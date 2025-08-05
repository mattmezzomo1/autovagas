import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AutoApplyService } from './auto-apply.service';
import { AutoApplyConfig } from '../entities/auto-apply-config.entity';
import { AutoApplyStatus, AutoApplyReason } from '../entities/auto-apply-history.entity';
import { Job } from '../../jobs/entities/job.entity';
import { ApplicationsService } from '../../jobs/services/applications.service';

@Injectable()
export class AutoApplyExecutorService {
  private readonly logger = new Logger(AutoApplyExecutorService.name);

  constructor(
    private autoApplyService: AutoApplyService,
    private applicationsService: ApplicationsService,
    @InjectRepository(AutoApplyConfig)
    private autoApplyConfigRepository: Repository<AutoApplyConfig>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async executeAutoApply(userId: string): Promise<void> {
    this.logger.log(`Iniciando execução de auto-apply para usuário ${userId}`);

    // Obter configuração de auto-apply
    const config = await this.autoApplyService.getConfig(userId);

    // Verificar se auto-apply está habilitado
    if (!config.isEnabled) {
      this.logger.log(`Auto-apply desabilitado para usuário ${userId}`);
      return;
    }

    // Verificar limites diários e mensais
    if (config.applicationsToday >= config.maxApplicationsPerDay) {
      this.logger.log(`Limite diário de auto-apply atingido para usuário ${userId}`);
      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.SKIPPED,
        AutoApplyReason.LIMIT_REACHED,
        'Limite diário de aplicações atingido',
      );
      return;
    }

    if (config.applicationsThisMonth >= config.maxApplicationsPerMonth) {
      this.logger.log(`Limite mensal de auto-apply atingido para usuário ${userId}`);
      await this.autoApplyService.recordHistory(
        userId,
        null,
        AutoApplyStatus.SKIPPED,
        AutoApplyReason.LIMIT_REACHED,
        'Limite mensal de aplicações atingido',
      );
      return;
    }

    // Buscar vagas que correspondem aos critérios
    const jobs = await this.findMatchingJobs(config);
    this.logger.log(`Encontradas ${jobs.length} vagas correspondentes para usuário ${userId}`);

    // Processar cada vaga
    for (const job of jobs) {
      await this.processJob(userId, job, config);

      // Verificar limites novamente após cada aplicação
      if (config.applicationsToday >= config.maxApplicationsPerDay) {
        this.logger.log(`Limite diário de auto-apply atingido durante processamento para usuário ${userId}`);
        break;
      }
    }

    this.logger.log(`Execução de auto-apply concluída para usuário ${userId}`);
  }

