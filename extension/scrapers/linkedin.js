// LinkedIn Scraper Implementation

/**
 * Scrape job search results from LinkedIn
 * @param {Object} task - The task object containing search parameters
 * @returns {Promise<Array>} - Array of job listings
 */
async function scrapeLinkedInSearch(task) {
  console.log('Starting LinkedIn search scrape:', task.params);
  
  // Build search URL
  const searchUrl = buildLinkedInSearchUrl(task.params);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(searchUrl);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job listings
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractLinkedInSearchResults,
      args: [task.params]
    });
    
    // Process the results
    const jobListings = results[0].result || [];
    console.log(`Found ${jobListings.length} LinkedIn job listings`);
    
    return jobListings;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Scrape detailed job information from LinkedIn
 * @param {Object} task - The task object containing job URL
 * @returns {Promise<Object>} - Detailed job information
 */
async function scrapeLinkedInJobDetails(task) {
  console.log('Starting LinkedIn job details scrape:', task.params.url);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(task.params.url);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job details
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractLinkedInJobDetails
    });
    
    // Process the results
    const jobDetails = results[0].result || {};
    console.log('LinkedIn job details scraped successfully');
    
    return jobDetails;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Build LinkedIn search URL from parameters
 * @param {Object} params - Search parameters
 * @returns {string} - Search URL
 */
function buildLinkedInSearchUrl(params) {
  let url = 'https://www.linkedin.com/jobs/search/?';
  const queryParams = [];
  
  // Add keywords
  if (params.keywords && params.keywords.length > 0) {
    queryParams.push(`keywords=${encodeURIComponent(params.keywords.join(' '))}`);
  }
  
  // Add location
  if (params.locations && params.locations.length > 0) {
    queryParams.push(`location=${encodeURIComponent(params.locations[0])}`);
  }
  
  // Add remote filter
  if (params.remote) {
    queryParams.push('f_WT=2');
  }
  
  // Add job type filters
  if (params.jobTypes && params.jobTypes.length > 0) {
    const jobTypeMap = {
      'CLT': 'F_JT=F',
      'PJ': 'F_JT=C',
      'Temporary': 'F_JT=T',
      'Internship': 'F_JT=I'
    };
    
    params.jobTypes.forEach(type => {
      if (jobTypeMap[type]) {
        queryParams.push(jobTypeMap[type]);
      }
    });
  }
  
  // Add date posted filter (last 24 hours)
  queryParams.push('f_TPR=r86400');
  
  // Combine all parameters
  url += queryParams.join('&');
  
  return url;
}

/**
 * Function that runs in the context of the LinkedIn page to extract search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of job listings
 */
function extractLinkedInSearchResults(params) {
  // This function runs in the context of the LinkedIn page
  const jobListings = [];
  
  // Get all job cards
  const jobCards = document.querySelectorAll('.job-search-card');
  
  // Extract data from each card
  jobCards.forEach((card, index) => {
    try {
      // Get job title
      const titleElement = card.querySelector('.job-search-card__title');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      // Get company name
      const companyElement = card.querySelector('.job-search-card__company-name');
      const company = companyElement ? companyElement.textContent.trim() : '';
      
      // Get location
      const locationElement = card.querySelector('.job-search-card__location');
      const location = locationElement ? locationElement.textContent.trim() : '';
      
      // Get job link
      const linkElement = card.querySelector('.job-search-card__title');
      const url = linkElement ? linkElement.closest('a').href : '';
      
      // Get job ID from URL
      const jobId = url.match(/\/view\/([0-9]+)\/?/)?.[1] || `linkedin-${Date.now()}-${index}`;
      
      // Get posted date
      const dateElement = card.querySelector('.job-search-card__listdate');
      const postedDate = dateElement ? dateElement.getAttribute('datetime') : '';
      
      // Add to results
      jobListings.push({
        id: jobId,
        platform: 'linkedin',
        title,
        company,
        location,
        url,
        postedDate,
        scrapedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error extracting job card data:', error);
    }
  });
  
  return jobListings;
}

/**
 * Function that runs in the context of the LinkedIn page to extract job details
 * @returns {Object} - Detailed job information
 */
function extractLinkedInJobDetails() {
  try {
    // Get job title
    const titleElement = document.querySelector('.top-card-layout__title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Get company name
    const companyElement = document.querySelector('.topcard__org-name-link');
    const company = companyElement ? companyElement.textContent.trim() : '';
    
    // Get location
    const locationElement = document.querySelector('.topcard__flavor--bullet');
    const location = locationElement ? locationElement.textContent.trim() : '';
    
    // Get job description
    const descriptionElement = document.querySelector('.description__text');
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';
    
    // Get job criteria
    const criteriaElements = document.querySelectorAll('.description__job-criteria-item');
    const criteria = {};
    
    criteriaElements.forEach(element => {
      const label = element.querySelector('.description__job-criteria-subheader').textContent.trim();
      const value = element.querySelector('.description__job-criteria-text').textContent.trim();
      criteria[label] = value;
    });
    
    // Extract requirements from description
    const requirements = extractRequirementsFromDescription(description);
    
    // Get application URL
    const applyButton = document.querySelector('.apply-button');
    const applicationUrl = applyButton ? applyButton.href : window.location.href;
    
    return {
      title,
      company,
      location,
      description,
      criteria,
      requirements,
      applicationUrl,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting job details:', error);
    return {};
  }
}

/**
 * Extract requirements from job description
 * @param {string} description - Job description text
 * @returns {Array} - Array of requirements
 */
function extractRequirementsFromDescription(description) {
  if (!description) return [];
  
  const requirements = [];
  
  // Look for common requirement patterns
  const lines = description.split('\n');
  
  let inRequirementsList = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this line starts a requirements section
    if (/^(requirements|qualifications|what you'll need|what you need|skills|experience required):/i.test(trimmedLine)) {
      inRequirementsList = true;
      continue;
    }
    
    // Check if this line ends a requirements section
    if (inRequirementsList && /^(responsibilities|about the role|what you'll do|benefits|about us):/i.test(trimmedLine)) {
      inRequirementsList = false;
      continue;
    }
    
    // Check if this is a bullet point in a requirements section
    if (inRequirementsList && (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || /^\d+\./.test(trimmedLine))) {
      const requirement = trimmedLine.replace(/^[•\-\d\.]+\s*/, '').trim();
      if (requirement.length > 5) {
        requirements.push(requirement);
      }
    }
  }
  
  return requirements;
}

// Export functions
window.scrapeLinkedInSearch = scrapeLinkedInSearch;
window.scrapeLinkedInJobDetails = scrapeLinkedInJobDetails;
