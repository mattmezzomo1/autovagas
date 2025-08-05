import { UserProfile } from '../types/auth';
import { AutoApplyService, ApplicationResult, JobSearchParams, Platform, ScrapedJob, ScraperCredentials } from './webscraper';

/**
 * Eventos emitidos pelo serviço de robô de auto-aplicação
 */
export interface AutoApplyRobotEvents {
  onStart: () => void;
  onStop: () => void;
  onJobFound: (job: ScrapedJob) => void;
  onJobAnalyzed: (job: ScrapedJob & { matchScore: number }) => void;
  onJobApplied: (result: ApplicationResult) => void;
  onError: (error: Error) => void;
  onComplete: (results: ApplicationResult[]) => void;
}

/**
 * Configuração do robô de auto-aplicação
 */
export interface AutoApplyRobotConfig {
  platforms: {
    linkedin?: ScraperCredentials;
    infojobs?: ScraperCredentials;
    catho?: ScraperCredentials;
  };
  searchParams: JobSearchParams;
  matchThreshold: number;
  maxApplicationsPerDay: number;
  runInterval: number; // Em milissegundos
  headless: boolean;
}

/**
 * Serviço de gerenciamento do robô de auto-aplicação
 */
export class AutoApplyRobotService {
  private autoApplyService: AutoApplyService;
  private config: AutoApplyRobotConfig | null = null;
  private isActive: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastRunDate: Date | null = null;
  private todayApplicationCount: number = 0;
  private events: Partial<AutoApplyRobotEvents> = {};
  private appliedJobs: ApplicationResult[] = [];

  constructor() {
    this.autoApplyService = new AutoApplyService();
  }

  /**
   * Configura o robô de auto-aplicação
   */
  async configure(config: AutoApplyRobotConfig): Promise<void> {
    this.config = config;

    // Inicializa o serviço de auto-aplicação com emulação humana
    await this.autoApplyService.initialize({
      headless: config.headless,
      timeout: 30000,
      maxRetries: 3,
      delayBetweenActions: 1000,
      humanEmulation: true,
      randomizeUserAgent: true,
      useProxy: false,
      viewportWidth: 1366 + Math.floor(Math.random() * 300),  // Tamanho de tela aleatório para parecer mais humano
      viewportHeight: 768 + Math.floor(Math.random() * 200),
      minDelayMs: 800,
      maxDelayMs: 5000
    });

    // Configura as credenciais para cada plataforma
    if (config.platforms.linkedin) {
      this.autoApplyService.setCredentials('linkedin', config.platforms.linkedin);
    }

    if (config.platforms.infojobs) {
      this.autoApplyService.setCredentials('infojobs', config.platforms.infojobs);
    }

    if (config.platforms.catho) {
      this.autoApplyService.setCredentials('catho', config.platforms.catho);
    }

    console.log('Robô de auto-aplicação configurado com sucesso');
  }

  /**
   * Registra handlers para os eventos do robô
   */
  on<K extends keyof AutoApplyRobotEvents>(event: K, handler: AutoApplyRobotEvents[K]): void {
    this.events[event] = handler;
  }

  /**
   * Emite um evento
   */
  private emit<K extends keyof AutoApplyRobotEvents>(event: K, ...args: Parameters<AutoApplyRobotEvents[K]>): void {
    const handler = this.events[event] as (...args: any[]) => void;
    if (handler) {
      handler(...args);
    }
  }