  private async findMatchingJobs(config: AutoApplyConfig): Promise<Job[]> {
    // Construir query para buscar vagas correspondentes
    const query: any = {
      isActive: true,
    };

    // Filtrar por tipos de contratação
    if (config.jobTypes && config.jobTypes.length > 0) {
      query.jobType = In(config.jobTypes);
    }

    // Filtrar por modelos de trabalho
    if (config.workModels && config.workModels.length > 0) {
      query.workModel = In(config.workModels);
    }

    // Filtrar por salário mínimo
    if (config.salaryMin) {
      query.salaryMax = MoreThanOrEqual(config.salaryMin);
    }

    // Filtrar por experiência máxima
    if (config.experienceMax) {
      query.experienceYears = LessThanOrEqual(config.experienceMax);
    }

    // Buscar vagas
    const jobs = await this.jobsRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });

    // Filtrar por palavras-chave, localizações e indústrias
    // (Isso é feito em memória para maior flexibilidade)
    return jobs.filter(job => {
      // Verificar correspondência de palavras-chave
      if (config.keywords) {
        const keywords = config.keywords.toLowerCase().split(',').map(k => k.trim());
        const jobText = `${job.title} ${job.description} ${job.skills}`.toLowerCase();
        
        if (!keywords.some(keyword => jobText.includes(keyword))) {
          return false;
        }
      }

      // Verificar correspondência de localizações
      if (config.locations) {
        const locations = config.locations.toLowerCase().split(',').map(l => l.trim());
        const jobLocation = job.location.toLowerCase();
        
        if (!locations.some(location => jobLocation.includes(location))) {
          return false;
        }
      }

      // Verificar correspondência de indústrias
      if (config.industries) {
        const industries = config.industries.toLowerCase().split(',').map(i => i.trim());
        const jobIndustry = job.industry.toLowerCase();
        
        if (!industries.some(industry => jobIndustry.includes(industry))) {
          return false;
        }
      }

      // Verificar palavras-chave excluídas
      if (config.excludedKeywords) {
        const excludedKeywords = config.excludedKeywords.toLowerCase().split(',').map(k => k.trim());
        const jobText = `${job.title} ${job.description} ${job.skills}`.toLowerCase();
        
        if (excludedKeywords.some(keyword => jobText.includes(keyword))) {
          return false;
        }
      }

      // Verificar empresas excluídas
      if (config.excludedCompanies) {
        const excludedCompanies = config.excludedCompanies.toLowerCase().split(',').map(c => c.trim());
        const jobCompany = job.companyName.toLowerCase();
        
        if (excludedCompanies.some(company => jobCompany.includes(company))) {
          return false;
        }
      }

      return true;
    });
  }

  private async processJob(userId: string, job: Job, config: AutoApplyConfig): Promise<void> {
    try {
      // Calcular pontuação de correspondência
      const matchScore = this.calculateMatchScore(job, config);
      
      // Verificar se a pontuação é suficiente
      if (matchScore < config.matchThreshold) {
        await this.autoApplyService.recordHistory(
          userId,
          job.id,
          AutoApplyStatus.SKIPPED,
          AutoApplyReason.LOW_MATCH,
          `Pontuação de correspondência (${matchScore}) abaixo do limiar (${config.matchThreshold})`,
          matchScore,
        );
        return;
      }

      // Verificar se já se candidatou a esta vaga
      try {
        // Tentar se candidatar à vaga
        const application = await this.applicationsService.apply(userId, {
          jobId: job.id,
          coverLetter: config.defaultCoverLetter,
          resumeUrl: config.defaultResumeUrl,
        });

        // Registrar sucesso
        await this.autoApplyService.recordHistory(
          userId,
          job.id,
          AutoApplyStatus.SUCCESS,
          AutoApplyReason.APPLIED,
          `Candidatura realizada com sucesso. Pontuação de correspondência: ${matchScore}`,
          matchScore,
          application.id,
        );
      } catch (error) {
        // Verificar se o erro é porque já se candidatou
        if (error.message && error.message.includes('já se candidatou')) {
          await this.autoApplyService.recordHistory(
            userId,
            job.id,
            AutoApplyStatus.SKIPPED,
            AutoApplyReason.ALREADY_APPLIED,
            'Já se candidatou a esta vaga',
            matchScore,
          );
        } else {
          // Outro tipo de erro
          await this.autoApplyService.recordHistory(
            userId,
            job.id,
            AutoApplyStatus.FAILED,
            AutoApplyReason.ERROR,
            `Erro ao se candidatar: ${error.message}`,
            matchScore,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar vaga ${job.id} para usuário ${userId}: ${error.message}`);
      
      await this.autoApplyService.recordHistory(
        userId,
        job.id,
        AutoApplyStatus.FAILED,
        AutoApplyReason.ERROR,
        `Erro ao processar vaga: ${error.message}`,
      );
    }
  }

  private calculateMatchScore(job: Job, config: AutoApplyConfig): number {
    // Esta é uma implementação simplificada de cálculo de pontuação
    // Em um cenário real, você usaria um algoritmo mais sofisticado
    
    let score = 0;
    const maxScore = 10;
    
    // Correspondência de palavras-chave
    if (config.keywords) {
      const keywords = config.keywords.toLowerCase().split(',').map(k => k.trim());
      const jobText = `${job.title} ${job.description} ${job.skills}`.toLowerCase();
      
      const keywordMatches = keywords.filter(keyword => jobText.includes(keyword)).length;
      const keywordScore = (keywordMatches / keywords.length) * 5; // Peso 5
      
      score += keywordScore;
    } else {
      // Se não há palavras-chave, dar pontuação média
      score += 2.5;
    }
    
    // Correspondência de localização
    if (config.locations) {
      const locations = config.locations.toLowerCase().split(',').map(l => l.trim());
      const jobLocation = job.location.toLowerCase();
      
      const locationMatches = locations.some(location => jobLocation.includes(location));
      const locationScore = locationMatches ? 2 : 0; // Peso 2
      
      score += locationScore;
    } else {
      // Se não há localizações, dar pontuação média
      score += 1;
    }
    
    // Correspondência de indústria
    if (config.industries) {
      const industries = config.industries.toLowerCase().split(',').map(i => i.trim());
      const jobIndustry = job.industry.toLowerCase();
      
      const industryMatches = industries.some(industry => jobIndustry.includes(industry));
      const industryScore = industryMatches ? 1.5 : 0; // Peso 1.5
      
      score += industryScore;
    } else {
      // Se não há indústrias, dar pontuação média
      score += 0.75;
    }
    
    // Correspondência de salário
    if (config.salaryMin && job.salaryMax) {
      const salaryScore = job.salaryMax >= config.salaryMin ? 1.5 : 0; // Peso 1.5
      score += salaryScore;
    } else {
      // Se não há salário mínimo ou a vaga não tem salário máximo, dar pontuação média
      score += 0.75;
    }
    
    // Arredondar para o inteiro mais próximo e limitar ao máximo
    return Math.min(Math.round(score), maxScore);
  }
}
