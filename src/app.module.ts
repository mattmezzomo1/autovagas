import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { FilesModule } from './files/files.module';
import { JobsModule } from './jobs/jobs.module';
import { AutoApplyModule } from './auto-apply/auto-apply.module';
import { DocumentsModule } from './documents/documents.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { QueueModule } from './queue/queue.module';
import { PaymentsModule } from './payments/payments.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CommonModule, // Must be imported before other modules to apply global pipes and filters
    AuthModule,
    UsersModule,
    EmailModule,
    FilesModule,
    JobsModule,
    AutoApplyModule,
    DocumentsModule,
    ScrapersModule,
    QueueModule,
    PaymentsModule,
  ],
})
export class AppModule {}
