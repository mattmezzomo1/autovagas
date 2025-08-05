// AutoVagas Extension - Common Content Script
// This script is injected into all job platform pages

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.action === 'extractSearchResults') {
    const results = extractSearchResults(message.platform, message.params);
    sendResponse(results);
    return true;
  }

  if (message.action === 'extractJobDetails') {
    const details = extractJobDetails(message.platform);
    sendResponse(details);
    return true;
  }
});

/**
 * Extract search results based on platform
 * @param {string} platform - Platform name
 * @param {Object} params - Search parameters
 * @returns {Array} - Job listings
 */
function extractSearchResults(platform, params) {
  switch (platform) {
    case 'linkedin':
      return extractLinkedInSearchResults(params);
    case 'indeed':
      return extractIndeedSearchResults(params);
    case 'infojobs':
      return extractInfoJobsSearchResults(params);
    case 'catho':
      return extractCathoSearchResults(params);
    default:
      console.error(`Unsupported platform: ${platform}`);
      return [];
  }
}

/**
 * Extract job details based on platform
 * @param {string} platform - Platform name
 * @returns {Object} - Job details
 */
function extractJobDetails(platform) {
  switch (platform) {
    case 'linkedin':
      return extractLinkedInJobDetails();
    case 'indeed':
      return extractIndeedJobDetails();
    case 'infojobs':
      return extractInfoJobsJobDetails();
    case 'catho':
      return extractCathoJobDetails();
    default:
      console.error(`Unsupported platform: ${platform}`);
      return {};
  }
}

/**
 * Extract LinkedIn search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Job listings
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
 * Extract LinkedIn job details
 * @returns {Object} - Job details
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
 * Extract Indeed search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Job listings
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
 * Extract Indeed job details
 * @returns {Object} - Job details
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
 * Extract InfoJobs search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Job listings
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
 * Extract InfoJobs job details
 * @returns {Object} - Job details
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
 * Extract Catho search results
 * @param {Object} params - Search parameters
 * @returns {Array} - Job listings
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
 * Extract Catho job details
 * @returns {Object} - Job details
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
