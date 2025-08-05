const redisService = require('./redis.service');

/**
 * Serviço de Cache com fallback para memória
 */
class CacheService {
  constructor() {
    // Cache em memória como fallback
    this.memoryCache = new Map();
    this.memoryTTL = new Map();
    
    // Configurações
    this.defaultTTL = 3600; // 1 hora
    this.maxMemoryItems = 1000;
    
    // Limpar cache em memória periodicamente
    setInterval(() => this.cleanupMemoryCache(), 60000); // A cada minuto
  }

  /**
   * Define um valor no cache
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    try {
      // Tentar Redis primeiro
      if (redisService.isRedisConnected()) {
        const success = await redisService.set(key, value, ttlSeconds);
        if (success) {
          return true;
        }
      }

      // Fallback para memória
      return this.setMemory(key, value, ttlSeconds);
    } catch (error) {
      console.error('Cache SET error:', error);
      return this.setMemory(key, value, ttlSeconds);
    }
  }

  /**
   * Obtém um valor do cache
   */
  async get(key) {
    try {
      // Tentar Redis primeiro
      if (redisService.isRedisConnected()) {
        const value = await redisService.get(key);
        if (value !== null) {
          return value;
        }
      }

      // Fallback para memória
      return this.getMemory(key);
    } catch (error) {
      console.error('Cache GET error:', error);
      return this.getMemory(key);
    }
  }

