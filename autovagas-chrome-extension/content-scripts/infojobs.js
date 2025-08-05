// Content script para InfoJobs
console.log('AutoVagas - InfoJobs content script loaded');

// Estado do scraper do InfoJobs
let infojobsState = {
  isRunning: false,
  settings: null,
  processedJobs: new Set(),
  currentPage: 1,
  totalApplications: 0,
  observer: null
};

// Seletores específicos do InfoJobs
const INFOJOBS_SELECTORS = {
  jobCards: '.offer-item, .js-offer-item',
  jobTitle: '.offer-item-title a, h1.title',
  companyName: '.offer-item-company, .company-name',
  location: '.offer-item-location, .location',
  description: '.offer-description, .description-text',
  applyButton: '.btn-apply, .apply-button, [data-testid="apply-button"]',
  easyApplyButton: '.btn-easy-apply, .easy-apply',
  nextButton: '.pagination-next, .next-page',
  searchInput: '#q, .search-input',
  locationInput: '#province, .location-input',
  searchButton: '.search-button, .btn-search',
  jobsList: '.offers-list, .job-list',
  pagination: '.pagination',
  salaryInfo: '.salary, .offer-salary',
  jobType: '.contract-type, .job-type',
  experienceLevel: '.experience, .experience-level'
};

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('InfoJobs received message:', request);
  
  switch (request.action) {
    case 'startAutoApply':
      startInfoJobsAutoApply(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'stopAutoApply':
      stopInfoJobsAutoApply();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Inicia a auto aplicação no InfoJobs
async function startInfoJobsAutoApply(settings) {
  if (infojobsState.isRunning) {
    console.log('InfoJobs auto apply already running');
    return;
  }
  
  console.log('Starting InfoJobs auto apply with settings:', settings);
  
  infojobsState.isRunning = true;
  infojobsState.settings = settings;
  infojobsState.processedJobs.clear();
  infojobsState.currentPage = 1;
  infojobsState.totalApplications = 0;
  
  try {
    // Verifica se estamos na página de vagas
    if (!window.location.href.includes('infojobs.com.br')) {
      console.log('Not on InfoJobs, redirecting...');
      window.location.href = 'https://www.infojobs.com.br/vagas-de-emprego.aspx';
      return;
    }
    
    // Configura a busca se necessário
    await setupSearch();
    
    // Inicia o processamento
    await processJobListings();
    
  } catch (error) {
    console.error('Error starting InfoJobs auto apply:', error);
    infojobsState.isRunning = false;
  }
}

// Para a auto aplicação
function stopInfoJobsAutoApply() {
  console.log('Stopping InfoJobs auto apply');
  
  infojobsState.isRunning = false;
  
  if (infojobsState.observer) {
    infojobsState.observer.disconnect();
    infojobsState.observer = null;
  }
}

// Configura a busca baseada nas configurações
async function setupSearch() {
  const { searchCriteria } = infojobsState.settings;
  
  if (!searchCriteria.keywords.length && !searchCriteria.locations.length) {
    return; // Usa a busca atual se não há critérios específicos
  }
  
  try {
    // Preenche palavras-chave
    if (searchCriteria.keywords.length > 0) {
      const searchInput = document.querySelector(INFOJOBS_SELECTORS.searchInput);
      if (searchInput) {
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          searchInput, 
          searchCriteria.keywords.join(' '), 
          100
        );
      }
    }
    
    // Preenche localização
    if (searchCriteria.locations.length > 0) {
      const locationInput = document.querySelector(INFOJOBS_SELECTORS.locationInput);
      if (locationInput) {
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          locationInput, 
          searchCriteria.locations[0], 
          100
        );
      }
    }
    
    // Aguarda um pouco e clica em buscar
    await window.AutoVagasUtils.sleep(1000);
    
    const searchButton = document.querySelector(INFOJOBS_SELECTORS.searchButton);
    if (searchButton) {
      window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(searchButton);
      await window.AutoVagasUtils.sleep(3000); // Aguarda a página carregar
    }
    
  } catch (error) {
    console.error('Error setting up search:', error);
  }
}

