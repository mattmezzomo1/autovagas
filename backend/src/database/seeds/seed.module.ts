import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Suggestion } from '../../suggestions/entities/suggestion.entity';
import { Course } from '../../courses/entities/course.entity';
import { Match } from '../../matchmaking/entities/match.entity';
import { MatchCriteria } from '../../matchmaking/entities/match-criteria.entity';
import configuration from '../../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
    }),
    TypeOrmModule.forFeature([User, Company, Suggestion, Course, Match, MatchCriteria]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