  /**
   * Remove um valor do cache
   */
  async del(key) {
    try {
      // Remover do Redis
      if (redisService.isRedisConnected()) {
        await redisService.del(key);
      }

      // Remover da memória
      this.delMemory(key);
      return true;
    } catch (error) {
      console.error('Cache DEL error:', error);
      this.delMemory(key);
      return false;
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async exists(key) {
    try {
      // Verificar Redis primeiro
      if (redisService.isRedisConnected()) {
        const exists = await redisService.exists(key);
        if (exists) {
          return true;
        }
      }

      // Verificar memória
      return this.existsMemory(key);
    } catch (error) {
      console.error('Cache EXISTS error:', error);
      return this.existsMemory(key);
    }
  }

  /**
   * Incrementa um contador
   */
  async incr(key, ttlSeconds = this.defaultTTL) {
    try {
      // Tentar Redis primeiro
      if (redisService.isRedisConnected()) {
        const value = await redisService.incr(key);
        if (ttlSeconds > 0) {
          await redisService.expire(key, ttlSeconds);
        }
        return value;
      }

      // Fallback para memória
      return this.incrMemory(key, ttlSeconds);
    } catch (error) {
      console.error('Cache INCR error:', error);
      return this.incrMemory(key, ttlSeconds);
    }
  }

  /**
   * Remove chaves por padrão
   */
  async deletePattern(pattern) {
    try {
      let deletedCount = 0;

      // Remover do Redis
      if (redisService.isRedisConnected()) {
        deletedCount += await redisService.deletePattern(pattern);
      }

      // Remover da memória
      deletedCount += this.deletePatternMemory(pattern);

      return deletedCount;
    } catch (error) {
      console.error('Cache DELETE PATTERN error:', error);
      return this.deletePatternMemory(pattern);
    }
  }

  // ===== MÉTODOS ESPECÍFICOS PARA APLICAÇÃO =====

  /**
   * Cache para dados de dashboard
   */
  async cacheDashboardData(companyUserId, data, ttlSeconds = 300) {
    const key = this.generateKey('dashboard', companyUserId);
    return await this.set(key, data, ttlSeconds);
  }

  /**
   * Obtém dados de dashboard do cache
   */
  async getDashboardData(companyUserId) {
    const key = this.generateKey('dashboard', companyUserId);
    return await this.get(key);
  }

  /**
   * Cache para lista de vagas
   */
  async cacheJobsList(companyUserId, filters, data, ttlSeconds = 600) {
    const filterKey = this.generateFilterKey(filters);
    const key = this.generateKey('jobs', companyUserId, filterKey);
    return await this.set(key, data, ttlSeconds);
  }

  /**
   * Obtém lista de vagas do cache
   */
  async getJobsList(companyUserId, filters) {
    const filterKey = this.generateFilterKey(filters);
    const key = this.generateKey('jobs', companyUserId, filterKey);
    return await this.get(key);
  }

  /**
   * Cache para dados de candidatos
   */
  async cacheCandidatesList(companyUserId, filters, data, ttlSeconds = 600) {
    const filterKey = this.generateFilterKey(filters);
    const key = this.generateKey('candidates', companyUserId, filterKey);
    return await this.set(key, data, ttlSeconds);
  }

  /**
   * Obtém lista de candidatos do cache
   */
  async getCandidatesList(companyUserId, filters) {
    const filterKey = this.generateFilterKey(filters);
    const key = this.generateKey('candidates', companyUserId, filterKey);
    return await this.get(key);
  }

  /**
   * Cache para analytics
   */
  async cacheAnalytics(companyUserId, type, timeRange, data, ttlSeconds = 1800) {
    const key = this.generateKey('analytics', companyUserId, type, timeRange);
    return await this.set(key, data, ttlSeconds);
  }

  /**
   * Obtém analytics do cache
   */
  async getAnalytics(companyUserId, type, timeRange) {
    const key = this.generateKey('analytics', companyUserId, type, timeRange);
    return await this.get(key);
  }

  /**
   * Invalida cache relacionado a uma empresa
   */
  async invalidateCompanyCache(companyUserId) {
    const patterns = [
      `dashboard:${companyUserId}*`,
      `jobs:${companyUserId}*`,
      `candidates:${companyUserId}*`,
      `analytics:${companyUserId}*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.deletePattern(pattern);
    }

    return totalDeleted;
  }

  /**
   * Invalida cache relacionado a uma vaga
   */
  async invalidateJobCache(companyUserId, jobId) {
    const patterns = [
      `jobs:${companyUserId}*`,
      `candidates:${companyUserId}*`,
      `analytics:${companyUserId}*`,
      `job:${jobId}*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.deletePattern(pattern);
    }

    return totalDeleted;
  }

  // ===== MÉTODOS DE MEMÓRIA (FALLBACK) =====

  setMemory(key, value, ttlSeconds) {
    try {
      // Limitar tamanho do cache
      if (this.memoryCache.size >= this.maxMemoryItems) {
        this.cleanupMemoryCache();
      }

      this.memoryCache.set(key, value);
      
      if (ttlSeconds > 0) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.memoryTTL.set(key, expiresAt);
      }

      return true;
    } catch (error) {
      console.error('Memory cache SET error:', error);
      return false;
    }
  }

  getMemory(key) {
    try {
      // Verificar se expirou
      if (this.memoryTTL.has(key)) {
        const expiresAt = this.memoryTTL.get(key);
        if (Date.now() > expiresAt) {
          this.delMemory(key);
          return null;
        }
      }

      return this.memoryCache.get(key) || null;
    } catch (error) {
      console.error('Memory cache GET error:', error);
      return null;
    }
  }

  delMemory(key) {
    this.memoryCache.delete(key);
    this.memoryTTL.delete(key);
  }

  existsMemory(key) {
    if (this.memoryTTL.has(key)) {
      const expiresAt = this.memoryTTL.get(key);
      if (Date.now() > expiresAt) {
        this.delMemory(key);
        return false;
      }
    }

    return this.memoryCache.has(key);
  }

  incrMemory(key, ttlSeconds) {
    const current = this.getMemory(key) || 0;
    const newValue = current + 1;
    this.setMemory(key, newValue, ttlSeconds);
    return newValue;
  }

  deletePatternMemory(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deletedCount = 0;

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.delMemory(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  cleanupMemoryCache() {
    const now = Date.now();
    const keysToDelete = [];

    // Encontrar chaves expiradas
    for (const [key, expiresAt] of this.memoryTTL.entries()) {
      if (now > expiresAt) {
        keysToDelete.push(key);
      }
    }

    // Remover chaves expiradas
    for (const key of keysToDelete) {
      this.delMemory(key);
    }

    // Se ainda estiver muito grande, remover as mais antigas
    if (this.memoryCache.size > this.maxMemoryItems) {
      const keys = Array.from(this.memoryCache.keys());
      const keysToRemove = keys.slice(0, keys.length - this.maxMemoryItems);
      
      for (const key of keysToRemove) {
        this.delMemory(key);
      }
    }
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  generateKey(...parts) {
    return parts.join(':');
  }

  generateFilterKey(filters) {
    if (!filters || typeof filters !== 'object') {
      return 'default';
    }

    const sortedKeys = Object.keys(filters).sort();
    const keyParts = sortedKeys.map(key => `${key}=${filters[key]}`);
    return keyParts.join('&');
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      redis: {
        connected: redisService.isRedisConnected()
      },
      memory: {
        size: this.memoryCache.size,
        ttlSize: this.memoryTTL.size,
        maxSize: this.maxMemoryItems
      }
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
