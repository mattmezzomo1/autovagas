import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoApplyService } from './services/auto-apply.service';
import { AutoApplyExecutorService } from './services/auto-apply-executor.service';
import { AutoApplyController } from './controllers/auto-apply.controller';
import { AutoApplyConfig } from './entities/auto-apply-config.entity';
import { AutoApplyHistory } from './entities/auto-apply-history.entity';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AutoApplyConfig, AutoApplyHistory, User, Job]),
    JobsModule,
  ],
  controllers: [AutoApplyController],
  providers: [AutoApplyService, AutoApplyExecutorService],
  exports: [AutoApplyService, AutoApplyExecutorService],
})
export class AutoApplyModule {}
