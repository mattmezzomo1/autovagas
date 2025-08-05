import { db } from '../database';
import { TaskStatus, TaskType } from '../services/scraper/ScraperQueueService';

/**
 * Repository for scraper task database operations
 */
export class ScraperTaskRepository {
  /**
   * Find task by ID
   */
  async findById(taskId: string): Promise<any> {
    try {
      const query = 'SELECT * FROM scraper_tasks WHERE id = $1';
      const result = await db.query(query, [taskId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.formatTask(result.rows[0]);
    } catch (error) {
      console.error('Error finding task by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new task
   */
  async create(taskData: any): Promise<any> {
    try {
      const { id, userId, platform, type, params, status } = taskData;
      
      const query = `
        INSERT INTO scraper_tasks (id, user_id, platform, type, params, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await db.query(query, [id, userId, platform, type, JSON.stringify(params), status]);
      
      return this.formatTask(result.rows[0]);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  
  /**
   * Update a task
   */
  async update(taskId: string, taskData: any): Promise<any> {
    try {
      const { status, result, error, completedAt } = taskData;
      
      const query = `
        UPDATE scraper_tasks
        SET status = $1, result = $2, error = $3, completed_at = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      
      const result_json = result ? JSON.stringify(result) : null;
      
      const queryResult = await db.query(query, [status, result_json, error, completedAt, taskId]);
      
      if (queryResult.rows.length === 0) {
        return null;
      }
      
      return this.formatTask(queryResult.rows[0]);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
  
  /**
   * Find tasks by user ID
   */
  async findByUserId(userId: string): Promise<any[]> {
    try {
      const query = 'SELECT * FROM scraper_tasks WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await db.query(query, [userId]);
      
      return result.rows.map(this.formatTask);
    } catch (error) {
      console.error('Error finding tasks by user ID:', error);
      throw error;
    }
  }
  
  /**
   * Find tasks by status
   */
  async findByStatus(status: TaskStatus): Promise<any[]> {
    try {
      const query = 'SELECT * FROM scraper_tasks WHERE status = $1 ORDER BY created_at ASC';
      const result = await db.query(query, [status]);
      
      return result.rows.map(this.formatTask);
    } catch (error) {
      console.error('Error finding tasks by status:', error);
      throw error;
    }
  }
  
  /**
   * Find tasks by user ID and status
   */
  async findByUserIdAndStatus(userId: string, status: TaskStatus): Promise<any[]> {
    try {
      const query = 'SELECT * FROM scraper_tasks WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC';
      const result = await db.query(query, [userId, status]);
      
      return result.rows.map(this.formatTask);
    } catch (error) {
      console.error('Error finding tasks by user ID and status:', error);
      throw error;
    }
  }
  
  /**
   * Count tasks by user ID and status
   */
  async countByUserIdAndStatus(userId: string, status: TaskStatus): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) FROM scraper_tasks WHERE user_id = $1 AND status = $2';
      const result = await db.query(query, [userId, status]);
      
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting tasks by user ID and status:', error);
      throw error;
    }
  }
  
  /**
   * Count tasks by user ID and type
   */
  async countByUserIdAndType(userId: string, type: TaskType): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) FROM scraper_tasks WHERE user_id = $1 AND type = $2';
      const result = await db.query(query, [userId, type]);
      
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error counting tasks by user ID and type:', error);
      throw error;
    }
  }
  
  /**
   * Delete tasks older than a specific date
   */
  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const query = `
        DELETE FROM scraper_tasks
        WHERE created_at < $1 AND (status = $2 OR status = $3)
        RETURNING id
      `;
      
      const result = await db.query(query, [date, TaskStatus.COMPLETED, TaskStatus.FAILED]);
      
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting old tasks:', error);
      throw error;
    }
  }
  
  /**
   * Format task data from database
   */
  private formatTask(task: any): any {
    return {
      id: task.id,
      userId: task.user_id,
      platform: task.platform,
      type: task.type,
      params: task.params,
      status: task.status,
      result: task.result,
      error: task.error,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at
    };
  }
}
