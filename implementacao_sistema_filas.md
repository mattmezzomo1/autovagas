# Implementação do Sistema de Filas para Gerenciar Requisições de Scraping

Este documento detalha a implementação do sistema de filas para gerenciar as requisições de scraping, incluindo mecanismos de retry, circuit breaker e cache.

## 1. Sistema de Filas

Para gerenciar as requisições de scraping de forma eficiente, implementaremos um sistema de filas com prioridades.

### Serviço de Filas

```typescript
// src/services/queue/ScraperQueueService.ts
import { JobSearchParams, ScrapedJob, ApplicationResult } from '../webscraper/types';
import { UserProfile } from '../../types/auth';
import { WebScraperService } from '../webscraper/WebScraperService';
import { LinkedInScraperService } from '../webscraper/LinkedInScraperService';
import { InfoJobsScraperService } from '../webscraper/InfoJobsScraperService';
import { CathoScraperService } from '../webscraper/CathoScraperService';
import { IndeedScraperService } from '../webscraper/IndeedScraperService';

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
        lastFailure: null,
        state: 'closed',
        nextAttempt: null
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
        if (circuitBreaker.state === 'open') {
          // Verifica se é hora de tentar novamente
          if (circuitBreaker.nextAttempt && new Date() >= circuitBreaker.nextAttempt) {
            circuitBreaker.state = 'half-open';
          } else {
            // Pula esta tarefa, circuit breaker está aberto
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

            // Se o circuit breaker estava meio aberto, fecha-o
            if (circuitBreaker.state === 'half-open') {
              circuitBreaker.state = 'closed';
              circuitBreaker.failures = 0;
            }
          })
          .catch(error => {
            // Falha ao processar a tarefa
            console.error(`Erro ao processar tarefa ${task.id}:`, error);
            task.error = error.message;

            // Verifica se deve tentar novamente
            if (task.attempts < task.maxAttempts) {
              task.status = 'pending';

              // Atualiza o circuit breaker
              circuitBreaker.failures++;
              circuitBreaker.lastFailure = new Date();

              // Se atingiu o limite de falhas, abre o circuit breaker
              if (circuitBreaker.failures >= 3) {
                circuitBreaker.state = 'open';
                circuitBreaker.nextAttempt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
              }
            } else {
              task.status = 'failed';
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
}

/**
 * Estado do circuit breaker
 */
interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt: Date | null;
}
```

## 2. Sistema de Cache

Para reduzir o número de requisições e melhorar o desempenho, implementaremos um sistema de cache.

### Serviço de Cache

```typescript
// src/services/cache/ScraperCacheService.ts
import { ScrapedJob } from '../webscraper/types';

/**
 * Serviço para gerenciar cache de resultados de scraping
 */
export class ScraperCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 30 * 60 * 1000; // 30 minutos em milissegundos

  constructor() {
    // Inicia a limpeza periódica do cache
    setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000); // A cada 5 minutos
  }

  /**
   * Gera uma chave de cache com base nos parâmetros
   */
  generateCacheKey(platform: string, operation: string, params: any): string {
    return `${platform}:${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Obtém um valor do cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verifica se o cache expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Armazena um valor no cache
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Limpa entradas expiradas do cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalida cache relacionado a uma plataforma
   */
  async invalidatePlatformCache(platform: string): Promise<void> {
    const platformPrefix = `${platform}:`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(platformPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalida cache relacionado a uma operação específica
   */
  async invalidateOperationCache(platform: string, operation: string): Promise<void> {
    const operationPrefix = `${platform}:${operation}:`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(operationPrefix)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Entrada de cache
 */
interface CacheEntry {
  value: any;
  expiresAt: number;
}
```

## 3. Implementação de Circuit Breaker

O padrão Circuit Breaker já foi implementado no serviço de filas, mas aqui está uma implementação mais detalhada que pode ser usada de forma independente.

### Serviço de Circuit Breaker

```typescript
// src/services/circuitbreaker/CircuitBreakerService.ts

/**
 * Estados possíveis do circuit breaker
 */
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

/**
 * Configuração do circuit breaker
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenSuccessThreshold: number;
}

/**
 * Implementação do padrão Circuit Breaker
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 3,
      resetTimeout: 30000, // 30 segundos
      halfOpenSuccessThreshold: 2,
      ...config
    };
  }

  /**
   * Executa uma função protegida pelo circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      // Verifica se já passou o tempo de reset
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();

      this.onSuccess();

      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Chamado quando uma operação é bem-sucedida
   */
  private onSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.halfOpenSuccessThreshold) {
        this.reset();
      }
    }
  }

  /**
   * Chamado quando uma operação falha
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      return;
    }

    this.failureCount++;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  /**
   * Reseta o circuit breaker para o estado fechado
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }

  /**
   * Retorna o estado atual do circuit breaker
   */
  getState(): CircuitBreakerState {
    return this.state;
  }
}
```