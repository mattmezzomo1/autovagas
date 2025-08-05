import { UserProfile } from '../../types/auth';
import { CathoScraperService } from './CathoScraperService';
import { InfoJobsScraperService } from './InfoJobsScraperService';
import { IndeedScraperService } from './IndeedScraperService';
import { LinkedInScraperService } from './LinkedInScraperService';
import { ApplicationResult, JobSearchParams, Platform, ScrapedJob, ScraperConfig, ScraperCredentials } from './types';
import { jobsDatabase } from './JobsDatabase';

/**
 * Serviço de auto-aplicação que coordena os scrapers de diferentes plataformas
 */
export class AutoApplyService {
  private linkedInScraper: LinkedInScraperService;
  private infoJobsScraper: InfoJobsScraperService;
  private cathoScraper: CathoScraperService;
  private indeedScraper: IndeedScraperService;
  private credentials: Record<Platform, ScraperCredentials | null> = {
    linkedin: null,
    infojobs: null,
    catho: null,
    indeed: null
  };
  private isRunning: boolean = false;
  private jobQueue: ScrapedJob[] = [];
  private appliedJobs: ApplicationResult[] = [];
  private matchThreshold: number = 70; // Pontuação mínima para aplicação automática

  constructor() {
    this.linkedInScraper = new LinkedInScraperService();
    this.infoJobsScraper = new InfoJobsScraperService();
    this.cathoScraper = new CathoScraperService();
    this.indeedScraper = new IndeedScraperService();
  }

  /**
   * Inicializa o serviço de auto-aplicação
   */
  async initialize(config?: Partial<ScraperConfig>): Promise<void> {
    // Configura a emulação humana por padrão
    const humanConfig: Partial<ScraperConfig> = {
      ...config,
      humanEmulation: true,
      randomizeUserAgent: true,
      minDelayMs: 800,  // Atrasos um pouco maiores para parecer mais humano
      maxDelayMs: 5000
    };

    await Promise.all([
      this.linkedInScraper.initialize(humanConfig),
      this.infoJobsScraper.initialize(humanConfig),
      this.cathoScraper.initialize(humanConfig),
      this.indeedScraper.initialize(humanConfig)
    ]);

    console.log('Serviço de auto-aplicação inicializado com sucesso com emulação humana');
  }

  /**
   * Define as credenciais para uma plataforma
   */
  setCredentials(platform: Platform, credentials: ScraperCredentials): void {
    this.credentials[platform] = credentials;
    console.log(`Credenciais definidas para a plataforma: ${platform}`);
  }

  /**
   * Realiza login em uma plataforma específica
   */
  async login(platform: Platform): Promise<boolean> {
    const credentials = this.credentials[platform];

    if (!credentials) {
      console.error(`Credenciais não definidas para a plataforma: ${platform}`);
      return false;
    }

    switch (platform) {
      case 'linkedin':
        return this.linkedInScraper.login(credentials);
      case 'infojobs':
        return this.infoJobsScraper.login(credentials);
      case 'catho':
        return this.cathoScraper.login(credentials);
      case 'indeed':
        return this.indeedScraper.login(credentials);
      default:
        return false;
    }
  }

  /**
   * Realiza login em todas as plataformas configuradas
   */
  async loginAll(): Promise<Record<Platform, boolean>> {
    const results: Record<Platform, boolean> = {
      linkedin: false,
      infojobs: false,
      catho: false,
      indeed: false
    };

    for (const platform of Object.keys(this.credentials) as Platform[]) {
      if (this.credentials[platform]) {
        results[platform] = await this.login(platform);
      }
    }

    return results;
  }

  /**
   * Busca vagas em uma plataforma específica
   */
  async searchJobs(platform: Platform, params: JobSearchParams): Promise<ScrapedJob[]> {
    switch (platform) {
      case 'linkedin':
        return this.linkedInScraper.searchJobs(params);
      case 'infojobs':
        return this.infoJobsScraper.searchJobs(params);
      case 'catho':
        return this.cathoScraper.searchJobs(params);
      case 'indeed':
        return this.indeedScraper.searchJobs(params);
      default:
        return [];
    }
  }

  /**
   * Busca vagas em todas as plataformas configuradas
   */
  async searchJobsAll(params: JobSearchParams): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = [];

    for (const platform of Object.keys(this.credentials) as Platform[]) {
      if (this.credentials[platform]) {
        try {
          const jobs = await this.searchJobs(platform, params);
          allJobs.push(...jobs);
        } catch (error) {
          console.error(`Erro ao buscar vagas na plataforma ${platform}:`, error);
        }
      }
    }

