import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { AutoApplyConfig } from '../entities/auto-apply-config.entity';
import { AutoApplyHistory, AutoApplyStatus, AutoApplyReason } from '../entities/auto-apply-history.entity';
import { User, SubscriptionPlan } from '../../users/entities/user.entity';
import { UpdateAutoApplyConfigDto } from '../dto/update-auto-apply-config.dto';
import { GetAutoApplyHistoryDto } from '../dto/get-auto-apply-history.dto';

@Injectable()
export class AutoApplyService {
  constructor(
    @InjectRepository(AutoApplyConfig)
    private autoApplyConfigRepository: Repository<AutoApplyConfig>,
    @InjectRepository(AutoApplyHistory)
    private autoApplyHistoryRepository: Repository<AutoApplyHistory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Limites de aplicações por plano
  private readonly planLimits = {
    [SubscriptionPlan.BASIC]: {
      daily: 5,
      monthly: 20,
    },
    [SubscriptionPlan.PLUS]: {
      daily: 15,
      monthly: 100,
    },
    [SubscriptionPlan.PREMIUM]: {
      daily: 30,
      monthly: 300,
    },
  };

  async getConfig(userId: string): Promise<AutoApplyConfig> {
    // Buscar configuração existente ou criar uma nova
    let config = await this.autoApplyConfigRepository.findOne({
      where: { userId },
    });

    if (!config) {
      // Obter o plano do usuário para definir os limites
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
      }

      const planLimits = this.planLimits[user.subscriptionPlan];

      // Criar configuração padrão
      config = this.autoApplyConfigRepository.create({
        userId,
        isEnabled: false,
        maxApplicationsPerDay: planLimits.daily,
        maxApplicationsPerMonth: planLimits.monthly,
        lastResetDay: new Date(),
        lastResetMonth: new Date(),
      });

      await this.autoApplyConfigRepository.save(config);
    }

    // Verificar e resetar contadores se necessário
    await this.checkAndResetCounters(config);

    return config;
  }

  async updateConfig(userId: string, updateDto: UpdateAutoApplyConfigDto): Promise<AutoApplyConfig> {
    const config = await this.getConfig(userId);

    // Atualizar configuração
    Object.assign(config, updateDto);

    // Obter o plano do usuário para verificar os limites
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const planLimits = this.planLimits[user.subscriptionPlan];

    // Verificar se os limites estão dentro do permitido para o plano
    if (updateDto.maxApplicationsPerDay !== undefined) {
      if (updateDto.maxApplicationsPerDay > planLimits.daily) {
        throw new BadRequestException(`O limite diário máximo para o plano ${user.subscriptionPlan} é ${planLimits.daily}`);
      }
      config.maxApplicationsPerDay = updateDto.maxApplicationsPerDay;
    }

    if (updateDto.maxApplicationsPerMonth !== undefined) {
      if (updateDto.maxApplicationsPerMonth > planLimits.monthly) {
        throw new BadRequestException(`O limite mensal máximo para o plano ${user.subscriptionPlan} é ${planLimits.monthly}`);
      }
      config.maxApplicationsPerMonth = updateDto.maxApplicationsPerMonth;
    }

    return this.autoApplyConfigRepository.save(config);
  }

