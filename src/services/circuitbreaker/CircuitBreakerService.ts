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
 * 
 * O Circuit Breaker é um padrão de design que monitora falhas em chamadas a serviços externos
 * e, quando um limite é atingido, "abre o circuito" para evitar mais falhas.
 * Isso protege o sistema de falhas em cascata e permite que o serviço externo se recupere.
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
