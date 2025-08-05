import { TierBasedScraperService, UserTier } from './TierBasedScraperService';
import { ScraperQueueService } from './ScraperQueueService';
import { JobSearchParams, ScrapedJob } from '../webscraper/types';
import { UserService } from '../user/UserService';
import { config } from '../../config';

/**
 * Service for unified scraping that integrates client-side and server-side approaches
 */
export class UnifiedScraperService {
  private tierScraperService: TierBasedScraperService;
  private scraperQueueService: ScraperQueueService;
  private userService: UserService;
  
  constructor() {
    this.tierScraperService = new TierBasedScraperService();
    this.scraperQueueService = new ScraperQueueService();
    this.userService = new UserService();
  }
  
  /**
   * Search for jobs using the appropriate scraping method based on user tier
   */
  async searchJobs(userId: string, platform: string, params: JobSearchParams): Promise<any> {
    try {
      // Get user tier
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userTier = this.getUserTier(user);
      
      // Check if user can perform search
      if (!this.tierScraperService.canPerformSearch(userId, userTier)) {
        throw new Error(`Daily search limit reached for ${userTier} tier`);
      }
      
      // Determine if server-side or client-side scraping should be used
      const useServerSide = this.shouldUseServerSideScraping(userTier);
      
      let results: any;
      let taskId: string | null = null;
      
      if (useServerSide) {
        // Use server-side scraping for Plus/Premium tiers
        results = await this.tierScraperService.searchJobs(userId, userTier, platform, params);
      } else {
        // For Basic tier, create a task for the client-side scraper (Chrome extension)
        taskId = await this.scraperQueueService.queueSearchTask(userId, platform, params);
        results = { 
          pending: true, 
          taskId,
          message: 'Task queued for client-side scraping. Please ensure your Chrome extension is running.'
        };
      }
      
      // Return results with usage statistics
      return {
        results,
        taskId,
        useServerSide,
        usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
      };
    } catch (error) {
      console.error('Error in unified job search:', error);
      throw error;
    }
  }
  
  /**
   * Get job details using the appropriate scraping method based on user tier
   */
  async getJobDetails(userId: string, platform: string, jobId: string, url: string): Promise<any> {
    try {
      // Get user tier
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userTier = this.getUserTier(user);
      
      // Check if user can fetch job details
      if (!this.tierScraperService.canFetchJobDetails(userId, userTier)) {
        throw new Error(`Daily job details limit reached for ${userTier} tier`);
      }
      
      // Determine if server-side or client-side scraping should be used
      const useServerSide = this.shouldUseServerSideScraping(userTier);
      
      let details: any;
      let taskId: string | null = null;
      
      if (useServerSide) {
        // Use server-side scraping for Plus/Premium tiers
        details = await this.tierScraperService.getJobDetails(userId, userTier, platform, jobId, url);
      } else {
        // For Basic tier, create a task for the client-side scraper (Chrome extension)
        taskId = await this.scraperQueueService.queueJobDetailsTask(userId, platform, jobId, url);
        details = { 
          pending: true, 
          taskId,
          message: 'Task queued for client-side scraping. Please ensure your Chrome extension is running.'
        };
      }
      
      // Return details with usage statistics
      return {
        details,
        taskId,
        useServerSide,
        usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
      };
    } catch (error) {
      console.error('Error in unified job details fetch:', error);
      throw error;
    }
  }
  
  /**
   * Check task status
   */
  async checkTaskStatus(userId: string, taskId: string): Promise<any> {
    try {
      // Get task status from queue service
      const taskStatus = await this.scraperQueueService.getTaskStatus(taskId);
      
      if (!taskStatus) {
        throw new Error('Task not found');
      }
      
      // Verify that the task belongs to the user
      if (taskStatus.userId !== userId) {
        throw new Error('Unauthorized access to task');
      }
      
      return taskStatus;
    } catch (error) {
      console.error('Error checking task status:', error);
      throw error;
    }
  }
  
  /**
   * Get user tier from user object
   */
  private getUserTier(user: any): UserTier {
    if (!user) {
      return UserTier.BASIC;
    }
    
    // Determine user tier based on subscription
    if (user.subscription) {
      const planName = user.subscription.plan?.name?.toLowerCase() || '';
      
      if (planName.includes('premium')) {
        return UserTier.PREMIUM;
      } else if (planName.includes('plus')) {
        return UserTier.PLUS;
      }
    }
    
    return UserTier.BASIC;
  }
  
  /**
   * Determine if server-side scraping should be used based on user tier
   */
  private shouldUseServerSideScraping(tier: UserTier): boolean {
    switch (tier) {
      case UserTier.PREMIUM:
        return config.userTiers.premium.useServerSideScraping;
      case UserTier.PLUS:
        return config.userTiers.plus.useServerSideScraping;
      case UserTier.BASIC:
      default:
        return config.userTiers.basic.useServerSideScraping;
    }
  }
  
  /**
   * Get user usage statistics
   */
  async getUserUsageStatistics(userId: string): Promise<any> {
    try {
      // Get user tier
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userTier = this.getUserTier(user);
      
      // Get usage statistics
      const usage = this.tierScraperService.getUserUsageStatistics(userId, userTier);
      
      // Get client-side task statistics
      const taskStats = await this.scraperQueueService.getUserTaskStatistics(userId);
      
      return {
        ...usage,
        taskStats
      };
    } catch (error) {
      console.error('Error getting user usage statistics:', error);
      throw error;
    }
  }
}
