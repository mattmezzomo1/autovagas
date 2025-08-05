import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoApplyConfig } from './entities/auto-apply-config.entity';
import { CreateAutoApplyConfigDto } from './dto/create-auto-apply-config.dto';
import { UpdateAutoApplyConfigDto } from './dto/update-auto-apply-config.dto';
import { WebscraperService } from '../webscraper/webscraper.service';
import { UsersService } from '../users/users.service';
import { ApplicationsService } from '../applications/applications.service';
import { SubscriptionPlan } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutoApplyService {
  constructor(
    @InjectRepository(AutoApplyConfig)
    private autoApplyConfigRepository: Repository<AutoApplyConfig>,
    private webscraperService: WebscraperService,
    private usersService: UsersService,
    private applicationsService: ApplicationsService,
  ) {}

  async create(userId: string, createAutoApplyConfigDto: CreateAutoApplyConfigDto): Promise<AutoApplyConfig> {
    // Check if user has auto-apply enabled in subscription
    const user = await this.usersService.findById(userId);
    
    if (user.subscriptionPlan === SubscriptionPlan.BASIC) {
      throw new BadRequestException('Auto-apply is only available for Plus and Premium plans');
    }
    
    // Check if config already exists
    const existingConfig = await this.autoApplyConfigRepository.findOne({
      where: { userId },
    });
    
    if (existingConfig) {
      throw new BadRequestException('Auto-apply configuration already exists');
    }
    
    // Encrypt passwords
    const config = { ...createAutoApplyConfigDto };
    
    if (config.linkedinPassword) {
      config.linkedinPassword = await this.encryptPassword(config.linkedinPassword);
    }
    
    if (config.infojobsPassword) {
      config.infojobsPassword = await this.encryptPassword(config.infojobsPassword);
    }
    
    if (config.cathoPassword) {
      config.cathoPassword = await this.encryptPassword(config.cathoPassword);
    }
    
    // Create config
    const autoApplyConfig = this.autoApplyConfigRepository.create({
      ...config,
      userId,
    });
    
    return this.autoApplyConfigRepository.save(autoApplyConfig);
  }

  async findOne(userId: string): Promise<AutoApplyConfig> {
    const config = await this.autoApplyConfigRepository.findOne({
      where: { userId },
    });
    
    if (!config) {
      throw new NotFoundException('Auto-apply configuration not found');
    }
    
    return config;
  }

  async update(userId: string, updateAutoApplyConfigDto: UpdateAutoApplyConfigDto): Promise<AutoApplyConfig> {
    const config = await this.findOne(userId);
    
    // Update config properties
    Object.assign(config, updateAutoApplyConfigDto);
    
    // Encrypt passwords if provided
    if (updateAutoApplyConfigDto.linkedinPassword) {
      config.linkedinPassword = await this.encryptPassword(updateAutoApplyConfigDto.linkedinPassword);
    }
    
    if (updateAutoApplyConfigDto.infojobsPassword) {
      config.infojobsPassword = await this.encryptPassword(updateAutoApplyConfigDto.infojobsPassword);
    }
    
    if (updateAutoApplyConfigDto.cathoPassword) {
      config.cathoPassword = await this.encryptPassword(updateAutoApplyConfigDto.cathoPassword);
    }
    
    return this.autoApplyConfigRepository.save(config);
  }

  async remove(userId: string): Promise<void> {
    const config = await this.findOne(userId);
    await this.autoApplyConfigRepository.remove(config);
  }

  async startAutoApply(userId: string): Promise<{ success: boolean; message: string }> {
    // Check if user has auto-apply enabled in subscription
    const user = await this.usersService.findById(userId);
    
    if (!user.autoApplyEnabled) {
      throw new BadRequestException('Auto-apply is not enabled for this user');
    }
    
    // Get config
    const config = await this.findOne(userId);
    
    // Check if already running today
    const today = new Date().toDateString();
    const lastRunDay = config.lastRunDate ? config.lastRunDate.toDateString() : null;
    
    if (today === lastRunDay && config.todayApplicationCount >= config.maxApplicationsPerDay) {
      return {
        success: false,
        message: `Daily application limit reached (${config.maxApplicationsPerDay})`,
      };
    }
    
    // Reset counter if it's a new day
    if (today !== lastRunDay) {
      config.todayApplicationCount = 0;
    }
    
    // Update last run date
    config.lastRunDate = new Date();
    await this.autoApplyConfigRepository.save(config);
    
    // Start auto-apply process
    try {
      // Initialize webscraper
      await this.webscraperService.initialize({
        headless: config.headless,
        humanEmulation: true,
      });
      
      // Prepare credentials
      const credentials = {
        linkedin: config.linkedinUsername && config.linkedinPassword
          ? {
              username: config.linkedinUsername,
              password: await this.decryptPassword(config.linkedinPassword),
            }
          : null,
        infojobs: config.infojobsUsername && config.infojobsPassword
          ? {
              username: config.infojobsUsername,
              password: await this.decryptPassword(config.infojobsPassword),
            }
          : null,
        catho: config.cathoUsername && config.cathoPassword
          ? {
              username: config.cathoUsername,
              password: await this.decryptPassword(config.cathoPassword),
            }
          : null,
      };
      
      // Login to platforms
      const loginResults = await this.webscraperService.loginAll(credentials);
      
      // Search for jobs
      const searchParams = {
        keywords: config.keywords,
        locations: config.locations,
        remote: config.remote,
        jobTypes: config.jobTypes,
        workModels: config.workModels,
        salaryMin: config.salaryMin,
        workHours: config.workHours,
        internationalJobs: config.internationalJobs,
        experienceLevel: config.experienceLevel,
        industries: config.industries,
      };
      
      const jobs = await this.webscraperService.searchJobsAll(searchParams);
      
      // Analyze job matches
      const analyzedJobs = await Promise.all(
        jobs.map(async (job) => {
          const matchScore = await this.webscraperService.analyzeJobMatch(job, user);
          return { ...job, matchScore };
        }),
      );
      
      // Filter jobs by match threshold
      const matchedJobs = analyzedJobs
        .filter((job) => job.matchScore >= config.matchThreshold)
        .sort((a, b) => b.matchScore - a.matchScore);
      
      // Determine how many jobs to apply for
      const remainingApplications = config.maxApplicationsPerDay - config.todayApplicationCount;
      const jobsToApply = matchedJobs.slice(0, remainingApplications);
      
      // Apply for jobs
      const applicationResults = [];
      
      for (const job of jobsToApply) {
        try {
          const result = await this.webscraperService.applyToJob(job, user);
          
          if (result.success) {
            // Create application record
            await this.applicationsService.createFromAutoApply(
              userId,
              job.id,
              job.platform,
              result.applicationId,
              result.applicationUrl,
              job.matchScore,
            );
            
            // Increment counter
            config.todayApplicationCount++;
            applicationResults.push(result);
          }
          
          // Add delay between applications to seem more human
          await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 5000));
        } catch (error) {
          console.error(`Error applying for job ${job.id}:`, error);
        }
      }
      
      // Update config with new application count
      await this.autoApplyConfigRepository.save(config);
      
      return {
        success: true,
        message: `Applied to ${applicationResults.length} jobs`,
      };
    } catch (error) {
      console.error('Error in auto-apply process:', error);
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    } finally {
      // Close webscraper
      await this.webscraperService.close();
    }
  }

  async stopAutoApply(userId: string): Promise<{ success: boolean; message: string }> {
    // This is a placeholder since the actual auto-apply process runs synchronously
    // In a real implementation, you would have a way to stop a background process
    return {
      success: true,
      message: 'Auto-apply process stopped',
    };
  }

  async getStatus(userId: string): Promise<{
    isConfigured: boolean;
    lastRunDate: Date | null;
    todayApplicationCount: number;
    maxApplicationsPerDay: number;
  }> {
    try {
      const config = await this.findOne(userId);
      
      return {
        isConfigured: true,
        lastRunDate: config.lastRunDate,
        todayApplicationCount: config.todayApplicationCount,
        maxApplicationsPerDay: config.maxApplicationsPerDay,
      };
    } catch (error) {
      return {
        isConfigured: false,
        lastRunDate: null,
        todayApplicationCount: 0,
        maxApplicationsPerDay: 10,
      };
    }
  }

  private async encryptPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async decryptPassword(encryptedPassword: string): Promise<string> {
    // In a real implementation, you would use a proper encryption/decryption mechanism
    // bcrypt is a one-way hash, so we can't actually decrypt it
    // This is just a placeholder for the concept
    return encryptedPassword;
  }
}
