import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoApplyService } from './auto-apply.service';
import { AutoApplyController } from './auto-apply.controller';
import { AutoApplyConfig } from './entities/auto-apply-config.entity';
import { WebscraperModule } from '../webscraper/webscraper.module';
import { UsersModule } from '../users/users.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AutoApplyConfig]),
    WebscraperModule,
    UsersModule,
    ApplicationsModule,
  ],
  controllers: [AutoApplyController],
  providers: [AutoApplyService],
  exports: [AutoApplyService],
})
export class AutoApplyModule {}
