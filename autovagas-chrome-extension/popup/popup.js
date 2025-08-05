// Popup script para a extensão AutoVagas
console.log('AutoVagas Popup - Script loaded');

// Estado do popup
let popupState = {
  currentScreen: 'login',
  isAuthenticated: false,
  user: null,
  extensionState: null,
  settings: null
};

// Inicialização do popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup DOM loaded');
  
  // Verifica o estado de autenticação
  await checkAuthState();
  
  // Configura event listeners
  setupEventListeners();
  
  // Atualiza a interface
  updateUI();
  
  // Inicia polling para atualizações
  startPolling();
});

// Verifica o estado de autenticação
async function checkAuthState() {
  try {
    const response = await sendMessageToBackground({ action: 'getAuthState' });
    
    if (response.isAuthenticated) {
      popupState.isAuthenticated = true;
      popupState.user = response.user;
      popupState.currentScreen = 'dashboard';
      
      // Carrega o estado da extensão
      await loadExtensionState();
      await loadSettings();
    } else {
      popupState.currentScreen = 'login';
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
    popupState.currentScreen = 'login';
  }
}

// Carrega o estado da extensão
async function loadExtensionState() {
  try {
    const state = await sendMessageToBackground({ action: 'getExtensionState' });
    popupState.extensionState = state;
  } catch (error) {
    console.error('Error loading extension state:', error);
  }
}

// Carrega as configurações
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    popupState.settings = result.settings || getDefaultSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    popupState.settings = getDefaultSettings();
  }
}

// Configurações padrão
function getDefaultSettings() {
  return {
    platforms: {
      linkedin: true,
      infojobs: true,
      catho: true,
      indeed: true,
      vagas: true
    },
    searchCriteria: {
      keywords: [],
      locations: [],
      jobTypes: ['CLT', 'PJ'],
      workModels: ['Remoto', 'Híbrido', 'Presencial']
    },
    applicationSettings: {
      delayBetweenApplications: 5000,
      skipAppliedJobs: true
    }
  };
}

// Configura event listeners
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Toggle auto apply
  const toggleAutoApply = document.getElementById('toggleAutoApply');
  if (toggleAutoApply) {
    toggleAutoApply.addEventListener('click', handleToggleAutoApply);
  }
  
  // Navigation buttons
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => showScreen('settings'));
  }
  
  const statisticsBtn = document.getElementById('statisticsBtn');
  if (statisticsBtn) {
    statisticsBtn.addEventListener('click', () => showScreen('statistics'));
  }
  
  const backToMain = document.getElementById('backToMain');
  if (backToMain) {
    backToMain.addEventListener('click', () => showScreen('dashboard'));
  }
  
  const backToMainFromStats = document.getElementById('backToMainFromStats');
  if (backToMainFromStats) {
    backToMainFromStats.addEventListener('click', () => showScreen('dashboard'));
  }
  
  // Settings form
  const saveSettings = document.getElementById('saveSettings');
  if (saveSettings) {
    saveSettings.addEventListener('click', handleSaveSettings);
  }
  
  // External links
  const forgotPassword = document.getElementById('forgotPassword');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://autovagas.com/forgot-password' });
    });
  }
  
  const createAccount = document.getElementById('createAccount');
  if (createAccount) {
    createAccount.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://autovagas.com/register' });
    });
  }
}

// Manipula o login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  // Mostra loading
  showLoading(loginBtn, true);
  hideError(loginError);
  
  try {
    const response = await sendMessageToBackground({
      action: 'login',
      credentials: { email, password }
    });
    
    if (response.success) {
      popupState.isAuthenticated = true;
      popupState.user = response.user;
      popupState.currentScreen = 'dashboard';
      
      await loadExtensionState();
      await loadSettings();
      updateUI();
    } else {
      showError(loginError, response.error || 'Erro ao fazer login');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(loginError, 'Erro de conexão. Tente novamente.');
  } finally {
    showLoading(loginBtn, false);
  }
}

