// Background script para a extensão AutoVagas
console.log('AutoVagas Extension - Background script loaded');

// Configurações da API
const API_BASE_URL = 'http://localhost:3000'; // Será configurado para produção

// Estado global da extensão
let extensionState = {
  isAuthenticated: false,
  user: null,
  isRunning: false,
  currentPlatform: null,
  jobsFound: 0,
  applicationsSubmitted: 0,
  dailyLimit: 50,
  monthlyLimit: 50,
  monthlyUsed: 0
};

// Inicialização da extensão
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details);

  // Inicializa o storage
  await initializeStorage();

  // Carrega o estado do usuário
  await loadUserState();
});

// Inicializa o storage com valores padrão
async function initializeStorage() {
  const defaultSettings = {
    autoApplyEnabled: false,
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
      workModels: ['Remoto', 'Híbrido', 'Presencial'],
      salaryMin: 0,
      experienceLevel: 'any'
    },
    applicationSettings: {
      coverLetterTemplate: '',
      autoFillProfile: true,
      skipAppliedJobs: true,
      delayBetweenApplications: 5000 // 5 segundos
    },
    statistics: {
      totalApplications: 0,
      monthlyApplications: 0,
      lastResetDate: new Date().toISOString(),
      platformStats: {
        linkedin: 0,
        infojobs: 0,
        catho: 0,
        indeed: 0,
        vagas: 0
      }
    }
  };

  // Verifica se já existe configuração
  const existingSettings = await chrome.storage.local.get('settings');
  if (!existingSettings.settings) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
}

// Carrega o estado do usuário autenticado
async function loadUserState() {
  try {
    const authData = await chrome.storage.local.get(['authToken', 'user']);

    if (authData.authToken && authData.user) {
      extensionState.isAuthenticated = true;
      extensionState.user = authData.user;

      // Verifica se o token ainda é válido
      const isValid = await validateAuthToken(authData.authToken);
      if (!isValid) {
        await logout();
      } else {
        // Atualiza os limites baseado no plano do usuário
        updateUserLimits(authData.user);
      }
    }
  } catch (error) {
    console.error('Error loading user state:', error);
  }
}

// Valida o token de autenticação
async function validateAuthToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

// Atualiza os limites baseado no plano do usuário
function updateUserLimits(user) {
  const planLimits = {
    basic: { daily: 50, monthly: 50 },
    plus: { daily: 100, monthly: 100 },
    premium: { daily: 1000, monthly: 1000 }
  };

  const limits = planLimits[user.subscription?.plan] || planLimits.basic;
  extensionState.dailyLimit = limits.daily;
  extensionState.monthlyLimit = limits.monthly;
}

// Listener para mensagens dos content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.action) {
    case 'getAuthState':
      sendResponse({
        isAuthenticated: extensionState.isAuthenticated,
        user: extensionState.user
      });
      break;

    case 'login':
      handleLogin(request.credentials)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Indica resposta assíncrona

    case 'logout':
      handleLogout()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'startAutoApply':
      handleStartAutoApply(request.settings)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'stopAutoApply':
      handleStopAutoApply()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'getExtensionState':
      sendResponse(extensionState);
      break;

    case 'jobFound':
      handleJobFound(request.job, sender.tab);
      sendResponse({ success: true });
      break;

    case 'applicationSubmitted':
      handleApplicationSubmitted(request.application, sender.tab);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Manipula o login do usuário
async function handleLogin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.ok) {
      // Salva os dados de autenticação
      await chrome.storage.local.set({
        authToken: data.token,
        user: data.user
      });

      extensionState.isAuthenticated = true;
      extensionState.user = data.user;
      updateUserLimits(data.user);

      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Erro de conexão com o servidor' };
  }
}

// Manipula o logout
async function handleLogout() {
  await chrome.storage.local.remove(['authToken', 'user']);
  extensionState.isAuthenticated = false;
  extensionState.user = null;
  extensionState.isRunning = false;
}

// Manipula o início da auto-aplicação
async function handleStartAutoApply(settings) {
  if (!extensionState.isAuthenticated) {
    return { success: false, error: 'Usuário não autenticado' };
  }

  if (extensionState.monthlyUsed >= extensionState.monthlyLimit) {
    return { success: false, error: 'Limite mensal de aplicações atingido' };
  }

  extensionState.isRunning = true;

  // Salva as configurações
  await chrome.storage.local.set({ settings });

  // Notifica todos os content scripts para iniciar
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (isJobPlatform(tab.url)) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'startAutoApply',
        settings
      }).catch(() => {
        // Ignora erros de tabs que não têm content script
      });
    }
  }

  return { success: true };
}

// Manipula a parada da auto-aplicação
async function handleStopAutoApply() {
  extensionState.isRunning = false;

  // Notifica todos os content scripts para parar
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (isJobPlatform(tab.url)) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'stopAutoApply'
      }).catch(() => {
        // Ignora erros de tabs que não têm content script
      });
    }
  }
}

// Verifica se a URL é de uma plataforma de emprego
function isJobPlatform(url) {
  if (!url) return false;

  const platforms = [
    'linkedin.com',
    'infojobs.com.br',
    'catho.com.br',
    'indeed.com',
    'vagas.com.br'
  ];

  return platforms.some(platform => url.includes(platform));
}

// Manipula vaga encontrada
function handleJobFound(job, tab) {
  extensionState.jobsFound++;

  // Envia estatísticas para a API
  sendJobStatistics('job_found', job, tab);
}

// Manipula aplicação submetida
function handleApplicationSubmitted(application, tab) {
  extensionState.applicationsSubmitted++;
  extensionState.monthlyUsed++;

  // Atualiza estatísticas locais
  updateLocalStatistics(application);

  // Envia para a API
  sendJobStatistics('application_submitted', application, tab);
}

// Atualiza estatísticas locais
async function updateLocalStatistics(application) {
  const data = await chrome.storage.local.get('settings');
  const settings = data.settings || {};

  if (!settings.statistics) {
    settings.statistics = {
      totalApplications: 0,
      monthlyApplications: 0,
      lastResetDate: new Date().toISOString(),
      platformStats: {}
    };
  }

  settings.statistics.totalApplications++;
  settings.statistics.monthlyApplications++;

  const platform = application.platform || 'unknown';
  settings.statistics.platformStats[platform] =
    (settings.statistics.platformStats[platform] || 0) + 1;

  await chrome.storage.local.set({ settings });
}

// Envia estatísticas para a API
async function sendJobStatistics(eventType, data, tab) {
  if (!extensionState.isAuthenticated) return;

  try {
    const authData = await chrome.storage.local.get('authToken');

    await fetch(`${API_BASE_URL}/api/extension/statistics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        data,
        tabUrl: tab?.url,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error sending statistics:', error);
  }
}

// Listener para mudanças de tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isJobPlatform(tab.url)) {
    // Injeta o content script se necessário
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['utils/common.js']
    }).catch(() => {
      // Ignora erros se o script já estiver injetado
    });
  }
});

// Cleanup quando a extensão é desabilitada
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending...');
  extensionState.isRunning = false;
});
