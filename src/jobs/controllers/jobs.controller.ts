import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from '../services/jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { SearchJobsDto } from '../dto/search-jobs.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar uma nova vaga' })
  @ApiResponse({ status: 201, description: 'Vaga criada com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas empresas podem criar vagas' })
  async create(@Req() req: Request, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(req.user.sub, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar vagas com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de vagas' })
  async findAll(@Query() searchJobsDto: SearchJobsDto) {
    return this.jobsService.findAll(searchJobsDto);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter vagas recomendadas para o usuário' })
  @ApiResponse({ status: 200, description: 'Lista de vagas recomendadas' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de vagas a retornar' })
  async getRecommendedJobs(
    @Req() req: Request,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.getRecommendedJobs(req.user.sub, limit);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter vagas da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de vagas da empresa' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  async getCompanyJobs(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.getCompanyJobs(req.user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma vaga' })
  @ApiResponse({ status: 200, description: 'Detalhes da vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const job = await this.jobsService.findOne(id);
    
    // Increment view count
    await this.jobsService.incrementViewCount(id);
    
    return job;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar uma vaga' })
  @ApiResponse({ status: 200, description: 'Vaga atualizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para editar esta vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, req.user.sub, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir uma vaga' })
  @ApiResponse({ status: 204, description: 'Vaga excluída com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para excluir esta vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.jobsService.remove(id, req.user.sub);
  }

  @Patch(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar/desativar uma vaga' })
  @ApiResponse({ status: 200, description: 'Status da vaga alterado com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para alterar esta vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body('isActive') isActive: boolean,
  ) {
    return this.jobsService.toggleActive(id, req.user.sub, isActive);
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de uma vaga' })
  @ApiResponse({ status: 200, description: 'Estatísticas da vaga' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para ver estatísticas desta vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async getJobStatistics(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.jobsService.getJobStatistics(id, req.user.sub);
  }

  @Post(':id/impression')
  @ApiOperation({ summary: 'Registrar impressão de uma vaga' })
  @ApiResponse({ status: 204, description: 'Impressão registrada com sucesso' })
  @HttpCode(204)
  async recordImpression(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobsService.incrementImpressionCount(id);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Registrar clique em uma vaga' })
  @ApiResponse({ status: 204, description: 'Clique registrado com sucesso' })
  @HttpCode(204)
  async recordClick(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobsService.incrementClickCount(id);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar salvamento de uma vaga' })
  @ApiResponse({ status: 204, description: 'Salvamento registrado com sucesso' })
  @HttpCode(204)
  async recordSave(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobsService.incrementSaveCount(id);
  }
}
