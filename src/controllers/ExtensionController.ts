import { Request, Response } from 'express';
import { ExtensionCoordinatorService } from '../services/extension/ExtensionCoordinatorService';
import { JobsDatabase } from '../services/webscraper/JobsDatabase';
import { ScrapedJob } from '../services/webscraper/types';

/**
 * Controller for handling Chrome extension requests
 */
export class ExtensionController {
  private coordinatorService: ExtensionCoordinatorService;
  private jobsDatabase: JobsDatabase;
  
  constructor() {
    this.coordinatorService = new ExtensionCoordinatorService();
    this.jobsDatabase = new JobsDatabase();
  }
  
  /**
   * Register an extension
   */
  async registerExtension(req: Request, res: Response): Promise<void> {
    try {
      const { userId, extensionInfo } = req.body;
      
      if (!userId || !extensionInfo) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      this.coordinatorService.registerExtension(userId, extensionInfo);
      
      res.json({ 
        success: true,
        message: 'Extension registered successfully'
      });
    } catch (error) {
      console.error('Error registering extension:', error);
      res.status(500).json({ error: 'Failed to register extension' });
    }
  }
  
  /**
   * Get tasks for an extension
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const tasks = await this.coordinatorService.getTasksForExtension(userId);
      
      res.json(tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }
  
  /**
   * Receive task results from extension
   */
  async receiveTaskResults(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { results } = req.body;
      const userId = req.user?.id;
      
      if (!userId || !taskId || !results) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Process the results based on task type
      if (Array.isArray(results)) {
        // This is a job search result
        this.jobsDatabase.addJobs(results as ScrapedJob[]);
      } else {
        // This is a job details result
        this.jobsDatabase.updateJob(taskId, results);
      }
      
      // Update task status in coordinator
      await this.coordinatorService.receiveResults(userId, taskId, results);
      
      res.json({ 
        success: true,
        message: 'Results received successfully'
      });
    } catch (error) {
      console.error('Error receiving task results:', error);
      res.status(500).json({ error: 'Failed to process task results' });
    }
  }
  
  /**
   * Receive task failure from extension
   */
  async receiveTaskFailure(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { error } = req.body;
      const userId = req.user?.id;
      
      if (!userId || !taskId || !error) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Update task status in coordinator
      await this.coordinatorService.receiveFailure(userId, taskId, error);
      
      res.json({ 
        success: true,
        message: 'Failure report received'
      });
    } catch (error) {
      console.error('Error receiving task failure:', error);
      res.status(500).json({ error: 'Failed to process task failure' });
    }
  }
}
