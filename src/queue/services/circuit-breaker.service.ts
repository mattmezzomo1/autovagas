import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  resetTimeout: number;
}

interface CircuitStatus {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  nextReset: number | null;
}

@Injectable()
export class CircuitBreakerService implements OnModuleInit {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly redis: Redis.Redis;
  private readonly config: CircuitBreakerConfig;
  private readonly platforms: string[] = ['linkedin', 'infojobs', 'catho', 'indeed'];
  private resetTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly configService: ConfigService) {
    // Initialize Redis client
    this.redis = new Redis({
      host: this.configService.get('redis.host', 'localhost'),
      port: this.configService.get('redis.port', 6379),
      password: this.configService.get('redis.password', ''),
      db: this.configService.get('redis.db', 0),
    });

    // Initialize circuit breaker config
    this.config = {
      failureThreshold: this.configService.get('queue.circuitBreaker.failureThreshold', 50),
      successThreshold: this.configService.get('queue.circuitBreaker.successThreshold', 5),
      resetTimeout: this.configService.get('queue.circuitBreaker.resetTimeout', 60000),
    };
  }

  async onModuleInit() {
    // Initialize circuit breakers for all platforms
    for (const platform of this.platforms) {
      await this.initializeCircuit(platform);
    }
  }

  /**
   * Initialize circuit breaker for a platform
   */
  private async initializeCircuit(platform: string): Promise<void> {
    const key = `circuit:${platform}`;
    const exists = await this.redis.exists(key);

    if (!exists) {
      const initialStatus: CircuitStatus = {
        state: CircuitState.CLOSED,
        failures: 0,
        successes: 0,
        lastFailure: null,
        lastSuccess: null,
        nextReset: null,
      };

      await this.redis.set(key, JSON.stringify(initialStatus));
      this.logger.log(`Initialized circuit breaker for ${platform}`);
    } else {
      // Check if circuit is in OPEN state and schedule reset if needed
      const status = await this.getStatus(platform);
      if (status.state === CircuitState.OPEN && status.nextReset) {
        const now = Date.now();
        const timeUntilReset = status.nextReset - now;
        
        if (timeUntilReset > 0) {
          this.scheduleReset(platform, timeUntilReset);
        } else {
          // Reset time has passed, transition to HALF_OPEN
          await this.transitionToHalfOpen(platform);
        }
      }
    }
  }

  /**
   * Record a successful operation
   */
  async recordSuccess(platform: string): Promise<void> {
    const key = `circuit:${platform}`;
    const status = await this.getStatus(platform);

    if (status.state === CircuitState.HALF_OPEN) {
      // In HALF_OPEN state, increment successes
      status.successes += 1;
      status.lastSuccess = Date.now();

      // Check if success threshold is reached
      if (status.successes >= this.config.successThreshold) {
        // Transition to CLOSED state
        status.state = CircuitState.CLOSED;
        status.failures = 0;
        status.successes = 0;
        status.nextReset = null;
        this.logger.log(`Circuit breaker for ${platform} closed after successful operations`);
      }
    } else if (status.state === CircuitState.CLOSED) {
      // In CLOSED state, just update last success
      status.lastSuccess = Date.now();
      
      // Reset failure count on success
      if (status.failures > 0) {
        status.failures = Math.max(0, status.failures - 1);
      }
    }

    await this.redis.set(key, JSON.stringify(status));
  }

  /**
   * Record a failed operation
   */
  async recordFailure(platform: string): Promise<void> {
    const key = `circuit:${platform}`;
    const status = await this.getStatus(platform);

    if (status.state === CircuitState.CLOSED) {
      // In CLOSED state, increment failures
      status.failures += 1;
      status.lastFailure = Date.now();

      // Check if failure threshold is reached
      if (status.failures >= this.config.failureThreshold) {
        // Transition to OPEN state
        status.state = CircuitState.OPEN;
        status.nextReset = Date.now() + this.config.resetTimeout;
        this.logger.warn(`Circuit breaker for ${platform} opened due to too many failures`);
        
        // Schedule reset
        this.scheduleReset(platform, this.config.resetTimeout);
      }
    } else if (status.state === CircuitState.HALF_OPEN) {
      // In HALF_OPEN state, any failure transitions back to OPEN
      status.state = CircuitState.OPEN;
      status.failures += 1;
      status.successes = 0;
      status.lastFailure = Date.now();
      status.nextReset = Date.now() + this.config.resetTimeout;
      this.logger.warn(`Circuit breaker for ${platform} reopened after failure in half-open state`);
      
      // Schedule reset
      this.scheduleReset(platform, this.config.resetTimeout);
    }

    await this.redis.set(key, JSON.stringify(status));
  }

  /**
   * Check if circuit is open (service unavailable)
   */
  async isOpen(platform: string): Promise<boolean> {
    const status = await this.getStatus(platform);
    return status.state === CircuitState.OPEN;
  }

  /**
   * Get current circuit status
   */
  async getStatus(platform: string): Promise<CircuitStatus> {
    const key = `circuit:${platform}`;
    const data = await this.redis.get(key);
    
    if (!data) {
      // Initialize if not exists
      await this.initializeCircuit(platform);
      return this.getStatus(platform);
    }
    
    return JSON.parse(data);
  }

  /**
   * Transition circuit to HALF_OPEN state
   */
  private async transitionToHalfOpen(platform: string): Promise<void> {
    const key = `circuit:${platform}`;
    const status = await this.getStatus(platform);
    
    if (status.state === CircuitState.OPEN) {
      status.state = CircuitState.HALF_OPEN;
      status.successes = 0;
      status.nextReset = null;
      
      await this.redis.set(key, JSON.stringify(status));
      this.logger.log(`Circuit breaker for ${platform} transitioned to half-open state`);
    }
  }

  /**
   * Schedule circuit reset
   */
  private scheduleReset(platform: string, timeout: number): void {
    // Clear existing timer if any
    if (this.resetTimers.has(platform)) {
      clearTimeout(this.resetTimers.get(platform));
    }
    
    // Schedule new timer
    const timer = setTimeout(async () => {
      await this.transitionToHalfOpen(platform);
      this.resetTimers.delete(platform);
    }, timeout);
    
    this.resetTimers.set(platform, timer);
  }

  /**
   * Reset circuit breaker (force close)
   */
  async reset(platform: string): Promise<void> {
    const key = `circuit:${platform}`;
    
    // Clear existing timer if any
    if (this.resetTimers.has(platform)) {
      clearTimeout(this.resetTimers.get(platform));
      this.resetTimers.delete(platform);
    }
    
    // Reset to closed state
    const status: CircuitStatus = {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastFailure: null,
      lastSuccess: Date.now(),
      nextReset: null,
    };
    
    await this.redis.set(key, JSON.stringify(status));
    this.logger.log(`Circuit breaker for ${platform} manually reset to closed state`);
  }

  /**
   * Get all circuit breaker statuses
   */
  async getAllStatuses(): Promise<Record<string, CircuitStatus>> {
    const result: Record<string, CircuitStatus> = {};
    
    for (const platform of this.platforms) {
      result[platform] = await this.getStatus(platform);
    }
    
    return result;
  }
}
