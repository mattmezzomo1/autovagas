// Indeed Scraper Implementation

/**
 * Scrape job search results from Indeed
 * @param {Object} task - The task object containing search parameters
 * @returns {Promise<Array>} - Array of job listings
 */
async function scrapeIndeedSearch(task) {
  console.log('Starting Indeed search scrape:', task.params);
  
  // Build search URL
  const searchUrl = buildIndeedSearchUrl(task.params);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(searchUrl);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job listings
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractIndeedSearchResults,
      args: [task.params]
    });
    
    // Process the results
    const jobListings = results[0].result || [];
    console.log(`Found ${jobListings.length} Indeed job listings`);
    
    return jobListings;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Scrape detailed job information from Indeed
 * @param {Object} task - The task object containing job URL
 * @returns {Promise<Object>} - Detailed job information
 */
async function scrapeIndeedJobDetails(task) {
  console.log('Starting Indeed job details scrape:', task.params.url);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(task.params.url);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job details
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractIndeedJobDetails
    });
    
    // Process the results
    const jobDetails = results[0].result || {};
    console.log('Indeed job details scraped successfully');
    
    return jobDetails;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Build Indeed search URL from parameters
 * @param {Object} params - Search parameters
 * @returns {string} - Search URL
 */
function buildIndeedSearchUrl(params) {
  let url = 'https://br.indeed.com/jobs?';
  const queryParams = [];
  
  // Add keywords
  if (params.keywords && params.keywords.length > 0) {
    queryParams.push(`q=${encodeURIComponent(params.keywords.join(' '))}`);
  }
  
  // Add location
  if (params.locations && params.locations.length > 0) {
    queryParams.push(`l=${encodeURIComponent(params.locations[0])}`);
  }
  
  // Add remote filter
  if (params.remote) {
    queryParams.push('remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11');
  }
  
  // Add job type filters
  if (params.jobTypes && params.jobTypes.length > 0) {
    const jobTypeMap = {
      'CLT': 'jt=fulltime',
      'PJ': 'jt=contract',
      'Temporary': 'jt=temporary',
      'Internship': 'jt=internship'
    };
    
    params.jobTypes.forEach(type => {
      if (jobTypeMap[type]) {
        queryParams.push(jobTypeMap[type]);
      }
    });
  }
  
  // Add date posted filter (last 24 hours)
  queryParams.push('fromage=1');
  
  // Combine all parameters
  url += queryParams.join('&');
  
  return url;
}

/**
 * Function that runs in the context of the Indeed page to extract search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of job listings
 */
function extractIndeedSearchResults(params) {
  // This function runs in the context of the Indeed page
  const jobListings = [];
  
  // Get all job cards
  const jobCards = document.querySelectorAll('.job_seen_beacon');
  
  // Extract data from each card
  jobCards.forEach((card, index) => {
    try {
      // Get job title
      const titleElement = card.querySelector('.jobTitle span');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      // Get company name
      const companyElement = card.querySelector('.companyName');
      const company = companyElement ? companyElement.textContent.trim() : '';
      
      // Get location
      const locationElement = card.querySelector('.companyLocation');
      const location = locationElement ? locationElement.textContent.trim() : '';
      
      // Get salary if available
      const salaryElement = card.querySelector('.salary-snippet');
      const salary = salaryElement ? salaryElement.textContent.trim() : '';
      
      // Get job snippet
      const snippetElement = card.querySelector('.job-snippet');
      const snippet = snippetElement ? snippetElement.textContent.trim() : '';
      
      // Get job link
      const linkElement = card.querySelector('.jcs-JobTitle');
      const url = linkElement ? linkElement.href : '';
      
      // Get job ID from URL or generate one
      const jobId = url.match(/jk=([a-zA-Z0-9]+)/)?.[1] || `indeed-${Date.now()}-${index}`;
      
      // Get posted date
      const dateElement = card.querySelector('.date');
      const postedDate = dateElement ? dateElement.textContent.trim() : '';
      
      // Add to results
      jobListings.push({
        id: jobId,
        platform: 'indeed',
        title,
        company,
        location,
        salary,
        snippet,
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
 * Function that runs in the context of the Indeed page to extract job details
 * @returns {Object} - Detailed job information
 */
function extractIndeedJobDetails() {
  try {
    // Get job title
    const titleElement = document.querySelector('.jobsearch-JobInfoHeader-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Get company name
    const companyElement = document.querySelector('.jobsearch-InlineCompanyRating-companyName');
    const company = companyElement ? companyElement.textContent.trim() : '';
    
    // Get location
    const locationElement = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText');
    const location = locationElement ? locationElement.textContent.trim() : '';
    
    // Get salary if available
    const salaryElement = document.querySelector('[data-testid="attribute_snippet_compensation"]');
    const salary = salaryElement ? salaryElement.textContent.trim() : '';
    
    // Get job type
    const jobTypeElement = document.querySelector('[data-testid="attribute_snippet_job_type"]');
    const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : '';
    
    // Get job description
    const descriptionElement = document.querySelector('#jobDescriptionText');
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';
    
    // Extract requirements from description
    const requirements = extractRequirementsFromDescription(description);
    
    // Get application URL
    const applyButton = document.querySelector('.jobsearch-IndeedApplyButton');
    const applicationUrl = applyButton ? window.location.href : window.location.href;
    
    return {
      title,
      company,
      location,
      salary,
      jobType,
      description,
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
window.scrapeIndeedSearch = scrapeIndeedSearch;
window.scrapeIndeedJobDetails = scrapeIndeedJobDetails;
