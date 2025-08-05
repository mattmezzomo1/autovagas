import { Request, Response } from 'express';
import { UnifiedScraperService } from '../services/scraper/UnifiedScraperService';

/**
 * Controller for unified scraping operations
 */
export class UnifiedScraperController {
  private unifiedScraperService: UnifiedScraperService;
  
  constructor() {
    this.unifiedScraperService = new UnifiedScraperService();
  }
  
  /**
   * Search for jobs
   */
  async searchJobs(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      const { keywords, locations, remote, jobTypes } = req.body;
      const userId = req.user?.id;
      
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
      
      // Perform search
      const result = await this.unifiedScraperService.searchJobs(userId, platform, searchParams);
      
      res.json(result);
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
      
      // Get job details
      const result = await this.unifiedScraperService.getJobDetails(userId, platform, jobId, url);
      
      res.json(result);
    } catch (error) {
      console.error('Error getting job details:', error);
      res.status(500).json({ error: error.message || 'Failed to get job details' });
    }
  }
  
  /**
   * Check task status
   */
  async checkTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
      }
      
      // Check task status
      const taskStatus = await this.unifiedScraperService.checkTaskStatus(userId, taskId);
      
      res.json(taskStatus);
    } catch (error) {
      console.error('Error checking task status:', error);
      res.status(500).json({ error: error.message || 'Failed to check task status' });
    }
  }
  
  /**
   * Get user usage statistics
   */
  async getUserUsage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      // Get usage statistics
      const usage = await this.unifiedScraperService.getUserUsageStatistics(userId);
      
      res.json(usage);
    } catch (error) {
      console.error('Error getting user usage:', error);
      res.status(500).json({ error: error.message || 'Failed to get user usage' });
    }
  }
}
