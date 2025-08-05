import { JobSearchParams } from '../webscraper/types';

/**
 * Types of scraping tasks
 */
export enum TaskType {
  SEARCH_JOBS = 'search_jobs',
  JOB_DETAILS = 'job_details'
}

/**
 * Interface for a scraping task
 */
export interface ScrapingTask {
  id: string;
  type: TaskType;
  platform: string;
  params: any;
  priority: number;
  createdAt: Date;
  assignedTo?: string;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  duration?: number;
  error?: string;
  result?: any;
}

/**
 * Service to distribute tasks to extensions
 */
export class TaskDistributor {
  private tasks: Map<string, ScrapingTask> = new Map();
  private taskHistory: ScrapingTask[] = [];
  private maxTasksPerUser: number = 3;
  private maxHistorySize: number = 1000;
  private taskStats = {
    created: 0,
    completed: 0,
    failed: 0,
    byPlatform: {
      linkedin: 0,
      indeed: 0,
      infojobs: 0,
      catho: 0
    },
    byType: {
      search_jobs: 0,
      job_details: 0
    }
  };

  constructor() {
    // Create some initial tasks for testing
    this.createInitialTasks();
  }

  /**
   * Create initial tasks for testing
   */
  private createInitialTasks(): void {
    // LinkedIn search task
    this.addTask({
      id: `search-linkedin-${Date.now()}`,
      type: TaskType.SEARCH_JOBS,
      platform: 'linkedin',
      params: {
        keywords: ['desenvolvedor', 'javascript'],
        locations: ['São Paulo'],
        remote: true,
        jobTypes: ['CLT', 'PJ']
      },
      priority: 1,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });

    // Indeed search task
    this.addTask({
      id: `search-indeed-${Date.now()}`,
      type: TaskType.SEARCH_JOBS,
      platform: 'indeed',
      params: {
        keywords: ['desenvolvedor', 'javascript'],
        locations: ['São Paulo'],
        remote: true,
        jobTypes: ['CLT', 'PJ']
      },
      priority: 1,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });
  }

  /**
   * Add a new task
   */
  addTask(task: ScrapingTask): void {
    this.tasks.set(task.id, task);

    // Update statistics
    this.taskStats.created++;
    this.taskStats.byPlatform[task.platform]++;
    this.taskStats.byType[task.type]++;
  }

  /**
   * Add a job search task
   */
  addJobSearchTask(platform: string, params: JobSearchParams, priority: number = 1): string {
    const taskId = `search-${platform}-${Date.now()}`;

    this.addTask({
      id: taskId,
      type: TaskType.SEARCH_JOBS,
      platform,
      params,
      priority,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });

    return taskId;
  }

  /**
   * Add a job details task
   */
  addJobDetailsTask(platform: string, jobId: string, url: string, priority: number = 2): string {
    const taskId = `details-${platform}-${jobId}`;

    this.addTask({
      id: taskId,
      type: TaskType.JOB_DETAILS,
      platform,
      params: {
        jobId,
        url
      },
      priority,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });

    return taskId;
  }

  /**
   * Get tasks for a specific user
   */
  getTasksForUser(userId: string): ScrapingTask[] {
    // Get pending tasks
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());

    // Limit the number of tasks
    const tasksToAssign = pendingTasks.slice(0, this.maxTasksPerUser);

    // Assign tasks to user
    tasksToAssign.forEach(task => {
      task.assignedTo = userId;
      task.status = 'processing';
      this.tasks.set(task.id, task);
    });

