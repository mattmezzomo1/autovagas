// AutoVagas Extension Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginForm = document.getElementById('loginForm');
  const mainContent = document.getElementById('mainContent');
  const authForm = document.getElementById('authForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const userEmail = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const statusText = document.getElementById('statusText');
  const queueCount = document.getElementById('queueCount');
  const completedCount = document.getElementById('completedCount');
  const failedCount = document.getElementById('failedCount');
  const lastActivity = document.getElementById('lastActivity');
  const activeTasks = document.getElementById('activeTasks');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  
  // Check authentication status
  checkAuthStatus();
  
  // Set up event listeners
  authForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  pauseBtn.addEventListener('click', handlePause);
  resumeBtn.addEventListener('click', handleResume);
  
  // Update status every 2 seconds
  setInterval(updateStatus, 2000);
  
  /**
   * Check if user is authenticated
   */
  function checkAuthStatus() {
    chrome.runtime.sendMessage({ type: 'getStatus' }, response => {
      if (response.isAuthenticated) {
        showMainContent(response);
      } else {
        showLoginForm();
      }
    });
  }
  
  /**
   * Show login form
   */
  function showLoginForm() {
    loginForm.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
  
  /**
   * Show main content
   */
  function showMainContent(status) {
    loginForm.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
    // Update user info
    userEmail.textContent = status.userId;
    
    // Update status
    updateStatusDisplay(status);
  }
  
  /**
   * Handle login form submission
   */
  async function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      loginError.textContent = 'Por favor, preencha todos os campos';
      return;
    }
    
    loginError.textContent = '';
    
    // Send login request to background script
    chrome.runtime.sendMessage(
      { 
        type: 'login', 
        data: { email, password } 
      }, 
      response => {
        if (response.success) {
          showMainContent({ isAuthenticated: true, userId: email });
        } else {
          loginError.textContent = response.error || 'Falha ao fazer login';
        }
      }
    );
  }
  
  /**
   * Handle logout button click
   */
  function handleLogout() {
    chrome.runtime.sendMessage({ type: 'logout' }, response => {
      if (response.success) {
        showLoginForm();
      }
    });
  }
  
  /**
   * Handle pause button click
   */
  function handlePause() {
    chrome.runtime.sendMessage({ type: 'pauseScraping' }, response => {
      if (response.success) {
        updateStatus();
      }
    });
  }
  
  /**
   * Handle resume button click
   */
  function handleResume() {
    chrome.runtime.sendMessage({ type: 'resumeScraping' }, response => {
      if (response.success) {
        updateStatus();
      }
    });
  }
  
  /**
   * Update status display
   */
  function updateStatusDisplay(status) {
    // Update status text
    if (status.activeTasks && status.activeTasks.length > 0) {
      statusText.textContent = 'Ativo';
      statusText.style.color = '#4caf50'; // Green
    } else if (status.isProcessing) {
      statusText.textContent = 'Aguardando tarefas';
      statusText.style.color = '#2196f3'; // Blue
    } else {
      statusText.textContent = 'Pausado';
      statusText.style.color = '#ff9800'; // Orange
    }
    
    // Update statistics
    queueCount.textContent = status.queueLength || 0;
    completedCount.textContent = status.statistics?.tasksCompleted || 0;
    failedCount.textContent = status.statistics?.tasksFailed || 0;
    
    if (status.statistics?.lastActivity) {
      const lastActivityTime = new Date(status.statistics.lastActivity);
      lastActivity.textContent = formatDateTime(lastActivityTime);
    } else {
      lastActivity.textContent = '-';
    }
    
    // Update active tasks list
    updateActiveTasksList(status.activeTasks || []);
    
    // Update button states
    pauseBtn.disabled = !status.isProcessing;
    resumeBtn.disabled = status.isProcessing;
  }
  
  /**
   * Update active tasks list
   */
  function updateActiveTasksList(tasks) {
    if (tasks.length === 0) {
      activeTasks.innerHTML = '<div class="empty-state">Nenhuma tarefa ativa no momento</div>';
      return;
    }
    
    activeTasks.innerHTML = '';
    
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = 'task-item';
      
      const platformSpan = document.createElement('span');
      platformSpan.className = 'task-platform';
      platformSpan.textContent = task.platform;
      
      const typeSpan = document.createElement('span');
      typeSpan.className = 'task-type';
      typeSpan.textContent = getTaskTypeLabel(task.type);
      
      const timeSpan = document.createElement('div');
      timeSpan.className = 'task-time';
      timeSpan.textContent = `Iniciado: ${formatDateTime(new Date(task.startedAt))}`;
      
      taskElement.appendChild(platformSpan);
      taskElement.appendChild(typeSpan);
      taskElement.appendChild(timeSpan);
      
      activeTasks.appendChild(taskElement);
    });
  }
  
  /**
   * Get human-readable task type label
   */
  function getTaskTypeLabel(type) {
    const typeLabels = {
      'search_jobs': 'Busca de vagas',
      'job_details': 'Detalhes da vaga'
    };
    
    return typeLabels[type] || type;
  }
  
  /**
   * Format date and time
   */
  function formatDateTime(date) {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  /**
   * Update status from background script
   */
  function updateStatus() {
    chrome.runtime.sendMessage({ type: 'getStatus' }, response => {
      if (response.isAuthenticated) {
        updateStatusDisplay(response);
      }
    });
  }
});
