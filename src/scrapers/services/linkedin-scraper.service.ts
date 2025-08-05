import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScraperSessionService } from './scraper-session.service';
import { ScraperJobService } from './scraper-job.service';
import { ScraperPlatform, SessionStatus } from '../entities/scraper-session.entity';
import { ScraperJobStatus } from '../entities/scraper-job.entity';
import { ProxyService } from './proxy.service';
import * as puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { JobsService } from '../../jobs/services/jobs.service';
import { JobType, WorkModel } from '../../jobs/entities/job.entity';
import { ApplicationsService } from '../../jobs/services/applications.service';

// Add stealth plugin
puppeteer.use(StealthPlugin());

@Injectable()
export class LinkedInScraperService {
  private readonly logger = new Logger(LinkedInScraperService.name);
  private readonly baseUrl = 'https://www.linkedin.com';
  private readonly loginUrl = 'https://www.linkedin.com/login';
  private readonly jobsUrl = 'https://www.linkedin.com/jobs/search';
  private readonly apiUrl = 'https://www.linkedin.com/voyager/api';

  constructor(
    private configService: ConfigService,
    private scraperSessionService: ScraperSessionService,
    private scraperJobService: ScraperJobService,
    private proxyService: ProxyService,
    private jobsService: JobsService,
    private applicationsService: ApplicationsService,
  ) {}

