export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: process.env.DB_SCHEMA || 'public',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  frontend: {
    url: process.env.FRONTEND_URL,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },

  ai: {
    apiKey: process.env.AI_API_KEY,
    apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || 'gpt-4',
  },

  proxy: {
    apiUrl: process.env.PROXY_API_URL,
    apiKey: process.env.PROXY_API_KEY,
    staticProxies: process.env.STATIC_PROXIES ? JSON.parse(process.env.STATIC_PROXIES) : [],
  },

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

  captcha: {
    apiKey: process.env.CAPTCHA_API_KEY,
    provider: process.env.CAPTCHA_PROVIDER || '2captcha',
    timeout: parseInt(process.env.CAPTCHA_TIMEOUT, 10) || 120000, // 2 minutes
  },

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

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  queue: {
    concurrency: {
      linkedinScraper: parseInt(process.env.QUEUE_CONCURRENCY_LINKEDIN, 10) || 5,
      infojobsScraper: parseInt(process.env.QUEUE_CONCURRENCY_INFOJOBS, 10) || 5,
      cathoScraper: parseInt(process.env.QUEUE_CONCURRENCY_CATHO, 10) || 5,
      indeedScraper: parseInt(process.env.QUEUE_CONCURRENCY_INDEED, 10) || 5,
      autoApply: parseInt(process.env.QUEUE_CONCURRENCY_AUTO_APPLY, 10) || 3,
    },
    rateLimits: {
      linkedin: {
        points: parseInt(process.env.RATE_LIMIT_LINKEDIN_POINTS, 10) || 100,
        duration: parseInt(process.env.RATE_LIMIT_LINKEDIN_DURATION, 10) || 60, // 60 seconds
      },
      infojobs: {
        points: parseInt(process.env.RATE_LIMIT_INFOJOBS_POINTS, 10) || 100,
        duration: parseInt(process.env.RATE_LIMIT_INFOJOBS_DURATION, 10) || 60,
      },
      catho: {
        points: parseInt(process.env.RATE_LIMIT_CATHO_POINTS, 10) || 100,
        duration: parseInt(process.env.RATE_LIMIT_CATHO_DURATION, 10) || 60,
      },
      indeed: {
        points: parseInt(process.env.RATE_LIMIT_INDEED_POINTS, 10) || 100,
        duration: parseInt(process.env.RATE_LIMIT_INDEED_DURATION, 10) || 60,
      },
    },
    circuitBreaker: {
      failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD, 10) || 50,
      successThreshold: parseInt(process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD, 10) || 5,
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 10) || 60000, // 1 minute
    },
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4200'],
  },
});
