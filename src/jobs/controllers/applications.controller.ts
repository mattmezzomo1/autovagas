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
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Candidatar-se a uma vaga' })
  @ApiResponse({ status: 201, description: 'Candidatura realizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Apenas candidatos podem se candidatar a vagas' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada ou não está ativa' })
  @ApiResponse({ status: 409, description: 'Você já se candidatou a esta vaga' })
  async apply(@Req() req: Request, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.apply(req.user.sub, createApplicationDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter candidaturas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de candidaturas do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  async findUserApplications(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.applicationsService.findUserApplications(req.user.sub, page, limit);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter candidaturas para uma vaga' })
  @ApiResponse({ status: 200, description: 'Lista de candidaturas para a vaga' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para ver candidaturas desta vaga' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  async findJobApplications(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.applicationsService.findJobApplications(jobId, req.user.sub, page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes de uma candidatura' })
  @ApiResponse({ status: 200, description: 'Detalhes da candidatura' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status de uma candidatura' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para atualizar esta candidatura' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, req.user.sub, updateStatusDto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar candidatura como lida' })
  @ApiResponse({ status: 200, description: 'Candidatura marcada como lida' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para atualizar esta candidatura' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.applicationsService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirar candidatura' })
  @ApiResponse({ status: 204, description: 'Candidatura retirada com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não tem permissão para retirar esta candidatura' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada' })
  @HttpCode(204)
  async withdraw(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.applicationsService.withdraw(id, req.user.sub);
  }

  @Get('statistics/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CANDIDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de candidaturas do usuário' })
  @ApiResponse({ status: 200, description: 'Estatísticas de candidaturas' })
  @ApiResponse({ status: 403, description: 'Apenas candidatos podem ver estatísticas de candidaturas' })
  async getApplicationStatistics(@Req() req: Request) {
    return this.applicationsService.getApplicationStatistics(req.user.sub);
  }
}
