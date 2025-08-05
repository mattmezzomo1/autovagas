import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { QueueManagerService } from './services/queue-manager.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { QueueMonitoringService } from './services/queue-monitoring.service';
import { QueueController } from './controllers/queue.controller';
import { ScrapersModule } from '../scrapers/scrapers.module';
import { UsersModule } from '../users/users.module';

// Queue processors
import { LinkedInScraperProcessor } from './processors/linkedin-scraper.processor';
import { InfoJobsScraperProcessor } from './processors/infojobs-scraper.processor';
import { CathoScraperProcessor } from './processors/catho-scraper.processor';
import { IndeedScraperProcessor } from './processors/indeed-scraper.processor';
import { AutoApplyProcessor } from './processors/auto-apply.processor';

// Queue names
export const QUEUE_NAMES = {
  LINKEDIN_SCRAPER: 'linkedin-scraper',
  INFOJOBS_SCRAPER: 'infojobs-scraper',
  CATHO_SCRAPER: 'catho-scraper',
  INDEED_SCRAPER: 'indeed-scraper',
  AUTO_APPLY: 'auto-apply',
};

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
          password: configService.get('redis.password', ''),
          db: configService.get('redis.db', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 200, // Keep last 200 failed jobs
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.LINKEDIN_SCRAPER,
        limiter: {
          max: 10, // Max 10 jobs per
          duration: 1000, // 1 second
        },
      },
      {
        name: QUEUE_NAMES.INFOJOBS_SCRAPER,
        limiter: {
          max: 10,
          duration: 1000,
        },
      },
      {
        name: QUEUE_NAMES.CATHO_SCRAPER,
        limiter: {
          max: 10,
          duration: 1000,
        },
      },
      {
        name: QUEUE_NAMES.INDEED_SCRAPER,
        limiter: {
          max: 10,
          duration: 1000,
        },
      },
      {
        name: QUEUE_NAMES.AUTO_APPLY,
        limiter: {
          max: 5,
          duration: 1000,
        },
      },
    ),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      new BullAdapter(QUEUE_NAMES.LINKEDIN_SCRAPER),
      new BullAdapter(QUEUE_NAMES.INFOJOBS_SCRAPER),
      new BullAdapter(QUEUE_NAMES.CATHO_SCRAPER),
      new BullAdapter(QUEUE_NAMES.INDEED_SCRAPER),
      new BullAdapter(QUEUE_NAMES.AUTO_APPLY),
    ),
    ScrapersModule,
    UsersModule,
  ],
  controllers: [QueueController],
  providers: [
    QueueManagerService,
    RateLimiterService,
    CircuitBreakerService,
    QueueMonitoringService,
    LinkedInScraperProcessor,
    InfoJobsScraperProcessor,
    CathoScraperProcessor,
    IndeedScraperProcessor,
    AutoApplyProcessor,
  ],
  exports: [
    QueueManagerService,
    RateLimiterService,
    CircuitBreakerService,
    QueueMonitoringService,
  ],
})
export class QueueModule {}
