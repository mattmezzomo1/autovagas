import { TaskDistributor } from './TaskDistributor';
import { JobsDatabase } from '../webscraper/JobsDatabase';
import { ScrapedJob } from '../webscraper/types';

/**
 * Service to collect and process results from extensions
 */
export class ResultCollector {
  private taskDistributor: TaskDistributor;
  private jobsDatabase: JobsDatabase;
  private taskResults: Map<string, any> = new Map();
  private taskDurations: number[] = [];
  private platformStats = {
    linkedin: { success: 0, failure: 0, avgDuration: 0 },
    indeed: { success: 0, failure: 0, avgDuration: 0 },
    infojobs: { success: 0, failure: 0, avgDuration: 0 },
    catho: { success: 0, failure: 0, avgDuration: 0 }
  };
  private hourlyStats: { timestamp: Date, completed: number, failed: number }[] = [];

  constructor() {
    this.taskDistributor = new TaskDistributor();
    this.jobsDatabase = new JobsDatabase();

    // Initialize hourly stats
    this.initializeHourlyStats();

    // Update hourly stats every hour
    setInterval(() => this.updateHourlyStats(), 60 * 60 * 1000);
  }

  /**
   * Initialize hourly stats with empty data for the last 24 hours
   */
  private initializeHourlyStats(): void {
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now);
      timestamp.setHours(now.getHours() - i);
      timestamp.setMinutes(0);
      timestamp.setSeconds(0);
      timestamp.setMilliseconds(0);