  /**
   * Ativa o robô de auto-aplicação
   */
  async activate(profile: UserProfile): Promise<boolean> {
    if (this.isActive) {
      console.log('O robô de auto-aplicação já está ativo');
      return true;
    }

    if (!this.config) {
      console.error('O robô de auto-aplicação não foi configurado');
      return false;
    }

    try {
      this.isActive = true;
      this.emit('onStart');

      // Inicia o intervalo de execução
      this.intervalId = setInterval(() => this.run(profile), this.config.runInterval);

      // Executa imediatamente a primeira vez
      await this.run(profile);

      console.log('Robô de auto-aplicação ativado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao ativar o robô de auto-aplicação:', error);
      this.isActive = false;
      this.emit('onError', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Desativa o robô de auto-aplicação
   */
  async deactivate(): Promise<void> {
    if (!this.isActive) {
      console.log('O robô de auto-aplicação já está inativo');
      return;
    }

    try {
      // Limpa o intervalo
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Interrompe qualquer processo em andamento
      this.autoApplyService.stopAutoApply();

      this.isActive = false;
      this.emit('onStop');

      console.log('Robô de auto-aplicação desativado com sucesso');
    } catch (error) {
      console.error('Erro ao desativar o robô de auto-aplicação:', error);
      this.emit('onError', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Executa uma iteração do robô de auto-aplicação
   */
  private async run(profile: UserProfile): Promise<void> {
    if (!this.isActive || !this.config) {
      return;
    }

    try {
      // Verifica se já atingiu o limite diário de aplicações
      const today = new Date().toDateString();
      const lastRunDay = this.lastRunDate ? this.lastRunDate.toDateString() : null;

      if (today !== lastRunDay) {
        // Reinicia o contador para o novo dia
        this.todayApplicationCount = 0;
      }

      if (this.todayApplicationCount >= this.config.maxApplicationsPerDay) {
        console.log(`Limite diário de aplicações atingido (${this.config.maxApplicationsPerDay})`);
        return;
      }

      // Atualiza a data da última execução
      this.lastRunDate = new Date();

      // Busca vagas em todas as plataformas configuradas
      const jobs = await this.autoApplyService.searchJobsAll(this.config.searchParams);

      // Notifica sobre as vagas encontradas
      for (const job of jobs) {
        this.emit('onJobFound', job);
      }

      // Analisa a compatibilidade de cada vaga
      const analyzedJobs = jobs.map(job => {
        const matchScore = this.autoApplyService.analyzeJobMatch(job, profile);
        const analyzedJob = { ...job, matchScore };
        this.emit('onJobAnalyzed', analyzedJob);
        return analyzedJob;
      });

      // Filtra as vagas com pontuação acima do limiar
      const matchedJobs = analyzedJobs
        .filter(job => job.matchScore !== undefined && job.matchScore >= this.config.matchThreshold)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      console.log(`${matchedJobs.length} vagas compatíveis encontradas`);

      // Limita o número de aplicações para não ultrapassar o limite diário
      const remainingApplications = this.config.maxApplicationsPerDay - this.todayApplicationCount;
      const jobsToApply = matchedJobs.slice(0, remainingApplications);

      // Aplica para cada vaga
      for (const job of jobsToApply) {
        try {
          const result = await this.autoApplyService.applyToJob(job, profile);

          if (result.success) {
            this.todayApplicationCount++;
            this.appliedJobs.push(result);
            this.emit('onJobApplied', result);
            console.log(`Aplicação realizada com sucesso para a vaga: ${job.title}`);
          } else {
            console.error(`Falha na aplicação para a vaga: ${job.title} - ${result.error}`);
          }

          // Adiciona um atraso entre as aplicações para parecer mais humano
          await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
        } catch (error) {
          console.error(`Erro ao aplicar para a vaga ${job.title}:`, error);
          this.emit('onError', error instanceof Error ? error : new Error(String(error)));
        }
      }

      // Notifica sobre a conclusão da execução
      this.emit('onComplete', this.appliedJobs);
    } catch (error) {
      console.error('Erro durante a execução do robô de auto-aplicação:', error);
      this.emit('onError', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Verifica se o robô está ativo
   */
  isRobotActive(): boolean {
    return this.isActive;
  }

  /**
   * Obtém as aplicações realizadas pelo robô
   */
  getAppliedJobs(): ApplicationResult[] {
    return [...this.appliedJobs];
  }

  /**
   * Obtém o número de aplicações realizadas hoje
   */
  getTodayApplicationCount(): number {
    const today = new Date().toDateString();
    const lastRunDay = this.lastRunDate ? this.lastRunDate.toDateString() : null;

    if (today !== lastRunDay) {
      this.todayApplicationCount = 0;
    }

    return this.todayApplicationCount;
  }

  /**
   * Verifica o status de uma aplicação
   */
  async checkApplicationStatus(platform: Platform, applicationId: string): Promise<string> {
    return this.autoApplyService.checkApplicationStatus(platform, applicationId);
  }

  /**
   * Libera recursos utilizados pelo robô
   */
  async dispose(): Promise<void> {
    await this.deactivate();
    await this.autoApplyService.close();
  }
}
