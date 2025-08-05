import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ProxyRotationService, ProxyConfig, ProxySelectionOptions } from '../proxy/ProxyRotationService';
import { UserAgentRotatorService } from './UserAgentRotatorService';
import { HumanBehaviorSimulator } from './HumanBehaviorSimulator';
import { ScraperCacheService } from '../cache/ScraperCacheService';
import { config } from '../../config';
import { JobSearchParams, ScrapedJob } from '../webscraper/types';

// Add stealth plugin
puppeteerExtra.use(StealthPlugin());

/**
 * Service for scraping job platforms using proxies
 */
export class ProxyScraperService {
  private proxyRotationService: ProxyRotationService;
  private userAgentRotatorService: UserAgentRotatorService;
  private cacheService: ScraperCacheService;
  private humanBehaviorSimulator: HumanBehaviorSimulator;
  private browser: Browser | null = null;

  constructor() {
    this.proxyRotationService = new ProxyRotationService();
    this.userAgentRotatorService = new UserAgentRotatorService();
    this.cacheService = new ScraperCacheService();
    this.humanBehaviorSimulator = new HumanBehaviorSimulator();
  }

  /**
   * Initialize the browser
   */
  private async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await puppeteerExtra.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-notifications',
        '--disable-extensions',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    // Log browser launch
    console.log('Browser launched with stealth plugin');

