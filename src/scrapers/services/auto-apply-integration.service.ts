import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScraperJobService } from './scraper-job.service';
import { ScraperSessionService } from './scraper-session.service';
import { LinkedInScraperService } from './linkedin-scraper.service';
import { InfoJobsScraperService } from './infojobs-scraper.service';
import { CathoScraperService } from './catho-scraper.service';
import { IndeedScraperService } from './indeed-scraper.service';
import { AutoApplyService } from '../../auto-apply/services/auto-apply.service';
import { AutoApplyExecutorService } from '../../auto-apply/services/auto-apply-executor.service';
import { ScraperPlatform } from '../entities/scraper-session.entity';
import { AutoApplyStatus, AutoApplyReason } from '../../auto-apply/entities/auto-apply-history.entity';
import { DocumentsService } from '../../documents/services/documents.service';
import { DocumentType } from '../../documents/entities/document.entity';

@Injectable()
export class AutoApplyIntegrationService {
  private readonly logger = new Logger(AutoApplyIntegrationService.name);

  constructor(
    private configService: ConfigService,
    private scraperJobService: ScraperJobService,
    private scraperSessionService: ScraperSessionService,
    private linkedInScraperService: LinkedInScraperService,
    private infoJobsScraperService: InfoJobsScraperService,
    private cathoScraperService: CathoScraperService,
    private indeedScraperService: IndeedScraperService,
    private autoApplyService: AutoApplyService,
    private autoApplyExecutorService: AutoApplyExecutorService,
    private documentsService: DocumentsService,
  ) {}

