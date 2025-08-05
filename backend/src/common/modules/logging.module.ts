import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomLoggerService } from '../services/logging.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggingModule {}