    return tasksToAssign;
  }

  /**
   * Reassign a specific task
   */
  reassignTask(taskId: string): void {
    const task = this.tasks.get(taskId);

    if (task && task.status === 'processing') {
      task.status = 'pending';
      task.assignedTo = undefined;
      this.tasks.set(taskId, task);

      console.log(`Task ${taskId} reassigned`);
    }
  }

  /**
   * Reassign all tasks for a user
   */
  reassignTasksForUser(userId: string): void {
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.assignedTo === userId && task.status === 'processing') {
        task.status = 'pending';
        task.assignedTo = undefined;
        this.tasks.set(taskId, task);
      }
    }

    console.log(`All tasks for user ${userId} reassigned`);
  }

  /**
   * Mark a task as completed
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);

    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
      this.tasks.set(taskId, task);

      // Update statistics
      this.taskStats.completed++;

      // Add to history
      this.addToTaskHistory(task);

      console.log(`Task ${taskId} marked as completed`);
    }
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);

    if (task) {
      task.attempts++;
      task.error = error;

      if (task.attempts >= task.maxAttempts) {
        task.status = 'failed';
        task.failedAt = new Date();

        // Update statistics
        this.taskStats.failed++;

        // Add to history
        this.addToTaskHistory(task);

        console.log(`Task ${taskId} marked as failed after ${task.attempts} attempts: ${error}`);
      } else {
        task.status = 'pending';
        task.assignedTo = undefined;
        console.log(`Task ${taskId} returned to queue for retry (attempt ${task.attempts}): ${error}`);
      }

      this.tasks.set(taskId, task);
    }
  }

  /**
   * Add a task to the history
   */
  private addToTaskHistory(task: ScrapingTask): void {
    // Create a copy of the task for history
    const taskCopy = { ...task };

    // Add to history
    this.taskHistory.unshift(taskCopy);

    // Limit history size
    if (this.taskHistory.length > this.maxHistorySize) {
      this.taskHistory.pop();
    }

    // Remove from active tasks if completed or failed
    if (task.status === 'completed' || task.status === 'failed') {
      this.tasks.delete(task.id);
    }
  }

  /**
   * Get task statistics
   */
  getTaskStatistics() {
    // Count tasks by status
    const pendingTasks = Array.from(this.tasks.values()).filter(task => task.status === 'pending').length;
    const processingTasks = Array.from(this.tasks.values()).filter(task => task.status === 'processing').length;

    // Count tasks by platform
    const tasksByPlatform = {
      linkedin: Array.from(this.tasks.values()).filter(task => task.platform === 'linkedin').length,
      indeed: Array.from(this.tasks.values()).filter(task => task.platform === 'indeed').length,
      infojobs: Array.from(this.tasks.values()).filter(task => task.platform === 'infojobs').length,
      catho: Array.from(this.tasks.values()).filter(task => task.platform === 'catho').length
    };

    // Count tasks by type
    const tasksByType = {
      search_jobs: Array.from(this.tasks.values()).filter(task => task.type === TaskType.SEARCH_JOBS).length,
      job_details: Array.from(this.tasks.values()).filter(task => task.type === TaskType.JOB_DETAILS).length
    };

    return {
      pendingTasks,
      processingTasks,
      completedTasks: this.taskStats.completed,
      failedTasks: this.taskStats.failed,
      totalCreated: this.taskStats.created,
      tasksByPlatform,
      tasksByType
    };
  }

  /**
   * Get task queue
   */
  getTaskQueue() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTaskById(taskId: string): ScrapingTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get task history
   */
  getTaskHistory(options: {
    limit: number;
    offset: number;
    status?: string;
    platform?: string;
    type?: string;
  }) {
    let filteredHistory = [...this.taskHistory];

    // Apply filters
    if (options.status) {
      filteredHistory = filteredHistory.filter(task => task.status === options.status);
    }

    if (options.platform) {
      filteredHistory = filteredHistory.filter(task => task.platform === options.platform);
    }

    if (options.type) {
      filteredHistory = filteredHistory.filter(task => task.type === options.type);
    }

    // Apply pagination
    const paginatedHistory = filteredHistory.slice(
      options.offset,
      options.offset + options.limit
    );

    return {
      total: filteredHistory.length,
      offset: options.offset,
      limit: options.limit,
      tasks: paginatedHistory
    };
  }
}
