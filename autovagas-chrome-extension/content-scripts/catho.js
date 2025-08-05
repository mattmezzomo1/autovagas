// Content script para Catho
console.log('AutoVagas - Catho content script loaded');

// Estado do scraper do Catho
let cathoState = {
  isRunning: false,
  settings: null,
  processedJobs: new Set(),
  currentPage: 1,
  totalApplications: 0,
  observer: null
};

// Seletores específicos do Catho
const CATHO_SELECTORS = {
  jobCards: '.sc-job-card, .job-card, [data-testid="job-card"]',
  jobTitle: '.sc-job-card__title, .job-title, h2 a',
  companyName: '.sc-job-card__company, .company-name, .company',
  location: '.sc-job-card__location, .location, .job-location',
  description: '.job-description, .description, .sc-job-description',
  applyButton: '.sc-apply-button, .apply-button, [data-testid="apply-button"]',
  candidateButton: '.btn-candidatar, .candidatar',
  nextButton: '.pagination-next, .next, [aria-label="Próxima"]',
  searchInput: '.sc-search-input, .search-input, #search-input',
  locationInput: '.location-input, #location-input',
  searchButton: '.sc-search-button, .search-button, .btn-search',
  jobsList: '.sc-jobs-list, .jobs-list, .job-results',
  pagination: '.sc-pagination, .pagination',
  salaryInfo: '.sc-salary, .salary, .job-salary',
  jobType: '.sc-job-type, .job-type, .contract-type',
  experienceLevel: '.sc-experience, .experience, .seniority'
};

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Catho received message:', request);
  
  switch (request.action) {
    case 'startAutoApply':
      startCathoAutoApply(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'stopAutoApply':
      stopCathoAutoApply();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Inicia a auto aplicação no Catho
async function startCathoAutoApply(settings) {
  if (cathoState.isRunning) {
    console.log('Catho auto apply already running');
    return;
  }
  
  console.log('Starting Catho auto apply with settings:', settings);
  
  cathoState.isRunning = true;
  cathoState.settings = settings;
  cathoState.processedJobs.clear();
  cathoState.currentPage = 1;
  cathoState.totalApplications = 0;
  
  try {
    // Verifica se estamos na página de vagas
    if (!window.location.href.includes('catho.com.br')) {
      console.log('Not on Catho, redirecting...');
      window.location.href = 'https://www.catho.com.br/vagas/';
      return;
    }
    
    // Configura a busca se necessário
    await setupSearch();
    
    // Inicia o processamento
    await processJobListings();
    
  } catch (error) {
    console.error('Error starting Catho auto apply:', error);
    cathoState.isRunning = false;
  }
}

// Para a auto aplicação
function stopCathoAutoApply() {
  console.log('Stopping Catho auto apply');
  
  cathoState.isRunning = false;
  
  if (cathoState.observer) {
    cathoState.observer.disconnect();
    cathoState.observer = null;
  }
}

// Configura a busca baseada nas configurações
async function setupSearch() {
  const { searchCriteria } = cathoState.settings;
  
  if (!searchCriteria.keywords.length && !searchCriteria.locations.length) {
    return; // Usa a busca atual se não há critérios específicos
  }
  
  try {
    // Preenche palavras-chave
    if (searchCriteria.keywords.length > 0) {
      const searchInput = document.querySelector(CATHO_SELECTORS.searchInput);
      if (searchInput) {
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          searchInput, 
          searchCriteria.keywords.join(' '), 
          120
        );
      }
    }
    
    // Preenche localização
    if (searchCriteria.locations.length > 0) {
      const locationInput = document.querySelector(CATHO_SELECTORS.locationInput);
      if (locationInput) {
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          locationInput, 
          searchCriteria.locations[0], 
          120
        );
      }
    }
    
    // Aguarda um pouco e clica em buscar
    await window.AutoVagasUtils.sleep(1500);
    
    const searchButton = document.querySelector(CATHO_SELECTORS.searchButton);
    if (searchButton) {
      window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(searchButton);
      await window.AutoVagasUtils.sleep(4000); // Aguarda a página carregar
    }
    
  } catch (error) {
    console.error('Error setting up search:', error);
  }
}

