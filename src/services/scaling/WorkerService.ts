import * as cluster from 'cluster';
import * as os from 'os';
import { ScraperQueueService, TaskStatus } from '../scraper/ScraperQueueService';
import { ProxyScraperService } from '../scraper/ProxyScraperService';
import { config } from '../../config';

/**
 * Service for handling worker processes
 */
export class WorkerService {
  private scraperQueueService: ScraperQueueService;
  private proxyScraperService: ProxyScraperService;
  private isProcessing: boolean = false;
  private shouldShutdown: boolean = false;
  private lastHealthUpdate: Date = new Date();
  private taskProcessingInterval: NodeJS.Timeout | null = null;

  // Metrics
  private tasksProcessed: number = 0;
  private tasksSucceeded: number = 0;
  private tasksFailed: number = 0;
  private startTime: Date = new Date();

  constructor() {
    this.scraperQueueService = new ScraperQueueService();
    this.proxyScraperService = new ProxyScraperService();
  }

  /**
   * Initialize the worker
   */
  initialize(): void {
    if (cluster.isWorker) {
      console.log(`Worker ${process.pid} initializing`);

      // Set up message handling
      process.on('message', (message) => {
        this.handleMessage(message);
      });

      // Start processing tasks
      this.startTaskProcessing();

      // Send initial health status
      this.sendHealthStatus();

      // Set up periodic health status updates
      setInterval(() => this.sendHealthStatus(), 30000);

      // Set up periodic metrics updates
      setInterval(() => this.sendMetrics(), 60000);
    }
  }

  /**
   * Handle messages from the master process
   */
  private handleMessage(message: any): void {
    if (message.type === 'health_check') {
      this.sendHealthStatus();
    } else if (message.type === 'shutdown') {
      this.handleShutdown();
    }
  }

  /**
   * Send health status to master process
   */
  private sendHealthStatus(): void {
    this.lastHealthUpdate = new Date();

    if (process.send) {
      process.send({
        type: 'health',
        data: {
          pid: process.pid,
          isProcessing: this.isProcessing,
          lastUpdate: this.lastHealthUpdate,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      });
    }
  }

  /**
   * Send metrics to master process
   */
  private sendMetrics(): void {
    if (process.send) {
      const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000;

      process.send({
        type: 'metrics',
        data: {
          tasksProcessed: this.tasksProcessed,
          tasksSucceeded: this.tasksSucceeded,
          tasksFailed: this.tasksFailed,
          tasksPerMinute: uptime > 0 ? (this.tasksProcessed / uptime) * 60 : 0,
          successRate: this.tasksProcessed > 0 ? (this.tasksSucceeded / this.tasksProcessed) * 100 : 0
        }
      });
    }
  }

  /**
   * Handle graceful shutdown
   */
  private handleShutdown(): void {
    console.log(`Worker ${process.pid} received shutdown signal`);

    this.shouldShutdown = true;

    // If not processing, exit immediately
    if (!this.isProcessing) {
      console.log(`Worker ${process.pid} shutting down immediately`);
      process.exit(0);
    }

    // Otherwise, wait for current task to complete
    console.log(`Worker ${process.pid} will shut down after current task completes`);
  }

  /**
   * Start processing tasks
   */
  private startTaskProcessing(): void {
    console.log(`Worker ${process.pid} starting task processing`);

    this.taskProcessingInterval = setInterval(async () => {
      // Skip if already processing or should shutdown
      if (this.isProcessing || this.shouldShutdown) {
        return;
      }

      try {
        this.isProcessing = true;

        // Get next pending task
        const task = await this.scraperQueueService.getNextPendingTask();

        if (!task) {
          this.isProcessing = false;
          return;
        }

        console.log(`Worker ${process.pid} processing task ${task.id}`);

        // Update task status to processing
        await this.scraperQueueService.updateTaskStatus(task.id, TaskStatus.PROCESSING);

        // Process task based on type
        if (task.type === 'search') {
          await this.processSearchTask(task);
        } else if (task.type === 'job_details') {
          await this.processJobDetailsTask(task);
        }

        this.tasksProcessed++;

        // Check if should shutdown after task
        if (this.shouldShutdown) {
          console.log(`Worker ${process.pid} shutting down after task completion`);
          process.exit(0);
        }
      } catch (error) {
        console.error(`Worker ${process.pid} error processing task:`, error);
      } finally {
        this.isProcessing = false;
      }
    }, 1000);
  }

  /**
   * Process a search task
   */
  private async processSearchTask(task: any): Promise<void> {
    try {
      // Perform search based on platform
      let results: any[] = [];

      switch (task.platform) {
        case 'linkedin':
          results = await this.proxyScraperService.searchLinkedInJobs(task.params);
          break;
        case 'indeed':
          results = await this.proxyScraperService.searchIndeedJobs(task.params);
          break;
        case 'infojobs':
          results = await this.proxyScraperService.searchInfoJobsJobs(task.params);
          break;
        case 'catho':
          results = await this.proxyScraperService.searchCathoJobs(task.params);
          break;
        default:
          throw new Error(`Unsupported platform: ${task.platform}`);
      }

      // Update task status to completed
      await this.scraperQueueService.updateTaskStatus(task.id, TaskStatus.COMPLETED, results);
      this.tasksSucceeded++;
    } catch (error) {
      console.error(`Error processing search task ${task.id}:`, error);

      // Update task status to failed
      await this.scraperQueueService.updateTaskStatus(task.id, TaskStatus.FAILED, null, error.message);
      this.tasksFailed++;
    }
  }

  /**
   * Process a job details task
   */
  private async processJobDetailsTask(task: any): Promise<void> {
    try {
      // Get job details based on platform
      let details: any = {};

      switch (task.platform) {
        case 'linkedin':
          details = await this.proxyScraperService.getLinkedInJobDetails(task.params.jobId, task.params.url);
          break;
        case 'indeed':
          details = await this.proxyScraperService.getIndeedJobDetails(task.params.jobId, task.params.url);
          break;
        case 'infojobs':
          details = await this.proxyScraperService.getInfoJobsJobDetails(task.params.jobId, task.params.url);
          break;
        case 'catho':
          details = await this.proxyScraperService.getCathoJobDetails(task.params.jobId, task.params.url);
          break;
        default:
          throw new Error(`Unsupported platform: ${task.platform}`);
      }

      // Update task status to completed
      await this.scraperQueueService.updateTaskStatus(task.id, TaskStatus.COMPLETED, details);
      this.tasksSucceeded++;
    } catch (error) {
      console.error(`Error processing job details task ${task.id}:`, error);

      // Update task status to failed
      await this.scraperQueueService.updateTaskStatus(task.id, TaskStatus.FAILED, null, error.message);
      this.tasksFailed++;
    }
  }
}
