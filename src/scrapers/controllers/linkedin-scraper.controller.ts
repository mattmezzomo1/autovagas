import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LinkedInScraperService } from '../services/linkedin-scraper.service';
import { ScraperJobService } from '../services/scraper-job.service';
import { Request } from 'express';

@ApiTags('linkedin-scraper')
@Controller('scrapers/linkedin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LinkedInScraperController {
  constructor(
    private readonly linkedInScraperService: LinkedInScraperService,
    private readonly scraperJobService: ScraperJobService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to LinkedIn' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Login failed' })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() req: Request,
  ) {
    return this.linkedInScraperService.login(email, password, req.user.sub);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for jobs on LinkedIn' })
  @ApiResponse({ status: 200, description: 'Search job created' })
  async searchJobs(
    @Body('keywords') keywords: string,
    @Body('location') location: string,
    @Body('filters') filters: any,
    @Req() req: Request,
  ) {
    return this.linkedInScraperService.searchJobs(req.user.sub, keywords, location, filters);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get job details from LinkedIn' })
  @ApiResponse({ status: 200, description: 'Job details retrieval started' })
  async getJobDetails(
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ) {
    return this.linkedInScraperService.getJobDetails(req.user.sub, jobId);
  }

  @Post('apply/:jobId')
  @ApiOperation({ summary: 'Apply to a job on LinkedIn' })
  @ApiResponse({ status: 200, description: 'Job application started' })
  async applyToJob(
    @Param('jobId') jobId: string,
    @Body('coverLetter') coverLetter: string,
    @Body('resumeUrl') resumeUrl: string,
    @Req() req: Request,
  ) {
    return this.linkedInScraperService.applyToJob(req.user.sub, jobId, coverLetter, resumeUrl);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get user\'s scraper jobs' })
  @ApiResponse({ status: 200, description: 'List of scraper jobs' })
  async getUserJobs(
    @Req() req: Request,
    @Query('limit') limit: number = 10,
  ) {
    const jobs = await this.scraperJobService.findUserJobs(req.user.sub, limit);
    return { jobs };
  }

  @Get('job-status/:id')
  @ApiOperation({ summary: 'Get status of a scraper job' })
  @ApiResponse({ status: 200, description: 'Job status' })
  async getJobStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const job = await this.scraperJobService.findById(id);
    
    // Ensure the job belongs to the user
    if (job.userId !== req.user.sub) {
      return { error: 'Job not found' };
    }
    
    return { job };
  }
}
