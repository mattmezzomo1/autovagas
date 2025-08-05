import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';
import { AutoApplyService } from '../services/auto-apply.service';
import { AutoApplyExecutorService } from '../services/auto-apply-executor.service';
import { UpdateAutoApplyConfigDto } from '../dto/update-auto-apply-config.dto';
import { GetAutoApplyHistoryDto } from '../dto/get-auto-apply-history.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

@ApiTags('auto-apply')
@Controller('auto-apply')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CANDIDATE)
@ApiBearerAuth()
export class AutoApplyController {
  constructor(
    private readonly autoApplyService: AutoApplyService,
    private readonly autoApplyExecutorService: AutoApplyExecutorService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'Obter configuração de auto-apply' })
  @ApiResponse({ status: 200, description: 'Configuração de auto-apply' })
  async getConfig(@Req() req: Request) {
    return this.autoApplyService.getConfig(req.user.sub);
  }

  @Put('config')
  @ApiOperation({ summary: 'Atualizar configuração de auto-apply' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou limite excedido' })
  async updateConfig(
    @Req() req: Request,
    @Body() updateDto: UpdateAutoApplyConfigDto,
  ) {
    return this.autoApplyService.updateConfig(req.user.sub, updateDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obter histórico de auto-apply' })
  @ApiResponse({ status: 200, description: 'Histórico de auto-apply' })
  async getHistory(
    @Req() req: Request,
    @Query() filters: GetAutoApplyHistoryDto,
  ) {
    return this.autoApplyService.getHistory(req.user.sub, filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obter estatísticas de auto-apply' })
  @ApiResponse({ status: 200, description: 'Estatísticas de auto-apply' })
  async getStatistics(@Req() req: Request) {
    return this.autoApplyService.getStatistics(req.user.sub);
  }

  @Post('run')
  @ApiOperation({ summary: 'Executar auto-apply manualmente' })
  @ApiResponse({ status: 202, description: 'Auto-apply iniciado' })
  @ApiResponse({ status: 400, description: 'Auto-apply desabilitado ou limite excedido' })
  @HttpCode(202)
  async runAutoApply(@Req() req: Request) {
    // Verificar se auto-apply está habilitado
    const config = await this.autoApplyService.getConfig(req.user.sub);

    if (!config.isEnabled) {
      throw new BadRequestException('Auto-apply está desabilitado. Habilite-o nas configurações.');
    }

    // Verificar limites
    if (config.applicationsToday >= config.maxApplicationsPerDay) {
      throw new BadRequestException(`Limite diário de ${config.maxApplicationsPerDay} aplicações atingido.`);
    }

    if (config.applicationsThisMonth >= config.maxApplicationsPerMonth) {
      throw new BadRequestException(`Limite mensal de ${config.maxApplicationsPerMonth} aplicações atingido.`);
    }

    // Iniciar processo de auto-apply em segundo plano
    // Em um cenário real, você usaria uma fila de tarefas como Bull ou similar
    setTimeout(() => {
      // Verificar se o módulo de integração com o LinkedIn está disponível
      try {
        const autoApplyIntegrationService = this.moduleRef.get('AutoApplyIntegrationService', { strict: false });
        if (autoApplyIntegrationService) {
          autoApplyIntegrationService.executeAutoApplyForUser(req.user.sub)
            .catch(error => console.error(`Erro ao executar auto-apply com LinkedIn: ${error.message}`));
        } else {
          this.autoApplyExecutorService.executeAutoApply(req.user.sub)
            .catch(error => console.error(`Erro ao executar auto-apply: ${error.message}`));
        }
      } catch (error) {
        // Fallback para o executor padrão se o serviço de integração não estiver disponível
        this.autoApplyExecutorService.executeAutoApply(req.user.sub)
          .catch(error => console.error(`Erro ao executar auto-apply: ${error.message}`));
      }
    }, 0);

    return {
      message: 'Auto-apply iniciado. O processo será executado em segundo plano.',
      status: 'PROCESSING',
      config: {
        isEnabled: config.isEnabled,
        applicationsToday: config.applicationsToday,
        maxApplicationsPerDay: config.maxApplicationsPerDay,
        applicationsThisMonth: config.applicationsThisMonth,
        maxApplicationsPerMonth: config.maxApplicationsPerMonth,
      },
    };
  }

  @Post('test-match')
  @ApiOperation({ summary: 'Testar correspondência de auto-apply com uma vaga' })
  @ApiResponse({ status: 200, description: 'Resultado do teste de correspondência' })
  async testMatch(
    @Req() req: Request,
    @Body('jobId') jobId: string,
  ) {
    if (!jobId) {
      throw new BadRequestException('ID da vaga é obrigatório');
    }

    // Obter configuração de auto-apply
    const config = await this.autoApplyService.getConfig(req.user.sub);

    // Obter detalhes da vaga
    const job = await this.autoApplyExecutorService['jobsRepository'].findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException(`Vaga com ID ${jobId} não encontrada`);
    }

    // Calcular pontuação de correspondência
    const matchScore = this.autoApplyExecutorService['calculateMatchScore'](job, config);

    return {
      jobId,
      matchScore,
      wouldApply: matchScore >= config.matchThreshold,
      threshold: config.matchThreshold,
      config: {
        keywords: config.keywords,
        locations: config.locations,
        industries: config.industries,
        excludedKeywords: config.excludedKeywords,
        excludedCompanies: config.excludedCompanies,
        jobTypes: config.jobTypes,
        workModels: config.workModels,
        salaryMin: config.salaryMin,
        experienceMax: config.experienceMax,
      },
      job: {
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType,
        workModel: job.workModel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skills: job.skills,
        industry: job.industry,
        experienceYears: job.experienceYears,
      },
    };
  }
}