  async executeAutoApplyForUser(userId: string): Promise<void> {
    this.logger.log(`Starting auto-apply process for user ${userId}`);

    try {
      // Get auto-apply configuration
      const config = await this.autoApplyService.getConfig(userId);

      // Check if auto-apply is enabled
      if (!config.isEnabled) {
        this.logger.log(`Auto-apply is disabled for user ${userId}`);
        return;
      }

      // Check daily and monthly limits
      if (config.applicationsToday >= config.maxApplicationsPerDay) {
        this.logger.log(`Daily limit reached for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.SKIPPED,
          AutoApplyReason.LIMIT_REACHED,
          'Daily application limit reached',
        );
        return;
      }

      if (config.applicationsThisMonth >= config.maxApplicationsPerMonth) {
        this.logger.log(`Monthly limit reached for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.SKIPPED,
          AutoApplyReason.LIMIT_REACHED,
          'Monthly application limit reached',
        );
        return;
      }

      // Check if user has active sessions for any platform
      const linkedInSession = await this.scraperSessionService.findActiveSessionByUserAndPlatform(
        userId,
        ScraperPlatform.LINKEDIN,
      );

      const infoJobsSession = await this.scraperSessionService.findActiveSessionByUserAndPlatform(
        userId,
        ScraperPlatform.INFOJOBS,
      );

      const cathoSession = await this.scraperSessionService.findActiveSessionByUserAndPlatform(
        userId,
        ScraperPlatform.CATHO,
      );

      const indeedSession = await this.scraperSessionService.findActiveSessionByUserAndPlatform(
        userId,
        ScraperPlatform.INDEED,
      );

      if (!linkedInSession && !infoJobsSession && !cathoSession && !indeedSession) {
        this.logger.log(`No active scraper sessions for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.FAILED,
          AutoApplyReason.ERROR,
          'Nenhuma sessão ativa encontrada. Faça login em pelo menos uma plataforma.',
        );
        return;
      }

      // Process each platform with active session
      if (linkedInSession) {
        await this.processLinkedInAutoApply(userId, config, linkedInSession);
      }

      if (infoJobsSession) {
        await this.processInfoJobsAutoApply(userId, config, infoJobsSession);
      }

      if (cathoSession) {
        await this.processCathoAutoApply(userId, config, cathoSession);
      }

      if (indeedSession) {
        await this.processIndeedAutoApply(userId, config, indeedSession);
      }

      this.logger.log(`Completed auto-apply process for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error in auto-apply process for user ${userId}: ${error.message}`);

      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `Auto-apply process error: ${error.message}`,
      );
    }
  }

  private async processLinkedInAutoApply(userId: string, config: any, session: any): Promise<void> {
    this.logger.log(`Processing LinkedIn auto-apply for user ${userId}`);

    try {
      // Get default resume and cover letter
      const defaultResume = await this.documentsService.getDefaultDocument(userId, DocumentType.RESUME);
      const defaultCoverLetter = await this.documentsService.getDefaultDocument(userId, DocumentType.COVER_LETTER);

      // Create search job parameters based on auto-apply config
      const searchParameters = {
        action: 'searchJobs',
        keywords: config.keywords || '',
        location: config.locations || '',
        filters: {
          datePosted: 'r86400', // Last 24 hours
          jobType: this.mapJobTypesToLinkedIn(config.jobTypes),
          experience: this.mapExperienceToLinkedIn(config.experienceMax),
          distance: '25', // 25 miles/km
        },
      };

      // Create scraper job for search
      const scraperJob = await this.scraperJobService.createJob(
        userId,
        ScraperPlatform.LINKEDIN,
        searchParameters,
        true, // This is an auto-apply job
      );

      // Process the search job
      await this.linkedInScraperService.processJob(scraperJob.id);

      // Get search results
      const completedJob = await this.scraperJobService.findById(scraperJob.id);

      if (completedJob.status !== 'COMPLETED' || !completedJob.result || !completedJob.result.jobs) {
        this.logger.error(`LinkedIn search job failed for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.FAILED,
          AutoApplyReason.ERROR,
          'Falha ao buscar vagas no LinkedIn',
        );
        return;
      }

      // Process each job
      const jobs = completedJob.result.jobs;
      this.logger.log(`Found ${jobs.length} LinkedIn jobs for user ${userId}`);

      for (const job of jobs) {
        // Check if we've reached the daily limit
        const updatedConfig = await this.autoApplyService.getConfig(userId);
        if (updatedConfig.applicationsToday >= updatedConfig.maxApplicationsPerDay) {
          this.logger.log(`Daily limit reached during LinkedIn processing for user ${userId}`);
          break;
        }

        // Get job details
        const jobDetailsJob = await this.scraperJobService.createJob(
          userId,
          ScraperPlatform.LINKEDIN,
          {
            action: 'getJobDetails',
            linkedinJobId: job.id,
          },
          true,
        );

        await this.linkedInScraperService.processJob(jobDetailsJob.id);

        const jobDetailsResult = await this.scraperJobService.findById(jobDetailsJob.id);

        if (jobDetailsResult.status !== 'COMPLETED' || !jobDetailsResult.result || !jobDetailsResult.result.jobDetails) {
          this.logger.warn(`Failed to get details for LinkedIn job ${job.id}`);
          continue;
        }

        const jobDetails = jobDetailsResult.result.jobDetails;

        // Calculate match score
        const matchScore = await this.calculateMatchScore(jobDetails, config);

        // Check if job matches criteria
        if (matchScore < config.matchThreshold) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.LOW_MATCH,
            `LinkedIn: Pontuação de correspondência (${matchScore}) abaixo do limiar (${config.matchThreshold})`,
            matchScore,
          );
          continue;
        }

        // Check excluded keywords
        if (config.excludedKeywords && this.containsExcludedKeywords(jobDetails, config.excludedKeywords)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_KEYWORD,
            'LinkedIn: Vaga contém palavras-chave excluídas',
            matchScore,
          );
          continue;
        }

