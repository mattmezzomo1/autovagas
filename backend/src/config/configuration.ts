export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'jobhunt',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'jobhunt-documents',
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    plans: {
      basic: {
        id: process.env.STRIPE_BASIC_PLAN_ID || 'price_basic_monthly',
        price: 1990, // R$19.90
        credits: 10,
      },
      plus: {
        id: process.env.STRIPE_PLUS_PLAN_ID || 'price_plus_monthly',
        price: 4990, // R$49.90
        credits: 100,
      },
      premium: {
        id: process.env.STRIPE_PREMIUM_PLAN_ID || 'price_premium_monthly',
        price: 9990, // R$99.90
        credits: 1000,
      },
    },
  },

  ai: {
    apiKey: process.env.AI_API_KEY,
    endpoint: process.env.AI_ENDPOINT,
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60, // seconds
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100, // requests per TTL
  },

  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: process.env.UPLOAD_ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || 'logs',
  },
});
