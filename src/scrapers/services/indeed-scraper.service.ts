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
export class IndeedScraperService {
  private readonly logger = new Logger(IndeedScraperService.name);
  private readonly baseUrl = 'https://www.indeed.com.br';
  private readonly loginUrl = 'https://www.indeed.com.br/account/login';
  private readonly jobsUrl = 'https://www.indeed.com.br/jobs';
  private readonly apiUrl = 'https://www.indeed.com.br/api';

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
      await page.type('#ifl-InputFormField-3', email);
      await page.click('#auth-page-google-password-fallback');
      await page.waitForSelector('#ifl-InputFormField-7');
      await page.type('#ifl-InputFormField-7', password);
      
      // Click login button
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]'),
      ]);
      
      // Check if login was successful
      const currentUrl = page.url();
      if (currentUrl.includes('login') || await page.content().includes('Senha incorreta')) {
        throw new BadRequestException('Login falhou. Verifique suas credenciais.');
      }
      
      // Get cookies and headers
      const cookies = await page.cookies();
      const headers = {
        'User-Agent': await page.evaluate(() => navigator.userAgent),
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.indeed.com.br/',
      };
      
      // Create session
      const session = await this.scraperSessionService.createSession(
        userId,
        ScraperPlatform.INDEED,
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
      this.logger.error(`Indeed login error: ${error.message}`);
      throw new BadRequestException(`Falha ao fazer login no Indeed: ${error.message}`);
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
      ScraperPlatform.INDEED,
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
      indeedJobId: jobId,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.INDEED,
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
      indeedJobId: jobId,
      coverLetter,
      resumeUrl,
    };
    
    const scraperJob = await this.scraperJobService.createJob(
      userId,
      ScraperPlatform.INDEED,
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
        ScraperPlatform.INDEED,
      );
      
      if (!session) {
        throw new BadRequestException('Nenhuma sessão ativa do Indeed encontrada. Faça login primeiro.');
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
    let searchUrl = `${this.jobsUrl}?q=${encodeURIComponent(keywords)}`;
    
    if (location) {
      searchUrl += `&l=${encodeURIComponent(location)}`;
    }
    
    // Add filters
    if (filters) {
      if (filters.datePosted) {
        searchUrl += `&fromage=${encodeURIComponent(filters.datePosted)}`;
      }
      if (filters.jobType) {
        searchUrl += `&jt=${encodeURIComponent(filters.jobType)}`;
      }
      if (filters.radius) {
        searchUrl += `&radius=${encodeURIComponent(filters.radius)}`;
      }
      if (filters.salary) {
        searchUrl += `&salary=${encodeURIComponent(filters.salary)}`;
      }
      if (filters.experience) {
        searchUrl += `&explvl=${encodeURIComponent(filters.experience)}`;
      }
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
    const { indeedJobId } = parameters;
    
    // Build job URL
    const jobUrl = `${this.baseUrl}/viewjob?jk=${indeedJobId}`;
    
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
      const jobDetails = this.parseJobDetails(response.data, indeedJobId);
      
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
    const { indeedJobId, coverLetter, resumeUrl } = parameters;
    
    // First, get job details to ensure it exists
    const jobDetailsResult = await this.executeGetJobDetails(session, { indeedJobId });
    const { jobDetails } = jobDetailsResult;
    
    // Check if job has apply button
    if (!jobDetails.hasApplyButton) {
      throw new BadRequestException('Esta vaga não possui botão de candidatura direta no Indeed.');
    }
    
    // Build apply URL
    const applyUrl = `${this.apiUrl}/apply/${indeedJobId}`;
    
    try {
      // For Indeed, we need to use Puppeteer for application as it often requires multiple steps
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
        await page.setUserAgent(session.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Set cookies
        if (Array.isArray(session.cookies)) {
          await page.setCookie(...session.cookies);
        }
        
        // Navigate to job page
        await page.goto(jobDetailsResult.jobUrl, { waitUntil: 'networkidle2' });
        
        // Click apply button
        const applyButton = await page.$('.jobsearch-IndeedApplyButton-buttonWrapper button');
        if (!applyButton) {
          throw new BadRequestException('Botão de candidatura não encontrado na página.');
        }
        
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          applyButton.click(),
        ]);
        
        // Check if we need to fill out application form
        const formExists = await page.$('#ia-container');
        if (formExists) {
          // Fill out application form (simplified - in reality this would be more complex)
          // Upload resume if needed
          const resumeUpload = await page.$('input[type="file"]');
          if (resumeUpload && resumeUrl) {
            await resumeUpload.uploadFile(resumeUrl);
          }
          
          // Fill cover letter if needed
          const coverLetterField = await page.$('textarea[name="cover_letter"]');
          if (coverLetterField && coverLetter) {
            await coverLetterField.type(coverLetter);
          }
          
          // Submit application
          const continueButton = await page.$('button[type="submit"]');
          if (continueButton) {
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle2' }),
              continueButton.click(),
            ]);
          }
        }
        
        // Check if application was successful
        const successIndicator = await page.content();
        if (successIndicator.includes('Candidatura enviada') || successIndicator.includes('Application submitted')) {
          // Create application record in our system
          await this.createApplicationRecord(userId, jobDetails);
          
          return {
            success: true,
            message: 'Candidatura realizada com sucesso',
            jobDetails,
          };
        } else {
          throw new BadRequestException('Não foi possível confirmar se a candidatura foi enviada com sucesso.');
        }
      } finally {
        if (browser) {
          await browser.close();
        }
      }
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
      $('.jobsearch-ResultsList > div.cardOutline').each((index, element) => {
        // Check if this is a job card
        if (!$(element).find('.jobTitle').length) {
          return;
        }
        
        const jobId = $(element).attr('data-jk') || '';
        const title = $(element).find('.jobTitle span').text().trim();
        const companyName = $(element).find('.companyName').text().trim();
        const location = $(element).find('.companyLocation').text().trim();
        const salary = $(element).find('.salary-snippet').text().trim() || $(element).find('.estimated-salary').text().trim();
        const postedDate = $(element).find('.date').text().trim();
        
        jobs.push({
          id: jobId,
          title,
          companyName,
          location,
          salary,
          postedDate,
          url: `${this.baseUrl}/viewjob?jk=${jobId}`,
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
      const title = $('.jobsearch-JobInfoHeader-title').text().trim();
      const companyName = $('.jobsearch-InlineCompanyRating-companyHeader').text().trim();
      const location = $('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationName').text().trim();
      const salary = $('.jobsearch-JobMetadataHeader-item:contains("Salário")').text().trim();
      const description = $('.jobsearch-jobDescriptionText').html() || '';
      
      // Extract employment type
      let employmentType = 'CLT';
      $('.jobsearch-JobMetadataHeader-item').each((index, element) => {
        const text = $(element).text().trim();
        if (text.includes('Tipo de contratação:')) {
          employmentType = text.replace('Tipo de contratação:', '').trim();
        }
      });
      
      // Extract workplace type
      let workplaceType = 'Presencial';
      $('.jobsearch-JobMetadataHeader-item').each((index, element) => {
        const text = $(element).text().trim();
        if (text.includes('Tipo de trabalho:')) {
          workplaceType = text.replace('Tipo de trabalho:', '').trim();
        }
      });
      
      // Extract skills
      const skills = [];
      $('.jobsearch-ReqAndQualSection-item').each((index, element) => {
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
      $('.jobsearch-ReqAndQualSection-item').each((index, element) => {
        const text = $(element).text().trim();
        const match = text.match(/(\d+)\s*anos?\s*de\s*experiência/i);
        if (match) {
          experienceYears = parseInt(match[1], 10);
        }
      });
      
      // Check if job has apply button
      const hasApplyButton = $('.jobsearch-IndeedApplyButton-buttonWrapper').length > 0;
      
      // Extract requirements and benefits
      const requirements = $('.jobsearch-ReqAndQualSection-item-list').html() || '';
      const benefits = $('.jobsearch-JobDescriptionSection-sectionItem:contains("Benefícios")').html() || '';
      
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
        hasApplyButton,
        applicationUrl: hasApplyButton ? `${this.baseUrl}/apply/web?jk=${jobId}` : null,
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
    
    $('.jobsearch-JobMetadataHeader-item').each((index, element) => {
      const text = $(element).text().trim();
      if (text.includes('Setor:')) {
        industry = text.replace('Setor:', '').trim();
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
      'Referer': 'https://www.indeed.com.br/',
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

  private mapJobType(indeedType: string): JobType {
    const typeMap = {
      'CLT': JobType.CLT,
      'PJ': JobType.PJ,
      'Temporário': JobType.TEMPORARY,
      'Estágio': JobType.INTERNSHIP,
      'Freelancer': JobType.FREELANCER,
      'Tempo integral': JobType.CLT,
      'Meio período': JobType.CLT,
      'Contrato': JobType.PJ,
    };
    
    return typeMap[indeedType] || JobType.CLT;
  }

  private mapWorkModel(indeedType: string): WorkModel {
    const modelMap = {
      'Presencial': WorkModel.ONSITE,
      'Remoto': WorkModel.REMOTE,
      'Híbrido': WorkModel.HYBRID,
    };
    
    return modelMap[indeedType] || WorkModel.ONSITE;
  }
}
