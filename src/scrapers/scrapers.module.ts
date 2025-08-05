import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScraperSession } from './entities/scraper-session.entity';
import { ScraperJob } from './entities/scraper-job.entity';
import { ProxyService } from './services/proxy.service';
import { AdvancedProxyService } from './services/advanced-proxy.service';
import { UserAgentService } from './services/user-agent.service';
import { AntiDetectionService } from './services/anti-detection.service';
import { SessionManagerService } from './services/session-manager.service';
import { ScraperSessionService } from './services/scraper-session.service';
import { ScraperJobService } from './services/scraper-job.service';
import { LinkedInScraperService } from './services/linkedin-scraper.service';
import { InfoJobsScraperService } from './services/infojobs-scraper.service';
import { CathoScraperService } from './services/catho-scraper.service';
import { IndeedScraperService } from './services/indeed-scraper.service';
import { AutoApplyIntegrationService } from './services/auto-apply-integration.service';
import { LinkedInScraperController } from './controllers/linkedin-scraper.controller';
import { InfoJobsScraperController } from './controllers/infojobs-scraper.controller';
import { CathoScraperController } from './controllers/catho-scraper.controller';
import { IndeedScraperController } from './controllers/indeed-scraper.controller';
import { AntiDetectionController } from './controllers/anti-detection.controller';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { AutoApplyModule } from '../auto-apply/auto-apply.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScraperSession, ScraperJob]),
    ConfigModule,
    UsersModule,
    JobsModule,
    AutoApplyModule,
    DocumentsModule,
  ],
  controllers: [
    LinkedInScraperController,
    InfoJobsScraperController,
    CathoScraperController,
    IndeedScraperController,
    AntiDetectionController
  ],
  providers: [
    ProxyService,
    AdvancedProxyService,
    UserAgentService,
    AntiDetectionService,
    SessionManagerService,
    ScraperSessionService,
    ScraperJobService,
    LinkedInScraperService,
    InfoJobsScraperService,
    CathoScraperService,
    IndeedScraperService,
    AutoApplyIntegrationService,
  ],
  exports: [
    AdvancedProxyService,
    UserAgentService,
    AntiDetectionService,
    SessionManagerService,
    ScraperSessionService,
    ScraperJobService,
    LinkedInScraperService,
    InfoJobsScraperService,
    CathoScraperService,
    IndeedScraperService,
    AutoApplyIntegrationService,
  ],
})
export class ScrapersModule {}
