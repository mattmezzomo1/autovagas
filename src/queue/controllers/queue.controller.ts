import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { QueueManagerService } from '../services/queue-manager.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { QueueMonitoringService } from '../services/queue-monitoring.service';
import { QUEUE_NAMES } from '../queue.module';
import { Request } from 'express';

@ApiTags('queue')
@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(
    private readonly queueManagerService: QueueManagerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly queueMonitoringService: QueueMonitoringService,
  ) {}

  // Queue management endpoints
  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  @Roles(UserRole.ADMIN)
  async getQueueStats() {
    return this.queueManagerService.getAllQueueStats();
  }

  @Get('stats/:queueName')
  @ApiOperation({ summary: 'Get statistics for a specific queue' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  @Roles(UserRole.ADMIN)
  async getQueueStatsByName(@Param('queueName') queueName: string) {
    return this.queueManagerService.getQueueStats(queueName);
  }

  @Get('jobs/:queueName')
  @ApiOperation({ summary: 'Get jobs for a specific queue' })
  @ApiResponse({ status: 200, description: 'Queue jobs' })
  async getQueueJobs(
    @Param('queueName') queueName: string,
    @Query('status') status: string,
    @Req() req: Request,
  ) {
    return this.queueManagerService.getUserJobs(queueName, req.user.sub, status);
  }

  @Get('job/:queueName/:jobId')
  @ApiOperation({ summary: 'Get a specific job' })
  @ApiResponse({ status: 200, description: 'Job details' })
  async getJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ) {
    const job = await this.queueManagerService.getJob(queueName, jobId);
    
    // Check if job belongs to user or user is admin
    if (job.data._metadata?.userId !== req.user.sub && !req.user.roles.includes(UserRole.ADMIN)) {
      return { error: 'Unauthorized' };
    }
    
    return job;
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up old jobs' })
  @ApiResponse({ status: 200, description: 'Jobs cleaned up' })
  @Roles(UserRole.ADMIN)
  async cleanupJobs() {
    await this.queueManagerService.cleanupJobs();
    return { message: 'Jobs cleaned up successfully' };
  }

  // Rate limiter endpoints
  @Get('rate-limits')
  @ApiOperation({ summary: 'Get rate limit status for all platforms' })
  @ApiResponse({ status: 200, description: 'Rate limit status' })
  async getRateLimits(@Req() req: Request) {
    return this.rateLimiterService.getAllForUser(req.user.sub);
  }

  @Get('rate-limits/:platform')
  @ApiOperation({ summary: 'Get rate limit status for a specific platform' })
  @ApiResponse({ status: 200, description: 'Rate limit status' })
  async getRateLimitByPlatform(
    @Param('platform') platform: string,
    @Req() req: Request,
  ) {
    return this.rateLimiterService.getStatus(platform, req.user.sub);
  }

  @Post('rate-limits/:platform/reset')
  @ApiOperation({ summary: 'Reset rate limit for a platform' })
  @ApiResponse({ status: 200, description: 'Rate limit reset' })
  @Roles(UserRole.ADMIN)
  async resetRateLimit(
    @Param('platform') platform: string,
    @Body('userId') userId: string,
  ) {
    const success = await this.rateLimiterService.reset(platform, userId);
    return { success, message: success ? 'Rate limit reset successfully' : 'Failed to reset rate limit' };
  }

  // Circuit breaker endpoints
  @Get('circuit-breakers')
  @ApiOperation({ summary: 'Get circuit breaker status for all platforms' })
  @ApiResponse({ status: 200, description: 'Circuit breaker status' })
  @Roles(UserRole.ADMIN)
  async getCircuitBreakers() {
    return this.circuitBreakerService.getAllStatuses();
  }

  @Get('circuit-breakers/:platform')
  @ApiOperation({ summary: 'Get circuit breaker status for a specific platform' })
  @ApiResponse({ status: 200, description: 'Circuit breaker status' })
  @Roles(UserRole.ADMIN)
  async getCircuitBreakerByPlatform(@Param('platform') platform: string) {
    return this.circuitBreakerService.getStatus(platform);
  }

  @Post('circuit-breakers/:platform/reset')
  @ApiOperation({ summary: 'Reset circuit breaker for a platform' })
  @ApiResponse({ status: 200, description: 'Circuit breaker reset' })
  @Roles(UserRole.ADMIN)
  async resetCircuitBreaker(@Param('platform') platform: string) {
    await this.circuitBreakerService.reset(platform);
    return { message: 'Circuit breaker reset successfully' };
  }

  // Monitoring endpoints
  @Get('metrics/:queueName')
  @ApiOperation({ summary: 'Get latest metrics for a queue' })
  @ApiResponse({ status: 200, description: 'Queue metrics' })
  @Roles(UserRole.ADMIN)
  async getQueueMetrics(@Param('queueName') queueName: string) {
    return this.queueMonitoringService.getLatestMetrics(queueName);
  }

  @Get('metrics/:queueName/history')
  @ApiOperation({ summary: 'Get historical metrics for a queue' })
  @ApiResponse({ status: 200, description: 'Historical queue metrics' })
  @Roles(UserRole.ADMIN)
  async getQueueMetricsHistory(
    @Param('queueName') queueName: string,
    @Query('hours') hours: number = 24,
  ) {
    return this.queueMonitoringService.getHistoricalMetrics(queueName, hours);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiResponse({ status: 200, description: 'Recent alerts' })
  @Roles(UserRole.ADMIN)
  async getAlerts(@Query('limit') limit: number = 10) {
    return this.queueMonitoringService.getRecentAlerts(limit);
  }

  // Job submission endpoints
  @Post('linkedin-scraper')
  @ApiOperation({ summary: 'Add a job to the LinkedIn scraper queue' })
  @ApiResponse({ status: 201, description: 'Job added to queue' })
  @HttpCode(HttpStatus.CREATED)
  async addLinkedInScraperJob(
    @Body() data: any,
    @Body('priority') priority: number,
    @Req() req: Request,
  ) {
    const jobId = await this.queueManagerService.addLinkedInScraperJob(data, {
      userId: req.user.sub,
      priority,
    });
    
    return { jobId, message: 'Job added to LinkedIn scraper queue' };
  }

  @Post('infojobs-scraper')
  @ApiOperation({ summary: 'Add a job to the InfoJobs scraper queue' })
  @ApiResponse({ status: 201, description: 'Job added to queue' })
  @HttpCode(HttpStatus.CREATED)
  async addInfoJobsScraperJob(
    @Body() data: any,
    @Body('priority') priority: number,
    @Req() req: Request,
  ) {
    const jobId = await this.queueManagerService.addInfoJobsScraperJob(data, {
      userId: req.user.sub,
      priority,
    });
    
    return { jobId, message: 'Job added to InfoJobs scraper queue' };
  }

  @Post('catho-scraper')
  @ApiOperation({ summary: 'Add a job to the Catho scraper queue' })
  @ApiResponse({ status: 201, description: 'Job added to queue' })
  @HttpCode(HttpStatus.CREATED)
  async addCathoScraperJob(
    @Body() data: any,
    @Body('priority') priority: number,
    @Req() req: Request,
  ) {
    const jobId = await this.queueManagerService.addCathoScraperJob(data, {
      userId: req.user.sub,
      priority,
    });
    
    return { jobId, message: 'Job added to Catho scraper queue' };
  }

  @Post('indeed-scraper')
  @ApiOperation({ summary: 'Add a job to the Indeed scraper queue' })
  @ApiResponse({ status: 201, description: 'Job added to queue' })
  @HttpCode(HttpStatus.CREATED)
  async addIndeedScraperJob(
    @Body() data: any,
    @Body('priority') priority: number,
    @Req() req: Request,
  ) {
    const jobId = await this.queueManagerService.addIndeedScraperJob(data, {
      userId: req.user.sub,
      priority,
    });
    
    return { jobId, message: 'Job added to Indeed scraper queue' };
  }

  @Post('auto-apply')
  @ApiOperation({ summary: 'Add a job to the auto-apply queue' })
  @ApiResponse({ status: 201, description: 'Job added to queue' })
  @HttpCode(HttpStatus.CREATED)
  async addAutoApplyJob(
    @Body() data: any,
    @Body('priority') priority: number,
    @Req() req: Request,
  ) {
    const jobId = await this.queueManagerService.addAutoApplyJob(data, {
      userId: req.user.sub,
      priority,
    });
    
    return { jobId, message: 'Job added to auto-apply queue' };
  }
}
