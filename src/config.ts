import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 */
export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'autovagas'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Proxy configuration
  proxy: {
    // Enable proxy rotation
    enabled: process.env.PROXY_ENABLED === 'true',

    // Bright Data configuration
    brightdata: {
      enabled: process.env.BRIGHTDATA_ENABLED === 'true',
      apiKey: process.env.BRIGHTDATA_API_KEY || '',
      zoneId: process.env.BRIGHTDATA_ZONE_ID || ''
    },

    // Oxylabs configuration
    oxylabs: {
      enabled: process.env.OXYLABS_ENABLED === 'true',
      username: process.env.OXYLABS_USERNAME || '',
      password: process.env.OXYLABS_PASSWORD || ''
    },

    // SmartProxy configuration
    smartproxy: {
      enabled: process.env.SMARTPROXY_ENABLED === 'true',
      username: process.env.SMARTPROXY_USERNAME || '',
      password: process.env.SMARTPROXY_PASSWORD || ''
    },

    // Local proxy configuration
    local: {
      enabled: process.env.LOCAL_PROXY_ENABLED === 'true',
      proxyListPath: process.env.LOCAL_PROXY_LIST_PATH || path.join(__dirname, '../proxies.txt')
    }
  },

  // Scraper configuration
  scraper: {
    // Maximum concurrent scraping tasks
    maxConcurrentTasks: parseInt(process.env.MAX_CONCURRENT_TASKS || '10', 10),

    // Default timeout for scraping tasks (in milliseconds)
    defaultTimeout: parseInt(process.env.DEFAULT_SCRAPER_TIMEOUT || '60000', 10),

    // User agent rotation
    userAgentRotation: process.env.USER_AGENT_ROTATION === 'true',

    // Delay between requests (in milliseconds)
    minDelay: parseInt(process.env.MIN_SCRAPER_DELAY || '1000', 10),
    maxDelay: parseInt(process.env.MAX_SCRAPER_DELAY || '5000', 10),

    // Cache configuration
    cache: {
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.CACHE_TTL || '3600000', 10), // 1 hour in milliseconds
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10) // Maximum number of items in cache
    }
  },

  // User tiers configuration
  userTiers: {
    basic: {
      maxSearchesPerDay: parseInt(process.env.BASIC_MAX_SEARCHES_PER_DAY || '10', 10),
      maxJobDetailsPerDay: parseInt(process.env.BASIC_MAX_JOB_DETAILS_PER_DAY || '50', 10),
      useServerSideScraping: process.env.BASIC_USE_SERVER_SIDE_SCRAPING === 'true'
    },
    plus: {
      maxSearchesPerDay: parseInt(process.env.PLUS_MAX_SEARCHES_PER_DAY || '30', 10),
      maxJobDetailsPerDay: parseInt(process.env.PLUS_MAX_JOB_DETAILS_PER_DAY || '150', 10),
      useServerSideScraping: process.env.PLUS_USE_SERVER_SIDE_SCRAPING === 'true'
    },
    premium: {
      maxSearchesPerDay: parseInt(process.env.PREMIUM_MAX_SEARCHES_PER_DAY || '100', 10),
      maxJobDetailsPerDay: parseInt(process.env.PREMIUM_MAX_JOB_DETAILS_PER_DAY || '500', 10),
      useServerSideScraping: process.env.PREMIUM_USE_SERVER_SIDE_SCRAPING === 'true'
    }
  },

  // Scaling configuration
  scaling: {
    // Maximum number of worker processes (defaults to number of CPU cores)
    maxWorkers: parseInt(process.env.MAX_WORKERS || '0', 10),

    // Auto-scaling settings
    autoScaling: process.env.AUTO_SCALING === 'true',
    minWorkers: parseInt(process.env.MIN_WORKERS || '1', 10),

    // Load balancing settings
    loadBalancing: {
      strategy: process.env.LOAD_BALANCING_STRATEGY || 'round-robin', // 'round-robin', 'least-connections', 'ip-hash'
      sticky: process.env.STICKY_SESSIONS === 'true'
    },

    // Redis configuration for distributed task queue
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10)
    }
  }
};
