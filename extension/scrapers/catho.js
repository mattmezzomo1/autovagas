// Catho Scraper Implementation

/**
 * Scrape job search results from Catho
 * @param {Object} task - The task object containing search parameters
 * @returns {Promise<Array>} - Array of job listings
 */
async function scrapeCathoSearch(task) {
  console.log('Starting Catho search scrape:', task.params);
  
  // Build search URL
  const searchUrl = buildCathoSearchUrl(task.params);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(searchUrl);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Handle cookie consent if present
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: handleCathoCookieConsent
    });
    
    // Wait a bit for any redirects or cookie handling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Execute content script to extract job listings
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractCathoSearchResults,
      args: [task.params]
    });
    
    // Process the results
    const jobListings = results[0].result || [];
    console.log(`Found ${jobListings.length} Catho job listings`);
    
    return jobListings;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Scrape detailed job information from Catho
 * @param {Object} task - The task object containing job URL
 * @returns {Promise<Object>} - Detailed job information
 */
async function scrapeCathoJobDetails(task) {
  console.log('Starting Catho job details scrape:', task.params.url);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(task.params.url);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Handle cookie consent if present
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: handleCathoCookieConsent
    });
    
    // Wait a bit for any redirects or cookie handling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Execute content script to extract job details
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractCathoJobDetails
    });
    
    // Process the results
    const jobDetails = results[0].result || {};
    console.log('Catho job details scraped successfully');
    
    return jobDetails;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Handle cookie consent dialog on Catho
 */
function handleCathoCookieConsent() {
  try {
    // Look for cookie consent button and click it if present
    const cookieButton = document.querySelector('button[data-testid="cookie-banner-accept-button"]');
    if (cookieButton) {
      cookieButton.click();
      console.log('Clicked cookie consent button');
    }
  } catch (error) {
    console.error('Error handling cookie consent:', error);
  }
}

/**
 * Build Catho search URL from parameters
 * @param {Object} params - Search parameters
 * @returns {string} - Search URL
 */
function buildCathoSearchUrl(params) {
  let url = 'https://www.catho.com.br/vagas/?';
  const queryParams = [];
  
  // Add keywords
  if (params.keywords && params.keywords.length > 0) {
    queryParams.push(`q=${encodeURIComponent(params.keywords.join(' '))}`);
  }
  
  // Add location
  if (params.locations && params.locations.length > 0) {
    queryParams.push(`where=${encodeURIComponent(params.locations[0])}`);
  }
  
  // Add remote filter
  if (params.remote) {
    queryParams.push('remote=true');
  }
  
  // Add job type filters
  if (params.jobTypes && params.jobTypes.length > 0) {
    const jobTypeMap = {
      'CLT': 'contract_type=clt',
      'PJ': 'contract_type=pj',
      'Temporary': 'contract_type=temporary',
      'Internship': 'contract_type=internship'
    };
    
    params.jobTypes.forEach(type => {
      if (jobTypeMap[type]) {
        queryParams.push(jobTypeMap[type]);
      }
    });
  }
  
  // Add date posted filter (last 24 hours)
  queryParams.push('period=1');
  
  // Combine all parameters
  url += queryParams.join('&');
  
  return url;
}

/**
 * Function that runs in the context of the Catho page to extract search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of job listings
 */
function extractCathoSearchResults(params) {
  // This function runs in the context of the Catho page
  const jobListings = [];
  
  // Get all job cards
  const jobCards = document.querySelectorAll('.JobCard');
  
  // Extract data from each card
  jobCards.forEach((card, index) => {
    try {
      // Get job title
      const titleElement = card.querySelector('.JobCard__Title');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      // Get company name
      const companyElement = card.querySelector('.JobCard__Company');
      const company = companyElement ? companyElement.textContent.trim() : '';
      
      // Get location
      const locationElement = card.querySelector('.JobCard__Location');
      const location = locationElement ? locationElement.textContent.trim() : '';
      
      // Get salary if available
      const salaryElement = card.querySelector('.JobCard__Salary');
      const salary = salaryElement ? salaryElement.textContent.trim() : '';
      
      // Get job link
      const linkElement = card.querySelector('a.JobCard__Link');
      const url = linkElement ? linkElement.href : '';
      
      // Get job ID from URL or generate one
      const jobId = url.match(/\/([0-9]+)\/?/)?.[1] || `catho-${Date.now()}-${index}`;
      
      // Get posted date
      const dateElement = card.querySelector('.JobCard__Date');
      const postedDate = dateElement ? dateElement.textContent.trim() : '';
      
      // Add to results
      jobListings.push({
        id: jobId,
        platform: 'catho',
        title,
        company,
        location,
        salary,
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
 * Function that runs in the context of the Catho page to extract job details
 * @returns {Object} - Detailed job information
 */
function extractCathoJobDetails() {
  try {
    // Get job title
    const titleElement = document.querySelector('.JobViewTitle');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Get company name
    const companyElement = document.querySelector('.JobViewCompany');
    const company = companyElement ? companyElement.textContent.trim() : '';
    
    // Get location
    const locationElement = document.querySelector('.JobViewLocation');
    const location = locationElement ? locationElement.textContent.trim() : '';
    
    // Get salary if available
    const salaryElement = document.querySelector('.JobViewSalary');
    const salary = salaryElement ? salaryElement.textContent.trim() : '';
    
    // Get job type
    const jobTypeElement = document.querySelector('.JobViewContractType');
    const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : '';
    
    // Get job description
    const descriptionElement = document.querySelector('.JobViewDescription');
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';
    
    // Extract requirements from description
    const requirements = extractRequirementsFromDescription(description);
    
    // Get application URL
    const applicationUrl = window.location.href;
    
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
    if (/^(requisitos|qualificações|o que você precisa|habilidades|experiência necessária):/i.test(trimmedLine)) {
      inRequirementsList = true;
      continue;
    }
    
    // Check if this line ends a requirements section
    if (inRequirementsList && /^(responsabilidades|sobre a vaga|o que você vai fazer|benefícios|sobre nós):/i.test(trimmedLine)) {
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
window.scrapeCathoSearch = scrapeCathoSearch;
window.scrapeCathoJobDetails = scrapeCathoJobDetails;