  async login(email: string, password: string, userId: string): Promise<any> {
    let browser: Browser = null;
    
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
      
      const page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      // Navigate to login page
      await page.goto(this.loginUrl, { waitUntil: 'networkidle2' });
      
      // Fill in login form
      await page.type('#username', email);
      await page.type('#password', password);
      
      // Click login button
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('.login__form_action_container button'),
      ]);
      
      // Check if login was successful
      const currentUrl = page.url();
      if (currentUrl.includes('checkpoint') || currentUrl.includes('login')) {
        throw new BadRequestException('Login failed. Please check your credentials or solve the CAPTCHA manually.');
      }
      
      // Get cookies and headers
      const cookies = await page.cookies();
      const headers = {
        'User-Agent': await page.evaluate(() => navigator.userAgent),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.linkedin.com/',
        'X-Li-Lang': 'en_US',
        'X-RestLi-Protocol-Version': '2.0.0',
      };
      
      // Create session
      const session = await this.scraperSessionService.createSession(
        userId,
        ScraperPlatform.LINKEDIN,
        cookies,
        headers,
        false, // Server-side scraping
      );
      
      return {
        success: true,
        sessionId: session.id,
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(`LinkedIn login error: ${error.message}`);
      throw new BadRequestException(`Failed to login to LinkedIn: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async searchJobs(
    userId: string,
    keywords: string,
    location: string,
    filters: any = {},
  ): Promise<any> {
    // Create a job for the search
    const jobParameters = {
      action: 'searchJobs',
      keywords,
      location,
      filters,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.LINKEDIN,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Job search started',
    };
  }

  async getJobDetails(userId: string, jobId: string): Promise<any> {
    // Create a job for getting job details
    const jobParameters = {
      action: 'getJobDetails',
      linkedinJobId: jobId,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.LINKEDIN,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Job details retrieval started',
    };
  }

  async applyToJob(userId: string, jobId: string, coverLetter?: string, resumeUrl?: string): Promise<any> {
    // Create a job for applying to a job
    const jobParameters = {
      action: 'applyToJob',
      linkedinJobId: jobId,
      coverLetter,
      resumeUrl,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.LINKEDIN,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Job application started',
    };
  }

  async processJob(jobId: string): Promise<void> {
    // Get the job
    const job = await this.scraperJobService.findById(jobId);
    
    // Mark job as processing
    await this.scraperJobService.markJobAsProcessing(jobId);
    
    try {
      // Get active session for the user
      const session = await this.scraperSessionService.findActiveSessionByUserAndPlatform(
        job.userId,
        ScraperPlatform.LINKEDIN,
      );
      
      if (!session) {
        throw new BadRequestException('No active LinkedIn session found. Please login first.');
      }
      
      // Process based on action
      let result;
      switch (job.parameters.action) {
        case 'searchJobs':
          result = await this.executeJobSearch(session, job.parameters);
          break;
        case 'getJobDetails':
          result = await this.executeGetJobDetails(session, job.parameters);
          break;
        case 'applyToJob':
          result = await this.executeApplyToJob(session, job.parameters, job.userId);
          break;
        default:
          throw new BadRequestException(`Unknown action: ${job.parameters.action}`);
      }
      
      // Mark job as completed
      await this.scraperJobService.markJobAsCompleted(jobId, result);
      
      // Increment session request count
      await this.scraperSessionService.incrementRequestCount(session.id);
    } catch (error) {
      this.logger.error(`Error processing job ${jobId}: ${error.message}`);
      
      // Mark job as failed
      await this.scraperJobService.markJobAsFailed(jobId, error.message);
    }
  }

  private async executeJobSearch(session, parameters): Promise<any> {
    const { keywords, location, filters } = parameters;
    
    // Build search URL
    let searchUrl = `${this.jobsUrl}/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
    
    // Add filters
    if (filters) {
      if (filters.datePosted) {
        searchUrl += `&f_TPR=${encodeURIComponent(filters.datePosted)}`;
      }
      if (filters.jobType) {
        searchUrl += `&f_JT=${encodeURIComponent(filters.jobType)}`;
      }
      if (filters.experience) {
        searchUrl += `&f_E=${encodeURIComponent(filters.experience)}`;
      }
      if (filters.distance) {
        searchUrl += `&distance=${encodeURIComponent(filters.distance)}`;
      }
    }
    
    // Use API endpoint for better results
    const apiUrl = `${this.apiUrl}/search/jobs?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&start=0&count=25`;
    
    try {
      // Make request
      const response = await axios.get(apiUrl, {
        headers: this.buildHeaders(session),
        proxy: session.proxyUrl ? { 
          host: new URL(session.proxyUrl).hostname,
          port: parseInt(new URL(session.proxyUrl).port),
          protocol: new URL(session.proxyUrl).protocol.replace(':', ''),
        } : undefined,
      });
      
      // Parse results
      const jobs = this.parseJobSearchResults(response.data);
      
      return {
        success: true,
        jobs,
        totalResults: jobs.length,
        searchUrl,
      };
    } catch (error) {
      // Check if session is invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.scraperSessionService.invalidateSession(session.id, 'Session expired or invalid');
      }
      
      // Check if rate limited
      if (error.response && error.response.status === 429) {
        await this.scraperSessionService.markSessionAsRateLimited(session.id);
      }
      
      throw error;
    }
  }

  private async executeGetJobDetails(session, parameters): Promise<any> {
    const { linkedinJobId } = parameters;
    
    // Build job URL
    const jobUrl = `${this.baseUrl}/jobs/view/${linkedinJobId}`;
    
    // Use API endpoint for better results
    const apiUrl = `${this.apiUrl}/jobs/jobView?jobId=${linkedinJobId}`;
    
    try {
      // Make request
      const response = await axios.get(apiUrl, {
        headers: this.buildHeaders(session),
        proxy: session.proxyUrl ? { 
          host: new URL(session.proxyUrl).hostname,
          port: parseInt(new URL(session.proxyUrl).port),
          protocol: new URL(session.proxyUrl).protocol.replace(':', ''),
        } : undefined,
      });
      
      // Parse job details
      const jobDetails = this.parseJobDetails(response.data, linkedinJobId);
      
      return {
        success: true,
        jobDetails,
        jobUrl,
      };
    } catch (error) {
      // Check if session is invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.scraperSessionService.invalidateSession(session.id, 'Session expired or invalid');
      }
      
      // Check if rate limited
      if (error.response && error.response.status === 429) {
        await this.scraperSessionService.markSessionAsRateLimited(session.id);
      }
      
      throw error;
    }
  }

  private async executeApplyToJob(session, parameters, userId): Promise<any> {
    const { linkedinJobId, coverLetter, resumeUrl } = parameters;
    
    // First, get job details to ensure it exists and to get application URL
    const jobDetailsResult = await this.executeGetJobDetails(session, { linkedinJobId });
    const { jobDetails } = jobDetailsResult;
    
    // Check if job has easy apply
    if (!jobDetails.hasEasyApply) {
      throw new BadRequestException('This job does not support Easy Apply. Please apply directly on the company website.');
    }
    
    // Build apply URL
    const applyUrl = `${this.apiUrl}/jobs/applyJob`;
    
    try {
      // Make apply request (simplified - in reality this would be more complex)
      const response = await axios.post(applyUrl, {
        jobId: linkedinJobId,
        coverLetter: coverLetter || '',
        resumeId: resumeUrl ? 'custom' : 'default',
        resumeUrl: resumeUrl || '',
      }, {
        headers: this.buildHeaders(session),
        proxy: session.proxyUrl ? { 
          host: new URL(session.proxyUrl).hostname,
          port: parseInt(new URL(session.proxyUrl).port),
          protocol: new URL(session.proxyUrl).protocol.replace(':', ''),
        } : undefined,
      });
      
      // Create application record in our system
      await this.createApplicationRecord(userId, jobDetails);
      
      return {
        success: true,
        message: 'Successfully applied to job',
        jobDetails,
      };
    } catch (error) {
      // Check if session is invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.scraperSessionService.invalidateSession(session.id, 'Session expired or invalid');
      }
      
      // Check if rate limited
      if (error.response && error.response.status === 429) {
        await this.scraperSessionService.markSessionAsRateLimited(session.id);
      }
      
      throw error;
    }
  }

  private async createApplicationRecord(userId: string, jobDetails: any): Promise<void> {
    // First, create or update the job in our database
    const jobData = {
      title: jobDetails.title,
      description: jobDetails.description,
      companyName: jobDetails.companyName,
      location: jobDetails.location,
      jobType: this.mapJobType(jobDetails.employmentType),
      workModel: this.mapWorkModel(jobDetails.workplaceType),
      salaryMin: jobDetails.salaryMin,
      salaryMax: jobDetails.salaryMax,
      skills: jobDetails.skills.join(', '),
      requirements: jobDetails.requirements,
      benefits: jobDetails.benefits,
      industry: jobDetails.industry || 'Technology',
      experienceYears: jobDetails.experienceYears || 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      vacancies: 1,
      companyUserId: null, // This is a scraped job, not created by a company
    };
    
    // Create job
    const job = await this.jobsService.create(null, jobData);
    
    // Create application
    await this.applicationsService.apply(userId, {
      jobId: job.id,
      coverLetter: null,
      resumeUrl: null,
    });
  }

  private parseJobSearchResults(data: any): any[] {
    // This is a simplified parser - in reality, LinkedIn's API response is more complex
    const jobs = [];
    
    try {
      const elements = data.elements || [];
      
      for (const element of elements) {
        if (element.jobView) {
          const job = element.jobView;
          
          jobs.push({
            id: job.jobId,
            title: job.title,
            companyName: job.companyName,
            location: job.location,
            postedDate: job.listedAt,
            description: job.description,
            hasEasyApply: job.applyMethod && job.applyMethod.easyApplyEnabled,
            url: `https://www.linkedin.com/jobs/view/${job.jobId}`,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error parsing job search results: ${error.message}`);
    }
    
    return jobs;
  }

  private parseJobDetails(data: any, jobId: string): any {
    // This is a simplified parser - in reality, LinkedIn's API response is more complex
    try {
      const job = data.data || {};
      
      return {
        id: jobId,
        title: job.title,
        companyName: job.companyName,
        location: job.formattedLocation,
        postedDate: job.listedAt,
        description: job.description?.text || '',
        requirements: job.description?.text || '',
        benefits: job.benefits?.text || '',
        employmentType: job.employmentType,
        workplaceType: job.workplaceType,
        industry: job.companyIndustries?.[0] || '',
        companySize: job.companySize || '',
        experienceYears: this.extractExperienceYears(job.description?.text || ''),
        skills: job.requiredSkills || [],
        salaryMin: job.salary?.min || null,
        salaryMax: job.salary?.max || null,
        hasEasyApply: job.applyMethod?.easyApplyEnabled || false,
        applicationUrl: job.applyMethod?.applyUrl || '',
        companyUrl: job.companyUrl || '',
        companyLogo: job.companyLogo || '',
      };
    } catch (error) {
      this.logger.error(`Error parsing job details: ${error.message}`);
      
      return {
        id: jobId,
        title: 'Unknown',
        companyName: 'Unknown',
        location: 'Unknown',
        description: 'Failed to parse job details',
        hasEasyApply: false,
      };
    }
  }

  private extractExperienceYears(description: string): number {
    // Simple regex to extract years of experience
    const regex = /(\d+)[\s-]*years? of experience/i;
    const match = description.match(regex);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    return 0;
  }

  private buildHeaders(session): any {
    const headers = {
      'Cookie': this.formatCookies(session.cookies),
      'User-Agent': session.userAgent,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://www.linkedin.com/',
      'X-Li-Lang': 'en_US',
      'X-RestLi-Protocol-Version': '2.0.0',
      'csrf-token': this.extractCsrfToken(session.cookies),
    };
    
    // Add additional headers if available
    if (session.headers) {
      Object.assign(headers, session.headers);
    }
    
    return headers;
  }

  private formatCookies(cookies): string {
    if (Array.isArray(cookies)) {
      return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    }
    
    return '';
  }

  private extractCsrfToken(cookies): string {
    if (Array.isArray(cookies)) {
      const csrfCookie = cookies.find(cookie => cookie.name === 'JSESSIONID');
      if (csrfCookie) {
        return csrfCookie.value.replace(/"/g, '');
      }
    }
    
    return '';
  }

  private mapJobType(linkedinType: string): JobType {
    const typeMap = {
      'FULL_TIME': JobType.CLT,
      'PART_TIME': JobType.CLT,
      'CONTRACT': JobType.PJ,
      'TEMPORARY': JobType.TEMPORARY,
      'INTERNSHIP': JobType.INTERNSHIP,
      'VOLUNTEER': JobType.FREELANCER,
      'OTHER': JobType.CLT,
    };
    
    return typeMap[linkedinType] || JobType.CLT;
  }

  private mapWorkModel(linkedinType: string): WorkModel {
    const modelMap = {
      'ONSITE': WorkModel.ONSITE,
      'REMOTE': WorkModel.REMOTE,
      'HYBRID': WorkModel.HYBRID,
    };
    
    return modelMap[linkedinType] || WorkModel.ONSITE;
  }
}
