import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { LinkedInScraperService } from './services/linkedin-scraper.service';
import { InfoJobsScraperService } from './services/infojobs-scraper.service';
import { CathoScraperService } from './services/catho-scraper.service';
import { HumanBehaviorSimulatorService } from './services/human-behavior-simulator.service';
import { ScraperConfig } from './interfaces/scraper-config.interface';
import { ScraperCredentials } from './interfaces/scraper-credentials.interface';
import { JobSearchParams } from './interfaces/job-search-params.interface';
import { ScrapedJob } from './interfaces/scraped-job.interface';
import { ApplicationResult } from './interfaces/application-result.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WebscraperService implements OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;
  private config: ScraperConfig = {
    headless: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    maxRetries: 3,
    delayBetweenActions: 1000,
    humanEmulation: true,
    randomizeUserAgent: true,
    useProxy: false,
    proxyList: [],
    viewportWidth: 1366,
    viewportHeight: 768,
    minDelayMs: 500,
    maxDelayMs: 3000,
  };

  constructor(
    private configService: ConfigService,
    private linkedInScraperService: LinkedInScraperService,
    private infoJobsScraperService: InfoJobsScraperService,
    private cathoScraperService: CathoScraperService,
    private humanBehaviorSimulatorService: HumanBehaviorSimulatorService,
  ) {}

  async initialize(config?: Partial<ScraperConfig>): Promise<void> {
    // Merge provided config with defaults
    this.config = { ...this.config, ...config };

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        ...(this.config.useProxy ? ['--proxy-server=' + this.getRandomProxy()] : []),
      ],
      defaultViewport: {
        width: this.config.viewportWidth,
        height: this.config.viewportHeight,
      },
    });

    // Initialize platform-specific scrapers
    await Promise.all([
      this.linkedInScraperService.initialize(this.browser, this.config),
      this.infoJobsScraperService.initialize(this.browser, this.config),
      this.cathoScraperService.initialize(this.browser, this.config),
    ]);
  }

  async loginAll(credentials: Record<string, ScraperCredentials | null>): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {
      linkedin: false,
      infojobs: false,
      catho: false,
    };

    // Login to LinkedIn
    if (credentials.linkedin) {
      results.linkedin = await this.linkedInScraperService.login(credentials.linkedin);
    }

    // Login to InfoJobs
    if (credentials.infojobs) {
      results.infojobs = await this.infoJobsScraperService.login(credentials.infojobs);
    }

    // Login to Catho
    if (credentials.catho) {
      results.catho = await this.cathoScraperService.login(credentials.catho);
    }

    return results;
  }

  async searchJobsAll(params: JobSearchParams): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // Search on LinkedIn
    try {
      const linkedInJobs = await this.linkedInScraperService.searchJobs(params);
      jobs.push(...linkedInJobs);
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
    }

    // Search on InfoJobs
    try {
      const infoJobsJobs = await this.infoJobsScraperService.searchJobs(params);
      jobs.push(...infoJobsJobs);
    } catch (error) {
      console.error('Error searching InfoJobs jobs:', error);
    }

    // Search on Catho
    try {
      const cathoJobs = await this.cathoScraperService.searchJobs(params);
      jobs.push(...cathoJobs);
    } catch (error) {
      console.error('Error searching Catho jobs:', error);
    }

    return jobs;
  }

  async analyzeJobMatch(job: ScrapedJob, user: User): Promise<number> {
    // Determine which service to use based on the job platform
    switch (job.platform) {
      case 'linkedin':
        return this.linkedInScraperService.analyzeJobMatch(job, user);
      case 'infojobs':
        return this.infoJobsScraperService.analyzeJobMatch(job, user);
      case 'catho':
        return this.cathoScraperService.analyzeJobMatch(job, user);
      default:
        // Default matching algorithm
        return this.defaultAnalyzeJobMatch(job, user);
    }
  }

  async applyToJob(job: ScrapedJob, user: User): Promise<ApplicationResult> {
    // Determine which service to use based on the job platform
    switch (job.platform) {
      case 'linkedin':
        return this.linkedInScraperService.applyToJob(job, user);
      case 'infojobs':
        return this.infoJobsScraperService.applyToJob(job, user);
      case 'catho':
        return this.cathoScraperService.applyToJob(job, user);
      default:
        return {
          jobId: job.id,
          platform: job.platform,
          success: false,
          error: 'Unsupported platform',
          timestamp: new Date(),
        };
    }
  }

  async checkApplicationStatus(platform: string, applicationId: string): Promise<string> {
    // Determine which service to use based on the platform
    switch (platform) {
      case 'linkedin':
        return this.linkedInScraperService.checkApplicationStatus(applicationId);
      case 'infojobs':
        return this.infoJobsScraperService.checkApplicationStatus(applicationId);
      case 'catho':
        return this.cathoScraperService.checkApplicationStatus(applicationId);
      default:
        return 'Unknown platform';
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async onModuleDestroy() {
    await this.close();
  }

  private getRandomProxy(): string {
    if (this.config.proxyList.length === 0) {
      return '';
    }
    const randomIndex = Math.floor(Math.random() * this.config.proxyList.length);
    return this.config.proxyList[randomIndex];
  }

  private defaultAnalyzeJobMatch(job: ScrapedJob, user: User): number {
    // Simple matching algorithm based on skills
    const userSkills = user.skills || [];
    const jobRequirements = job.requirements || [];
    
    let matchCount = 0;
    for (const skill of userSkills) {
      if (jobRequirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))) {
        matchCount++;
      }
    }
    
    const matchScore = userSkills.length > 0 
      ? Math.min(100, Math.round((matchCount / userSkills.length) * 100))
      : 50; // Default score if no skills
    
    return matchScore;
  }
}