  async getHistory(userId: string, filters: GetAutoApplyHistoryDto): Promise<any> {
    const {
      status,
      reason,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    // Construir condições de busca
    const where: FindOptionsWhere<AutoApplyHistory> = { userId };

    if (status) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    // Filtro de data
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    // Calcular paginação
    const skip = (page - 1) * limit;

    // Executar consulta
    const [history, total] = await this.autoApplyHistoryRepository.findAndCount({
      where,
      relations: ['job'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  async getStatistics(userId: string): Promise<any> {
    // Obter configuração
    const config = await this.getConfig(userId);

    // Obter estatísticas gerais
    const totalHistory = await this.autoApplyHistoryRepository.count({
      where: { userId },
    });

    const successCount = await this.autoApplyHistoryRepository.count({
      where: { userId, status: AutoApplyStatus.SUCCESS },
    });

    const failedCount = await this.autoApplyHistoryRepository.count({
      where: { userId, status: AutoApplyStatus.FAILED },
    });

    const skippedCount = await this.autoApplyHistoryRepository.count({
      where: { userId, status: AutoApplyStatus.SKIPPED },
    });

    // Obter contagem por motivo
    const reasonCounts = {};
    for (const reason of Object.values(AutoApplyReason)) {
      reasonCounts[reason] = await this.autoApplyHistoryRepository.count({
        where: { userId, reason },
      });
    }

    // Obter estatísticas por período
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.autoApplyHistoryRepository.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(today),
      },
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = await this.autoApplyHistoryRepository.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(thisMonth),
      },
    });

    // Obter o plano do usuário
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const planLimits = this.planLimits[user.subscriptionPlan];

    return {
      total: totalHistory,
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
      successRate: totalHistory > 0 ? (successCount / totalHistory) * 100 : 0,
      byReason: reasonCounts,
      today: {
        count: todayCount,
        limit: config.maxApplicationsPerDay,
        remaining: Math.max(0, config.maxApplicationsPerDay - config.applicationsToday),
        planLimit: planLimits.daily,
      },
      thisMonth: {
        count: thisMonthCount,
        limit: config.maxApplicationsPerMonth,
        remaining: Math.max(0, config.maxApplicationsPerMonth - config.applicationsThisMonth),
        planLimit: planLimits.monthly,
      },
      planLimits: this.planLimits[user.subscriptionPlan],
    };
  }

  async recordHistory(
    userId: string,
    jobId: string,
    status: AutoApplyStatus,
    reason: AutoApplyReason,
    details?: string,
    matchScore?: number,
    applicationId?: string,
  ): Promise<AutoApplyHistory> {
    const history = this.autoApplyHistoryRepository.create({
      userId,
      jobId,
      status,
      reason,
      details,
      matchScore,
      applicationId,
    });

    // Se for uma aplicação bem-sucedida, incrementar os contadores
    if (status === AutoApplyStatus.SUCCESS && reason === AutoApplyReason.APPLIED) {
      await this.incrementApplicationCounters(userId);
    }

    return this.autoApplyHistoryRepository.save(history);
  }

  async incrementApplicationCounters(userId: string): Promise<void> {
    const config = await this.getConfig(userId);

    // Incrementar contadores
    config.applicationsToday += 1;
    config.applicationsThisMonth += 1;

    await this.autoApplyConfigRepository.save(config);
  }

  async checkAndResetCounters(config: AutoApplyConfig): Promise<void> {
    const today = new Date();
    let updated = false;

    // Verificar se é um novo dia
    if (!config.lastResetDay || this.isNewDay(config.lastResetDay, today)) {
      config.applicationsToday = 0;
      config.lastResetDay = today;
      updated = true;
    }

    // Verificar se é um novo mês
    if (!config.lastResetMonth || this.isNewMonth(config.lastResetMonth, today)) {
      config.applicationsThisMonth = 0;
      config.lastResetMonth = today;
      updated = true;
    }

    if (updated) {
      await this.autoApplyConfigRepository.save(config);
    }
  }

  private isNewDay(lastReset: Date, now: Date): boolean {
    return (
      lastReset.getDate() !== now.getDate() ||
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    );
  }

  private isNewMonth(lastReset: Date, now: Date): boolean {
    return (
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    );
  }

  async updatePlanLimits(userId: string): Promise<void> {
    // Obter o usuário e sua configuração
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    const config = await this.getConfig(userId);

    // Obter os limites do plano
    const planLimits = this.planLimits[user.subscriptionPlan];

    // Atualizar os limites se necessário
    let updated = false;

    if (config.maxApplicationsPerDay > planLimits.daily) {
      config.maxApplicationsPerDay = planLimits.daily;
      updated = true;
    }

    if (config.maxApplicationsPerMonth > planLimits.monthly) {
      config.maxApplicationsPerMonth = planLimits.monthly;
      updated = true;
    }

    if (updated) {
      await this.autoApplyConfigRepository.save(config);
    }
  }
}
