// Utility functions for the AutoVagas Chrome Extension

/**
 * Create a new tab for scraping
 * @param {string} url - URL to navigate to
 * @returns {Promise<chrome.tabs.Tab>} - Created tab
 */
async function createScrapingTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active: false }, tab => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(tab);
      }
    });
  });
}

/**
 * Wait for a tab to finish loading
 * @param {number} tabId - ID of the tab to wait for
 * @returns {Promise<void>}
 */
async function waitForTabLoad(tabId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Tab load timeout'));
    }, 30000); // 30 second timeout
    
    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Add a small delay to ensure page is fully rendered
        setTimeout(resolve, 2000);
      }
    }
    
    chrome.tabs.onUpdated.addListener(listener);
  });
}

/**
 * Send task results to the server
 * @param {string} taskId - ID of the completed task
 * @param {any} results - Task results
 * @returns {Promise<void>}
 */
async function sendTaskResults(taskId, results) {
  if (!state.isAuthenticated) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${CONFIG.API_BASE_URL}/extension/tasks/${taskId}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.userToken}`
    },
    body: JSON.stringify({
      taskId,
      results,
      completedAt: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to send task results: ${response.status}`);
  }
  
  console.log(`Results for task ${taskId} sent successfully`);
}

/**
 * Report task failure to the server
 * @param {string} taskId - ID of the failed task
 * @param {string} error - Error message
 * @returns {Promise<void>}
 */
async function reportTaskFailure(taskId, error) {
  if (!state.isAuthenticated) {
    throw new Error('Not authenticated');
  }
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/extension/tasks/${taskId}/failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.userToken}`
      },
      body: JSON.stringify({
        taskId,
        error,
        failedAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.error(`Failed to report task failure: ${response.status}`);
    } else {
      console.log(`Failure for task ${taskId} reported successfully`);
    }
  } catch (err) {
    console.error('Error reporting task failure:', err);
  }
}

/**
 * Scrape job search results based on platform
 * @param {Object} task - Task object
 * @returns {Promise<Array>} - Job listings
 */
async function scrapeJobSearch(task) {
  switch (task.platform) {
    case 'linkedin':
      return await scrapeLinkedInSearch(task);
    case 'indeed':
      return await scrapeIndeedSearch(task);
    case 'infojobs':
      return await scrapeInfoJobsSearch(task);
    case 'catho':
      return await scrapeCathoSearch(task);
    default:
      throw new Error(`Unsupported platform: ${task.platform}`);
  }
}

/**
 * Scrape job details based on platform
 * @param {Object} task - Task object
 * @returns {Promise<Object>} - Job details
 */
async function scrapeJobDetails(task) {
  switch (task.platform) {
    case 'linkedin':
      return await scrapeLinkedInJobDetails(task);
    case 'indeed':
      return await scrapeIndeedJobDetails(task);
    case 'infojobs':
      return await scrapeInfoJobsJobDetails(task);
    case 'catho':
      return await scrapeCathoJobDetails(task);
    default:
      throw new Error(`Unsupported platform: ${task.platform}`);
  }
}

/**
 * Generate a random delay within a range
 * @param {number} min - Minimum delay in milliseconds
 * @param {number} max - Maximum delay in milliseconds
 * @returns {Promise<void>}
 */
async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Get a random user agent
 * @returns {string} - User agent string
 */
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Export utility functions
window.createScrapingTab = createScrapingTab;
window.waitForTabLoad = waitForTabLoad;
window.sendTaskResults = sendTaskResults;
window.reportTaskFailure = reportTaskFailure;
window.scrapeJobSearch = scrapeJobSearch;
window.scrapeJobDetails = scrapeJobDetails;
window.randomDelay = randomDelay;
window.getRandomUserAgent = getRandomUserAgent;
