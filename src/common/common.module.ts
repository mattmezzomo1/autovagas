import { Module } from '@nestjs/common';
import { ValidationModule } from './validation/validation.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ValidationModule,
    ExceptionsModule,
    LoggerModule,
  ],
  exports: [
    ValidationModule,
    ExceptionsModule,
    LoggerModule,
  ],
})
export class CommonModule {}