    return this.browser;
  }

  /**
   * Create a new page with proxy
   */
  private async createProxyPage(proxyOptions: ProxySelectionOptions = {}): Promise<{ page: Page, proxy: ProxyConfig }> {
    // Get a proxy
    const proxy = this.proxyRotationService.getProxy(proxyOptions);

    if (!proxy) {
      throw new Error('No suitable proxy found');
    }

    // Initialize browser
    const browser = await this.initBrowser();

    // Create a new page
    const page = await browser.newPage();

    // Get a user agent based on the target platform
    const platform = proxyOptions.platform || 'linkedin';
    const userAgent = this.userAgentRotatorService.getTargetOptimizedUserAgent(platform as any);

    // Set user agent
    await page.setUserAgent(userAgent);

    // Set proxy
    if (proxy.username && proxy.password) {
      await page.authenticate({
        username: proxy.username,
        password: proxy.password
      });
    }

    // Set timeout
    await page.setDefaultNavigationTimeout(config.scraper.defaultTimeout);

    // Set viewport with slight randomization
    const width = 1920 + Math.floor(Math.random() * 100) - 50; // 1870-1970
    const height = 1080 + Math.floor(Math.random() * 100) - 50; // 1030-1130

    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1
    });

    // Set extra headers with some randomization
    const languages = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9'];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

    await page.setExtraHTTPHeaders({
      'Accept-Language': randomLanguage,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    });

    // Randomize the WebGL fingerprint
    await page.evaluateOnNewDocument(() => {
      // Override the WebGL fingerprinting functions
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // Randomize the WebGL fingerprint
        if (parameter === 37445) {
          return 'Intel Open Source Technology Center';
        }
        if (parameter === 37446) {
          return 'Mesa DRI Intel(R) HD Graphics 520 (Skylake GT2)';
        }
        return getParameter.apply(this, arguments);
      };
    });

    // Randomize the Canvas fingerprint
    await page.evaluateOnNewDocument(() => {
      // Override the Canvas fingerprinting functions
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

      HTMLCanvasElement.prototype.toDataURL = function(type) {
        if (this.width === 16 && this.height === 16) {
          // This is likely a fingerprinting attempt
          return originalToDataURL.apply(this, arguments);
        }
        return originalToDataURL.apply(this, arguments);
      };

      CanvasRenderingContext2D.prototype.getImageData = function(sx, sy, sw, sh) {
        // Add slight noise to the image data
        const imageData = originalGetImageData.apply(this, arguments);
        if (sw === 16 && sh === 16) {
          // This is likely a fingerprinting attempt
          return imageData;
        }
        return imageData;
      };
    });

    return { page, proxy };
  }

  /**
   * Search for jobs on LinkedIn
   */
  async searchLinkedInJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('linkedin', 'search', params);

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached LinkedIn search results');
      return cachedResults;
    }

    console.log('Searching LinkedIn jobs with params:', params);

    // Get proxy options based on location
    const proxyOptions: ProxySelectionOptions = {
      residential: true,
      minSuccessRate: 70
    };

    // If location is specified, try to get a proxy from that location
    if (params.locations && params.locations.length > 0) {
      const location = params.locations[0].toLowerCase();

      // Check if location is a Brazilian city
      const brCities = ['são paulo', 'sao paulo', 'rio de janeiro', 'brasília', 'brasilia', 'salvador', 'fortaleza'];
      if (brCities.some(city => location.includes(city))) {
        proxyOptions.country = 'br';

        // Try to match city
        for (const city of brCities) {
          if (location.includes(city)) {
            proxyOptions.city = city.replace('são', 'sao').replace('brasília', 'brasilia');
            break;
          }
        }
      } else if (location.includes('brasil') || location.includes('brazil')) {
        proxyOptions.country = 'br';
      } else if (location.includes('estados unidos') || location.includes('united states')) {
        proxyOptions.country = 'us';
      } else if (location.includes('canadá') || location.includes('canada')) {
        proxyOptions.country = 'ca';
      } else if (location.includes('méxico') || location.includes('mexico')) {
        proxyOptions.country = 'mx';
      }
    }

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage(proxyOptions);
      page = pageData.page;
      proxy = pageData.proxy;

      // Build LinkedIn search URL
      const url = this.buildLinkedInSearchUrl(params);

      // Navigate to search page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for job cards to load
      await page.waitForSelector('.job-search-card', { timeout: 10000 });

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job-search-card');
        const results = [];

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

            results.push({
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

        return results;
      });

      console.log(`Found ${jobs.length} LinkedIn jobs`);

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return [];
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Get LinkedIn job details
   */
  async getLinkedInJobDetails(jobId: string, url: string): Promise<any> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('linkedin', 'details', { jobId });

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached LinkedIn job details');
      return cachedResults;
    }

    console.log('Getting LinkedIn job details:', jobId);

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage({ residential: true, minSuccessRate: 80 });
      page = pageData.page;
      proxy = pageData.proxy;

      // Navigate to job page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for job details to load
      await page.waitForSelector('.top-card-layout__title', { timeout: 10000 });

      // Extract job details
      const jobDetails = await page.evaluate(() => {
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

          // Get application URL
          const applyButton = document.querySelector('.apply-button');
          const applicationUrl = applyButton ? applyButton.href : window.location.href;

          return {
            title,
            company,
            location,
            description,
            criteria,
            applicationUrl,
            scrapedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error extracting job details:', error);
          return {};
        }
      });

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobDetails);

      return jobDetails;
    } catch (error) {
      console.error('Error getting LinkedIn job details:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return {};
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Build LinkedIn search URL
   */
  private buildLinkedInSearchUrl(params: JobSearchParams): string {
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
   * Search for jobs on Indeed
   */
  async searchIndeedJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('indeed', 'search', params);

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached Indeed search results');
      return cachedResults;
    }

    console.log('Searching Indeed jobs with params:', params);

    // Get proxy options based on location
    const proxyOptions: ProxySelectionOptions = {
      residential: true,
      minSuccessRate: 70
    };

    // If location is specified, try to get a proxy from that location
    if (params.locations && params.locations.length > 0) {
      const location = params.locations[0].toLowerCase();

      // Check if location is a Brazilian city
      const brCities = ['são paulo', 'sao paulo', 'rio de janeiro', 'brasília', 'brasilia', 'salvador', 'fortaleza'];
      if (brCities.some(city => location.includes(city))) {
        proxyOptions.country = 'br';

        // Try to match city
        for (const city of brCities) {
          if (location.includes(city)) {
            proxyOptions.city = city.replace('são', 'sao').replace('brasília', 'brasilia');
            break;
          }
        }
      } else if (location.includes('brasil') || location.includes('brazil')) {
        proxyOptions.country = 'br';
      } else if (location.includes('estados unidos') || location.includes('united states')) {
        proxyOptions.country = 'us';
      } else if (location.includes('canadá') || location.includes('canada')) {
        proxyOptions.country = 'ca';
      } else if (location.includes('méxico') || location.includes('mexico')) {
        proxyOptions.country = 'mx';
      }
    }

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage(proxyOptions);
      page = pageData.page;
      proxy = pageData.proxy;

      // Build Indeed search URL
      const url = this.buildIndeedSearchUrl(params);

      // Simulate a human-like page visit
      await this.humanBehaviorSimulator.simulatePageVisit(page, url);

      // Add some random mouse movements
      await this.humanBehaviorSimulator.addRandomMouseMovements(page);

      // Wait for job cards to load with a more human-like approach
      await page.waitForSelector('.jobsearch-ResultsList', { timeout: 10000 });

      // Scroll down a bit to view more jobs
      await this.humanBehaviorSimulator.simulateScrolling(page, 800, true);

      // Random delay before extraction
      await this.humanBehaviorSimulator.randomDelay(1000, 2000);

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job_seen_beacon');
        const results = [];

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

            // Get salary
            const salaryElement = card.querySelector('.salary-snippet');
            const salary = salaryElement ? salaryElement.textContent.trim() : '';

            // Get job snippet
            const snippetElement = card.querySelector('.job-snippet');
            const snippet = snippetElement ? snippetElement.textContent.trim() : '';

            // Get job link
            const linkElement = card.querySelector('.jcs-JobTitle');
            const url = linkElement ? linkElement.getAttribute('href') : '';
            const fullUrl = url.startsWith('/') ? 'https://www.indeed.com' + url : url;

            // Get job ID from URL or generate one
            const jobId = url.match(/jk=([a-zA-Z0-9]+)/)?.[1] || `indeed-${Date.now()}-${index}`;

            // Get posted date
            const dateElement = card.querySelector('.date');
            const postedDate = dateElement ? dateElement.textContent.trim() : '';

            results.push({
              id: jobId,
              platform: 'indeed',
              title,
              company,
              location,
              salary,
              snippet,
              url: fullUrl,
              postedDate,
              scrapedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error extracting job card data:', error);
          }
        });

        return results;
      });

      console.log(`Found ${jobs.length} Indeed jobs`);

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error('Error searching Indeed jobs:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return [];
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Get Indeed job details
   */
  async getIndeedJobDetails(jobId: string, url: string): Promise<any> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('indeed', 'details', { jobId });

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached Indeed job details');
      return cachedResults;
    }

    console.log('Getting Indeed job details:', jobId);

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage({ residential: true, minSuccessRate: 80 });
      page = pageData.page;
      proxy = pageData.proxy;

      // Simulate a human-like page visit
      await this.humanBehaviorSimulator.simulatePageVisit(page, url);

      // Add some random mouse movements
      await this.humanBehaviorSimulator.addRandomMouseMovements(page);

      // Wait for job details to load with a more human-like approach
      await page.waitForSelector('.jobsearch-JobComponent', { timeout: 10000 });

      // Scroll down to read the job description
      await this.humanBehaviorSimulator.simulateScrolling(page, 500, true);

      // Random delay before scrolling more
      await this.humanBehaviorSimulator.randomDelay(800, 1500);

      // Scroll more to see the full description
      await this.humanBehaviorSimulator.simulateScrolling(page, 800, false);

      // Random delay before extraction
      await this.humanBehaviorSimulator.randomDelay(1000, 2000);

      // Extract job details
      const jobDetails = await page.evaluate(() => {
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

          // Get job description
          const descriptionElement = document.querySelector('#jobDescriptionText');
          const description = descriptionElement ? descriptionElement.textContent.trim() : '';

          // Get salary
          const salaryElement = document.querySelector('.jobsearch-JobMetadataHeader-item');
          const salary = salaryElement && salaryElement.textContent.includes('R$') ?
                         salaryElement.textContent.trim() : '';

          // Get job type
          const jobTypeElement = document.querySelector('.jobsearch-JobMetadataHeader-item:nth-child(2)');
          const jobType = jobTypeElement ? jobTypeElement.textContent.trim() : '';

          // Get application URL
          const applyButton = document.querySelector('.jobsearch-IndeedApplyButton');
          const applicationUrl = applyButton ?
                                window.location.href :
                                document.querySelector('.jobsearch-OnlineApplyButton')?.getAttribute('href') ||
                                window.location.href;

          return {
            title,
            company,
            location,
            description,
            salary,
            jobType,
            applicationUrl,
            scrapedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error extracting job details:', error);
          return {};
        }
      });

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobDetails);

      return jobDetails;
    } catch (error) {
      console.error('Error getting Indeed job details:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return {};
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Build Indeed search URL
   */
  private buildIndeedSearchUrl(params: JobSearchParams): string {
    let url = 'https://www.indeed.com/jobs?';
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
      queryParams.push('remotejob=1');
    }

    // Add job type filters
    if (params.jobTypes && params.jobTypes.length > 0) {
      const jobTypeMap = {
        'CLT': 'jt=fulltime',
        'PJ': 'jt=contract',
        'Estágio': 'jt=internship',
        'Temporário': 'jt=temporary'
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
   * Search for jobs on InfoJobs
   */
  async searchInfoJobsJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('infojobs', 'search', params);

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached InfoJobs search results');
      return cachedResults;
    }

    console.log('Searching InfoJobs jobs with params:', params);

    // Get proxy options based on location
    const proxyOptions: ProxySelectionOptions = {
      residential: true,
      minSuccessRate: 70,
      country: 'br' // InfoJobs Brazil is the primary target
    };

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage(proxyOptions);
      page = pageData.page;
      proxy = pageData.proxy;

      // Build InfoJobs search URL
      const url = this.buildInfoJobsSearchUrl(params);

      // Navigate to search page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for job cards to load
      await page.waitForSelector('.vacancy-list', { timeout: 10000 });

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobElements = document.querySelectorAll('.vacancy-item');
        const results = [];

        jobElements.forEach((jobElement, index) => {
          try {
            const titleElement = jobElement.querySelector('.vacancy-title a');
            const companyElement = jobElement.querySelector('.vacancy-company');
            const locationElement = jobElement.querySelector('.vacancy-location');
            const salaryElement = jobElement.querySelector('.vacancy-salary');
            const linkElement = jobElement.querySelector('.vacancy-title a');

            const title = titleElement ? titleElement.textContent?.trim() : '';
            const company = companyElement ? companyElement.textContent?.trim() : '';
            const location = locationElement ? locationElement.textContent?.trim() : '';
            const salary = salaryElement ? salaryElement.textContent?.trim() : '';
            const url = linkElement ? linkElement.getAttribute('href') : '';
            const fullUrl = url?.startsWith('/') ? 'https://www.infojobs.com.br' + url : url || '';

            // Extract job ID from URL or generate one
            const jobId = url?.match(/\/([0-9]+)\/?/)?.[1] || `infojobs-${Date.now()}-${index}`;

            results.push({
              id: jobId,
              platform: 'infojobs',
              title: title || '',
              company: company || '',
              location: location || '',
              salary: salary || '',
              url: fullUrl,
              scrapedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error extracting InfoJobs job data:', error);
          }
        });

        return results;
      });

      console.log(`Found ${jobs.length} InfoJobs jobs`);

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error('Error searching InfoJobs jobs:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return [];
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Get InfoJobs job details
   */
  async getInfoJobsJobDetails(jobId: string, url: string): Promise<any> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('infojobs', 'details', { jobId });

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached InfoJobs job details');
      return cachedResults;
    }

    console.log('Getting InfoJobs job details:', jobId);

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage({ residential: true, minSuccessRate: 80, country: 'br' });
      page = pageData.page;
      proxy = pageData.proxy;

      // Navigate to job page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for job details to load
      await page.waitForSelector('.vacancy-details', { timeout: 10000 });

      // Extract job details
      const jobDetails = await page.evaluate(() => {
        try {
          // Get job title
          const titleElement = document.querySelector('.vacancy-title');
          const title = titleElement ? titleElement.textContent?.trim() : '';

          // Get company name
          const companyElement = document.querySelector('.vacancy-company-name');
          const company = companyElement ? companyElement.textContent?.trim() : '';

          // Get location
          const locationElement = document.querySelector('.vacancy-location');
          const location = locationElement ? locationElement.textContent?.trim() : '';

          // Get job description
          const descriptionElement = document.querySelector('.vacancy-description');
          const description = descriptionElement ? descriptionElement.textContent?.trim() : '';

          // Get requirements
          const requirementsElement = document.querySelector('.vacancy-requirements');
          const requirementsText = requirementsElement ? requirementsElement.textContent?.trim() : '';

          // Parse requirements into an array
          const requirements = requirementsText ?
            requirementsText.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0) :
            [];

          // Get job type
          const jobTypeElement = document.querySelector('.vacancy-contract-type');
          const jobType = jobTypeElement ? jobTypeElement.textContent?.trim() : '';

          // Get work model
          const workModelElement = document.querySelector('.vacancy-work-model');
          const workModel = workModelElement ? workModelElement.textContent?.trim() : '';

          // Get salary
          const salaryElement = document.querySelector('.vacancy-salary');
          const salary = salaryElement ? salaryElement.textContent?.trim() : '';

          // Get application URL
          const applyButton = document.querySelector('.apply-button');
          const applicationUrl = applyButton ? applyButton.getAttribute('href') : window.location.href;

          return {
            title,
            company,
            location,
            description,
            requirements,
            jobType,
            workModel,
            salary,
            applicationUrl,
            scrapedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error extracting InfoJobs job details:', error);
          return {};
        }
      });

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobDetails);

      return jobDetails;
    } catch (error) {
      console.error('Error getting InfoJobs job details:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return {};
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Build InfoJobs search URL
   */
  private buildInfoJobsSearchUrl(params: JobSearchParams): string {
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
        'CLT': 'contrato=clt',
        'PJ': 'contrato=autonomo',
        'Estágio': 'contrato=estagio',
        'Temporário': 'contrato=temporario'
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
   * Search for jobs on Catho
   */
  async searchCathoJobs(params: JobSearchParams): Promise<ScrapedJob[]> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('catho', 'search', params);

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached Catho search results');
      return cachedResults;
    }

    console.log('Searching Catho jobs with params:', params);

    // Get proxy options based on location
    const proxyOptions: ProxySelectionOptions = {
      residential: true,
      minSuccessRate: 70,
      country: 'br' // Catho is a Brazilian platform
    };

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage(proxyOptions);
      page = pageData.page;
      proxy = pageData.proxy;

      // Build Catho search URL
      const url = this.buildCathoSearchUrl(params);

      // Navigate to search page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Handle cookie consent if present
      await page.evaluate(() => {
        const cookieButton = document.querySelector('.cookie-consent-accept');
        if (cookieButton) {
          (cookieButton as HTMLElement).click();
        }
      });

      // Wait a bit for any redirects or cookie handling
      await page.waitForTimeout(2000);

      // Wait for job cards to load
      await page.waitForSelector('.JobCard', { timeout: 10000 });

      // Extract job data
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.JobCard');
        const results = [];

        jobCards.forEach((card, index) => {
          try {
            // Get job title
            const titleElement = card.querySelector('.JobCard__Title');
            const title = titleElement ? titleElement.textContent?.trim() : '';

            // Get company name
            const companyElement = card.querySelector('.JobCard__Company');
            const company = companyElement ? companyElement.textContent?.trim() : '';

            // Get location
            const locationElement = card.querySelector('.JobCard__Location');
            const location = locationElement ? locationElement.textContent?.trim() : '';

            // Get salary
            const salaryElement = card.querySelector('.JobCard__Salary');
            const salary = salaryElement ? salaryElement.textContent?.trim() : '';

            // Get job link
            const linkElement = card.querySelector('a.JobCard__Link');
            const url = linkElement ? linkElement.getAttribute('href') : '';
            const fullUrl = url?.startsWith('/') ? 'https://www.catho.com.br' + url : url || '';

            // Get job ID from URL or generate one
            const jobId = url?.match(/\/([0-9]+)\/?/)?.[1] || `catho-${Date.now()}-${index}`;

            // Get posted date
            const dateElement = card.querySelector('.JobCard__Date');
            const postedDate = dateElement ? dateElement.textContent?.trim() : '';

            results.push({
              id: jobId,
              platform: 'catho',
              title: title || '',
              company: company || '',
              location: location || '',
              salary: salary || '',
              url: fullUrl,
              postedDate,
              scrapedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error extracting Catho job data:', error);
          }
        });

        return results;
      });

      console.log(`Found ${jobs.length} Catho jobs`);

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error('Error searching Catho jobs:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return [];
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Get Catho job details
   */
  async getCathoJobDetails(jobId: string, url: string): Promise<any> {
    // Generate cache key
    const cacheKey = this.cacheService.generateCacheKey('catho', 'details', { jobId });

    // Check cache
    const cachedResults = await this.cacheService.get(cacheKey);
    if (cachedResults) {
      console.log('Using cached Catho job details');
      return cachedResults;
    }

    console.log('Getting Catho job details:', jobId);

    let page: Page | null = null;
    let proxy: ProxyConfig | null = null;

    try {
      // Create page with proxy
      const pageData = await this.createProxyPage({ residential: true, minSuccessRate: 80, country: 'br' });
      page = pageData.page;
      proxy = pageData.proxy;

      // Navigate to job page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Handle cookie consent if present
      await page.evaluate(() => {
        const cookieButton = document.querySelector('.cookie-consent-accept');
        if (cookieButton) {
          (cookieButton as HTMLElement).click();
        }
      });

      // Wait a bit for any redirects or cookie handling
      await page.waitForTimeout(2000);

      // Wait for job details to load
      await page.waitForSelector('.JobDetails', { timeout: 10000 });

      // Extract job details
      const jobDetails = await page.evaluate(() => {
        try {
          // Get job title
          const titleElement = document.querySelector('.JobDetails__Title');
          const title = titleElement ? titleElement.textContent?.trim() : '';

          // Get company name
          const companyElement = document.querySelector('.JobDetails__Company');
          const company = companyElement ? companyElement.textContent?.trim() : '';

          // Get location
          const locationElement = document.querySelector('.JobDetails__Location');
          const location = locationElement ? locationElement.textContent?.trim() : '';

          // Get job description
          const descriptionElement = document.querySelector('.JobDetails__Description');
          const description = descriptionElement ? descriptionElement.textContent?.trim() : '';

          // Get requirements
          const requirementsElement = document.querySelector('.JobDetails__Requirements');
          const requirementsText = requirementsElement ? requirementsElement.textContent?.trim() : '';

          // Parse requirements into an array
          const requirements = requirementsText ?
            requirementsText.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0) :
            [];

          // Get job type
          const jobTypeElement = document.querySelector('.JobDetails__ContractType');
          const jobType = jobTypeElement ? jobTypeElement.textContent?.trim() : '';

          // Get work model
          const workModelElement = document.querySelector('.JobDetails__WorkModel');
          const workModel = workModelElement ? workModelElement.textContent?.trim() : '';

          // Get salary
          const salaryElement = document.querySelector('.JobDetails__Salary');
          const salary = salaryElement ? salaryElement.textContent?.trim() : '';

          // Get application URL
          const applyButton = document.querySelector('.JobDetails__ApplyButton');
          const applicationUrl = applyButton ? applyButton.getAttribute('href') : window.location.href;

          return {
            title,
            company,
            location,
            description,
            requirements,
            jobType,
            workModel,
            salary,
            applicationUrl,
            scrapedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error extracting Catho job details:', error);
          return {};
        }
      });

      // Report proxy success
      this.proxyRotationService.reportProxySuccess(proxy);

      // Cache results
      await this.cacheService.set(cacheKey, jobDetails);

      return jobDetails;
    } catch (error) {
      console.error('Error getting Catho job details:', error);

      // Report proxy failure
      if (proxy) {
        const isBanned = error.message.includes('403') ||
                         error.message.includes('429') ||
                         error.message.includes('captcha');
        this.proxyRotationService.reportProxyFailure(proxy, isBanned);
      }

      return {};
    } finally {
      // Close page
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Build Catho search URL
   */
  private buildCathoSearchUrl(params: JobSearchParams): string {
    let url = 'https://www.catho.com.br/vagas/';

    // Add keywords
    if (params.keywords && params.keywords.length > 0) {
      url += encodeURIComponent(params.keywords.join(' ')) + '/';
    }

    // Add location
    if (params.locations && params.locations.length > 0) {
      url += encodeURIComponent(params.locations[0]) + '/';
    }

    // Add query parameters
    const queryParams = [];

    // Add remote filter
    if (params.remote) {
      queryParams.push('regime=home-office');
    }

    // Add job type filters
    if (params.jobTypes && params.jobTypes.length > 0) {
      const jobTypeMap = {
        'CLT': 'clt',
        'PJ': 'pj',
        'Estágio': 'estagio',
        'Temporário': 'temporario'
      };

      const jobTypes = params.jobTypes
        .map(type => jobTypeMap[type])
        .filter(Boolean);

      if (jobTypes.length > 0) {
        queryParams.push(`contrato=${jobTypes.join(',')}`);
      }
    }

    // Add salary filter
    if (params.salaryMin) {
      queryParams.push(`salario_minimo=${params.salaryMin}`);
    }

    // Add date posted filter (last 24 hours)
    queryParams.push('periodo=1');

    // Combine all parameters
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
