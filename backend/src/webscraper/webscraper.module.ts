import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebscraperService } from './webscraper.service';
import { LinkedInScraperService } from './services/linkedin-scraper.service';
import { InfoJobsScraperService } from './services/infojobs-scraper.service';
import { CathoScraperService } from './services/catho-scraper.service';
import { HumanBehaviorSimulatorService } from './services/human-behavior-simulator.service';

@Module({
  imports: [ConfigModule],
  providers: [
    WebscraperService,
    LinkedInScraperService,
    InfoJobsScraperService,
    CathoScraperService,
    HumanBehaviorSimulatorService,
  ],
  exports: [WebscraperService],
})
export class WebscraperModule {}
