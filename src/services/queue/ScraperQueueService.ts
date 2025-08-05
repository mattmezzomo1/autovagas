import { JobSearchParams, ScrapedJob, ApplicationResult } from '../webscraper/types';
import { UserProfile } from '../../types/auth';
import { WebScraperService } from '../webscraper/WebScraperService';
import { LinkedInScraperService } from '../webscraper/LinkedInScraperService';
import { InfoJobsScraperService } from '../webscraper/InfoJobsScraperService';
import { CathoScraperService } from '../webscraper/CathoScraperService';
import { IndeedScraperService } from '../webscraper/IndeedScraperService';
import { ScraperCacheService } from '../cache/ScraperCacheService';

/**
 * Tipos de tarefas que podem ser enfileiradas
 */
enum TaskType {
  SEARCH_JOBS = 'search_jobs',
  APPLY_TO_JOB = 'apply_to_job'
}

/**
 * Interface para uma tarefa na fila
 */
interface QueueTask {
  id: string;
  type: TaskType;
  platform: string;
  priority: number;
  params: any;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Estado do circuit breaker
 */
interface CircuitBreakerState {
  failures: number;
  consecutiveFailures: number;
  totalFailures: number;
  lastFailure: Date | null;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: Date | null;
  failureThreshold: number;
  resetTimeout: number; // em milissegundos
  successesInHalfOpen: number;
  requiredSuccessesForClose: number;
}

/**
 * Serviço para gerenciar filas de requisições de scraping
 */
export class ScraperQueueService {
  private queue: QueueTask[] = [];
  private processing: boolean = false;
  private scrapers: Record<string, WebScraperService> = {};
  private maxConcurrent: number = 3;
  private currentConcurrent: number = 0;
  private circuitBreakers: Record<string, CircuitBreakerState> = {};
  private cacheService: ScraperCacheService;

  constructor() {
    // Inicializa os scrapers
    this.scrapers = {
      'linkedin': new LinkedInScraperService(),
      'infojobs': new InfoJobsScraperService(),
      'catho': new CathoScraperService(),
      'indeed': new IndeedScraperService()
    };

    // Inicializa os circuit breakers
    Object.keys(this.scrapers).forEach(platform => {
      this.circuitBreakers[platform] = {
        failures: 0,
        consecutiveFailures: 0,
        totalFailures: 0,
        lastFailure: null,
        state: 'closed',
        nextAttempt: null,
        failureThreshold: 3,
        resetTimeout: 5 * 60 * 1000, // 5 minutos
        successesInHalfOpen: 0,
        requiredSuccessesForClose: 2
      };
    });

    // Inicializa o serviço de cache
    this.cacheService = new ScraperCacheService();

    // Inicia o processamento da fila
    setInterval(() => this.processQueue(), 5000);
  }

  /**
   * Adiciona uma tarefa de busca de vagas à fila
   */
  async enqueueJobSearch(platform: string, params: JobSearchParams, priority: number = 1): Promise<string> {
    // Verifica se há resultados em cache
    const cacheKey = this.cacheService.generateCacheKey(platform, 'search', params);
    const cachedResults = await this.cacheService.get(cacheKey);

    if (cachedResults) {
      console.log(`Resultados encontrados em cache para ${platform}`);
      return cachedResults;
    }

    // Se não há cache, adiciona à fila
    const taskId = `search-${platform}-${Date.now()}`;

    this.queue.push({
      id: taskId,
      type: TaskType.SEARCH_JOBS,
      platform,
      priority,
      params,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });

    // Ordena a fila por prioridade
    this.sortQueue();

    return taskId;
  }

  /**
   * Adiciona uma tarefa de aplicação para vaga à fila
   */
  async enqueueJobApplication(platform: string, job: ScrapedJob, profile: UserProfile, priority: number = 2): Promise<string> {
    const taskId = `apply-${platform}-${job.id}-${Date.now()}`;

    this.queue.push({
      id: taskId,
      type: TaskType.APPLY_TO_JOB,
      platform,
      priority,
      params: { job, profile },
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    });

    // Ordena a fila por prioridade
    this.sortQueue();

    return taskId;
  }

  /**
   * Obtém o status de uma tarefa
   */
  getTaskStatus(taskId: string): QueueTask | null {
    return this.queue.find(task => task.id === taskId) || null;
  }