    return allJobs;
  }

  /**
   * Analisa a compatibilidade entre uma vaga e o perfil do usuário
   */
  analyzeJobMatch(job: ScrapedJob, profile: UserProfile): number {
    switch (job.platform) {
      case 'linkedin':
        return this.linkedInScraper.analyzeJobMatch(job, profile);
      case 'infojobs':
        return this.infoJobsScraper.analyzeJobMatch(job, profile);
      case 'catho':
        return this.cathoScraper.analyzeJobMatch(job, profile);
      case 'indeed':
        return this.indeedScraper.analyzeJobMatch(job, profile);
      default:
        return 0;
    }
  }

  /**
   * Aplica para uma vaga específica
   */
  async applyToJob(job: ScrapedJob, profile: UserProfile): Promise<ApplicationResult> {
    switch (job.platform) {
      case 'linkedin':
        return this.linkedInScraper.applyToJob(job, profile);
      case 'infojobs':
        return this.infoJobsScraper.applyToJob(job, profile);
      case 'catho':
        return this.cathoScraper.applyToJob(job, profile);
      case 'indeed':
        return this.indeedScraper.applyToJob(job, profile);
      default:
        return {
          id: `unknown-app-${Date.now()}`,
          jobId: job.id,
          platform: job.platform,
          title: job.title,
          company: job.company,
          status: 'failed',
          appliedAt: new Date(),
          error: 'Plataforma não suportada',
          matchScore: 0,
          resumeUsed: 'none'
        };
    }
  }

  /**
   * Verifica o status de uma aplicação
   */
  async checkApplicationStatus(platform: Platform, applicationId: string): Promise<string> {
    switch (platform) {
      case 'linkedin':
        return this.linkedInScraper.checkApplicationStatus(applicationId);
      case 'infojobs':
        return this.infoJobsScraper.checkApplicationStatus(applicationId);
      case 'catho':
        return this.cathoScraper.checkApplicationStatus(applicationId);
      case 'indeed':
        return this.indeedScraper.checkApplicationStatus(applicationId);
      default:
        return 'Plataforma não suportada';
    }
  }

  /**
   * Inicia o processo de auto-aplicação
   */
  async startAutoApply(profile: UserProfile, params: JobSearchParams, matchThreshold: number = 70): Promise<void> {
    if (this.isRunning) {
      console.log('O processo de auto-aplicação já está em execução');
      return;
    }

    this.isRunning = true;
    this.matchThreshold = matchThreshold;

    try {
      console.log('Iniciando processo de auto-aplicação...');

      // Realiza login em todas as plataformas
      const loginResults = await this.loginAll();
      const loggedInPlatforms = Object.entries(loginResults)
        .filter(([_, success]) => success)
        .map(([platform]) => platform as Platform);

      if (loggedInPlatforms.length === 0) {
        console.error('Não foi possível fazer login em nenhuma plataforma');
        this.isRunning = false;
        return;
      }

      console.log(`Login realizado com sucesso nas plataformas: ${loggedInPlatforms.join(', ')}`);

      // Busca vagas em todas as plataformas
      const jobs = await this.searchJobsAll(params);
      console.log(`Encontradas ${jobs.length} vagas no total`);

      // Analisa a compatibilidade de cada vaga
      const analyzedJobs = jobs.map(job => {
        const matchScore = this.analyzeJobMatch(job, profile);
        return { ...job, matchScore };
      });

      // Filtra as vagas com pontuação acima do limiar
      const matchedJobs = analyzedJobs
        .filter(job => job.matchScore !== undefined && job.matchScore >= this.matchThreshold)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      console.log(`${matchedJobs.length} vagas compatíveis encontradas`);

      // Adiciona as vagas à fila
      this.jobQueue = matchedJobs;

      // Inicia o processamento da fila
      await this.processJobQueue(profile);
    } catch (error) {
      console.error('Erro durante o processo de auto-aplicação:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Processa a fila de vagas para aplicação
   */
  private async processJobQueue(profile: UserProfile): Promise<void> {
    console.log(`Processando fila de ${this.jobQueue.length} vagas...`);

    // Salva todas as vagas no banco de dados
    jobsDatabase.addJobs(this.jobQueue);
    console.log(`${this.jobQueue.length} vagas adicionadas ao banco de dados`);

    for (const job of this.jobQueue) {
      try {
        console.log(`Aplicando para a vaga: ${job.title} - ${job.company} (${job.platform})`);

        const result = await this.applyToJob(job, profile);
        this.appliedJobs.push(result);

        // Salva a aplicação no banco de dados
        jobsDatabase.addApplication(result);

        if (result.status === 'success') {
          console.log(`Aplicação realizada com sucesso para a vaga: ${job.title}`);
        } else {
          console.error(`Falha na aplicação para a vaga: ${job.title} - ${result.error}`);
        }

        // Adiciona um atraso entre as aplicações para parecer mais humano
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
      } catch (error) {
        console.error(`Erro ao aplicar para a vaga ${job.title}:`, error);
      }
    }

    console.log(`Processamento da fila concluído. ${this.appliedJobs.length} aplicações realizadas.`);
    this.jobQueue = [];
  }

  /**
   * Interrompe o processo de auto-aplicação
   */
  stopAutoApply(): void {
    if (!this.isRunning) {
      console.log('O processo de auto-aplicação não está em execução');
      return;
    }

    console.log('Interrompendo processo de auto-aplicação...');
    this.isRunning = false;
    this.jobQueue = [];
  }

  /**
   * Obtém as aplicações realizadas
   */
  getAppliedJobs(): ApplicationResult[] {
    return [...this.appliedJobs];
  }

  /**
   * Verifica se o processo de auto-aplicação está em execução
   */
  isAutoApplyRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Obtém todas as vagas do banco de dados
   */
  getAllJobs(): ScrapedJob[] {
    return jobsDatabase.getAllJobs();
  }

  /**
   * Obtém vagas por categoria
   */
  getJobsByCategory(category: string): ScrapedJob[] {
    return jobsDatabase.getJobsByCategory(category);
  }

  /**
   * Busca vagas por palavras-chave
   */
  searchJobsInDatabase(query: string): ScrapedJob[] {
    return jobsDatabase.searchJobs(query);
  }

  /**
   * Obtém estatísticas do banco de dados
   */
  getDatabaseStats(): Record<string, any> {
    return jobsDatabase.getStats();
  }

  /**
   * Fecha todos os scrapers e libera recursos
   */
  async close(): Promise<void> {
    await Promise.all([
      this.linkedInScraper.close(),
      this.infoJobsScraper.close(),
      this.cathoScraper.close(),
      this.indeedScraper.close()
    ]);

    this.isRunning = false;
    console.log('Serviço de auto-aplicação encerrado');
  }
}

// Exporta uma instância singleton do serviço de auto-aplicação
export const autoApplyService = new AutoApplyService();
