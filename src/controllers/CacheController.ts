import { Request, Response } from 'express';
import { ScraperCacheService, CacheEvictionPolicy } from '../services/cache/ScraperCacheService';

/**
 * Controller for cache management
 */
export class CacheController {
  private cacheService: ScraperCacheService;
  
  constructor() {
    this.cacheService = new ScraperCacheService();
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.cacheService.getCacheStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error getting cache statistics:', error);
      res.status(500).json({ error: 'Failed to get cache statistics' });
    }
  }
  
  /**
   * Clear cache
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      await this.cacheService.clear();
      res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }
  
  /**
   * Set cache eviction policy
   */
  async setCacheEvictionPolicy(req: Request, res: Response): Promise<void> {
    try {
      const { policy } = req.body;
      
      if (!policy || !Object.values(CacheEvictionPolicy).includes(policy)) {
        res.status(400).json({ error: 'Invalid eviction policy' });
        return;
      }
      
      this.cacheService.setEvictionPolicy(policy as CacheEvictionPolicy);
      res.json({ success: true, message: `Cache eviction policy set to ${policy}` });
    } catch (error) {
      console.error('Error setting cache eviction policy:', error);
      res.status(500).json({ error: 'Failed to set cache eviction policy' });
    }
  }
  
  /**
   * Invalidate cache for a platform
   */
  async invalidatePlatformCache(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      
      if (!platform) {
        res.status(400).json({ error: 'Platform is required' });
        return;
      }
      
      await this.cacheService.invalidatePlatformCache(platform);
      res.json({ success: true, message: `Cache for platform ${platform} invalidated` });
    } catch (error) {
      console.error('Error invalidating platform cache:', error);
      res.status(500).json({ error: 'Failed to invalidate platform cache' });
    }
  }
  
  /**
   * Invalidate cache for an operation
   */
  async invalidateOperationCache(req: Request, res: Response): Promise<void> {
    try {
      const { platform, operation } = req.params;
      
      if (!platform || !operation) {
        res.status(400).json({ error: 'Platform and operation are required' });
        return;
      }
      
      await this.cacheService.invalidateOperationCache(platform, operation);
      res.json({ success: true, message: `Cache for ${platform}:${operation} invalidated` });
    } catch (error) {
      console.error('Error invalidating operation cache:', error);
      res.status(500).json({ error: 'Failed to invalidate operation cache' });
    }
  }
}
