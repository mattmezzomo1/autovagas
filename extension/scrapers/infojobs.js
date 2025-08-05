// InfoJobs Scraper Implementation

/**
 * Scrape job search results from InfoJobs
 * @param {Object} task - The task object containing search parameters
 * @returns {Promise<Array>} - Array of job listings
 */
async function scrapeInfoJobsSearch(task) {
  console.log('Starting InfoJobs search scrape:', task.params);
  
  // Build search URL
  const searchUrl = buildInfoJobsSearchUrl(task.params);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(searchUrl);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job listings
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractInfoJobsSearchResults,
      args: [task.params]
    });
    
    // Process the results
    const jobListings = results[0].result || [];
    console.log(`Found ${jobListings.length} InfoJobs job listings`);
    
    return jobListings;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Scrape detailed job information from InfoJobs
 * @param {Object} task - The task object containing job URL
 * @returns {Promise<Object>} - Detailed job information
 */
async function scrapeInfoJobsJobDetails(task) {
  console.log('Starting InfoJobs job details scrape:', task.params.url);
  
  // Create a new tab for scraping
  const tab = await createScrapingTab(task.params.url);
  
  try {
    // Wait for page to load
    await waitForTabLoad(tab.id);
    
    // Execute content script to extract job details
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractInfoJobsJobDetails
    });
    
    // Process the results
    const jobDetails = results[0].result || {};
    console.log('InfoJobs job details scraped successfully');
    
    return jobDetails;
  } finally {
    // Close the tab
    await chrome.tabs.remove(tab.id);
  }
}

/**
 * Build InfoJobs search URL from parameters
 * @param {Object} params - Search parameters
 * @returns {string} - Search URL
 */
function buildInfoJobsSearchUrl(params) {
  let url = 'https://www.infojobs.com.br/empregos.aspx?';
  const queryParams = [];
  
  // Add keywords
  if (params.keywords && params.keywords.length > 0) {
    queryParams.push(`palabra=${encodeURIComponent(params.keywords.join(' '))}`);
  }
  
  // Add location
  if (params.locations && params.locations.length > 0) {
    queryParams.push(`provincia=${encodeURIComponent(params.locations[0])}`);
  }
  
  // Add remote filter
  if (params.remote) {
    queryParams.push('teletrabajo=true');
  }
  
  // Add job type filters
  if (params.jobTypes && params.jobTypes.length > 0) {
    const jobTypeMap = {
      'CLT': 'tipocontrato=1', // CLT
      'PJ': 'tipocontrato=8', // PJ
      'Temporary': 'tipocontrato=3', // Temporário
      'Internship': 'tipocontrato=6' // Estágio
    };
    
    params.jobTypes.forEach(type => {
      if (jobTypeMap[type]) {
        queryParams.push(jobTypeMap[type]);
      }
    });
  }
  
  // Add date posted filter (last 24 hours)
  queryParams.push('publicado=1');
  
  // Combine all parameters
  url += queryParams.join('&');
  
  return url;
}

/**
 * Function that runs in the context of the InfoJobs page to extract search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of job listings
 */
function extractInfoJobsSearchResults(params) {
  // This function runs in the context of the InfoJobs page
  const jobListings = [];
  
  // Get all job cards
  const jobCards = document.querySelectorAll('.vagaCard');
  
  // Extract data from each card
  jobCards.forEach((card, index) => {
    try {
      // Get job title
      const titleElement = card.querySelector('.vagaTitle');
      const title = titleElement ? titleElement.textContent.trim() : '';
      
      // Get company name
      const companyElement = card.querySelector('.vagaInfoCompany');
      const company = companyElement ? companyElement.textContent.trim() : '';
      
      // Get location
      const locationElement = card.querySelector('.vagaLocalDate');
      const locationText = locationElement ? locationElement.textContent.trim() : '';
      const location = locationText.split('-')[0].trim();
      
      // Get salary if available
      const salaryElement = card.querySelector('.vagaSalario');
      const salary = salaryElement ? salaryElement.textContent.trim() : '';
      
      // Get job link
      const linkElement = card.querySelector('a.vagaTitle');
      const url = linkElement ? linkElement.href : '';
      
      // Get job ID from URL or generate one
      const jobId = url.match(/\/([0-9]+)\/?/)?.[1] || `infojobs-${Date.now()}-${index}`;
      
      // Get posted date
      const dateElement = card.querySelector('.vagaLocalDate');
      const dateText = dateElement ? dateElement.textContent.trim() : '';
      const postedDate = dateText.split('-')[1]?.trim() || '';
      
      // Add to results
      jobListings.push({
        id: jobId,
        platform: 'infojobs',
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
 * Function that runs in the context of the InfoJobs page to extract job details
 * @returns {Object} - Detailed job information
 */
function extractInfoJobsJobDetails() {
  try {
    // Get job title
    const titleElement = document.querySelector('h1.vagaTitle');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Get company name
    const companyElement = document.querySelector('.vagaInfoCompany');
    const company = companyElement ? companyElement.textContent.trim() : '';
    
    // Get location
    const locationElement = document.querySelector('.vagaLocalDate');
    const locationText = locationElement ? locationElement.textContent.trim() : '';
    const location = locationText.split('-')[0].trim();
    
    // Get salary if available
    const salaryElement = document.querySelector('.vagaSalario');
    const salary = salaryElement ? salaryElement.textContent.trim() : '';
    
    // Get job type
    const jobTypeElement = document.querySelector('.vagaInfoContrato');
    const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : '';
    
    // Get job description
    const descriptionElement = document.querySelector('.vagaDescricao');
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
window.scrapeInfoJobsSearch = scrapeInfoJobsSearch;
window.scrapeInfoJobsJobDetails = scrapeInfoJobsJobDetails;