      this.hourlyStats.push({
        timestamp,
        completed: 0,
        failed: 0
      });
    }
  }

  /**
   * Update hourly stats by adding a new hour and removing the oldest
   */
  private updateHourlyStats(): void {
    const now = new Date();
    const newHour = new Date(now);
    newHour.setMinutes(0);
    newHour.setSeconds(0);
    newHour.setMilliseconds(0);

    this.hourlyStats.push({
      timestamp: newHour,
      completed: 0,
      failed: 0
    });

    // Remove oldest hour
    if (this.hourlyStats.length > 24) {
      this.hourlyStats.shift();
    }
  }

  /**
   * Process results from a task
   */
  async processResults(taskId: string, results: any): Promise<void> {
    console.log(`Processing results for task ${taskId}`);

    try {
      // Store the results
      this.taskResults.set(taskId, results);

      // Check if results is an array (job search) or object (job details)
      if (Array.isArray(results)) {
        // This is a job search result
        await this.processJobSearchResults(taskId, results);
      } else {
        // This is a job details result
        await this.processJobDetailsResult(taskId, results);
      }

      // Calculate task duration if we have start time
      const task = this.taskDistributor.getTaskById(taskId);
      if (task && task.startedAt) {
        const duration = new Date().getTime() - task.startedAt.getTime();
        task.duration = duration;

        // Update task durations list
        this.taskDurations.push(duration);
        if (this.taskDurations.length > 100) {
          this.taskDurations.shift();
        }

        // Update platform stats
        if (task.platform in this.platformStats) {
          this.platformStats[task.platform].success++;

          // Update average duration
          const currentAvg = this.platformStats[task.platform].avgDuration;
          const currentCount = this.platformStats[task.platform].success;
          this.platformStats[task.platform].avgDuration =
            (currentAvg * (currentCount - 1) + duration) / currentCount;
        }
      }

      // Update hourly stats
      const currentHour = this.getCurrentHourStat();
      if (currentHour) {
        currentHour.completed++;
      }

      // Mark task as completed
      this.taskDistributor.completeTask(taskId);
    } catch (error) {
      console.error(`Error processing results for task ${taskId}:`, error);

      // Update platform stats for failure
      const task = this.taskDistributor.getTaskById(taskId);
      if (task && task.platform in this.platformStats) {
        this.platformStats[task.platform].failure++;
      }

      // Update hourly stats
      const currentHour = this.getCurrentHourStat();
      if (currentHour) {
        currentHour.failed++;
      }

      this.taskDistributor.failTask(taskId, error.message);
    }
  }

  /**
   * Get the current hour stat object
   */
  private getCurrentHourStat() {
    const now = new Date();
    const currentHour = new Date(now);
    currentHour.setMinutes(0);
    currentHour.setSeconds(0);
    currentHour.setMilliseconds(0);

    return this.hourlyStats.find(stat =>
      stat.timestamp.getTime() === currentHour.getTime()
    );
  }

  /**
   * Process job search results
   */
  private async processJobSearchResults(taskId: string, results: ScrapedJob[]): Promise<void> {
    console.log(`Processing ${results.length} job search results`);

    // Add jobs to database
    this.jobsDatabase.addJobs(results);

    // Create job details tasks for each job
    for (const job of results) {
      if (job.url) {
        this.taskDistributor.addJobDetailsTask(
          job.platform,
          job.id,
          job.url,
          2 // Higher priority than search
        );
      }
    }
  }

  /**
   * Process job details result
   */
  private async processJobDetailsResult(taskId: string, result: any): Promise<void> {
    console.log(`Processing job details result`);

    // Extract job ID from task ID
    const jobId = taskId.replace('details-', '').split('-').slice(1).join('-');

    // Update job in database
    this.jobsDatabase.updateJob(jobId, result);
  }

  /**
   * Process task failure
   */
  async processFailure(taskId: string, error: string): Promise<void> {
    console.log(`Processing failure for task ${taskId}: ${error}`);

    // Update platform stats for failure
    const task = this.taskDistributor.getTaskById(taskId);
    if (task && task.platform in this.platformStats) {
      this.platformStats[task.platform].failure++;
    }

    // Update hourly stats
    const currentHour = this.getCurrentHourStat();
    if (currentHour) {
      currentHour.failed++;
    }

    // Mark task as failed
    this.taskDistributor.failTask(taskId, error);
  }

  /**
   * Get result statistics
   */
  getResultStatistics() {
    // Calculate average task duration
    const averageTaskDuration = this.taskDurations.length > 0
      ? this.taskDurations.reduce((sum, duration) => sum + duration, 0) / this.taskDurations.length
      : 0;

    // Calculate tasks per hour
    const last24Hours = this.hourlyStats.reduce(
      (sum, stat) => sum + stat.completed + stat.failed,
      0
    );
    const tasksPerHour = last24Hours / 24;

    // Calculate success rate
    const totalCompleted = this.hourlyStats.reduce((sum, stat) => sum + stat.completed, 0);
    const totalFailed = this.hourlyStats.reduce((sum, stat) => sum + stat.failed, 0);
    const successRate = totalCompleted + totalFailed > 0
      ? (totalCompleted / (totalCompleted + totalFailed)) * 100
      : 0;

    return {
      averageTaskDuration,
      tasksPerHour,
      successRate,
      totalCompleted,
      totalFailed
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeframe: string) {
    // Get hourly stats based on timeframe
    let relevantStats = [...this.hourlyStats];

    if (timeframe === '1h') {
      relevantStats = relevantStats.slice(-1);
    } else if (timeframe === '6h') {
      relevantStats = relevantStats.slice(-6);
    } else if (timeframe === '12h') {
      relevantStats = relevantStats.slice(-12);
    }
    // Default is 24h, which is the full array

    return {
      timeframe,
      hourlyStats: relevantStats,
      totalCompleted: relevantStats.reduce((sum, stat) => sum + stat.completed, 0),
      totalFailed: relevantStats.reduce((sum, stat) => sum + stat.failed, 0),
      averageTaskDuration: this.taskDurations.length > 0
        ? this.taskDurations.reduce((sum, duration) => sum + duration, 0) / this.taskDurations.length
        : 0
    };
  }

  /**
   * Get platform statistics
   */
  getPlatformStatistics() {
    return this.platformStats;
  }
}
