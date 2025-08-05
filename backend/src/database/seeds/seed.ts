import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const logger = new Logger('Seed');
  
  try {
    logger.log('Starting seeding...');
    
    const app = await NestFactory.create(SeedModule);
    const seedService = app.get(SeedService);
    
    await seedService.seed();
    
    await app.close();
    logger.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
