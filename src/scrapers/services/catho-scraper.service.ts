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
export class CathoScraperService {
  private readonly logger = new Logger(CathoScraperService.name);
  private readonly baseUrl = 'https://www.catho.com.br';
  private readonly loginUrl = 'https://www.catho.com.br/login/';
  private readonly jobsUrl = 'https://www.catho.com.br/vagas/';
  private readonly apiUrl = 'https://www.catho.com.br/api';

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
      await page.type('input[name="email"]', email);
      await page.type('input[name="password"]', password);
      
      // Click login button
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]'),
      ]);
      
      // Check if login was successful
      const currentUrl = page.url();
      if (currentUrl.includes('login') || await page.content().includes('Usuário ou senha incorretos')) {
        throw new BadRequestException('Login falhou. Verifique suas credenciais.');
      }
      
      // Get cookies and headers
      const cookies = await page.cookies();
      const headers = {
        'User-Agent': await page.evaluate(() => navigator.userAgent),
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.catho.com.br/',
        'Origin': 'https://www.catho.com.br',
      };
      
      // Create session
      const session = await this.scraperSessionService.createSession(
        userId,
        ScraperPlatform.CATHO,
        cookies,
        headers,
        false, // Server-side scraping
      );
      
      return {
        success: true,
        sessionId: session.id,
        message: 'Login bem-sucedido',
      };
    } catch (error) {
      this.logger.error(`Catho login error: ${error.message}`);
      throw new BadRequestException(`Falha ao fazer login no Catho: ${error.message}`);
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
      ScraperPlatform.CATHO,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Busca de vagas iniciada',
    };
  }

  async getJobDetails(userId: string, jobId: string): Promise<any> {
    // Create a job for getting job details
    const jobParameters = {
      action: 'getJobDetails',
      cathoJobId: jobId,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.CATHO,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Busca de detalhes da vaga iniciada',
    };
  }

  async applyToJob(userId: string, jobId: string, coverLetter?: string, resumeUrl?: string): Promise<any> {
    // Create a job for applying to a job
    const jobParameters = {
      action: 'applyToJob',
      cathoJobId: jobId,
      coverLetter,
      resumeUrl,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.CATHO,
      jobParameters,
      false,
    );
    
    // Process the job immediately if possible
    this.processJob(scraperJob.id).catch(error => {
      this.logger.error(`Error processing job ${scraperJob.id}: ${error.message}`);
    });
    
    return {
      jobId: scraperJob.id,
      message: 'Candidatura iniciada',
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
        ScraperPlatform.CATHO,
      );
      
      if (!session) {
        throw new BadRequestException('Nenhuma sessão ativa do Catho encontrada. Faça login primeiro.');
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
          throw new BadRequestException(`Ação desconhecida: ${job.parameters.action}`);
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
    let searchUrl = `${this.jobsUrl}`;
    
    if (keywords) {
      searchUrl += `${encodeURIComponent(keywords)}/`;
    }
    
    if (location) {
      searchUrl += `em-${encodeURIComponent(location)}/`;
    }
    
    // Add query parameters
    let queryParams = [];
    
    // Add filters
    if (filters) {
      if (filters.datePosted) {
        queryParams.push(`publicacao=${encodeURIComponent(filters.datePosted)}`);
      }
      if (filters.jobType) {
        queryParams.push(`regime=${encodeURIComponent(filters.jobType)}`);
      }
      if (filters.experience) {
        queryParams.push(`experiencia=${encodeURIComponent(filters.experience)}`);
      }
      if (filters.salary) {
        queryParams.push(`salario=${encodeURIComponent(filters.salary)}`);
      }
      if (filters.education) {
        queryParams.push(`escolaridade=${encodeURIComponent(filters.education)}`);
      }
    }
    
    // Add query parameters to URL
    if (queryParams.length > 0) {
      searchUrl += `?${queryParams.join('&')}`;
    }
    
    try {
      // Make request
      const response = await axios.get(searchUrl, {
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
        await this.scraperSessionService.invalidateSession(session.id, 'Sessão expirada ou inválida');
      }
      
      // Check if rate limited
      if (error.response && error.response.status === 429) {
        await this.scraperSessionService.markSessionAsRateLimited(session.id);
      }
      
      throw error;
    }
  }

  private async executeGetJobDetails(session, parameters): Promise<any> {
    const { cathoJobId } = parameters;
    
    // Build job URL
    const jobUrl = `${this.baseUrl}/vagas/vaga-${cathoJobId}`;
    
    try {
      // Make request
      const response = await axios.get(jobUrl, {
        headers: this.buildHeaders(session),
        proxy: session.proxyUrl ? { 
          host: new URL(session.proxyUrl).hostname,
          port: parseInt(new URL(session.proxyUrl).port),
          protocol: new URL(session.proxyUrl).protocol.replace(':', ''),
        } : undefined,
      });
      
      // Parse job details
      const jobDetails = this.parseJobDetails(response.data, cathoJobId);
      
      return {
        success: true,
        jobDetails,
        jobUrl,
      };
    } catch (error) {
      // Check if session is invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.scraperSessionService.invalidateSession(session.id, 'Sessão expirada ou inválida');
      }
      
      // Check if rate limited
      if (error.response && error.response.status === 429) {
        await this.scraperSessionService.markSessionAsRateLimited(session.id);
      }
      
      throw error;
    }
  }

  private async executeApplyToJob(session, parameters, userId): Promise<any> {
    const { cathoJobId, coverLetter, resumeUrl } = parameters;
    
    // First, get job details to ensure it exists
    const jobDetailsResult = await this.executeGetJobDetails(session, { cathoJobId });
    const { jobDetails } = jobDetailsResult;
    
    // Build apply URL
    const applyUrl = `${this.apiUrl}/jobs/${cathoJobId}/apply`;
    
    try {
      // Make apply request
      const response = await axios.post(applyUrl, {
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
        message: 'Candidatura realizada com sucesso',
        jobDetails,
      };
    } catch (error) {
      // Check if session is invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        await this.scraperSessionService.invalidateSession(session.id, 'Sessão expirada ou inválida');
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
      industry: jobDetails.industry || 'Tecnologia',
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

  private parseJobSearchResults(html: string): any[] {
    const jobs = [];
    
    try {
      const $ = cheerio.load(html);
      
      // Find job listings
      $('.job-vacancy').each((index, element) => {
        const jobId = $(element).attr('data-job-id') || '';
        const title = $(element).find('.job-vacancy__title').text().trim();
        const companyName = $(element).find('.job-vacancy__company-name').text().trim();
        const location = $(element).find('.job-vacancy__location').text().trim();
        const salary = $(element).find('.job-vacancy__salary').text().trim();
        const postedDate = $(element).find('.job-vacancy__date').text().trim();
        const url = $(element).find('a.job-vacancy__link').attr('href') || '';
        
        jobs.push({
          id: jobId,
          title,
          companyName,
          location,
          salary,
          postedDate,
          url: this.baseUrl + url,
        });
      });
    } catch (error) {
      this.logger.error(`Error parsing job search results: ${error.message}`);
    }
    
    return jobs;
  }

  private parseJobDetails(html: string, jobId: string): any {
    try {
      const $ = cheerio.load(html);
      
      // Extract job details
      const title = $('.job-details__title').text().trim();
      const companyName = $('.job-details__company-name').text().trim();
      const location = $('.job-details__location').text().trim();
      const salary = $('.job-details__salary').text().trim();
      const description = $('.job-details__description').html() || '';
      const requirements = $('.job-details__requirements').html() || '';
      const benefits = $('.job-details__benefits').html() || '';
      
      // Extract employment type
      let employmentType = 'CLT';
      $('.job-details__info-item').each((index, element) => {
        const label = $(element).find('.job-details__info-label').text().trim();
        const value = $(element).find('.job-details__info-value').text().trim();
        if (label.includes('Regime de contratação')) {
          employmentType = value;
        }
      });
      
      // Extract workplace type
      let workplaceType = 'Presencial';
      $('.job-details__info-item').each((index, element) => {
        const label = $(element).find('.job-details__info-label').text().trim();
        const value = $(element).find('.job-details__info-value').text().trim();
        if (label.includes('Modelo de trabalho')) {
          workplaceType = value;
        }
      });
      
      // Extract skills
      const skills = [];
      $('.job-details__skills-item').each((index, element) => {
        skills.push($(element).text().trim());
      });
      
      // Extract salary range
      let salaryMin = null;
      let salaryMax = null;
      if (salary) {
        const salaryMatch = salary.match(/R\$\s*([\d.,]+)\s*a\s*R\$\s*([\d.,]+)/);
        if (salaryMatch) {
          salaryMin = parseFloat(salaryMatch[1].replace('.', '').replace(',', '.'));
          salaryMax = parseFloat(salaryMatch[2].replace('.', '').replace(',', '.'));
        } else {
          const singleSalaryMatch = salary.match(/R\$\s*([\d.,]+)/);
          if (singleSalaryMatch) {
            salaryMin = parseFloat(singleSalaryMatch[1].replace('.', '').replace(',', '.'));
            salaryMax = salaryMin;
          }
        }
      }
      
      // Extract experience years
      let experienceYears = 0;
      $('.job-details__requirements').each((index, element) => {
        const text = $(element).text().trim();
        const match = text.match(/(\d+)\s*anos?\s*de\s*experiência/i);
        if (match) {
          experienceYears = parseInt(match[1], 10);
        }
      });
      
      return {
        id: jobId,
        title,
        companyName,
        location,
        salary,
        description: this.cleanHtml(description),
        requirements: this.cleanHtml(requirements),
        benefits: this.cleanHtml(benefits),
        employmentType,
        workplaceType,
        skills,
        salaryMin,
        salaryMax,
        experienceYears,
        industry: this.extractIndustry($),
        applicationUrl: `${this.baseUrl}/api/jobs/${jobId}/apply`,
      };
    } catch (error) {
      this.logger.error(`Error parsing job details: ${error.message}`);
      
      return {
        id: jobId,
        title: 'Desconhecido',
        companyName: 'Desconhecido',
        location: 'Desconhecido',
        description: 'Falha ao analisar detalhes da vaga',
      };
    }
  }

  private extractIndustry($: cheerio.CheerioAPI): string {
    let industry = 'Tecnologia';
    
    $('.job-details__info-item').each((index, element) => {
      const label = $(element).find('.job-details__info-label').text().trim();
      const value = $(element).find('.job-details__info-value').text().trim();
      if (label.includes('Área')) {
        industry = value;
      }
    });
    
    return industry;
  }

  private cleanHtml(html: string): string {
    if (!html) return '';
    
    // Remove script and style tags
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();
  }

  private buildHeaders(session): any {
    const headers = {
      'Cookie': this.formatCookies(session.cookies),
      'User-Agent': session.userAgent,
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Referer': 'https://www.catho.com.br/',
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

  private mapJobType(cathoType: string): JobType {
    const typeMap = {
      'CLT': JobType.CLT,
      'PJ': JobType.PJ,
      'Temporário': JobType.TEMPORARY,
      'Estágio': JobType.INTERNSHIP,
      'Freelancer': JobType.FREELANCER,
    };
    
    return typeMap[cathoType] || JobType.CLT;
  }

  private mapWorkModel(cathoType: string): WorkModel {
    const modelMap = {
      'Presencial': WorkModel.ONSITE,
      'Remoto': WorkModel.REMOTE,
      'Híbrido': WorkModel.HYBRID,
    };
    
    return modelMap[cathoType] || WorkModel.ONSITE;
  }
}