// Processa as listagens de vagas
async function processJobListings() {
  while (infojobsState.isRunning) {
    try {
      console.log(`Processing InfoJobs page ${infojobsState.currentPage}`);
      
      // Aguarda a página carregar
      await window.AutoVagasUtils.DOMUtils.waitForElement(INFOJOBS_SELECTORS.jobsList);
      
      // Obtém todas as vagas da página atual
      const jobCards = document.querySelectorAll(INFOJOBS_SELECTORS.jobCards);
      console.log(`Found ${jobCards.length} job cards on page ${infojobsState.currentPage}`);
      
      // Processa cada vaga
      for (const jobCard of jobCards) {
        if (!infojobsState.isRunning) break;
        
        // Gera um ID único para a vaga baseado no link ou título
        const jobLink = jobCard.querySelector('a');
        const jobId = jobLink ? jobLink.href : jobCard.textContent.trim().substring(0, 50);
        
        // Pula se já processamos esta vaga
        if (infojobsState.processedJobs.has(jobId)) {
          continue;
        }
        
        infojobsState.processedJobs.add(jobId);
        
        try {
          // Rola até a vaga para garantir visibilidade
          window.AutoVagasUtils.DOMUtils.scrollToElement(jobCard);
          await window.AutoVagasUtils.sleep(500);
          
          // Clica na vaga para ver os detalhes
          if (jobLink) {
            window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(jobLink);
            await window.AutoVagasUtils.sleep(2000);
          }
          
          // Extrai informações da vaga
          const jobInfo = await extractJobInfo(jobId, jobCard);
          
          if (jobInfo) {
            // Notifica que encontrou uma vaga
            chrome.runtime.sendMessage({
              action: 'jobFound',
              job: jobInfo
            });
            
            // Verifica se deve aplicar
            if (shouldApplyToJob(jobInfo)) {
              const applied = await applyToJob(jobInfo);
              
              if (applied) {
                infojobsState.totalApplications++;
                
                // Notifica que aplicou
                chrome.runtime.sendMessage({
                  action: 'applicationSubmitted',
                  application: {
                    ...jobInfo,
                    platform: 'infojobs',
                    appliedAt: new Date().toISOString()
                  }
                });
                
                console.log(`Applied to job: ${jobInfo.title} at ${jobInfo.company}`);
              }
            }
          }
          
          // Delay entre aplicações
          await window.AutoVagasUtils.AntiDetectionUtils.randomDelay(
            infojobsState.settings.applicationSettings.delayBetweenApplications,
            infojobsState.settings.applicationSettings.delayBetweenApplications + 2000
          );
          
        } catch (error) {
          console.error(`Error processing job ${jobId}:`, error);
        }
      }
      
      // Tenta ir para a próxima página
      const hasNextPage = await goToNextPage();
      if (!hasNextPage) {
        console.log('No more pages to process');
        break;
      }
      
    } catch (error) {
      console.error('Error processing job listings:', error);
      break;
    }
  }
  
  console.log(`InfoJobs auto apply completed. Total applications: ${infojobsState.totalApplications}`);
  infojobsState.isRunning = false;
}

// Extrai informações da vaga
async function extractJobInfo(jobId, jobCard) {
  try {
    const titleElement = jobCard.querySelector(INFOJOBS_SELECTORS.jobTitle);
    const companyElement = jobCard.querySelector(INFOJOBS_SELECTORS.companyName);
    const locationElement = jobCard.querySelector(INFOJOBS_SELECTORS.location);
    const salaryElement = jobCard.querySelector(INFOJOBS_SELECTORS.salaryInfo);
    const jobTypeElement = jobCard.querySelector(INFOJOBS_SELECTORS.jobType);
    
    // Se estamos na página de detalhes, tenta extrair mais informações
    const descriptionElement = document.querySelector(INFOJOBS_SELECTORS.description);
    
    if (!titleElement) {
      console.log('Could not find job title element');
      return null;
    }
    
    const jobInfo = {
      id: jobId,
      title: window.AutoVagasUtils.DOMUtils.extractText(INFOJOBS_SELECTORS.jobTitle),
      company: window.AutoVagasUtils.DOMUtils.extractText(INFOJOBS_SELECTORS.companyName),
      location: window.AutoVagasUtils.DOMUtils.extractText(INFOJOBS_SELECTORS.location),
      salary: salaryElement ? salaryElement.textContent.trim() : '',
      jobType: jobTypeElement ? jobTypeElement.textContent.trim() : '',
      description: descriptionElement ? descriptionElement.textContent.trim() : '',
      url: window.location.href,
      platform: 'infojobs',
      foundAt: new Date().toISOString()
    };
    
    console.log('Extracted job info:', jobInfo);
    return jobInfo;
    
  } catch (error) {
    console.error('Error extracting job info:', error);
    return null;
  }
}