// Manipula o logout
async function handleLogout() {
  try {
    await sendMessageToBackground({ action: 'logout' });
    
    popupState.isAuthenticated = false;
    popupState.user = null;
    popupState.currentScreen = 'login';
    popupState.extensionState = null;
    
    updateUI();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Manipula o toggle de auto apply
async function handleToggleAutoApply() {
  if (!popupState.extensionState) return;
  
  try {
    if (popupState.extensionState.isRunning) {
      // Para a auto aplicação
      await sendMessageToBackground({ action: 'stopAutoApply' });
    } else {
      // Inicia a auto aplicação
      await sendMessageToBackground({
        action: 'startAutoApply',
        settings: popupState.settings
      });
    }
    
    // Atualiza o estado
    await loadExtensionState();
    updateDashboard();
  } catch (error) {
    console.error('Toggle auto apply error:', error);
  }
}

// Manipula o salvamento de configurações
async function handleSaveSettings() {
  try {
    // Coleta os dados do formulário
    const settings = {
      platforms: {
        linkedin: document.getElementById('enableLinkedIn').checked,
        infojobs: document.getElementById('enableInfoJobs').checked,
        catho: document.getElementById('enableCatho').checked,
        indeed: document.getElementById('enableIndeed').checked,
        vagas: document.getElementById('enableVagas').checked
      },
      searchCriteria: {
        keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()).filter(k => k),
        locations: document.getElementById('locations').value.split(',').map(l => l.trim()).filter(l => l)
      },
      applicationSettings: {
        delayBetweenApplications: parseInt(document.getElementById('delayBetweenApplications').value) * 1000,
        skipAppliedJobs: document.getElementById('skipAppliedJobs').checked
      }
    };
    
    // Salva no storage
    await chrome.storage.local.set({ settings });
    popupState.settings = settings;
    
    // Mostra feedback
    const saveBtn = document.getElementById('saveSettings');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Salvo!';
    saveBtn.style.background = '#28a745';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Atualiza a interface
function updateUI() {
  showScreen(popupState.currentScreen);
  
  if (popupState.currentScreen === 'dashboard') {
    updateDashboard();
  } else if (popupState.currentScreen === 'settings') {
    updateSettings();
  } else if (popupState.currentScreen === 'statistics') {
    updateStatistics();
  }
}

// Mostra uma tela específica
function showScreen(screenName) {
  const screens = ['loginScreen', 'dashboardScreen', 'settingsScreen', 'statisticsScreen'];
  
  screens.forEach(screen => {
    const element = document.getElementById(screen);
    if (element) {
      element.style.display = screen === `${screenName}Screen` ? 'block' : 'none';
    }
  });
  
  popupState.currentScreen = screenName;
}

// Atualiza o dashboard
function updateDashboard() {
  if (!popupState.user || !popupState.extensionState) return;
  
  // Informações do usuário
  const userName = document.getElementById('userName');
  const userPlan = document.getElementById('userPlan');
  const userInitials = document.getElementById('userInitials');
  
  if (userName) userName.textContent = popupState.user.fullName || popupState.user.email;
  if (userPlan) userPlan.textContent = `Plano ${popupState.user.subscription?.plan || 'Básico'}`;
  if (userInitials) {
    const initials = (popupState.user.fullName || popupState.user.email)
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    userInitials.textContent = initials;
  }
  
  // Status
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const toggleBtn = document.getElementById('toggleAutoApply');
  
  if (popupState.extensionState.isRunning) {
    if (statusDot) statusDot.classList.add('active');
    if (statusText) statusText.textContent = 'Ativo';
    if (toggleBtn) toggleBtn.classList.add('active');
  } else {
    if (statusDot) statusDot.classList.remove('active');
    if (statusText) statusText.textContent = 'Inativo';
    if (toggleBtn) toggleBtn.classList.remove('active');
  }
  
  // Estatísticas
  const jobsFound = document.getElementById('jobsFound');
  const applicationsSubmitted = document.getElementById('applicationsSubmitted');
  
  if (jobsFound) jobsFound.textContent = popupState.extensionState.jobsFound || 0;
  if (applicationsSubmitted) applicationsSubmitted.textContent = popupState.extensionState.applicationsSubmitted || 0;
  
  // Limites de uso
  updateUsageLimits();
  
  // Status das plataformas
  updatePlatformStatus();
}

// Atualiza os limites de uso
function updateUsageLimits() {
  const usageText = document.getElementById('usageText');
  const progressFill = document.getElementById('progressFill');
  const resetDate = document.getElementById('resetDate');
  
  if (!popupState.extensionState) return;
  
  const used = popupState.extensionState.monthlyUsed || 0;
  const limit = popupState.extensionState.monthlyLimit || 50;
  const percentage = Math.min((used / limit) * 100, 100);
  
  if (usageText) usageText.textContent = `${used} de ${limit} aplicações`;
  if (progressFill) progressFill.style.width = `${percentage}%`;
  
  // Data de reset (próximo mês)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  
  if (resetDate) {
    resetDate.textContent = `Renova em: ${nextMonth.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })}`;
  }
}

// Atualiza o status das plataformas
function updatePlatformStatus() {
  if (!popupState.settings) return;
  
  const platforms = ['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'];
  
  platforms.forEach(platform => {
    const item = document.querySelector(`[data-platform="${platform}"]`);
    const status = item?.querySelector('.platform-status');
    
    if (status) {
      if (popupState.settings.platforms[platform]) {
        status.classList.add('active');
      } else {
        status.classList.remove('active');
      }
    }
  });
}

// Atualiza as configurações
function updateSettings() {
  if (!popupState.settings) return;
  
  // Plataformas
  Object.entries(popupState.settings.platforms).forEach(([platform, enabled]) => {
    const checkbox = document.getElementById(`enable${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
    if (checkbox) checkbox.checked = enabled;
  });
  
  // Critérios de busca
  const keywords = document.getElementById('keywords');
  const locations = document.getElementById('locations');
  
  if (keywords) keywords.value = popupState.settings.searchCriteria.keywords.join(', ');
  if (locations) locations.value = popupState.settings.searchCriteria.locations.join(', ');
  
  // Configurações de aplicação
  const delay = document.getElementById('delayBetweenApplications');
  const skipApplied = document.getElementById('skipAppliedJobs');
  
  if (delay) delay.value = (popupState.settings.applicationSettings.delayBetweenApplications || 5000) / 1000;
  if (skipApplied) skipApplied.checked = popupState.settings.applicationSettings.skipAppliedJobs;
}

// Atualiza as estatísticas
async function updateStatistics() {
  try {
    const result = await chrome.storage.local.get('settings');
    const stats = result.settings?.statistics || {};
    
    const totalApplications = document.getElementById('totalApplicationsStats');
    const monthlyApplications = document.getElementById('monthlyApplicationsStats');
    const successRate = document.getElementById('successRateStats');
    
    if (totalApplications) totalApplications.textContent = stats.totalApplications || 0;
    if (monthlyApplications) monthlyApplications.textContent = stats.monthlyApplications || 0;
    if (successRate) successRate.textContent = '0%'; // Será calculado quando tivermos dados de resposta
    
    // Estatísticas por plataforma
    updatePlatformStatistics(stats.platformStats || {});
    
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Atualiza estatísticas por plataforma
function updatePlatformStatistics(platformStats) {
  const container = document.getElementById('platformStatsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.entries(platformStats).forEach(([platform, count]) => {
    const item = document.createElement('div');
    item.className = 'platform-stat-item';
    item.innerHTML = `
      <div class="platform-stat-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
      <div class="platform-stat-count">${count}</div>
    `;
    container.appendChild(item);
  });
}

// Utilitários
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

function showLoading(button, show) {
  const spinner = button.querySelector('.spinner');
  const text = button.querySelector('.btn-text');
  
  if (show) {
    if (spinner) spinner.style.display = 'block';
    if (text) text.style.display = 'none';
    button.disabled = true;
  } else {
    if (spinner) spinner.style.display = 'none';
    if (text) text.style.display = 'block';
    button.disabled = false;
  }
}

function showError(errorElement, message) {
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function hideError(errorElement) {
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

// Polling para atualizações
function startPolling() {
  setInterval(async () => {
    if (popupState.isAuthenticated && popupState.currentScreen === 'dashboard') {
      await loadExtensionState();
      updateDashboard();
    }
  }, 5000); // Atualiza a cada 5 segundos
}
