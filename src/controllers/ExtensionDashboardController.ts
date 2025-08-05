import { Request, Response } from 'express';
import { ExtensionCoordinatorService } from '../services/extension/ExtensionCoordinatorService';
import { TaskDistributor } from '../services/extension/TaskDistributor';
import { ResultCollector } from '../services/extension/ResultCollector';
import { ScraperCacheService } from '../services/cache/ScraperCacheService';

/**
 * Controller for the extension monitoring dashboard
 */
export class ExtensionDashboardController {
  private coordinatorService: ExtensionCoordinatorService;
  private taskDistributor: TaskDistributor;
  private resultCollector: ResultCollector;
  private cacheService: ScraperCacheService;
  
  constructor() {
    this.coordinatorService = new ExtensionCoordinatorService();
    this.taskDistributor = new TaskDistributor();
    this.resultCollector = new ResultCollector();
    this.cacheService = new ScraperCacheService();
  }
  
  /**
   * Get dashboard overview data
   */
  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      // Get active extensions
      const activeExtensions = this.coordinatorService.getActiveExtensions();
      
      // Get task statistics
      const taskStats = this.taskDistributor.getTaskStatistics();
      
      // Get result statistics
      const resultStats = this.resultCollector.getResultStatistics();
      
      // Get cache statistics
      const cacheStats = this.cacheService.getCacheStatistics();
      
      // Calculate overall statistics
      const totalExtensions = activeExtensions.size;
      const activeExtensionsCount = Array.from(activeExtensions.values()).filter(ext => ext.status === 'processing').length;
      const idleExtensionsCount = totalExtensions - activeExtensionsCount;
      
      // Prepare response
      const response = {
        overview: {
          totalExtensions,
          activeExtensions: activeExtensionsCount,
          idleExtensions: idleExtensionsCount,
          pendingTasks: taskStats.pendingTasks,
          processingTasks: taskStats.processingTasks,
          completedTasks: taskStats.completedTasks,
          failedTasks: taskStats.failedTasks,
          cacheHitRate: cacheStats.hitRate,
          cacheSize: cacheStats.size
        },
        taskDistribution: {
          byPlatform: taskStats.tasksByPlatform,
          byType: taskStats.tasksByType
        },
        performance: {
          averageTaskDuration: resultStats.averageTaskDuration,
          tasksPerHour: resultStats.tasksPerHour,
          successRate: resultStats.successRate
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      res.status(500).json({ error: 'Failed to get dashboard overview' });
    }
  }
  
  /**
   * Get active extensions
   */
  async getActiveExtensions(req: Request, res: Response): Promise<void> {
    try {
      const activeExtensions = this.coordinatorService.getActiveExtensions();
      
      // Convert Map to array for JSON response
      const extensionsArray = Array.from(activeExtensions.entries()).map(([userId, extension]) => ({
        userId,
        lastSeen: extension.lastSeen,
        status: extension.status,
        extensionInfo: extension.extensionInfo,
        currentTask: extension.currentTask
      }));
      
      res.json(extensionsArray);
    } catch (error) {
      console.error('Error getting active extensions:', error);
      res.status(500).json({ error: 'Failed to get active extensions' });
    }
  }
  
  /**
   * Get task queue
   */
  async getTaskQueue(req: Request, res: Response): Promise<void> {
    try {
      const taskQueue = this.taskDistributor.getTaskQueue();
      res.json(taskQueue);
    } catch (error) {
      console.error('Error getting task queue:', error);
      res.status(500).json({ error: 'Failed to get task queue' });
    }
  }
  
  /**
   * Get task history
   */
  async getTaskHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 100, offset = 0, status, platform, type } = req.query;
      
      const taskHistory = this.taskDistributor.getTaskHistory({
        limit: Number(limit),
        offset: Number(offset),
        status: status as string,
        platform: platform as string,
        type: type as string
      });
      
      res.json(taskHistory);
    } catch (error) {
      console.error('Error getting task history:', error);
      res.status(500).json({ error: 'Failed to get task history' });
    }
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '24h' } = req.query;
      
      const metrics = this.resultCollector.getPerformanceMetrics(timeframe as string);
      
      res.json(metrics);
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  }
  
  /**
   * Get platform statistics
   */
  async getPlatformStatistics(req: Request, res: Response): Promise<void> {
    try {
      const platformStats = this.resultCollector.getPlatformStatistics();
      
      res.json(platformStats);
    } catch (error) {
      console.error('Error getting platform statistics:', error);
      res.status(500).json({ error: 'Failed to get platform statistics' });
    }
  }
}
