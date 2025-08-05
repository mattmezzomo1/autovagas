const Redis = require('ioredis');
const config = require('../config/config');

/**
 * Serviço de Redis para cache e pub/sub
 */
class RedisService {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
  }

  /**
   * Inicializa conexão com Redis
   */
  async initialize() {
    try {
      if (!config.redis.host) {
        console.log('Redis não configurado, usando cache em memória');
        return;
      }

      // Cliente principal para cache
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Cliente para subscriber (WebSocket events)
      this.subscriber = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Cliente para publisher (WebSocket events)
      this.publisher = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Conectar
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect()
      ]);

      this.isConnected = true;

      // Event listeners
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.subscriber.on('error', (err) => {
        console.error('Redis Subscriber Error:', err);
      });

      this.publisher.on('error', (err) => {
        console.error('Redis Publisher Error:', err);
      });

      console.log('Redis Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Verifica se Redis está conectado
   */
  isRedisConnected() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  // ===== CACHE METHODS =====

  /**
   * Define um valor no cache
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const serializedValue = JSON.stringify(value);
      
      if (ttlSeconds > 0) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Obtém um valor do cache
   */
  async get(key) {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const value = await this.client.get(key);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Remove um valor do cache
   */
  async del(key) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async exists(key) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Define TTL para uma chave
   */
  async expire(key, ttlSeconds) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.client.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Incrementa um valor
   */
  async incr(key) {
    try {
      if (!this.isRedisConnected()) {
        return 0;
      }

      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  /**
   * Remove chaves por padrão
   */
  async deletePattern(pattern) {
    try {
      if (!this.isRedisConnected()) {
        return 0;
      }

      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Redis DELETE PATTERN error:', error);
      return 0;
    }
  }

  // ===== PUB/SUB METHODS =====

  /**
   * Publica uma mensagem
   */
  async publish(channel, message) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      const serializedMessage = JSON.stringify(message);
      await this.publisher.publish(channel, serializedMessage);
      return true;
    } catch (error) {
      console.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  /**
   * Subscreve a um canal
   */
  async subscribe(channel, callback) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.subscriber.subscribe(channel);
      
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch (error) {
            console.error('Error parsing Redis message:', error);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error);
      return false;
    }
  }

  /**
   * Desinscreve de um canal
   */
  async unsubscribe(channel) {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.subscriber.unsubscribe(channel);
      return true;
    } catch (error) {
      console.error('Redis UNSUBSCRIBE error:', error);
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Gera chave de cache
   */
  generateCacheKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Limpa todo o cache
   */
  async flushAll() {
    try {
      if (!this.isRedisConnected()) {
        return false;
      }

      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('Redis FLUSH error:', error);
      return false;
    }
  }

  /**
   * Obtém informações do Redis
   */
  async getInfo() {
    try {
      if (!this.isRedisConnected()) {
        return null;
      }

      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error('Redis INFO error:', error);
      return null;
    }
  }

  /**
   * Fecha conexões
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
      }
      if (this.subscriber) {
        await this.subscriber.quit();
      }
      if (this.publisher) {
        await this.publisher.quit();
      }
      
      this.isConnected = false;
      console.log('Redis connections closed');
    } catch (error) {
      console.error('Error closing Redis connections:', error);
    }
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = redisService;
