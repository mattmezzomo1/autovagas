import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.module';
import { RateLimiterService } from './rate-limiter.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { UsersService } from '../../users/services/users.service';
import { UserSubscriptionTier } from '../../users/entities/user-subscription.entity';

export enum JobPriority {
  LOW = 10,
  NORMAL = 5,
  HIGH = 1,
  CRITICAL = 0,
}

export interface QueueJobOptions {
  userId: string;
  priority?: JobPriority;
  delay?: number;
  attempts?: number;
  timeout?: number;
  jobId?: string;
}

@Injectable()
export class QueueManagerService {
  private readonly logger = new Logger(QueueManagerService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.LINKEDIN_SCRAPER)
    private readonly linkedinScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INFOJOBS_SCRAPER)
    private readonly infojobsScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CATHO_SCRAPER)
    private readonly cathoScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INDEED_SCRAPER)
    private readonly indeedScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AUTO_APPLY)
    private readonly autoApplyQueue: Queue,
    private readonly configService: ConfigService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Add a job to the LinkedIn scraper queue
   */
  async addLinkedInScraperJob(
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(this.linkedinScraperQueue, 'linkedin', data, options);
  }

  /**
   * Add a job to the InfoJobs scraper queue
   */
  async addInfoJobsScraperJob(
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(this.infojobsScraperQueue, 'infojobs', data, options);
  }

  /**
   * Add a job to the Catho scraper queue
   */
  async addCathoScraperJob(
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(this.cathoScraperQueue, 'catho', data, options);
  }

  /**
   * Add a job to the Indeed scraper queue
   */
  async addIndeedScraperJob(
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(this.indeedScraperQueue, 'indeed', data, options);
  }

  /**
   * Add a job to the auto-apply queue
   */
  async addAutoApplyJob(
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    return this.addJob(this.autoApplyQueue, null, data, options);
  }

  /**
   * Generic method to add a job to a queue
   */
  private async addJob(
    queue: Queue,
    platform: string | null,
    data: any,
    options: QueueJobOptions,
  ): Promise<string> {
    const { userId, priority, delay, attempts, timeout, jobId } = options;

    // Check if circuit breaker is open for this platform
    if (platform && this.circuitBreakerService.isOpen(platform)) {
      this.logger.warn(`Circuit breaker is open for ${platform}, job rejected`);
      throw new Error(`Service ${platform} is currently unavailable. Please try again later.`);
    }

    // Check rate limits for this platform
    if (platform) {
      const canProceed = await this.rateLimiterService.consume(platform, userId);
      if (!canProceed) {
        this.logger.warn(`Rate limit exceeded for ${platform} by user ${userId}`);
        throw new Error(`Rate limit exceeded for ${platform}. Please try again later.`);
      }
    }

    // Get user subscription tier to determine priority
    const user = await this.usersService.findById(userId);
    const userTier = user?.subscription?.tier || UserSubscriptionTier.BASIC;
    
    // Set job options based on user tier
    const jobOptions: JobOptions = {
      priority: priority || this.getPriorityByTier(userTier),
      delay: delay || 0,
      attempts: attempts || 3,
      timeout: timeout || 300000, // 5 minutes
      jobId: jobId || undefined,
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 200, // Keep last 200 failed jobs
    };

    // Add metadata to job data
    const jobData = {
      ...data,
      _metadata: {
        userId,
        userTier,
        createdAt: new Date().toISOString(),
        platform,
      },
    };

    // Add job to queue
    const job = await queue.add(jobData, jobOptions);
    this.logger.log(`Added job ${job.id} to queue ${queue.name} for user ${userId}`);

    return job.id.toString();
  }

  /**
   * Get job priority based on user subscription tier
   */
  private getPriorityByTier(tier: UserSubscriptionTier): JobPriority {
    switch (tier) {
      case UserSubscriptionTier.PREMIUM:
        return JobPriority.HIGH;
      case UserSubscriptionTier.PLUS:
        return JobPriority.NORMAL;
      case UserSubscriptionTier.BASIC:
      default:
        return JobPriority.LOW;
    }
  }

  /**
   * Get a job by ID from a specific queue
   */
  async getJob(queueName: string, jobId: string): Promise<any> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    return {
      id: job.id,
      data: job.data,
      progress: await job.progress(),
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      returnvalue: job.returnvalue,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      timestamp: job.timestamp,
      state: await job.getState(),
    };
  }

  /**
   * Get all jobs for a user from a specific queue
   */
  async getUserJobs(queueName: string, userId: string, status?: string): Promise<any[]> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    // Get jobs based on status
    let jobs: any[] = [];
    if (status === 'active') {
      jobs = await queue.getActive();
    } else if (status === 'waiting') {
      jobs = await queue.getWaiting();
    } else if (status === 'delayed') {
      jobs = await queue.getDelayed();
    } else if (status === 'completed') {
      jobs = await queue.getCompleted();
    } else if (status === 'failed') {
      jobs = await queue.getFailed();
    } else {
      // Get all jobs
      const activeJobs = await queue.getActive();
      const waitingJobs = await queue.getWaiting();
      const delayedJobs = await queue.getDelayed();
      const completedJobs = await queue.getCompleted();
      const failedJobs = await queue.getFailed();
      jobs = [...activeJobs, ...waitingJobs, ...delayedJobs, ...completedJobs, ...failedJobs];
    }

    // Filter jobs by user ID
    return jobs
      .filter(job => job.data._metadata?.userId === userId)
      .map(job => ({
        id: job.id,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        state: job.getState(),
        timestamp: job.timestamp,
      }));
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [
      jobCounts,
      failedCount,
      completedCount,
      activeCount,
      delayedCount,
      waitingCount,
    ] = await Promise.all([
      queue.getJobCounts(),
      queue.getFailedCount(),
      queue.getCompletedCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getWaitingCount(),
    ]);

    return {
      name: queue.name,
      counts: jobCounts,
      failed: failedCount,
      completed: completedCount,
      active: activeCount,
      delayed: delayedCount,
      waiting: waitingCount,
    };
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<any[]> {
    const queueNames = Object.values(QUEUE_NAMES);
    const stats = await Promise.all(
      queueNames.map(name => this.getQueueStats(name)),
    );
    return stats;
  }

  /**
   * Get queue by name
   */
  private getQueueByName(name: string): Queue | null {
    switch (name) {
      case QUEUE_NAMES.LINKEDIN_SCRAPER:
        return this.linkedinScraperQueue;
      case QUEUE_NAMES.INFOJOBS_SCRAPER:
        return this.infojobsScraperQueue;
      case QUEUE_NAMES.CATHO_SCRAPER:
        return this.cathoScraperQueue;
      case QUEUE_NAMES.INDEED_SCRAPER:
        return this.indeedScraperQueue;
      case QUEUE_NAMES.AUTO_APPLY:
        return this.autoApplyQueue;
      default:
        return null;
    }
  }

  /**
   * Clean up completed and failed jobs
   */
  async cleanupJobs(): Promise<void> {
    const queueNames = Object.values(QUEUE_NAMES);
    
    for (const name of queueNames) {
      const queue = this.getQueueByName(name);
      if (queue) {
        // Remove old completed jobs (keep last 100)
        await queue.clean(86400000, 'completed', 100); // 24 hours
        
        // Remove old failed jobs (keep last 200)
        await queue.clean(86400000 * 7, 'failed', 200); // 7 days
      }
    }
    
    this.logger.log('Cleaned up old jobs');
  }
}
