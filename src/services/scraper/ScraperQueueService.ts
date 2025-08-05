import { v4 as uuidv4 } from 'uuid';
import { ScraperTaskRepository } from '../../repositories/ScraperTaskRepository';
import { JobSearchParams } from '../webscraper/types';

/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Task type enum
 */
export enum TaskType {
  SEARCH = 'search',
  JOB_DETAILS = 'job_details'
}

/**
 * Service for managing scraper task queue
 */
export class ScraperQueueService {
  private taskRepository: ScraperTaskRepository;
  
  constructor() {
    this.taskRepository = new ScraperTaskRepository();
  }
  
  /**
   * Queue a search task for client-side scraping
   */
  async queueSearchTask(userId: string, platform: string, params: JobSearchParams): Promise<string> {
    try {
      // Generate task ID
      const taskId = `search-${platform}-${uuidv4()}`;
      
      // Create task
      await this.taskRepository.create({
        id: taskId,
        userId,
        platform,
        type: TaskType.SEARCH,
        params,
        status: TaskStatus.PENDING
      });
      
      console.log(`Search task queued: ${taskId}`);
      
      return taskId;
    } catch (error) {
      console.error('Error queueing search task:', error);
      throw error;
    }
  }
  
  /**
   * Queue a job details task for client-side scraping
   */
  async queueJobDetailsTask(userId: string, platform: string, jobId: string, url: string): Promise<string> {
    try {
      // Generate task ID
      const taskId = `details-${platform}-${jobId}`;
      
      // Create task
      await this.taskRepository.create({
        id: taskId,
        userId,
        platform,
        type: TaskType.JOB_DETAILS,
        params: { jobId, url },
        status: TaskStatus.PENDING
      });
      
      console.log(`Job details task queued: ${taskId}`);
      
      return taskId;
    } catch (error) {
      console.error('Error queueing job details task:', error);
      throw error;
    }
  }
  
  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      return await this.taskRepository.findById(taskId);
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  }
  
  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, result?: any, error?: string): Promise<void> {
    try {
      await this.taskRepository.update(taskId, {
        status,
        result,
        error,
        completedAt: status === TaskStatus.COMPLETED || status === TaskStatus.FAILED ? new Date() : null
      });
      
      console.log(`Task ${taskId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
  
  /**
   * Get pending tasks for a user
   */
  async getPendingTasksForUser(userId: string): Promise<any[]> {
    try {
      return await this.taskRepository.findByUserIdAndStatus(userId, TaskStatus.PENDING);
    } catch (error) {
      console.error('Error getting pending tasks for user:', error);
      throw error;
    }
  }
  
  /**
   * Get next pending task
   */
  async getNextPendingTask(): Promise<any> {
    try {
      const pendingTasks = await this.taskRepository.findByStatus(TaskStatus.PENDING);
      
      if (pendingTasks.length === 0) {
        return null;
      }
      
      // Sort by creation date (oldest first)
      pendingTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      return pendingTasks[0];
    } catch (error) {
      console.error('Error getting next pending task:', error);
      throw error;
    }
  }
  
  /**
   * Get user task statistics
   */
  async getUserTaskStatistics(userId: string): Promise<any> {
    try {
      // Get counts by status
      const pendingCount = await this.taskRepository.countByUserIdAndStatus(userId, TaskStatus.PENDING);
      const processingCount = await this.taskRepository.countByUserIdAndStatus(userId, TaskStatus.PROCESSING);
      const completedCount = await this.taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
      const failedCount = await this.taskRepository.countByUserIdAndStatus(userId, TaskStatus.FAILED);
      
      // Get counts by type
      const searchCount = await this.taskRepository.countByUserIdAndType(userId, TaskType.SEARCH);
      const jobDetailsCount = await this.taskRepository.countByUserIdAndType(userId, TaskType.JOB_DETAILS);
      
      return {
        totalTasks: pendingCount + processingCount + completedCount + failedCount,
        pendingTasks: pendingCount,
        processingTasks: processingCount,
        completedTasks: completedCount,
        failedTasks: failedCount,
        searchTasks: searchCount,
        jobDetailsTasks: jobDetailsCount
      };
    } catch (error) {
      console.error('Error getting user task statistics:', error);
      throw error;
    }
  }
  
  /**
   * Clean up old tasks
   */
  async cleanupOldTasks(daysToKeep: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const deletedCount = await this.taskRepository.deleteOlderThan(cutoffDate);
      
      console.log(`Cleaned up ${deletedCount} old tasks`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old tasks:', error);
      throw error;
    }
  }
}
