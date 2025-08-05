// Content script para Vagas.com
console.log('AutoVagas - Vagas.com content script loaded');

// Estado do scraper do Vagas.com
let vagasState = {
  isRunning: false,
  settings: null,
  processedJobs: new Set(),
  currentPage: 1,
  totalApplications: 0,
  observer: null
};

// Seletores específicos do Vagas.com
const VAGAS_SELECTORS = {
  jobCards: '.vaga-item, .job-item, .opportunity-item',
  jobTitle: '.vaga-titulo, .job-title, .opportunity-title h3 a',
  companyName: '.vaga-empresa, .company-name, .opportunity-company',
  location: '.vaga-local, .job-location, .opportunity-location',
  description: '.vaga-descricao, .job-description, .opportunity-description',
  applyButton: '.btn-candidatar, .apply-button, .candidatar-se',
  quickApplyButton: '.candidatura-rapida, .quick-apply',
  nextButton: '.proxima, .next, .pagination-next',
  searchInput: '.busca-input, .search-input, #q',
  locationInput: '.local-input, .location-input, #cidade',
  searchButton: '.btn-buscar, .search-button, .buscar',
  jobsList: '.vagas-lista, .jobs-list, .opportunities-list',
  pagination: '.paginacao, .pagination',
  salaryInfo: '.vaga-salario, .salary, .opportunity-salary',
  jobType: '.vaga-tipo, .job-type, .contract-type',
  level: '.vaga-nivel, .level, .seniority'
};

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Vagas.com received message:', request);
  
  switch (request.action) {
    case 'startAutoApply':
      startVagasAutoApply(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'stopAutoApply':
      stopVagasAutoApply();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Inicia a auto aplicação no Vagas.com
async function startVagasAutoApply(settings) {
  if (vagasState.isRunning) {
    console.log('Vagas.com auto apply already running');
    return;
  }
  
  console.log('Starting Vagas.com auto apply with settings:', settings);
  
  vagasState.isRunning = true;
  vagasState.settings = settings;
  vagasState.processedJobs.clear();
  vagasState.currentPage = 1;
  vagasState.totalApplications = 0;
  
  try {
    // Verifica se estamos na página de vagas
    if (!window.location.href.includes('vagas.com.br')) {
      console.log('Not on Vagas.com, redirecting...');
      window.location.href = 'https://www.vagas.com.br/vagas-de-emprego';
      return;
    }
    
    // Configura a busca se necessário
    await setupSearch();
    
    // Inicia o processamento
    await processJobListings();
    
  } catch (error) {
    console.error('Error starting Vagas.com auto apply:', error);
    vagasState.isRunning = false;
  }
}

// Para a auto aplicação
function stopVagasAutoApply() {
  console.log('Stopping Vagas.com auto apply');
  
  vagasState.isRunning = false;
  
  if (vagasState.observer) {
    vagasState.observer.disconnect();
    vagasState.observer = null;
  }
}

// Configura a busca baseada nas configurações
async function setupSearch() {
  const { searchCriteria } = vagasState.settings;
  
  if (!searchCriteria.keywords.length && !searchCriteria.locations.length) {
    return; // Usa a busca atual se não há critérios específicos
  }
  
  try {
    // Preenche palavras-chave
    if (searchCriteria.keywords.length > 0) {
      const searchInput = document.querySelector(VAGAS_SELECTORS.searchInput);
      if (searchInput) {
        searchInput.value = '';
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          searchInput, 
          searchCriteria.keywords.join(' '), 
          90
        );
      }
    }
    
    // Preenche localização
    if (searchCriteria.locations.length > 0) {
      const locationInput = document.querySelector(VAGAS_SELECTORS.locationInput);
      if (locationInput) {
        locationInput.value = '';
        await window.AutoVagasUtils.AntiDetectionUtils.simulateTyping(
          locationInput, 
          searchCriteria.locations[0], 
          90
        );
      }
    }
    
    // Aguarda um pouco e clica em buscar
    await window.AutoVagasUtils.sleep(1300);
    
    const searchButton = document.querySelector(VAGAS_SELECTORS.searchButton);
    if (searchButton) {
      window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(searchButton);
      await window.AutoVagasUtils.sleep(3500); // Aguarda a página carregar
    }
    
  } catch (error) {
    console.error('Error setting up search:', error);
  }
}

// Processa as listagens de vagas
async function processJobListings() {
  while (vagasState.isRunning) {
    try {
      console.log(`Processing Vagas.com page ${vagasState.currentPage}`);
      
      // Aguarda a página carregar
      await window.AutoVagasUtils.DOMUtils.waitForElement(VAGAS_SELECTORS.jobsList);
      
      // Obtém todas as vagas da página atual
      const jobCards = document.querySelectorAll(VAGAS_SELECTORS.jobCards);
      console.log(`Found ${jobCards.length} job cards on page ${vagasState.currentPage}`);
      
      // Processa cada vaga
      for (const jobCard of jobCards) {
        if (!vagasState.isRunning) break;
        
        // Gera um ID único para a vaga
        const jobLink = jobCard.querySelector('a');
        const jobId = jobLink ? 
          jobLink.href.split('/').pop().split('?')[0] : 
          jobCard.textContent.trim().substring(0, 50);
        
        // Pula se já processamos esta vaga
        if (vagasState.processedJobs.has(jobId)) {
          continue;
        }
        
        vagasState.processedJobs.add(jobId);
        
        try {
          // Rola até a vaga para garantir visibilidade
          window.AutoVagasUtils.DOMUtils.scrollToElement(jobCard);
          await window.AutoVagasUtils.sleep(700);
          
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
                vagasState.totalApplications++;
                
                // Notifica que aplicou
                chrome.runtime.sendMessage({
                  action: 'applicationSubmitted',
                  application: {
                    ...jobInfo,
                    platform: 'vagas',
                    appliedAt: new Date().toISOString()
                  }
                });
                
                console.log(`Applied to job: ${jobInfo.title} at ${jobInfo.company}`);
              }
            }
          }
          
          // Volta para a lista de vagas
          window.history.back();
          await window.AutoVagasUtils.sleep(2500);
          
          // Delay entre aplicações
          await window.AutoVagasUtils.AntiDetectionUtils.randomDelay(
            vagasState.settings.applicationSettings.delayBetweenApplications,
            vagasState.settings.applicationSettings.delayBetweenApplications + 3000
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
  
  console.log(`Vagas.com auto apply completed. Total applications: ${vagasState.totalApplications}`);
  vagasState.isRunning = false;
}

// Extrai informações da vaga
async function extractJobInfo(jobId, jobCard) {
  try {
    // Aguarda os elementos carregarem na página de detalhes
    await window.AutoVagasUtils.sleep(1500);
    
    const jobInfo = {
      id: jobId,
      title: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.jobTitle),
      company: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.companyName),
      location: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.location),
      salary: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.salaryInfo),
      jobType: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.jobType),
      level: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.level),
      description: window.AutoVagasUtils.DOMUtils.extractText(VAGAS_SELECTORS.description),
      url: window.location.href,
      platform: 'vagas',
      foundAt: new Date().toISOString()
    };
    
    // Se não conseguiu extrair da página de detalhes, tenta do card
    if (!jobInfo.title && jobCard) {
      jobInfo.title = jobCard.querySelector(VAGAS_SELECTORS.jobTitle)?.textContent?.trim() || '';
      jobInfo.company = jobCard.querySelector(VAGAS_SELECTORS.companyName)?.textContent?.trim() || '';
      jobInfo.location = jobCard.querySelector(VAGAS_SELECTORS.location)?.textContent?.trim() || '';
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
  const { searchCriteria, applicationSettings } = vagasState.settings;
  
  // Verifica se já aplicou
  if (applicationSettings.skipAppliedJobs) {
    const appliedIndicator = document.querySelector(
      '.ja-candidatou, .applied, .candidatura-enviada, .already-applied'
    );
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
    // Procura pelo botão de candidatura rápida primeiro
    let applyButton = document.querySelector(VAGAS_SELECTORS.quickApplyButton);
    
    if (!applyButton) {
      applyButton = document.querySelector(VAGAS_SELECTORS.applyButton);
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
    const modal = document.querySelector('.modal, .popup, .candidatura-modal');
    if (modal) {
      // Procura por botão de confirmação no modal
      const confirmButton = modal.querySelector(
        '.btn-confirmar, .btn-candidatar, .confirm, .enviar, .submit'
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
      const submitButton = form.querySelector(
        'button[type="submit"], .btn-submit, .enviar, .candidatar'
      );
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
    const nextButton = document.querySelector(VAGAS_SELECTORS.nextButton);
    if (!nextButton || 
        nextButton.disabled || 
        nextButton.classList.contains('disabled') ||
        nextButton.classList.contains('inactive')) {
      return false;
    }
    
    window.AutoVagasUtils.DOMUtils.scrollToElement(nextButton);
    await window.AutoVagasUtils.sleep(500);
    
    window.AutoVagasUtils.AntiDetectionUtils.simulateHumanClick(nextButton);
    vagasState.currentPage++;
    
    await window.AutoVagasUtils.sleep(4000); // Aguarda a página carregar
    return true;
    
  } catch (error) {
    console.error('Error going to next page:', error);
    return false;
  }
}

// Inicialização
if (window.location.href.includes('vagas.com.br')) {
  console.log('Vagas.com content script initialized');
  
  // Observa mudanças na URL para detectar navegação SPA
  let currentUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Vagas.com URL changed:', currentUrl);
      
      // Se saiu da página de vagas, para o auto apply
      if (!currentUrl.includes('vagas') && vagasState.isRunning) {
        stopVagasAutoApply();
      }
    }
  });
  
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
