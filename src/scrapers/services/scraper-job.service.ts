import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ScraperJob, ScraperJobStatus } from '../entities/scraper-job.entity';
import { ScraperPlatform } from '../entities/scraper-session.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScraperJobService {
  private readonly logger = new Logger(ScraperJobService.name);
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(
    @InjectRepository(ScraperJob)
    private scraperJobRepository: Repository<ScraperJob>,
    private configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('scraper.maxRetries', 3);
    this.retryDelayMs = this.configService.get<number>('scraper.retryDelayMs', 5 * 60 * 1000); // 5 minutes
  }

  async createJob(
    userId: string,
    platform: ScraperPlatform,
    parameters: any,
    isAutoApply: boolean = false,
  ): Promise<ScraperJob> {
    const job = this.scraperJobRepository.create({
      userId,
      platform,
      parameters,
      status: ScraperJobStatus.PENDING,
      isAutoApply,
    });

    return this.scraperJobRepository.save(job);
  }

  async findById(id: string): Promise<ScraperJob> {
    const job = await this.scraperJobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async findPendingJobs(limit: number = 10): Promise<ScraperJob[]> {
    return this.scraperJobRepository.find({
      where: [
        { status: ScraperJobStatus.PENDING },
        { 
          status: ScraperJobStatus.FAILED, 
          retryCount: LessThan(this.maxRetries),
          nextRetryAt: LessThan(new Date()),
        },
      ],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async findUserJobs(userId: string, limit: number = 10): Promise<ScraperJob[]> {
    return this.scraperJobRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markJobAsProcessing(id: string): Promise<ScraperJob> {
    const job = await this.findById(id);
    
    job.status = ScraperJobStatus.PROCESSING;
    job.startedAt = new Date();
    
    return this.scraperJobRepository.save(job);
  }

  async markJobAsCompleted(id: string, result: any): Promise<ScraperJob> {
    const job = await this.findById(id);
    
    job.status = ScraperJobStatus.COMPLETED;
    job.result = result;
    job.completedAt = new Date();
    
    return this.scraperJobRepository.save(job);
  }

  async markJobAsFailed(id: string, errorMessage: string): Promise<ScraperJob> {
    const job = await this.findById(id);
    
    job.status = ScraperJobStatus.FAILED;
    job.errorMessage = errorMessage;
    job.retryCount += 1;
    
    // Schedule retry if under max retries
    if (job.retryCount < this.maxRetries) {
      const now = new Date();
      const retryDelay = this.retryDelayMs * Math.pow(2, job.retryCount - 1); // Exponential backoff
      job.nextRetryAt = new Date(now.getTime() + retryDelay);
    }
    
    return this.scraperJobRepository.save(job);
  }

  async cleanupOldJobs(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await this.scraperJobRepository.delete({
      createdAt: LessThan(cutoffDate),
      status: ScraperJobStatus.COMPLETED,
    });
    
    return result.affected || 0;
  }
}
