import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.module';
import { AutoApplyIntegrationService } from '../../scrapers/services/auto-apply-integration.service';
import { AutoApplyService } from '../../auto-apply/services/auto-apply.service';

@Processor(QUEUE_NAMES.AUTO_APPLY)
export class AutoApplyProcessor {
  private readonly logger = new Logger(AutoApplyProcessor.name);
  private readonly concurrency: number;

  constructor(
    private readonly autoApplyIntegrationService: AutoApplyIntegrationService,
    private readonly autoApplyService: AutoApplyService,
    private readonly configService: ConfigService,
  ) {
    this.concurrency = this.configService.get<number>('queue.concurrency.autoApply', 3);
  }

  @Process({
    concurrency: 3, // Process 3 jobs at a time
  })
  async processJob(job: Job): Promise<any> {
    this.logger.log(`Processing auto-apply job ${job.id}`);
    
    try {
      // Extract job data
      const { action, ...params } = job.data;
      const userId = job.data._metadata?.userId;
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Update job progress
      await job.progress(10);
      
      let result;
      
      // Process based on action
      if (action === 'executeAutoApply') {
        // Execute auto-apply process
        await this.autoApplyIntegrationService.executeAutoApply(userId);
        
        // Get auto-apply history
        const history = await this.autoApplyService.getHistory(userId, 10);
        
        result = { 
          success: true,
          message: 'Auto-apply process executed successfully',
          history,
        };
      } else if (action === 'applyToJob') {
        // Apply to a specific job
        const { jobId, coverLetter, resumeUrl } = params;
        
        if (!jobId) {
          throw new Error('Job ID is required');
        }
        
        await this.autoApplyService.applyToJob(userId, jobId, coverLetter, resumeUrl);
        
        result = {
          success: true,
          message: 'Applied to job successfully',
          jobId,
        };
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
      
      // Update job progress
      await job.progress(100);
      
      return result;
    } catch (error) {
      this.logger.error(`Error processing auto-apply job ${job.id}: ${error.message}`);
      
      // Rethrow the error to mark the job as failed
      throw error;
    }
  }
}