        // Check excluded companies
        if (config.excludedCompanies && this.isExcludedCompany(jobDetails, config.excludedCompanies)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_COMPANY,
            'LinkedIn: Vaga é de empresa excluída',
            matchScore,
          );
          continue;
        }

        // Check if job has Easy Apply
        if (!jobDetails.hasEasyApply) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.ERROR,
            'LinkedIn: Vaga não suporta Easy Apply',
            matchScore,
          );
          continue;
        }

        // Apply to job
        try {
          const applyJob = await this.scraperJobService.createJob(
            userId,
            ScraperPlatform.LINKEDIN,
            {
              action: 'applyToJob',
              linkedinJobId: job.id,
              coverLetter: defaultCoverLetter ? defaultCoverLetter.content : config.defaultCoverLetter,
              resumeUrl: defaultResume ? defaultResume.url : config.defaultResumeUrl,
            },
            true,
          );

          await this.linkedInScraperService.processJob(applyJob.id);

          const applyResult = await this.scraperJobService.findById(applyJob.id);

          if (applyResult.status === 'COMPLETED') {
            // Record successful application
            await this.autoApplyService.recordHistory(
              userId,
              null, // We don't have our internal job ID here
              AutoApplyStatus.SUCCESS,
              AutoApplyReason.APPLIED,
              `LinkedIn: Candidatura realizada com sucesso para ${jobDetails.title} na ${jobDetails.companyName}`,
              matchScore,
            );

            // Increment application counters
            await this.autoApplyService.incrementApplicationCounters(userId);

            // Increment document usage if used
            if (defaultResume) {
              await this.documentsService.incrementUsageCount(defaultResume.id);
            }
            if (defaultCoverLetter) {
              await this.documentsService.incrementUsageCount(defaultCoverLetter.id);
            }
          } else {
            // Record failed application
            await this.autoApplyService.recordHistory(
              userId,
              null,
              AutoApplyStatus.FAILED,
              AutoApplyReason.ERROR,
              `LinkedIn: Falha ao se candidatar: ${applyResult.errorMessage || 'Erro desconhecido'}`,
              matchScore,
            );
          }
        } catch (error) {
          this.logger.error(`Error applying to LinkedIn job ${job.id}: ${error.message}`);

          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.FAILED,
            AutoApplyReason.ERROR,
            `LinkedIn: Erro ao se candidatar: ${error.message}`,
            matchScore,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in LinkedIn auto-apply process for user ${userId}: ${error.message}`);

      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `LinkedIn: Erro no processo de auto-apply: ${error.message}`,
      );
    }
  }

  private async processInfoJobsAutoApply(userId: string, config: any, session: any): Promise<void> {
    this.logger.log(`Processing InfoJobs auto-apply for user ${userId}`);

    try {
      // Get default resume and cover letter
      const defaultResume = await this.documentsService.getDefaultDocument(userId, DocumentType.RESUME);
      const defaultCoverLetter = await this.documentsService.getDefaultDocument(userId, DocumentType.COVER_LETTER);

      // Create search job parameters based on auto-apply config
      const searchParameters = {
        action: 'searchJobs',
        keywords: config.keywords || '',
        location: config.locations || '',
        filters: {
          datePosted: '1', // Last 24 hours
          jobType: this.mapJobTypesToInfoJobs(config.jobTypes),
          experience: this.mapExperienceToInfoJobs(config.experienceMax),
          salary: config.salaryMin ? this.mapSalaryToInfoJobs(config.salaryMin) : '',
        },
      };

      // Create scraper job for search
      const scraperJob = await this.scraperJobService.createJob(
        userId,
        ScraperPlatform.INFOJOBS,
        searchParameters,
        true, // This is an auto-apply job
      );

      // Process the search job
      await this.infoJobsScraperService.processJob(scraperJob.id);

      // Get search results
      const completedJob = await this.scraperJobService.findById(scraperJob.id);

      if (completedJob.status !== 'COMPLETED' || !completedJob.result || !completedJob.result.jobs) {
        this.logger.error(`InfoJobs search job failed for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.FAILED,
          AutoApplyReason.ERROR,
          'Falha ao buscar vagas no InfoJobs',
        );
        return;
      }

      // Process each job
      const jobs = completedJob.result.jobs;
      this.logger.log(`Found ${jobs.length} InfoJobs jobs for user ${userId}`);

      for (const job of jobs) {
        // Check if we've reached the daily limit
        const updatedConfig = await this.autoApplyService.getConfig(userId);
        if (updatedConfig.applicationsToday >= updatedConfig.maxApplicationsPerDay) {
          this.logger.log(`Daily limit reached during InfoJobs processing for user ${userId}`);
          break;
        }

        // Get job details
        const jobDetailsJob = await this.scraperJobService.createJob(
          userId,
          ScraperPlatform.INFOJOBS,
          {
            action: 'getJobDetails',
            infoJobsJobId: job.id,
          },
          true,
        );

        await this.infoJobsScraperService.processJob(jobDetailsJob.id);

        const jobDetailsResult = await this.scraperJobService.findById(jobDetailsJob.id);

        if (jobDetailsResult.status !== 'COMPLETED' || !jobDetailsResult.result || !jobDetailsResult.result.jobDetails) {
          this.logger.warn(`Failed to get details for InfoJobs job ${job.id}`);
          continue;
        }

        const jobDetails = jobDetailsResult.result.jobDetails;

        // Calculate match score
        const matchScore = await this.calculateMatchScore(jobDetails, config);

        // Check if job matches criteria
        if (matchScore < config.matchThreshold) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.LOW_MATCH,
            `InfoJobs: Pontuação de correspondência (${matchScore}) abaixo do limiar (${config.matchThreshold})`,
            matchScore,
          );
          continue;
        }

        // Check excluded keywords
        if (config.excludedKeywords && this.containsExcludedKeywords(jobDetails, config.excludedKeywords)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_KEYWORD,
            'InfoJobs: Vaga contém palavras-chave excluídas',
            matchScore,
          );
          continue;
        }

        // Check excluded companies
        if (config.excludedCompanies && this.isExcludedCompany(jobDetails, config.excludedCompanies)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_COMPANY,
            'InfoJobs: Vaga é de empresa excluída',
            matchScore,
          );
          continue;
        }

        // Apply to job
        try {
          const applyJob = await this.scraperJobService.createJob(
            userId,
            ScraperPlatform.INFOJOBS,
            {
              action: 'applyToJob',
              infoJobsJobId: job.id,
              coverLetter: defaultCoverLetter ? defaultCoverLetter.content : config.defaultCoverLetter,
              resumeUrl: defaultResume ? defaultResume.url : config.defaultResumeUrl,
            },
            true,
          );

          await this.infoJobsScraperService.processJob(applyJob.id);

          const applyResult = await this.scraperJobService.findById(applyJob.id);

          if (applyResult.status === 'COMPLETED') {
            // Record successful application
            await this.autoApplyService.recordHistory(
              userId,
              null, // We don't have our internal job ID here
              AutoApplyStatus.SUCCESS,
              AutoApplyReason.APPLIED,
              `InfoJobs: Candidatura realizada com sucesso para ${jobDetails.title} na ${jobDetails.companyName}`,
              matchScore,
            );

            // Increment application counters
            await this.autoApplyService.incrementApplicationCounters(userId);

            // Increment document usage if used
            if (defaultResume) {
              await this.documentsService.incrementUsageCount(defaultResume.id);
            }
            if (defaultCoverLetter) {
              await this.documentsService.incrementUsageCount(defaultCoverLetter.id);
            }
          } else {
            // Record failed application
            await this.autoApplyService.recordHistory(
              userId,
              null,
              AutoApplyStatus.FAILED,
              AutoApplyReason.ERROR,
              `InfoJobs: Falha ao se candidatar: ${applyResult.errorMessage || 'Erro desconhecido'}`,
              matchScore,
            );
          }
        } catch (error) {
          this.logger.error(`Error applying to InfoJobs job ${job.id}: ${error.message}`);

          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.FAILED,
            AutoApplyReason.ERROR,
            `InfoJobs: Erro ao se candidatar: ${error.message}`,
            matchScore,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in InfoJobs auto-apply process for user ${userId}: ${error.message}`);

      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `InfoJobs: Erro no processo de auto-apply: ${error.message}`,
      );
    }
  }

  private mapJobTypesToInfoJobs(jobTypes: string[]): string {
    if (!jobTypes || jobTypes.length === 0) return '';

    const typeMap = {
      'CLT': 'clt',
      'PJ': 'pj',
      'FREELANCER': 'autonomo',
      'INTERNSHIP': 'estagio',
      'TEMPORARY': 'temporario',
    };

    const infoJobsTypes = jobTypes.map(type => typeMap[type] || '').filter(Boolean);

    return infoJobsTypes.join(',');
  }

  private mapExperienceToInfoJobs(experienceMax: number): string {
    if (!experienceMax) return '';

    if (experienceMax <= 1) return '1';
    if (experienceMax <= 3) return '2';
    if (experienceMax <= 5) return '3';
    if (experienceMax <= 10) return '4';
    return '5';
  }

  private mapSalaryToInfoJobs(salaryMin: number): string {
    if (!salaryMin) return '';

    if (salaryMin <= 1000) return '1';
    if (salaryMin <= 2000) return '2';
    if (salaryMin <= 3000) return '3';
    if (salaryMin <= 4000) return '4';
    if (salaryMin <= 5000) return '5';
    if (salaryMin <= 7000) return '6';
    if (salaryMin <= 10000) return '7';
    return '8';
  }

  private async processCathoAutoApply(userId: string, config: any, session: any): Promise<void> {
    this.logger.log(`Processing Catho auto-apply for user ${userId}`);

    try {
      // Get default resume and cover letter
      const defaultResume = await this.documentsService.getDefaultDocument(userId, DocumentType.RESUME);
      const defaultCoverLetter = await this.documentsService.getDefaultDocument(userId, DocumentType.COVER_LETTER);

      // Create search job parameters based on auto-apply config
      const searchParameters = {
        action: 'searchJobs',
        keywords: config.keywords || '',
        location: config.locations || '',
        filters: {
          datePosted: '1', // Last 24 hours
          jobType: this.mapJobTypesToCatho(config.jobTypes),
          experience: this.mapExperienceToCatho(config.experienceMax),
          salary: config.salaryMin ? this.mapSalaryToCatho(config.salaryMin) : '',
          education: 'any',
        },
      };

      // Create scraper job for search
      const scraperJob = await this.scraperJobService.createJob(
        userId,
        ScraperPlatform.CATHO,
        searchParameters,
        true, // This is an auto-apply job
      );

      // Process the search job
      await this.cathoScraperService.processJob(scraperJob.id);

      // Get search results
      const completedJob = await this.scraperJobService.findById(scraperJob.id);

      if (completedJob.status !== 'COMPLETED' || !completedJob.result || !completedJob.result.jobs) {
        this.logger.error(`Catho search job failed for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.FAILED,
          AutoApplyReason.ERROR,
          'Falha ao buscar vagas no Catho',
        );
        return;
      }

      // Process each job
      const jobs = completedJob.result.jobs;
      this.logger.log(`Found ${jobs.length} Catho jobs for user ${userId}`);

      for (const job of jobs) {
        // Check if we've reached the daily limit
        const updatedConfig = await this.autoApplyService.getConfig(userId);
        if (updatedConfig.applicationsToday >= updatedConfig.maxApplicationsPerDay) {
          this.logger.log(`Daily limit reached during Catho processing for user ${userId}`);
          break;
        }

        // Get job details
        const jobDetailsJob = await this.scraperJobService.createJob(
          userId,
          ScraperPlatform.CATHO,
          {
            action: 'getJobDetails',
            cathoJobId: job.id,
          },
          true,
        );

        await this.cathoScraperService.processJob(jobDetailsJob.id);

        const jobDetailsResult = await this.scraperJobService.findById(jobDetailsJob.id);

        if (jobDetailsResult.status !== 'COMPLETED' || !jobDetailsResult.result || !jobDetailsResult.result.jobDetails) {
          this.logger.warn(`Failed to get details for Catho job ${job.id}`);
          continue;
        }

        const jobDetails = jobDetailsResult.result.jobDetails;

        // Calculate match score
        const matchScore = await this.calculateMatchScore(jobDetails, config);

        // Check if job matches criteria
        if (matchScore < config.matchThreshold) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.LOW_MATCH,
            `Catho: Pontuação de correspondência (${matchScore}) abaixo do limiar (${config.matchThreshold})`,
            matchScore,
          );
          continue;
        }

        // Check excluded keywords
        if (config.excludedKeywords && this.containsExcludedKeywords(jobDetails, config.excludedKeywords)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_KEYWORD,
            'Catho: Vaga contém palavras-chave excluídas',
            matchScore,
          );
          continue;
        }

        // Check excluded companies
        if (config.excludedCompanies && this.isExcludedCompany(jobDetails, config.excludedCompanies)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_COMPANY,
            'Catho: Vaga é de empresa excluída',
            matchScore,
          );
          continue;
        }

        // Apply to job
        try {
          const applyJob = await this.scraperJobService.createJob(
            userId,
            ScraperPlatform.CATHO,
            {
              action: 'applyToJob',
              cathoJobId: job.id,
              coverLetter: defaultCoverLetter ? defaultCoverLetter.content : config.defaultCoverLetter,
              resumeUrl: defaultResume ? defaultResume.url : config.defaultResumeUrl,
            },
            true,
          );

          await this.cathoScraperService.processJob(applyJob.id);

          const applyResult = await this.scraperJobService.findById(applyJob.id);

          if (applyResult.status === 'COMPLETED') {
            // Record successful application
            await this.autoApplyService.recordHistory(
              userId,
              null, // We don't have our internal job ID here
              AutoApplyStatus.SUCCESS,
              AutoApplyReason.APPLIED,
              `Catho: Candidatura realizada com sucesso para ${jobDetails.title} na ${jobDetails.companyName}`,
              matchScore,
            );

            // Increment application counters
            await this.autoApplyService.incrementApplicationCounters(userId);

            // Increment document usage if used
            if (defaultResume) {
              await this.documentsService.incrementUsageCount(defaultResume.id);
            }
            if (defaultCoverLetter) {
              await this.documentsService.incrementUsageCount(defaultCoverLetter.id);
            }
          } else {
            // Record failed application
            await this.autoApplyService.recordHistory(
              userId,
              null,
              AutoApplyStatus.FAILED,
              AutoApplyReason.ERROR,
              `Catho: Falha ao se candidatar: ${applyResult.errorMessage || 'Erro desconhecido'}`,
              matchScore,
            );
          }
        } catch (error) {
          this.logger.error(`Error applying to Catho job ${job.id}: ${error.message}`);

          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.FAILED,
            AutoApplyReason.ERROR,
            `Catho: Erro ao se candidatar: ${error.message}`,
            matchScore,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in Catho auto-apply process for user ${userId}: ${error.message}`);

      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `Catho: Erro no processo de auto-apply: ${error.message}`,
      );
    }
  }

  private mapJobTypesToCatho(jobTypes: string[]): string {
    if (!jobTypes || jobTypes.length === 0) return '';

    const typeMap = {
      'CLT': 'clt',
      'PJ': 'pj',
      'FREELANCER': 'freelancer',
      'INTERNSHIP': 'estagio',
      'TEMPORARY': 'temporario',
    };

    const cathoTypes = jobTypes.map(type => typeMap[type] || '').filter(Boolean);

    return cathoTypes.join(',');
  }

  private mapExperienceToCatho(experienceMax: number): string {
    if (!experienceMax) return '';

    if (experienceMax <= 1) return 'sem-experiencia';
    if (experienceMax <= 3) return 'ate-3-anos';
    if (experienceMax <= 5) return 'ate-5-anos';
    if (experienceMax <= 10) return 'ate-10-anos';
    return 'mais-de-10-anos';
  }

  private mapSalaryToCatho(salaryMin: number): string {
    if (!salaryMin) return '';

    if (salaryMin <= 1000) return 'ate-1000';
    if (salaryMin <= 2000) return 'de-1000-a-2000';
    if (salaryMin <= 3000) return 'de-2000-a-3000';
    if (salaryMin <= 5000) return 'de-3000-a-5000';
    if (salaryMin <= 10000) return 'de-5000-a-10000';
    return 'acima-de-10000';
  }

  private async processIndeedAutoApply(userId: string, config: any, session: any): Promise<void> {
    this.logger.log(`Processing Indeed auto-apply for user ${userId}`);

    try {
      // Get default resume and cover letter
      const defaultResume = await this.documentsService.getDefaultDocument(userId, DocumentType.RESUME);
      const defaultCoverLetter = await this.documentsService.getDefaultDocument(userId, DocumentType.COVER_LETTER);

      // Create search job parameters based on auto-apply config
      const searchParameters = {
        action: 'searchJobs',
        keywords: config.keywords || '',
        location: config.locations || '',
        filters: {
          datePosted: '1', // Last 24 hours
          jobType: this.mapJobTypesToIndeed(config.jobTypes),
          experience: this.mapExperienceToIndeed(config.experienceMax),
          salary: config.salaryMin ? this.mapSalaryToIndeed(config.salaryMin) : '',
          radius: '25', // 25 km
        },
      };

      // Create scraper job for search
      const scraperJob = await this.scraperJobService.createJob(
        userId,
        ScraperPlatform.INDEED,
        searchParameters,
        true, // This is an auto-apply job
      );

      // Process the search job
      await this.indeedScraperService.processJob(scraperJob.id);

      // Get search results
      const completedJob = await this.scraperJobService.findById(scraperJob.id);

      if (completedJob.status !== 'COMPLETED' || !completedJob.result || !completedJob.result.jobs) {
        this.logger.error(`Indeed search job failed for user ${userId}`);
        await this.autoApplyService.recordHistory(
          userId,
          null,
          AutoApplyStatus.FAILED,
          AutoApplyReason.ERROR,
          'Falha ao buscar vagas no Indeed',
        );
        return;
      }

      // Process each job
      const jobs = completedJob.result.jobs;
      this.logger.log(`Found ${jobs.length} Indeed jobs for user ${userId}`);

      for (const job of jobs) {
        // Check if we've reached the daily limit
        const updatedConfig = await this.autoApplyService.getConfig(userId);
        if (updatedConfig.applicationsToday >= updatedConfig.maxApplicationsPerDay) {
          this.logger.log(`Daily limit reached during Indeed processing for user ${userId}`);
          break;
        }

        // Get job details
        const jobDetailsJob = await this.scraperJobService.createJob(
          userId,
          ScraperPlatform.INDEED,
          {
            action: 'getJobDetails',
            indeedJobId: job.id,
          },
          true,
        );

        await this.indeedScraperService.processJob(jobDetailsJob.id);

        const jobDetailsResult = await this.scraperJobService.findById(jobDetailsJob.id);

        if (jobDetailsResult.status !== 'COMPLETED' || !jobDetailsResult.result || !jobDetailsResult.result.jobDetails) {
          this.logger.warn(`Failed to get details for Indeed job ${job.id}`);
          continue;
        }

        const jobDetails = jobDetailsResult.result.jobDetails;

        // Check if job has apply button
        if (!jobDetails.hasApplyButton) {
          this.logger.warn(`Indeed job ${job.id} does not have an apply button`);
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.ERROR,
            'Indeed: Vaga não possui botão de candidatura direta',
            0,
          );
          continue;
        }

        // Calculate match score
        const matchScore = await this.calculateMatchScore(jobDetails, config);

        // Check if job matches criteria
        if (matchScore < config.matchThreshold) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.LOW_MATCH,
            `Indeed: Pontuação de correspondência (${matchScore}) abaixo do limiar (${config.matchThreshold})`,
            matchScore,
          );
          continue;
        }

        // Check excluded keywords
        if (config.excludedKeywords && this.containsExcludedKeywords(jobDetails, config.excludedKeywords)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_KEYWORD,
            'Indeed: Vaga contém palavras-chave excluídas',
            matchScore,
          );
          continue;
        }

        // Check excluded companies
        if (config.excludedCompanies && this.isExcludedCompany(jobDetails, config.excludedCompanies)) {
          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.EXCLUDED_COMPANY,
            'Indeed: Vaga é de empresa excluída',
            matchScore,
          );
          continue;
        }

        // Apply to job
        try {
          const applyJob = await this.scraperJobService.createJob(
            userId,
            ScraperPlatform.INDEED,
            {
              action: 'applyToJob',
              indeedJobId: job.id,
              coverLetter: defaultCoverLetter ? defaultCoverLetter.content : config.defaultCoverLetter,
              resumeUrl: defaultResume ? defaultResume.url : config.defaultResumeUrl,
            },
            true,
          );

          await this.indeedScraperService.processJob(applyJob.id);

          const applyResult = await this.scraperJobService.findById(applyJob.id);

          if (applyResult.status === 'COMPLETED') {
            // Record successful application
            await this.autoApplyService.recordHistory(
              userId,
              null, // We don't have our internal job ID here
              AutoApplyStatus.SUCCESS,
              AutoApplyReason.APPLIED,
              `Indeed: Candidatura realizada com sucesso para ${jobDetails.title} na ${jobDetails.companyName}`,
              matchScore,
            );

            // Increment application counters
            await this.autoApplyService.incrementApplicationCounters(userId);

            // Increment document usage if used
            if (defaultResume) {
              await this.documentsService.incrementUsageCount(defaultResume.id);
            }
            if (defaultCoverLetter) {
              await this.documentsService.incrementUsageCount(defaultCoverLetter.id);
            }
          } else {
            // Record failed application
            await this.autoApplyService.recordHistory(
              userId,
              null,
              AutoApplyStatus.FAILED,
              AutoApplyReason.ERROR,
              `Indeed: Falha ao se candidatar: ${applyResult.errorMessage || 'Erro desconhecido'}`,
              matchScore,
            );
          }
        } catch (error) {
          this.logger.error(`Error applying to Indeed job ${job.id}: ${error.message}`);

          await this.autoApplyService.recordHistory(
            userId,
            null,
            AutoApplyStatus.FAILED,
            AutoApplyReason.ERROR,
            `Indeed: Erro ao se candidatar: ${error.message}`,
            matchScore,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error in Indeed auto-apply process for user ${userId}: ${error.message}`);

      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `Indeed: Erro no processo de auto-apply: ${error.message}`,
      );
    }
  }

  private mapJobTypesToIndeed(jobTypes: string[]): string {
    if (!jobTypes || jobTypes.length === 0) return '';

    const typeMap = {
      'CLT': 'fulltime',
      'PJ': 'contract',
      'FREELANCER': 'contract',
      'INTERNSHIP': 'internship',
      'TEMPORARY': 'temporary',
    };

    const indeedTypes = jobTypes.map(type => typeMap[type] || '').filter(Boolean);

    return indeedTypes.join(',');
  }

  private mapExperienceToIndeed(experienceMax: number): string {
    if (!experienceMax) return '';

    if (experienceMax <= 1) return 'entry_level';
    if (experienceMax <= 3) return 'mid_level';
    if (experienceMax <= 5) return 'mid_level';
    if (experienceMax <= 10) return 'senior_level';
    return 'executive_level';
  }

  private mapSalaryToIndeed(salaryMin: number): string {
    if (!salaryMin) return '';

    // Indeed uses annual salary in thousands
    const annualSalary = salaryMin * 12 / 1000;

    if (annualSalary <= 30) return '30';
    if (annualSalary <= 50) return '50';
    if (annualSalary <= 70) return '70';
    if (annualSalary <= 90) return '90';
    if (annualSalary <= 110) return '110';
    if (annualSalary <= 130) return '130';
    return '150';
  }

  private async calculateMatchScore(jobDetails: any, config: any): Promise<number> {
    // This is a simplified version of the match score calculation
    // In a real implementation, this would be more sophisticated

    let score = 0;
    const maxScore = 10;

    // Check keywords match
    if (config.keywords) {
      const keywords = config.keywords.toLowerCase().split(',').map(k => k.trim());
      const jobText = `${jobDetails.title} ${jobDetails.description}`.toLowerCase();

      const keywordMatches = keywords.filter(keyword => jobText.includes(keyword)).length;
      const keywordScore = (keywordMatches / keywords.length) * 5; // Weight: 5

      score += keywordScore;
    } else {
      score += 2.5; // Default score if no keywords specified
    }

    // Check location match
    if (config.locations) {
      const locations = config.locations.toLowerCase().split(',').map(l => l.trim());
      const jobLocation = jobDetails.location.toLowerCase();

      const locationMatches = locations.some(location => jobLocation.includes(location));
      const locationScore = locationMatches ? 2 : 0; // Weight: 2

      score += locationScore;
    } else {
      score += 1; // Default score if no locations specified
    }

    // Check industry match
    if (config.industries && jobDetails.industry) {
      const industries = config.industries.toLowerCase().split(',').map(i => i.trim());
      const jobIndustry = jobDetails.industry.toLowerCase();

      const industryMatches = industries.some(industry => jobIndustry.includes(industry));
      const industryScore = industryMatches ? 1.5 : 0; // Weight: 1.5

      score += industryScore;
    } else {
      score += 0.75; // Default score if no industries specified
    }

    // Check job type match
    if (config.jobTypes && jobDetails.employmentType) {
      const jobTypeMatches = config.jobTypes.includes(this.mapLinkedInToJobType(jobDetails.employmentType));
      const jobTypeScore = jobTypeMatches ? 1.5 : 0; // Weight: 1.5

      score += jobTypeScore;
    } else {
      score += 0.75; // Default score if no job types specified
    }

    // Round to nearest integer and cap at max score
    return Math.min(Math.round(score), maxScore);
  }

  private containsExcludedKeywords(jobDetails: any, excludedKeywords: string): boolean {
    if (!excludedKeywords) return false;

    const keywords = excludedKeywords.toLowerCase().split(',').map(k => k.trim());
    const jobText = `${jobDetails.title} ${jobDetails.description}`.toLowerCase();

    return keywords.some(keyword => jobText.includes(keyword));
  }

  private isExcludedCompany(jobDetails: any, excludedCompanies: string): boolean {
    if (!excludedCompanies) return false;

    const companies = excludedCompanies.toLowerCase().split(',').map(c => c.trim());
    const companyName = jobDetails.companyName.toLowerCase();

    return companies.some(company => companyName.includes(company));
  }

  private mapJobTypesToLinkedIn(jobTypes: string[]): string {
    if (!jobTypes || jobTypes.length === 0) return '';

    const typeMap = {
      'CLT': 'F',
      'PJ': 'C',
      'FREELANCER': 'C',
      'INTERNSHIP': 'I',
      'TEMPORARY': 'T',
    };

    const linkedInTypes = jobTypes.map(type => typeMap[type] || '').filter(Boolean);

    return linkedInTypes.join(',');
  }

  private mapExperienceToLinkedIn(experienceMax: number): string {
    if (!experienceMax) return '';

    if (experienceMax <= 1) return '1';
    if (experienceMax <= 3) return '2';
    if (experienceMax <= 5) return '3';
    if (experienceMax <= 10) return '4';
    return '5';
  }

  private mapLinkedInToJobType(linkedinType: string): string {
    const typeMap = {
      'FULL_TIME': 'CLT',
      'PART_TIME': 'CLT',
      'CONTRACT': 'PJ',
      'TEMPORARY': 'TEMPORARY',
      'INTERNSHIP': 'INTERNSHIP',
      'VOLUNTEER': 'FREELANCER',
      'OTHER': 'CLT',
    };

    return typeMap[linkedinType] || 'CLT';
  }
}
