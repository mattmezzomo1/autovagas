// AutoVagas Chrome Extension - Background Script
// This script runs in the background and manages the scraping tasks

// Configuration
const CONFIG = {
  API_BASE_URL: 'https://autovagas.com/api',
  POLLING_INTERVAL: 60000, // 1 minute
  MAX_CONCURRENT_TASKS: 1,
  TASK_TIMEOUT: 300000, // 5 minutes
  RETRY_DELAY: 30000, // 30 seconds
  MAX_RETRIES: 3
};

// State management
const state = {
  isAuthenticated: false,
  userToken: null,
  userId: null,
  taskQueue: [],
  activeTasks: new Map(), // taskId -> task
  isProcessing: false,
  statistics: {
    tasksCompleted: 0,
    tasksFailed: 0,
    lastActivity: null
  }
};

// Initialize extension
async function initialize() {
  console.log('AutoVagas extension initializing...');
  
  // Try to restore authentication state
  await restoreAuthState();
  
  // Set up periodic task polling
  chrome.alarms.create('taskPolling', { periodInMinutes: CONFIG.POLLING_INTERVAL / 60000 });
  chrome.alarms.onAlarm.addListener(handleAlarm);
  
  // Set up message listeners for popup communication
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Register with server if authenticated
  if (state.isAuthenticated) {
    registerWithServer();
  }
  
  console.log('AutoVagas extension initialized');
}

// Restore authentication state from storage
async function restoreAuthState() {
  try {
    const data = await chrome.storage.local.get(['userToken', 'userId', 'isAuthenticated']);
    if (data.userToken && data.userId) {
      state.userToken = data.userToken;
      state.userId = data.userId;
      state.isAuthenticated = true;
      console.log('Authentication restored for user:', state.userId);
    }
  } catch (error) {
    console.error('Failed to restore auth state:', error);
  }
}

// Save authentication state to storage
async function saveAuthState() {
  try {
    await chrome.storage.local.set({
      userToken: state.userToken,
      userId: state.userId,
      isAuthenticated: state.isAuthenticated
    });
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
}

// Register extension with server
async function registerWithServer() {
  if (!state.isAuthenticated) return;
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/extension/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.userToken}`
      },
      body: JSON.stringify({
        userId: state.userId,
        extensionInfo: {
          version: chrome.runtime.getManifest().version,
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server registration failed: ${response.status}`);
    }
    
    console.log('Extension registered with server');
    
    // Start polling for tasks
    fetchTasks();
  } catch (error) {
    console.error('Failed to register with server:', error);
    // Retry after delay
    setTimeout(registerWithServer, CONFIG.RETRY_DELAY);
  }
}

// Handle alarm events
function handleAlarm(alarm) {
  if (alarm.name === 'taskPolling') {
    fetchTasks();
  }
}

// Handle messages from popup
function handleMessage(message, sender, sendResponse) {
  console.log('Received message:', message);
  
  switch (message.type) {
    case 'login':
      handleLogin(message.data, sendResponse);
      return true; // Keep channel open for async response
      
    case 'logout':
      handleLogout();
      sendResponse({ success: true });
      break;
      
    case 'getStatus':
      sendResponse({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        queueLength: state.taskQueue.length,
        activeTasks: Array.from(state.activeTasks.values()).map(t => ({
          id: t.id,
          platform: t.platform,
          type: t.type,
          startedAt: t.startedAt
        })),
        statistics: state.statistics
      });
      break;
      
    case 'pauseScraping':
      state.isProcessing = false;
      sendResponse({ success: true });
      break;
      
    case 'resumeScraping':
      state.isProcessing = true;
      processNextTask();
      sendResponse({ success: true });
      break;
  }
}

// Handle login request
async function handleLogin(credentials, sendResponse) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update state
    state.userToken = data.token;
    state.userId = data.userId;
    state.isAuthenticated = true;
    
    // Save to storage
    await saveAuthState();
    
    // Register with server
    registerWithServer();
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Login failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle logout request
async function handleLogout() {
  // Clear state
  state.userToken = null;
  state.userId = null;
  state.isAuthenticated = false;
  state.taskQueue = [];
  state.activeTasks.clear();
  
  // Clear storage
  await chrome.storage.local.clear();
  
  console.log('User logged out');
}

// Fetch tasks from server
async function fetchTasks() {
  if (!state.isAuthenticated) return;
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/extension/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${state.userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    
    const tasks = await response.json();
    
    if (tasks.length > 0) {
      console.log(`Received ${tasks.length} tasks from server`);
      state.taskQueue.push(...tasks);
      
      // Start processing if not already
      if (!state.isProcessing) {
        state.isProcessing = true;
        processNextTask();
      }
    }
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
}

// Process next task in queue
async function processNextTask() {
  if (!state.isProcessing || state.taskQueue.length === 0 || 
      state.activeTasks.size >= CONFIG.MAX_CONCURRENT_TASKS) {
    return;
  }
  
  const task = state.taskQueue.shift();
  task.startedAt = new Date();
  task.attempts = task.attempts || 0;
  
  // Add to active tasks
  state.activeTasks.set(task.id, task);
  
  // Update statistics
  state.statistics.lastActivity = new Date();
  
  console.log(`Processing task: ${task.id} (${task.platform} - ${task.type})`);
  
  try {
    // Execute the appropriate scraping function based on task type and platform
    let results;
    
    switch (task.type) {
      case 'search_jobs':
        results = await scrapeJobSearch(task);
        break;
      case 'job_details':
        results = await scrapeJobDetails(task);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
    
    // Send results to server
    await sendTaskResults(task.id, results);
    
    // Update statistics
    state.statistics.tasksCompleted++;
    
    // Remove from active tasks
    state.activeTasks.delete(task.id);
    
    // Process next task
    processNextTask();
  } catch (error) {
    console.error(`Task ${task.id} failed:`, error);
    
    // Handle retry logic
    task.attempts++;
    if (task.attempts < CONFIG.MAX_RETRIES) {
      console.log(`Retrying task ${task.id} (attempt ${task.attempts})`);
      state.taskQueue.push(task);
    } else {
      // Report failure to server
      await reportTaskFailure(task.id, error.message);
      state.statistics.tasksFailed++;
    }
    
    // Remove from active tasks
    state.activeTasks.delete(task.id);
    
    // Process next task
    processNextTask();
  }
}

// Initialize the extension
initialize();
