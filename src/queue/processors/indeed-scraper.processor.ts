import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.module';
import { IndeedScraperService } from '../../scrapers/services/indeed-scraper.service';
import { ScraperJobService } from '../../scrapers/services/scraper-job.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

@Processor(QUEUE_NAMES.INDEED_SCRAPER)
export class IndeedScraperProcessor {
  private readonly logger = new Logger(IndeedScraperProcessor.name);
  private readonly concurrency: number;

  constructor(
    private readonly indeedScraperService: IndeedScraperService,
    private readonly scraperJobService: ScraperJobService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly configService: ConfigService,
  ) {
    this.concurrency = this.configService.get<number>('queue.concurrency.indeedScraper', 5);
  }

  @Process({
    concurrency: 5, // Process 5 jobs at a time
  })
  async processJob(job: Job): Promise<any> {
    this.logger.log(`Processing Indeed scraper job ${job.id}`);
    
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
        await this.indeedScraperService.processJob(jobId);
        
        // Get the updated job
        const scraperJob = await this.scraperJobService.findById(jobId);
        result = { scraperJob };
      } else {
        // Create a new scraper job
        const scraperJob = await this.scraperJobService.createJob(
          userId,
          'INDEED',
          params,
          false,
        );
        
        // Update job progress
        await job.progress(30);
        
        // Process the scraper job
        await this.indeedScraperService.processJob(scraperJob.id);
        
        // Update job progress
        await job.progress(90);
        
        // Get the updated job
        const updatedJob = await this.scraperJobService.findById(scraperJob.id);
        result = { scraperJob: updatedJob };
      }
      
      // Update job progress
      await job.progress(100);
      
      // Record success for circuit breaker
      await this.circuitBreakerService.recordSuccess('indeed');
      
      return result;
    } catch (error) {
      this.logger.error(`Error processing Indeed scraper job ${job.id}: ${error.message}`);
      
      // Record failure for circuit breaker
      await this.circuitBreakerService.recordFailure('indeed');
      
      // Rethrow the error to mark the job as failed
      throw error;
    }
  }
}
