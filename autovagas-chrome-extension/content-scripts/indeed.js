// Content script para Indeed
console.log('AutoVagas - Indeed content script loaded');

// Estado do scraper do Indeed
let indeedState = {
  isRunning: false,
  settings: null,
  processedJobs: new Set(),
  currentPage: 1,
  totalApplications: 0,
  observer: null
};

// Seletores específicos do Indeed
const INDEED_SELECTORS = {
  jobCards: '[data-jk], .job_seen_beacon, .slider_container .slider_item',
  jobTitle: '[data-testid="job-title"], .jobTitle a, h2 a span[title]',
  companyName: '[data-testid="company-name"], .companyName, .company',
  location: '[data-testid="job-location"], .locationsContainer, .location',
  description: '.jobDescriptionContent, .job-snippet, .summary',
  applyButton: '.indeedApplyButton, .ia-IndeedApplyButton, [data-testid="apply-button"]',
  easyApplyButton: '.ia-IndeedApplyButton, .indeedApplyButton',
  nextButton: '[aria-label="Next Page"], .np:last-child, .pn',
  searchInput: '#text-input-what, .icl-TextInput--text',
  locationInput: '#text-input-where, .icl-TextInput--location',
  searchButton: '.yosegi-InlineWhatWhere-primaryButton, .icl-Button--primary',
  jobsList: '.jobsearch-SerpJobCard, .job_seen_beacon',
  pagination: '.np, .pn',
  salaryInfo: '.salary-snippet, .estimated-salary',
  jobType: '.jobMetadata, .job-snippet li',
  rating: '.ratingsDisplay, .rating'
};

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Indeed received message:', request);
  
  switch (request.action) {
    case 'startAutoApply':
      startIndeedAutoApply(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'stopAutoApply':
      stopIndeedAutoApply();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Inicia a auto aplicação no Indeed
async function startIndeedAutoApply(settings) {
  if (indeedState.isRunning) {
    console.log('Indeed auto apply already running');
    return;
  }
  
  console.log('Starting Indeed auto apply with settings:', settings);
  
  indeedState.isRunning = true;
  indeedState.settings = settings;
  indeedState.processedJobs.clear();
  indeedState.currentPage = 1;
  indeedState.totalApplications = 0;
  
  try {
    // Verifica se estamos na página de vagas
    if (!window.location.href.includes('indeed.com')) {
      console.log('Not on Indeed, redirecting...');
      window.location.href = 'https://br.indeed.com/jobs';
      return;
    }
    
    // Configura a busca se necessário
    await setupSearch();
    
    // Inicia o processamento
    await processJobListings();
    
  } catch (error) {
    console.error('Error starting Indeed auto apply:', error);
    indeedState.isRunning = false;
  }
}

// Para a auto aplicação
function stopIndeedAutoApply() {
  console.log('Stopping Indeed auto apply');
  
  indeedState.isRunning = false;
  
  if (indeedState.observer) {
    indeedState.observer.disconnect();
    indeedState.observer = null;
  }
}

// Configura a busca baseada nas configurações
async function setupSearch() {
  const { searchCriteria } = indeedState.settings;
  
  if (!searchCriteria.keywords.length && !searchCriteria.locations.length) {
    return; // Usa a busca atual se não há critérios específicos
  }
  
  try {
    // Preenche palavras-chave
    if (searchCriteria.keywords.length > 0) {
      const searchInput = document.querySelector(INDEED_SELECTORS.searchInput);
      if (searchInput) {
        searchInput.value = '';
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          searchInput, 
          searchCriteria.keywords.join(' '), 
          80
        );
      }
    }
    
    // Preenche localização
    if (searchCriteria.locations.length > 0) {
      const locationInput = document.querySelector(INDEED_SELECTORS.locationInput);
      if (locationInput) {
        locationInput.value = '';
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          locationInput, 
          searchCriteria.locations[0], 
          80
        );
      }
    }
    
    // Aguarda um pouco e clica em buscar
    await window.AutoVagasUtils.sleep(1200);
    
    const searchButton = document.querySelector(INDEED_SELECTORS.searchButton);
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
  while (indeedState.isRunning) {
    try {
      console.log(`Processing Indeed page ${indeedState.currentPage}`);
      
      // Aguarda a página carregar
      await window.AutoVagasUtils.sleep(2000);
      
      // Obtém todas as vagas da página atual
      const jobCards = document.querySelectorAll(INDEED_SELECTORS.jobCards);
      console.log(`Found ${jobCards.length} job cards on page ${indeedState.currentPage}`);
      
      // Processa cada vaga
      for (const jobCard of jobCards) {
        if (!indeedState.isRunning) break;
        
        // Gera um ID único para a vaga
        const jobId = jobCard.getAttribute('data-jk') || 
                     jobCard.querySelector('a')?.href?.split('jk=')[1]?.split('&')[0] ||
                     Math.random().toString(36).substr(2, 9);
        
        // Pula se já processamos esta vaga
        if (indeedState.processedJobs.has(jobId)) {
          continue;
        }
        
        indeedState.processedJobs.add(jobId);
        
        try {
          // Rola até a vaga para garantir visibilidade
          window.AutoVagasUtils.DOMUtils.scrollToElement(jobCard);
          await window.AutoVagasUtils.sleep(600);
          
          // Clica na vaga para ver os detalhes
          const jobLink = jobCard.querySelector('a, [data-testid="job-title"]');
          if (jobLink) {
            window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(jobLink);
            await window.AutoVagasUtils.sleep(2500);
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
                indeedState.totalApplications++;
                
                // Notifica que aplicou
                chrome.runtime.sendMessage({
                  action: 'applicationSubmitted',
                  application: {
                    ...jobInfo,
                    platform: 'indeed',
                    appliedAt: new Date().toISOString()
                  }
                });
                
                console.log(`Applied to job: ${jobInfo.title} at ${jobInfo.company}`);
              }
            }
          }
          
          // Delay entre aplicações
          await window.AutoVagasUtils.AntiDetectionUtils.randomDelay(
            indeedState.settings.applicationSettings.delayBetweenApplications,
            indeedState.settings.applicationSettings.delayBetweenApplications + 2000
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
  
  console.log(`Indeed auto apply completed. Total applications: ${indeedState.totalApplications}`);
  indeedState.isRunning = false;
}

// Extrai informações da vaga
async function extractJobInfo(jobId, jobCard) {
  try {
    // Aguarda os elementos carregarem
    await window.AutoVagasUtils.sleep(1000);
    
    const jobInfo = {
      id: jobId,
      title: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.jobTitle),
      company: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.companyName),
      location: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.location),
      salary: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.salaryInfo),
      rating: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.rating),
      description: window.AutoVagasUtils.DOMUtils.extractText(INDEED_SELECTORS.description),
      url: window.location.href,
      platform: 'indeed',
      foundAt: new Date().toISOString()
    };
    
    // Se não conseguiu extrair da página atual, tenta do card
    if (!jobInfo.title && jobCard) {
      const titleElement = jobCard.querySelector(INDEED_SELECTORS.jobTitle);
      const companyElement = jobCard.querySelector(INDEED_SELECTORS.companyName);
      const locationElement = jobCard.querySelector(INDEED_SELECTORS.location);
      
      jobInfo.title = titleElement?.textContent?.trim() || titleElement?.getAttribute('title') || '';
      jobInfo.company = companyElement?.textContent?.trim() || '';
      jobInfo.location = locationElement?.textContent?.trim() || '';
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
  const { searchCriteria, applicationSettings } = indeedState.settings;
  
  // Verifica se já aplicou
  if (applicationSettings.skipAppliedJobs) {
    const appliedIndicator = document.querySelector('.ia-Applied, .applied, .alreadyApplied');
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
    // Procura pelo botão de aplicar do Indeed
    let applyButton = document.querySelector(INDEED_SELECTORS.easyApplyButton);
    
    if (!applyButton) {
      applyButton = document.querySelector(INDEED_SELECTORS.applyButton);
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
    await window.AutoVagasUtils.sleep(800);
    
    // Clica no botão de aplicar
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(applyButton);
    await window.AutoVagasUtils.sleep(2000);
    
    // Indeed pode abrir uma nova aba ou modal
    // Verifica se há modal de aplicação
    const modal = document.querySelector('.ia-Modal, .indeed-apply-modal, .apply-modal');
    if (modal) {
      // Procura por botão de continuar/enviar no modal
      const continueButton = modal.querySelector(
        '.ia-continueButton, .continue-button, .btn-primary, .submit'
      );
      if (continueButton && !continueButton.disabled) {
        await window.AutoVagasUtils.sleep(1000);
        window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(continueButton);
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
    // Indeed usa diferentes seletores para paginação
    const nextButton = document.querySelector(INDEED_SELECTORS.nextButton) ||
                      document.querySelector('a[aria-label="Next"]') ||
                      document.querySelector('.np[aria-label="Next"]');
    
    if (!nextButton || nextButton.classList.contains('disabled')) {
      return false;
    }
    
    window.AutoVagasUtils.DOMUtils.scrollToElement(nextButton);
    await window.AutoVagasUtils.sleep(500);
    
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(nextButton);
    indeedState.currentPage++;
    
    await window.AutoVagasUtils.sleep(3000); // Aguarda a página carregar
    return true;
    
  } catch (error) {
    console.error('Error going to next page:', error);
    return false;
  }
}

// Inicialização
if (window.location.href.includes('indeed.com')) {
  console.log('Indeed content script initialized');
  
  // Observa mudanças na URL para detectar navegação SPA
  let currentUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Indeed URL changed:', currentUrl);
      
      // Se saiu da página de jobs, para o auto apply
      if (!currentUrl.includes('jobs') && indeedState.isRunning) {
        stopIndeedAutoApply();
      }
    }
  });
  
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
