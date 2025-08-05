import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { AutoApplyModule } from './auto-apply/auto-apply.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { CompaniesModule } from './companies/companies.module';
import { StripeModule } from './stripe/stripe.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { WebscraperModule } from './webscraper/webscraper.module';
import { CoursesModule } from './courses/courses.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { LoggingModule } from './common/modules/logging.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('throttle.ttl', 60),
        limit: configService.get('throttle.limit', 100),
      }),
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    DocumentsModule,
    JobsModule,
    ApplicationsModule,
    AutoApplyModule,
    SuggestionsModule,
    CompaniesModule,
    StripeModule,
    StorageModule,
    AiModule,
    WebscraperModule,
    CoursesModule,
    MatchmakingModule,
    LoggingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
