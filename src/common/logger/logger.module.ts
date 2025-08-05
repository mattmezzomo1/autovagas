import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const environment = configService.get<string>('environment', 'development');
        const isProduction = environment === 'production';
        const logDir = path.join(process.cwd(), 'logs');
        
        // Define log format
        const logFormat = winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          isProduction
            ? winston.format.json()
            : nestWinstonModuleUtilities.format.nestLike('Autovagas', {
                colors: true,
                prettyPrint: true,
              }),
        );
        
        // Define transports
        const transports: winston.transport[] = [
          // Console transport
          new winston.transports.Console({
            level: isProduction ? 'info' : 'debug',
            format: logFormat,
          }),
        ];
        
        // Add file transports in production
        if (isProduction) {
          // Combined log file
          transports.push(
            new winston.transports.File({
              filename: path.join(logDir, 'combined.log'),
              level: 'info',
              format: logFormat,
              maxsize: 10 * 1024 * 1024, // 10MB
              maxFiles: 5,
            }),
          );
          
          // Error log file
          transports.push(
            new winston.transports.File({
              filename: path.join(logDir, 'error.log'),
              level: 'error',
              format: logFormat,
              maxsize: 10 * 1024 * 1024, // 10MB
              maxFiles: 5,
            }),
          );
        }
        
        return {
          transports,
          // Handle uncaught exceptions and unhandled rejections
          exceptionHandlers: [
            new winston.transports.File({
              filename: path.join(logDir, 'exceptions.log'),
              maxsize: 10 * 1024 * 1024, // 10MB
              maxFiles: 5,
            }),
          ],
          exitOnError: false,
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
