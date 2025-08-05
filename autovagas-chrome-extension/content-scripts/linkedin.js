// Content script para LinkedIn
console.log('AutoVagas - LinkedIn content script loaded');

// Estado do scraper do LinkedIn
let linkedinState = {
  isRunning: false,
  settings: null,
  processedJobs: new Set(),
  currentPage: 1,
  totalApplications: 0,
  observer: null
};

// Seletores específicos do LinkedIn
const LINKEDIN_SELECTORS = {
  jobCards: '[data-job-id]',
  jobTitle: '.job-details-jobs-unified-top-card__job-title h1',
  companyName: '.job-details-jobs-unified-top-card__company-name a',
  location: '.job-details-jobs-unified-top-card__bullet',
  description: '.jobs-description__content',
  applyButton: '.jobs-apply-button',
  easyApplyButton: '[aria-label*="Easy Apply"]',
  nextButton: '[aria-label="Next"]',
  submitButton: '[aria-label="Submit application"]',
  searchInput: '.jobs-search-box__text-input',
  locationInput: '[placeholder*="City"]',
  searchButton: '.jobs-search-box__submit-button',
  jobsList: '.jobs-search-results-list',
  pagination: '.artdeco-pagination__pages'
};

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('LinkedIn received message:', request);
  
  switch (request.action) {
    case 'startAutoApply':
      startLinkedInAutoApply(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'stopAutoApply':
      stopLinkedInAutoApply();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Inicia a auto aplicação no LinkedIn
async function startLinkedInAutoApply(settings) {
  if (linkedinState.isRunning) {
    console.log('LinkedIn auto apply already running');
    return;
  }
  
  console.log('Starting LinkedIn auto apply with settings:', settings);
  
  linkedinState.isRunning = true;
  linkedinState.settings = settings;
  linkedinState.processedJobs.clear();
  linkedinState.currentPage = 1;
  linkedinState.totalApplications = 0;
  
  try {
    // Verifica se estamos na página de jobs
    if (!window.location.href.includes('/jobs/')) {
      // Navega para a página de jobs
      window.location.href = 'https://www.linkedin.com/jobs/';
      return;
    }
    
    // Configura a busca se necessário
    await setupSearch();
    
    // Inicia o processamento
    await processJobListings();
    
  } catch (error) {
    console.error('Error starting LinkedIn auto apply:', error);
    linkedinState.isRunning = false;
  }
}

// Para a auto aplicação
function stopLinkedInAutoApply() {
  console.log('Stopping LinkedIn auto apply');
  
  linkedinState.isRunning = false;
  
  if (linkedinState.observer) {
    linkedinState.observer.disconnect();
    linkedinState.observer = null;
  }
}

// Configura a busca baseada nas configurações
async function setupSearch() {
  const { searchCriteria } = linkedinState.settings;
  
  if (!searchCriteria.keywords.length && !searchCriteria.locations.length) {
    return; // Usa a busca atual se não há critérios específicos
  }
  
  try {
    // Preenche palavras-chave
    if (searchCriteria.keywords.length > 0) {
      const searchInput = document.querySelector(LINKEDIN_SELECTORS.searchInput);
      if (searchInput) {
        searchInput.value = searchCriteria.keywords.join(' ');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    // Preenche localização
    if (searchCriteria.locations.length > 0) {
      const locationInput = document.querySelector(LINKEDIN_SELECTORS.locationInput);
      if (locationInput) {
        locationInput.value = searchCriteria.locations[0]; // Usa a primeira localização
        locationInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    // Aguarda um pouco e clica em buscar
    await sleep(1000);
    
    const searchButton = document.querySelector(LINKEDIN_SELECTORS.searchButton);
    if (searchButton) {
      searchButton.click();
      await sleep(3000); // Aguarda a página carregar
    }
    
  } catch (error) {
    console.error('Error setting up search:', error);
  }
}

// Processa as listagens de vagas
async function processJobListings() {
  while (linkedinState.isRunning) {
    try {
      console.log(`Processing LinkedIn page ${linkedinState.currentPage}`);
      
      // Aguarda a página carregar
      await waitForElement(LINKEDIN_SELECTORS.jobsList);
      
      // Obtém todas as vagas da página atual
      const jobCards = document.querySelectorAll(LINKEDIN_SELECTORS.jobCards);
      console.log(`Found ${jobCards.length} job cards on page ${linkedinState.currentPage}`);
      
      // Processa cada vaga
      for (const jobCard of jobCards) {
        if (!linkedinState.isRunning) break;
        
        const jobId = jobCard.getAttribute('data-job-id');
        
        // Pula se já processamos esta vaga
        if (linkedinState.processedJobs.has(jobId)) {
          continue;
        }
        
        linkedinState.processedJobs.add(jobId);
        
        try {
          // Clica na vaga para ver os detalhes
          jobCard.click();
          await sleep(2000);
          
          // Extrai informações da vaga
          const jobInfo = await extractJobInfo(jobId);
          
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
                linkedinState.totalApplications++;
                
                // Notifica que aplicou
                chrome.runtime.sendMessage({
                  action: 'applicationSubmitted',
                  application: {
                    ...jobInfo,
                    platform: 'linkedin',
                    appliedAt: new Date().toISOString()
                  }
                });
                
                console.log(`Applied to job: ${jobInfo.title} at ${jobInfo.company}`);
              }
            }
          }
          
          // Delay entre aplicações
          await sleep(linkedinState.settings.applicationSettings.delayBetweenApplications);
          
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
  
  console.log(`LinkedIn auto apply completed. Total applications: ${linkedinState.totalApplications}`);
  linkedinState.isRunning = false;
}

// Extrai informações da vaga
async function extractJobInfo(jobId) {
  try {
    // Aguarda os elementos carregarem
    await waitForElement(LINKEDIN_SELECTORS.jobTitle, 5000);
    
    const titleElement = document.querySelector(LINKEDIN_SELECTORS.jobTitle);
    const companyElement = document.querySelector(LINKEDIN_SELECTORS.companyName);
    const locationElement = document.querySelector(LINKEDIN_SELECTORS.location);
    const descriptionElement = document.querySelector(LINKEDIN_SELECTORS.description);
    
    if (!titleElement) {
      console.log('Could not find job title element');
      return null;
    }
    
    const jobInfo = {
      id: jobId,
      title: titleElement.textContent?.trim() || '',
      company: companyElement?.textContent?.trim() || '',
      location: locationElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      url: window.location.href,
      platform: 'linkedin',
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
  const { searchCriteria, applicationSettings } = linkedinState.settings;
  
  // Verifica se já aplicou (se a configuração estiver ativada)
  if (applicationSettings.skipAppliedJobs) {
    // Aqui você poderia verificar em um banco de dados local ou API
    // Por enquanto, assumimos que não aplicou
  }
  
  // Verifica palavras-chave
  if (searchCriteria.keywords.length > 0) {
    const jobText = `${jobInfo.title} ${jobInfo.description}`.toLowerCase();
    const hasKeyword = searchCriteria.keywords.some(keyword => 
      jobText.includes(keyword.toLowerCase())
    );
    
    if (!hasKeyword) {
      console.log(`Job "${jobInfo.title}" doesn't match keywords`);
      return false;
    }
  }
  
  // Verifica localização
  if (searchCriteria.locations.length > 0) {
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
    // Procura pelo botão Easy Apply primeiro
    let applyButton = document.querySelector(LINKEDIN_SELECTORS.easyApplyButton);
    
    if (!applyButton) {
      // Se não encontrar Easy Apply, procura pelo botão normal
      applyButton = document.querySelector(LINKEDIN_SELECTORS.applyButton);
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
    
    // Clica no botão de aplicar
    applyButton.click();
    await sleep(2000);
    
    // Se for Easy Apply, pode ter um modal
    const submitButton = document.querySelector(LINKEDIN_SELECTORS.submitButton);
    if (submitButton && !submitButton.disabled) {
      submitButton.click();
      await sleep(1000);
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
    const pagination = document.querySelector(LINKEDIN_SELECTORS.pagination);
    if (!pagination) return false;
    
    const nextButton = pagination.querySelector(`[aria-label="Page ${linkedinState.currentPage + 1}"]`);
    if (!nextButton) return false;
    
    nextButton.click();
    linkedinState.currentPage++;
    
    await sleep(3000); // Aguarda a página carregar
    return true;
    
  } catch (error) {
    console.error('Error going to next page:', error);
    return false;
  }
}

// Utilitários
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Inicialização
if (window.location.href.includes('linkedin.com')) {
  console.log('LinkedIn content script initialized');
  
  // Observa mudanças na URL para detectar navegação SPA
  let currentUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('LinkedIn URL changed:', currentUrl);
      
      // Se saiu da página de jobs, para o auto apply
      if (!currentUrl.includes('/jobs/') && linkedinState.isRunning) {
        stopLinkedInAutoApply();
      }
    }
  });
  
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
