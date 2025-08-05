import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PlatformAuthController } from './platform-auth.controller';
import { PlatformAuthService } from '../services/platform-auth.service';
import { PlatformConnection } from '../entities/platform-connection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformConnection]),
    ConfigModule,
  ],
  controllers: [PlatformAuthController],
  providers: [PlatformAuthService],
  exports: [PlatformAuthService],
})
export class PlatformAuthModule {}
