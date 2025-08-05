// Utilitários comuns para todos os content scripts
console.log('AutoVagas - Common utilities loaded');

// Classe base para scrapers
class JobScraper {
  constructor(platform, selectors) {
    this.platform = platform;
    this.selectors = selectors;
    this.state = {
      isRunning: false,
      settings: null,
      processedJobs: new Set(),
      currentPage: 1,
      totalApplications: 0,
      observer: null
    };
  }

  // Inicia o scraper
  async start(settings) {
    if (this.state.isRunning) {
      console.log(`${this.platform} scraper already running`);
      return;
    }

    console.log(`Starting ${this.platform} scraper with settings:`, settings);
    
    this.state.isRunning = true;
    this.state.settings = settings;
    this.state.processedJobs.clear();
    this.state.currentPage = 1;
    this.state.totalApplications = 0;

    try {
      await this.initialize();
      await this.processJobs();
    } catch (error) {
      console.error(`Error in ${this.platform} scraper:`, error);
      this.stop();
    }
  }

  // Para o scraper
  stop() {
    console.log(`Stopping ${this.platform} scraper`);
    
    this.state.isRunning = false;
    
    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }
  }

  // Métodos que devem ser implementados pelas subclasses
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  async processJobs() {
    throw new Error('processJobs() must be implemented by subclass');
  }

  async extractJobInfo(element) {
    throw new Error('extractJobInfo() must be implemented by subclass');
  }

  async applyToJob(jobInfo) {
    throw new Error('applyToJob() must be implemented by subclass');
  }

  // Métodos utilitários comuns
  shouldApplyToJob(jobInfo) {
    const { searchCriteria, applicationSettings } = this.state.settings;
    
    // Verifica se já aplicou
    if (applicationSettings.skipAppliedJobs) {
      // Implementar verificação de aplicações anteriores
    }
    
    // Verifica palavras-chave
    if (searchCriteria.keywords && searchCriteria.keywords.length > 0) {
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

  // Notifica que encontrou uma vaga
  notifyJobFound(jobInfo) {
    chrome.runtime.sendMessage({
      action: 'jobFound',
      job: jobInfo
    });
  }

  // Notifica que aplicou para uma vaga
  notifyApplicationSubmitted(jobInfo) {
    this.state.totalApplications++;
    
    chrome.runtime.sendMessage({
      action: 'applicationSubmitted',
      application: {
        ...jobInfo,
        platform: this.platform,
        appliedAt: new Date().toISOString()
      }
    });
  }
}

// Utilitários de DOM
const DOMUtils = {
  // Aguarda um elemento aparecer
  waitForElement(selector, timeout = 10000) {
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
  },

  // Aguarda múltiplos elementos
  waitForElements(selectors, timeout = 10000) {
    const promises = selectors.map(selector => this.waitForElement(selector, timeout));
    return Promise.all(promises);
  },

  // Clica em um elemento com retry
  async clickElement(selector, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const element = await this.waitForElement(selector, 5000);
        if (element && !element.disabled) {
          element.click();
          return true;
        }
      } catch (error) {
        console.log(`Attempt ${i + 1} failed to click ${selector}:`, error);
      }
      
      await sleep(1000);
    }
    
    return false;
  },

  // Preenche um input
  async fillInput(selector, value) {
    try {
      const input = await this.waitForElement(selector, 5000);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } catch (error) {
      console.error(`Error filling input ${selector}:`, error);
    }
    
    return false;
  },

  // Extrai texto de um elemento
  extractText(selector, defaultValue = '') {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : defaultValue;
  },

  // Verifica se um elemento está visível
  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= window.innerHeight && 
           rect.right <= window.innerWidth;
  },

  // Rola até um elemento
  scrollToElement(element) {
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }
};

// Utilitários de string
const StringUtils = {
  // Normaliza texto removendo acentos e caracteres especiais
  normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  },

  // Verifica se uma string contém palavras-chave
  containsKeywords(text, keywords) {
    if (!keywords || keywords.length === 0) return true;
    
    const normalizedText = this.normalize(text);
    return keywords.some(keyword => 
      normalizedText.includes(this.normalize(keyword))
    );
  },

  // Extrai salário de um texto
  extractSalary(text) {
    const salaryRegex = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g;
    const matches = text.match(salaryRegex);
    return matches ? matches[0] : null;
  },

  // Limpa HTML de um texto
  stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
};

// Utilitários de detecção anti-bot
const AntiDetectionUtils = {
  // Delay aleatório entre ações
  randomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    return sleep(delay);
  },

  // Simula movimento humano do mouse
  simulateHumanClick(element) {
    if (!element) return;

    // Dispara eventos de mouse para simular comportamento humano
    const events = ['mousedown', 'mouseup', 'click'];
    
    events.forEach(eventType => {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(event);
    });
  },

  // Simula digitação humana
  async simulateTyping(input, text, delay = 100) {
    if (!input) return;

    input.focus();
    
    for (let i = 0; i < text.length; i++) {
      input.value = text.substring(0, i + 1);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Delay aleatório entre caracteres
      await sleep(delay + Math.random() * 50);
    }
    
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },

  // Verifica se a página tem captcha
  hasCaptcha() {
    const captchaSelectors = [
      '[data-captcha]',
      '.captcha',
      '#captcha',
      '.recaptcha',
      '.hcaptcha'
    ];
    
    return captchaSelectors.some(selector => 
      document.querySelector(selector) !== null
    );
  }
};

// Utilitários de armazenamento local
const StorageUtils = {
  // Salva dados no storage local
  async save(key, data) {
    try {
      await chrome.storage.local.set({ [key]: data });
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  },

  // Carrega dados do storage local
  async load(key, defaultValue = null) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || defaultValue;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return defaultValue;
    }
  },

  // Remove dados do storage
  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }
};

// Função sleep global
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para enviar mensagens para o background
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Exporta as utilidades para uso global
window.AutoVagasUtils = {
  JobScraper,
  DOMUtils,
  StringUtils,
  AntiDetectionUtils,
  StorageUtils,
  sleep,
  sendMessageToBackground
};