// Processa as listagens de vagas
async function processJobListings() {
  while (cathoState.isRunning) {
    try {
      console.log(`Processing Catho page ${cathoState.currentPage}`);
      
      // Aguarda a página carregar
      await window.AutoVagasUtils.DOMUtils.waitForElement(CATHO_SELECTORS.jobsList);
      
      // Obtém todas as vagas da página atual
      const jobCards = document.querySelectorAll(CATHO_SELECTORS.jobCards);
      console.log(`Found ${jobCards.length} job cards on page ${cathoState.currentPage}`);
      
      // Processa cada vaga
      for (const jobCard of jobCards) {
        if (!cathoState.isRunning) break;
        
        // Gera um ID único para a vaga
        const jobLink = jobCard.querySelector('a');
        const jobId = jobLink ? 
          jobLink.href.split('/').pop() : 
          jobCard.textContent.trim().substring(0, 50);
        
        // Pula se já processamos esta vaga
        if (cathoState.processedJobs.has(jobId)) {
          continue;
        }
        
        cathoState.processedJobs.add(jobId);
        
        try {
          // Rola até a vaga para garantir visibilidade
          window.AutoVagasUtils.DOMUtils.scrollToElement(jobCard);
          await window.AutoVagasUtils.sleep(800);
          
          // Clica na vaga para ver os detalhes
          if (jobLink) {
            window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(jobLink);
            await window.AutoVagasUtils.sleep(3000);
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
                cathoState.totalApplications++;
                
                // Notifica que aplicou
                chrome.runtime.sendMessage({
                  action: 'applicationSubmitted',
                  application: {
                    ...jobInfo,
                    platform: 'catho',
                    appliedAt: new Date().toISOString()
                  }
                });
                
                console.log(`Applied to job: ${jobInfo.title} at ${jobInfo.company}`);
              }
            }
          }
          
          // Volta para a lista de vagas
          window.history.back();
          await window.AutoVagasUtils.sleep(2000);
          
          // Delay entre aplicações
          await window.AutoVagasUtils.AntiDetectionUtils.randomDelay(
            cathoState.settings.applicationSettings.delayBetweenApplications,
            cathoState.settings.applicationSettings.delayBetweenApplications + 3000
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
  
  console.log(`Catho auto apply completed. Total applications: ${cathoState.totalApplications}`);
  cathoState.isRunning = false;
}

// Extrai informações da vaga
async function extractJobInfo(jobId, jobCard) {
  try {
    // Aguarda os elementos carregarem na página de detalhes
    await window.AutoVagasUtils.sleep(1000);
    
    const jobInfo = {
      id: jobId,
      title: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.jobTitle),
      company: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.companyName),
      location: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.location),
      salary: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.salaryInfo),
      jobType: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.jobType),
      experience: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.experienceLevel),
      description: window.AutoVagasUtils.DOMUtils.extractText(CATHO_SELECTORS.description),
      url: window.location.href,
      platform: 'catho',
      foundAt: new Date().toISOString()
    };
    
    // Se não conseguiu extrair da página de detalhes, tenta do card
    if (!jobInfo.title && jobCard) {
      jobInfo.title = jobCard.querySelector(CATHO_SELECTORS.jobTitle)?.textContent?.trim() || '';
      jobInfo.company = jobCard.querySelector(CATHO_SELECTORS.companyName)?.textContent?.trim() || '';
      jobInfo.location = jobCard.querySelector(CATHO_SELECTORS.location)?.textContent?.trim() || '';
    }
    
    if (!jobInfo.title) {
      console.log('Could not extract job title');
      return null;
    }
    
    console.log('Extracted job info:', jobInfo);
    return jobInfo;
    
  } catch (error) {
    console.error('Error extracting job info:', error);
    return null;
  }
}

// Verifica se deve aplicar para a vaga
function shouldApplyToJob(jobInfo) {
  const { searchCriteria, applicationSettings } = cathoState.settings;
  
  // Verifica se já aplicou
  if (applicationSettings.skipAppliedJobs) {
    const appliedIndicator = document.querySelector('.applied, .ja-candidatou, .candidatura-enviada');
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
    // Procura pelo botão de candidatar
    let applyButton = document.querySelector(CATHO_SELECTORS.candidateButton);
    
    if (!applyButton) {
      applyButton = document.querySelector(CATHO_SELECTORS.applyButton);
    }
    
    if (!applyButton) {
      console.log(`No apply button found for job: ${jobInfo.title}`);
      return false;
    }
    
    // Verifica se o botão está disponível
    if (applyButton.disabled || 
        applyButton.getAttribute('aria-disabled') === 'true' ||
        applyButton.classList.contains('disabled')) {
      console.log(`Apply button is disabled for job: ${jobInfo.title}`);
      return false;
    }
    
    // Rola até o botão
    window.AutoVagasUtils.DOMUtils.scrollToElement(applyButton);
    await window.AutoVagasUtils.sleep(1000);
    
    // Clica no botão de candidatar
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(applyButton);
    await window.AutoVagasUtils.sleep(3000);
    
    // Verifica se apareceu um modal ou formulário
    const modal = document.querySelector('.modal, .popup, .candidatura-modal, .apply-modal');
    if (modal) {
      // Procura por botão de confirmação no modal
      const confirmButton = modal.querySelector(
        '.btn-confirm, .btn-candidatar, .confirm, .enviar, .submit'
      );
      if (confirmButton && !confirmButton.disabled) {
        await window.AutoVagasUtils.sleep(1000);
        window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(confirmButton);
        await window.AutoVagasUtils.sleep(2000);
      }
    }
    
    // Verifica se há formulário de candidatura
    const form = document.querySelector('.candidatura-form, .apply-form, form');
    if (form) {
      const submitButton = form.querySelector('button[type="submit"], .btn-submit, .enviar');
      if (submitButton && !submitButton.disabled) {
        await window.AutoVagasUtils.sleep(1000);
        window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(submitButton);
        await window.AutoVagasUtils.sleep(2000);
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
    const nextButton = document.querySelector(CATHO_SELECTORS.nextButton);
    if (!nextButton || nextButton.disabled || nextButton.classList.contains('disabled')) {
      return false;
    }
    
    window.AutoVagasUtils.DOMUtils.scrollToElement(nextButton);
    await window.AutoVagasUtils.sleep(500);
    
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(nextButton);
    cathoState.currentPage++;
    
    await window.AutoVagasUtils.sleep(4000); // Aguarda a página carregar
    return true;
    
  } catch (error) {
    console.error('Error going to next page:', error);
    return false;
  }
}

// Inicialização
if (window.location.href.includes('catho.com.br')) {
  console.log('Catho content script initialized');
  
  // Observa mudanças na URL para detectar navegação SPA
  let currentUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Catho URL changed:', currentUrl);
      
      // Se saiu da página de vagas, para o auto apply
      if (!currentUrl.includes('vagas') && cathoState.isRunning) {
        stopCathoAutoApply();
      }
    }
  });
  
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
