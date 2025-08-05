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
import { CathoScraperService } from '../services/catho-scraper.service';
import { ScraperJobService } from '../services/scraper-job.service';
import { Request } from 'express';

@ApiTags('catho-scraper')
@Controller('scrapers/catho')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CathoScraperController {
  constructor(
    private readonly cathoScraperService: CathoScraperService,
    private readonly scraperJobService: ScraperJobService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login no Catho' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido' })
  @ApiResponse({ status: 400, description: 'Login falhou' })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() req: Request,
  ) {
    return this.cathoScraperService.login(email, password, req.user.sub);
  }

  @Post('search')
  @ApiOperation({ summary: 'Buscar vagas no Catho' })
  @ApiResponse({ status: 200, description: 'Busca iniciada' })
  async searchJobs(
    @Body('keywords') keywords: string,
    @Body('location') location: string,
    @Body('filters') filters: any,
    @Req() req: Request,
  ) {
    return this.cathoScraperService.searchJobs(req.user.sub, keywords, location, filters);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Obter detalhes de uma vaga no Catho' })
  @ApiResponse({ status: 200, description: 'Busca de detalhes iniciada' })
  async getJobDetails(
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ) {
    return this.cathoScraperService.getJobDetails(req.user.sub, jobId);
  }

  @Post('apply/:jobId')
  @ApiOperation({ summary: 'Candidatar-se a uma vaga no Catho' })
  @ApiResponse({ status: 200, description: 'Candidatura iniciada' })
  async applyToJob(
    @Param('jobId') jobId: string,
    @Body('coverLetter') coverLetter: string,
    @Body('resumeUrl') resumeUrl: string,
    @Req() req: Request,
  ) {
    return this.cathoScraperService.applyToJob(req.user.sub, jobId, coverLetter, resumeUrl);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Obter trabalhos de scraping do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de trabalhos de scraping' })
  async getUserJobs(
    @Req() req: Request,
    @Query('limit') limit: number = 10,
  ) {
    const jobs = await this.scraperJobService.findUserJobs(req.user.sub, limit);
    return { jobs };
  }

  @Get('job-status/:id')
  @ApiOperation({ summary: 'Obter status de um trabalho de scraping' })
  @ApiResponse({ status: 200, description: 'Status do trabalho' })
  async getJobStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const job = await this.scraperJobService.findById(id);
    
    // Ensure the job belongs to the user
    if (job.userId !== req.user.sub) {
      return { error: 'Trabalho não encontrado' };
    }
    
    return { job };
  }
}
