import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './services/jobs.service';
import { ApplicationsService } from './services/applications.service';
import { JobsController } from './controllers/jobs.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { Job } from './entities/job.entity';
import { Application } from './entities/application.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Application, User])],
  controllers: [JobsController, ApplicationsController],
  providers: [JobsService, ApplicationsService],
  exports: [JobsService, ApplicationsService],
})
export class JobsModule {}