  /**
   * Processa a fila de tarefas
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || this.currentConcurrent >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    try {
      // Obtém as próximas tarefas pendentes
      const pendingTasks = this.queue.filter(task => task.status === 'pending');

      for (const task of pendingTasks) {
        // Verifica se atingimos o limite de tarefas concorrentes
        if (this.currentConcurrent >= this.maxConcurrent) {
          break;
        }

        // Verifica o estado do circuit breaker para a plataforma
        const circuitBreaker = this.circuitBreakers[task.platform];

        // Verifica se o circuit breaker está aberto
        if (circuitBreaker.state === 'open') {
          // Verifica se é hora de tentar novamente
          if (circuitBreaker.nextAttempt && new Date() >= circuitBreaker.nextAttempt) {
            console.log(`Circuit breaker para ${task.platform} mudando para half-open`);
            circuitBreaker.state = 'half-open';
            circuitBreaker.successesInHalfOpen = 0;
          } else {
            // Pula esta tarefa, circuit breaker está aberto
            console.log(`Pulando tarefa para ${task.platform}, circuit breaker está aberto. Próxima tentativa: ${circuitBreaker.nextAttempt}`);
            continue;
          }
        }

        // Se o circuit breaker estiver half-open, limita o número de tarefas
        if (circuitBreaker.state === 'half-open') {
          // Verifica se já há tarefas em processamento para esta plataforma
          const tasksInProcessing = this.queue.filter(t =>
            t.platform === task.platform &&
            t.status === 'processing'
          ).length;

          // No estado half-open, permitimos apenas uma tarefa por vez
          if (tasksInProcessing > 0) {
            console.log(`Pulando tarefa para ${task.platform}, circuit breaker está half-open e já há tarefas em processamento`);
            continue;
          }
        }

        // Processa a tarefa
        this.currentConcurrent++;
        task.status = 'processing';
        task.attempts++;
        task.lastAttempt = new Date();

        this.processTask(task)
          .then(() => {
            // Tarefa concluída com sucesso
            task.status = 'completed';
            console.log(`Tarefa ${task.id} para ${task.platform} concluída com sucesso`);

            // Reseta falhas consecutivas
            circuitBreaker.consecutiveFailures = 0;

            // Se o circuit breaker estava meio aberto, incrementa o contador de sucessos
            if (circuitBreaker.state === 'half-open') {
              circuitBreaker.successesInHalfOpen++;
              console.log(`Circuit breaker para ${task.platform} em half-open com ${circuitBreaker.successesInHalfOpen}/${circuitBreaker.requiredSuccessesForClose} sucessos`);

              // Se atingiu o número necessário de sucessos, fecha o circuit breaker
              if (circuitBreaker.successesInHalfOpen >= circuitBreaker.requiredSuccessesForClose) {
                console.log(`Circuit breaker para ${task.platform} fechando após ${circuitBreaker.successesInHalfOpen} sucessos consecutivos`);
                circuitBreaker.state = 'closed';
                circuitBreaker.failures = 0;
                circuitBreaker.consecutiveFailures = 0;
                circuitBreaker.successesInHalfOpen = 0;
              }
            }
          })
          .catch(error => {
            // Falha ao processar a tarefa
            console.error(`Erro ao processar tarefa ${task.id} para ${task.platform}:`, error);
            task.error = error.message;

            // Atualiza o circuit breaker
            circuitBreaker.failures++;
            circuitBreaker.consecutiveFailures++;
            circuitBreaker.totalFailures++;
            circuitBreaker.lastFailure = new Date();

            // Calcula o tempo de espera com backoff exponencial
            const backoffTime = Math.min(
              circuitBreaker.resetTimeout * Math.pow(2, circuitBreaker.consecutiveFailures - 1),
              30 * 60 * 1000 // Máximo de 30 minutos
            );

            // Verifica se deve tentar novamente
            if (task.attempts < task.maxAttempts) {
              task.status = 'pending';

              // Se atingiu o limite de falhas consecutivas, abre o circuit breaker
              if (circuitBreaker.consecutiveFailures >= circuitBreaker.failureThreshold) {
                console.log(`Circuit breaker para ${task.platform} abrindo após ${circuitBreaker.consecutiveFailures} falhas consecutivas`);
                circuitBreaker.state = 'open';
                circuitBreaker.nextAttempt = new Date(Date.now() + backoffTime);
                console.log(`Próxima tentativa para ${task.platform} em ${new Date(Date.now() + backoffTime)}`);
              }
            } else {
              task.status = 'failed';
              console.log(`Tarefa ${task.id} para ${task.platform} falhou após ${task.attempts} tentativas`);
            }
          })
          .finally(() => {
            this.currentConcurrent--;
          });
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Processa uma tarefa específica
   */
  private async processTask(task: QueueTask): Promise<void> {
    const scraper = this.scrapers[task.platform];

    if (!scraper) {
      throw new Error(`Scraper não encontrado para a plataforma ${task.platform}`);
    }

    switch (task.type) {
      case TaskType.SEARCH_JOBS:
        const jobs = await scraper.searchJobs(task.params);
        task.result = jobs;

        // Armazena em cache
        const searchCacheKey = this.cacheService.generateCacheKey(task.platform, 'search', task.params);
        await this.cacheService.set(searchCacheKey, jobs);
        break;

      case TaskType.APPLY_TO_JOB:
        const { job, profile } = task.params;
        const result = await scraper.applyToJob(job, profile);
        task.result = result;
        break;

      default:
        throw new Error(`Tipo de tarefa desconhecido: ${task.type}`);
    }
  }

  /**
   * Ordena a fila por prioridade (maior prioridade primeiro)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Primeiro por prioridade (decrescente)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      // Depois por data de criação (crescente)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Obtém o status dos circuit breakers
   */
  getCircuitBreakersStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    Object.keys(this.circuitBreakers).forEach(platform => {
      const cb = this.circuitBreakers[platform];
      status[platform] = {
        state: cb.state,
        failures: cb.failures,
        consecutiveFailures: cb.consecutiveFailures,
        totalFailures: cb.totalFailures,
        lastFailure: cb.lastFailure,
        nextAttempt: cb.nextAttempt,
        successesInHalfOpen: cb.successesInHalfOpen,
        requiredSuccessesForClose: cb.requiredSuccessesForClose
      };
    });

    return status;
  }

  /**
   * Reseta o circuit breaker para uma plataforma específica
   */
  resetCircuitBreaker(platform: string): boolean {
    if (!this.circuitBreakers[platform]) {
      return false;
    }

    this.circuitBreakers[platform] = {
      failures: 0,
      consecutiveFailures: 0,
      totalFailures: 0,
      lastFailure: null,
      state: 'closed',
      nextAttempt: null,
      failureThreshold: this.circuitBreakers[platform].failureThreshold,
      resetTimeout: this.circuitBreakers[platform].resetTimeout,
      successesInHalfOpen: 0,
      requiredSuccessesForClose: this.circuitBreakers[platform].requiredSuccessesForClose
    };

    console.log(`Circuit breaker para ${platform} resetado manualmente`);
    return true;
  }
}
