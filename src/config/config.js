/**
 * Configurações do backend para os serviços administrativos
 */

module.exports = {
  // Configurações do servidor
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',

  // Configurações do banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'autovagas',
    schema: process.env.DB_SCHEMA || 'public',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // Configurações do Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },

  // Configurações do JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_should_be_very_long_and_complex',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_should_be_different_from_access_token',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // Configurações de email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@autovagas.com',
  },

  // Configurações do Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    basicPlanId: process.env.STRIPE_BASIC_PLAN_ID,
    plusPlanId: process.env.STRIPE_PLUS_PLAN_ID,
    premiumPlanId: process.env.STRIPE_PREMIUM_PLAN_ID,
    currency: process.env.STRIPE_CURRENCY || 'brl',
    trialPeriodDays: parseInt(process.env.STRIPE_TRIAL_PERIOD_DAYS, 10) || 7,
    gracePeriodDays: parseInt(process.env.STRIPE_GRACE_PERIOD_DAYS, 10) || 3,
  },

  // Configurações do scraper
  scraper: {
    maxRetries: parseInt(process.env.SCRAPER_MAX_RETRIES, 10) || 3,
    retryDelayMs: parseInt(process.env.SCRAPER_RETRY_DELAY_MS, 10) || 300000, // 5 minutes
    maxConcurrentJobs: parseInt(process.env.SCRAPER_MAX_CONCURRENT_JOBS, 10) || 5,
    jobCleanupDays: parseInt(process.env.SCRAPER_JOB_CLEANUP_DAYS, 10) || 7,
    antiDetection: {
      enabled: process.env.SCRAPER_ANTI_DETECTION_ENABLED === 'true',
      useProxies: process.env.SCRAPER_USE_PROXIES === 'true',
      useUserAgentRotation: process.env.SCRAPER_USE_USER_AGENT_ROTATION === 'true',
      useFingerprinting: process.env.SCRAPER_USE_FINGERPRINTING === 'true',
      useHumanBehavior: process.env.SCRAPER_USE_HUMAN_BEHAVIOR === 'true',
      useCaptchaSolver: process.env.SCRAPER_USE_CAPTCHA_SOLVER === 'true',
      usePersistentSessions: process.env.SCRAPER_USE_PERSISTENT_SESSIONS === 'true',
    },
  },

  // Configurações do Redis
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },

  // Configurações de Cache
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_TTL) || 3600,
    maxMemoryItems: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },

  // Configurações do WebSocket
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED !== 'false',
    transports: ['websocket', 'polling'],
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000
  },

  // Configurações de CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4200', 'http://localhost:3000'],
  },

  // Configurações do frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
  },
};
