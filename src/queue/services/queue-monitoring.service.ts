import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.module';
import { CircuitBreakerService } from './circuit-breaker.service';
import * as Redis from 'ioredis';

interface QueueMetrics {
  processed: number;
  failed: number;
  delayed: number;
  active: number;
  waiting: number;
  completed: number;
  throughput: number; // jobs per minute
  errorRate: number; // percentage
  avgProcessingTime: number; // milliseconds
  p95ProcessingTime: number; // milliseconds
}

@Injectable()
export class QueueMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(QueueMonitoringService.name);
  private readonly redis: Redis.Redis;
  private metricsInterval: NodeJS.Timeout;
  private alertsInterval: NodeJS.Timeout;

  constructor(
    @InjectQueue(QUEUE_NAMES.LINKEDIN_SCRAPER)
    private readonly linkedinScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INFOJOBS_SCRAPER)
    private readonly infojobsScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CATHO_SCRAPER)
    private readonly cathoScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INDEED_SCRAPER)
    private readonly indeedScraperQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AUTO_APPLY)
    private readonly autoApplyQueue: Queue,
    private readonly configService: ConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {
    // Initialize Redis client
    this.redis = new Redis({
      host: this.configService.get('redis.host', 'localhost'),
      port: this.configService.get('redis.port', 6379),
      password: this.configService.get('redis.password', ''),
      db: this.configService.get('redis.db', 0),
    });
  }

  async onModuleInit() {
    // Set up event listeners for all queues
    this.setupQueueListeners(this.linkedinScraperQueue, 'linkedin');
    this.setupQueueListeners(this.infojobsScraperQueue, 'infojobs');
    this.setupQueueListeners(this.cathoScraperQueue, 'catho');
    this.setupQueueListeners(this.indeedScraperQueue, 'indeed');
    this.setupQueueListeners(this.autoApplyQueue, 'auto-apply');

    // Start collecting metrics every minute
    this.metricsInterval = setInterval(() => {
      this.collectMetrics().catch(err => 
        this.logger.error(`Error collecting metrics: ${err.message}`)
      );
    }, 60000); // Every minute

    // Start checking for alerts every 5 minutes
    this.alertsInterval = setInterval(() => {
      this.checkAlerts().catch(err => 
        this.logger.error(`Error checking alerts: ${err.message}`)
      );
    }, 300000); // Every 5 minutes
  }

  /**
   * Set up event listeners for a queue
   */
  private setupQueueListeners(queue: Queue, platform: string): void {
    // Listen for completed jobs
    queue.on('completed', async (job: Job, result: any) => {
      try {
        // Record processing time
        const processingTime = job.finishedOn - job.processedOn;
        await this.recordProcessingTime(queue.name, processingTime);
        
        // Record success for circuit breaker if platform is specified
        if (platform !== 'auto-apply') {
          await this.circuitBreakerService.recordSuccess(platform);
        }
        
        // Log completion
        this.logger.log(`Job ${job.id} in queue ${queue.name} completed in ${processingTime}ms`);
      } catch (error) {
        this.logger.error(`Error handling completed job: ${error.message}`);
      }
    });

    // Listen for failed jobs
    queue.on('failed', async (job: Job, error: Error) => {
      try {
        // Record failure for circuit breaker if platform is specified
        if (platform !== 'auto-apply') {
          await this.circuitBreakerService.recordFailure(platform);
        }
        
        // Log failure
        this.logger.error(`Job ${job.id} in queue ${queue.name} failed: ${error.message}`);
        
        // Check if we should trigger an alert
        const failedCount = await queue.getFailedCount();
        if (failedCount > 10) {
          this.triggerAlert(queue.name, `High failure rate detected: ${failedCount} failed jobs`);
        }
      } catch (error) {
        this.logger.error(`Error handling failed job: ${error.message}`);
      }
    });

    // Listen for stalled jobs
    queue.on('stalled', async (jobId: string) => {
      this.logger.warn(`Job ${jobId} in queue ${queue.name} stalled`);
    });
  }

  /**
   * Record processing time for a job
   */
  private async recordProcessingTime(queueName: string, processingTime: number): Promise<void> {
    const key = `metrics:processing-times:${queueName}`;
    const timestamp = Date.now();
    
    // Store processing time with timestamp
    await this.redis.zadd(key, timestamp, `${timestamp}:${processingTime}`);
    
    // Remove old entries (older than 24 hours)
    const cutoff = timestamp - 24 * 60 * 60 * 1000;
    await this.redis.zremrangebyscore(key, 0, cutoff);
  }

  /**
   * Collect metrics for all queues
   */
  private async collectMetrics(): Promise<void> {
    const queueNames = Object.values(QUEUE_NAMES);
    
    for (const name of queueNames) {
      const queue = this.getQueueByName(name);
      if (queue) {
        const metrics = await this.getQueueMetrics(queue);
        
        // Store metrics in Redis
        const key = `metrics:${name}:${Date.now()}`;
        await this.redis.set(key, JSON.stringify(metrics));
        await this.redis.expire(key, 86400 * 7); // Keep for 7 days
        
        // Store latest metrics
        await this.redis.set(`metrics:${name}:latest`, JSON.stringify(metrics));
      }
    }
  }

  /**
   * Get metrics for a queue
   */
  private async getQueueMetrics(queue: Queue): Promise<QueueMetrics> {
    // Get job counts
    const [
      jobCounts,
      completedJobs,
      failedJobs,
    ] = await Promise.all([
      queue.getJobCounts(),
      queue.getCompleted(0, 100), // Get last 100 completed jobs
      queue.getFailed(0, 100), // Get last 100 failed jobs
    ]);
    
    // Calculate throughput (jobs per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentCompletedJobs = completedJobs.filter(job => job.finishedOn > oneMinuteAgo);
    const throughput = recentCompletedJobs.length;
    
    // Calculate error rate
    const totalJobs = completedJobs.length + failedJobs.length;
    const errorRate = totalJobs > 0 ? (failedJobs.length / totalJobs) * 100 : 0;
    
    // Calculate processing times
    const processingTimes = completedJobs
      .filter(job => job.finishedOn && job.processedOn)
      .map(job => job.finishedOn - job.processedOn);
    
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;
    
    // Calculate 95th percentile processing time
    let p95ProcessingTime = 0;
    if (processingTimes.length > 0) {
      processingTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(processingTimes.length * 0.95);
      p95ProcessingTime = processingTimes[p95Index] || processingTimes[processingTimes.length - 1];
    }
    
    return {
      processed: jobCounts.completed,
      failed: jobCounts.failed,
      delayed: jobCounts.delayed,
      active: jobCounts.active,
      waiting: jobCounts.waiting,
      completed: jobCounts.completed,
      throughput,
      errorRate,
      avgProcessingTime,
      p95ProcessingTime,
    };
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(): Promise<void> {
    const queueNames = Object.values(QUEUE_NAMES);
    
    for (const name of queueNames) {
      const queue = this.getQueueByName(name);
      if (queue) {
        // Check for high waiting count
        const waitingCount = await queue.getWaitingCount();
        if (waitingCount > 1000) {
          this.triggerAlert(name, `High waiting job count: ${waitingCount} jobs waiting`);
        }
        
        // Check for high error rate
        const metrics = await this.getLatestMetrics(name);
        if (metrics && metrics.errorRate > 20) {
          this.triggerAlert(name, `High error rate: ${metrics.errorRate.toFixed(2)}% of jobs failing`);
        }
        
        // Check for slow processing
        if (metrics && metrics.avgProcessingTime > 30000) {
          this.triggerAlert(name, `Slow processing: Average processing time is ${(metrics.avgProcessingTime / 1000).toFixed(2)}s`);
        }
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(queueName: string, message: string): void {
    const alert = {
      queueName,
      message,
      timestamp: new Date().toISOString(),
      severity: 'high',
    };
    
    // Log alert
    this.logger.warn(`ALERT: ${message} (Queue: ${queueName})`);
    
    // Store alert in Redis
    const key = `alerts:${queueName}:${Date.now()}`;
    this.redis.set(key, JSON.stringify(alert));
    this.redis.expire(key, 86400 * 7); // Keep for 7 days
    
    // Add to recent alerts list
    this.redis.lpush('alerts:recent', JSON.stringify(alert));
    this.redis.ltrim('alerts:recent', 0, 99); // Keep last 100 alerts
    
    // In a real system, you would send notifications here (email, Slack, etc.)
  }

  /**
   * Get latest metrics for a queue
   */
  async getLatestMetrics(queueName: string): Promise<QueueMetrics | null> {
    const data = await this.redis.get(`metrics:${queueName}:latest`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get historical metrics for a queue
   */
  async getHistoricalMetrics(queueName: string, hours: number = 24): Promise<QueueMetrics[]> {
    const now = Date.now();
    const cutoff = now - hours * 60 * 60 * 1000;
    
    // Get all metrics keys for the queue
    const keys = await this.redis.keys(`metrics:${queueName}:*`);
    
    // Filter out 'latest' key and keys older than cutoff
    const filteredKeys = keys
      .filter(key => !key.endsWith(':latest'))
      .filter(key => {
        const timestamp = parseInt(key.split(':')[2], 10);
        return timestamp >= cutoff;
      })
      .sort(); // Sort by timestamp
    
    // Get metrics data
    const metrics: QueueMetrics[] = [];
    for (const key of filteredKeys) {
      const data = await this.redis.get(key);
      if (data) {
        metrics.push(JSON.parse(data));
      }
    }
    
    return metrics;
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 10): Promise<any[]> {
    const data = await this.redis.lrange('alerts:recent', 0, limit - 1);
    return data.map(item => JSON.parse(item));
  }

  /**
   * Get queue by name
   */
  private getQueueByName(name: string): Queue | null {
    switch (name) {
      case QUEUE_NAMES.LINKEDIN_SCRAPER:
        return this.linkedinScraperQueue;
      case QUEUE_NAMES.INFOJOBS_SCRAPER:
        return this.infojobsScraperQueue;
      case QUEUE_NAMES.CATHO_SCRAPER:
        return this.cathoScraperQueue;
      case QUEUE_NAMES.INDEED_SCRAPER:
        return this.indeedScraperQueue;
      case QUEUE_NAMES.AUTO_APPLY:
        return this.autoApplyQueue;
      default:
        return null;
    }
  }
}
