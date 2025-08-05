import { Request, Response } from 'express';
import { TierBasedScraperService, UserTier } from '../services/scraper/TierBasedScraperService';

/**
 * Controller for tier-based scraping
 */
export class TierScraperController {
  private tierScraperService: TierBasedScraperService;
  
  constructor() {
    this.tierScraperService = new TierBasedScraperService();
  }
  
  /**
   * Search for jobs
   */
  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      const { keywords, locations, remote, jobTypes } = req.body;
      const userId = req.user?.id;
      const userTier = this.getUserTier(req.user);
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      if (!platform) {
        res.status(400).json({ error: 'Platform is required' });
        return;
      }
      
      // Validate search parameters
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json({ error: 'Keywords are required' });
        return;
      }
      
      const searchParams = {
        keywords,
        locations: locations || [],
        remote: remote || false,
        jobTypes: jobTypes || []
      };
      
      // Check if user can perform search
      if (!this.tierScraperService.canPerformSearch(userId, userTier)) {
        res.status(403).json({ 
          error: 'Daily search limit reached',
          usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
        });
        return;
      }
      
      // Perform search
      const results = await this.tierScraperService.searchJobs(userId, userTier, platform, searchParams);
      
      // Return results with usage statistics
      res.json({
        results,
        usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
      res.status(500).json({ error: error.message || 'Failed to search jobs' });
    }
  }
  
  /**
   * Get job details
   */
  async getJobDetails(req: Request, res: Response): Promise<void> {
    try {
      const { platform, jobId } = req.params;
      const { url } = req.body;
      const userId = req.user?.id;
      const userTier = this.getUserTier(req.user);
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      if (!platform || !jobId) {
        res.status(400).json({ error: 'Platform and job ID are required' });
        return;
      }
      
      if (!url) {
        res.status(400).json({ error: 'Job URL is required' });
        return;
      }
      
      // Check if user can fetch job details
      if (!this.tierScraperService.canFetchJobDetails(userId, userTier)) {
        res.status(403).json({ 
          error: 'Daily job details limit reached',
          usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
        });
        return;
      }
      
      // Get job details
      const details = await this.tierScraperService.getJobDetails(userId, userTier, platform, jobId, url);
      
      // Return details with usage statistics
      res.json({
        details,
        usage: this.tierScraperService.getUserUsageStatistics(userId, userTier)
      });
    } catch (error) {
      console.error('Error getting job details:', error);
      res.status(500).json({ error: error.message || 'Failed to get job details' });
    }
  }
  
  /**
   * Get user usage statistics
   */
  async getUserUsage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userTier = this.getUserTier(req.user);
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const usage = this.tierScraperService.getUserUsageStatistics(userId, userTier);
      res.json(usage);
    } catch (error) {
      console.error('Error getting user usage:', error);
      res.status(500).json({ error: 'Failed to get user usage' });
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
}