// Verifica se deve aplicar para a vaga
function shouldApplyToJob(jobInfo) {
  const { searchCriteria, applicationSettings } = infojobsState.settings;
  
  // Verifica se já aplicou (se a configuração estiver ativada)
  if (applicationSettings.skipAppliedJobs) {
    // Verifica se há indicação de que já aplicou
    const appliedIndicator = document.querySelector('.applied, .candidatura-enviada, .already-applied');
    if (appliedIndicator) {
      console.log(`Already applied to job: ${jobInfo.title}`);
      return false;
    }
  }
  
  // Verifica palavras-chave
  if (searchCriteria.keywords && searchCriteria.keywords.length > 0) {
    const jobText = `${jobInfo.title} ${jobInfo.description}`;
    if (!window.AutoVagasUtils.StringUtils.containsKeywords(jobText, searchCriteria.keywords)) {
      console.log(`Job "${jobInfo.title}" doesn't match keywords`);
      return false;
    }
  }
  
  // Verifica localização
  if (searchCriteria.locations && searchCriteria.locations.length > 0) {
    const hasLocation = searchCriteria.locations.some(location =>
      jobInfo.location.toLowerCase().includes(location.toLowerCase())
    );
    
    if (!hasLocation && !jobInfo.location.toLowerCase().includes('remot')) {
      console.log(`Job "${jobInfo.title}" doesn't match location criteria`);
      return false;
    }
  }
  
  return true;
}

// Aplica para a vaga
async function applyToJob(jobInfo) {
  try {
    // Procura pelo botão de aplicar
    let applyButton = document.querySelector(INFOJOBS_SELECTORS.easyApplyButton);
    
    if (!applyButton) {
      applyButton = document.querySelector(INFOJOBS_SELECTORS.applyButton);
    }
    
    if (!applyButton) {
      console.log(`No apply button found for job: ${jobInfo.title}`);
      return false;
    }
    
    // Verifica se o botão está disponível
    if (applyButton.disabled || applyButton.getAttribute('aria-disabled') === 'true') {
      console.log(`Apply button is disabled for job: ${jobInfo.title}`);
      return false;
    }
    
    // Rola até o botão
    window.AutoVagasUtils.DOMUtils.scrollToElement(applyButton);
    await window.AutoVagasUtils.sleep(500);
    
    // Clica no botão de aplicar
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(applyButton);
    await window.AutoVagasUtils.sleep(2000);
    
    // Verifica se apareceu um modal ou formulário
    const modal = document.querySelector('.modal, .popup, .apply-modal');
    if (modal) {
      // Procura por botão de confirmação no modal
      const confirmButton = modal.querySelector('.btn-confirm, .btn-apply, .confirm, .enviar');
      if (confirmButton && !confirmButton.disabled) {
        window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(confirmButton);
        await window.AutoVagasUtils.sleep(1000);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('Error applying to job:', error);
    return false;
  }
}

// Vai para a próxima página
async function goToNextPage() {
  try {
    const nextButton = document.querySelector(INFOJOBS_SELECTORS.nextButton);
    if (!nextButton || nextButton.disabled) return false;
    
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(nextButton);
    infojobsState.currentPage++;
    
    await window.AutoVagasUtils.sleep(3000); // Aguarda a página carregar
    return true;
    
  } catch (error) {
    console.error('Error going to next page:', error);
    return false;
  }
}

// Inicialização
if (window.location.href.includes('infojobs.com.br')) {
  console.log('InfoJobs content script initialized');
  
  // Observa mudanças na URL para detectar navegação SPA
  let currentUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('InfoJobs URL changed:', currentUrl);
      
      // Se saiu da página de vagas, para o auto apply
      if (!currentUrl.includes('vagas') && infojobsState.isRunning) {
        stopInfoJobsAutoApply();
      }
    }
  });
  
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
