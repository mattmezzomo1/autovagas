import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.module';
import { LinkedInScraperService } from '../../scrapers/services/linkedin-scraper.service';
import { ScraperJobService } from '../../scrapers/services/scraper-job.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

@Processor(QUEUE_NAMES.LINKEDIN_SCRAPER)
export class LinkedInScraperProcessor {
  private readonly logger = new Logger(LinkedInScraperProcessor.name);
  private readonly concurrency: number;

  constructor(
    private readonly linkedInScraperService: LinkedInScraperService,
    private readonly scraperJobService: ScraperJobService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly configService: ConfigService,
  ) {
    this.concurrency = this.configService.get<number>('queue.concurrency.linkedinScraper', 5);
  }

  @Process({
    concurrency: 5, // Process 5 jobs at a time
  })
  async processJob(job: Job): Promise<any> {
    this.logger.log(`Processing LinkedIn scraper job ${job.id}`);
    
    try {
      // Extract job data
      const { action, jobId, ...params } = job.data;
      const userId = job.data._metadata?.userId;
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Update job progress
      await job.progress(10);
      
      let result;
      
      // Process based on action
      if (action === 'processJob' && jobId) {
        // Process an existing scraper job
        await this.linkedInScraperService.processJob(jobId);
        
        // Get the updated job
        const scraperJob = await this.scraperJobService.findById(jobId);
        result = { scraperJob };
      } else {
        // Create a new scraper job
        const scraperJob = await this.scraperJobService.createJob(
          userId,
          'LINKEDIN',
          params,
          false,
        );
        
        // Update job progress
        await job.progress(30);
        
        // Process the scraper job
        await this.linkedInScraperService.processJob(scraperJob.id);
        
        // Update job progress
        await job.progress(90);
        
        // Get the updated job
        const updatedJob = await this.scraperJobService.findById(scraperJob.id);
        result = { scraperJob: updatedJob };
      }
      
      // Update job progress
      await job.progress(100);
      
      // Record success for circuit breaker
      await this.circuitBreakerService.recordSuccess('linkedin');
      
      return result;
    } catch (error) {
      this.logger.error(`Error processing LinkedIn scraper job ${job.id}: ${error.message}`);
      
      // Record failure for circuit breaker
      await this.circuitBreakerService.recordFailure('linkedin');
      
      // Rethrow the error to mark the job as failed
      throw error;
    }
  }
}
