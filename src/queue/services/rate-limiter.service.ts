import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';
import { UsersService } from '../../users/services/users.service';
import { UserSubscriptionTier } from '../../users/entities/user-subscription.entity';

interface RateLimitConfig {
  points: number;
  duration: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly redis: Redis.Redis;
  private readonly rateLimits: Record<string, RateLimitConfig>;
  private readonly tierMultipliers: Record<UserSubscriptionTier, number>;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // Initialize Redis client
    this.redis = new Redis({
      host: this.configService.get('redis.host', 'localhost'),
      port: this.configService.get('redis.port', 6379),
      password: this.configService.get('redis.password', ''),
      db: this.configService.get('redis.db', 0),
    });

    // Initialize rate limits from config
    this.rateLimits = {
      linkedin: {
        points: this.configService.get('queue.rateLimits.linkedin.points', 100),
        duration: this.configService.get('queue.rateLimits.linkedin.duration', 60),
      },
      infojobs: {
        points: this.configService.get('queue.rateLimits.infojobs.points', 100),
        duration: this.configService.get('queue.rateLimits.infojobs.duration', 60),
      },
      catho: {
        points: this.configService.get('queue.rateLimits.catho.points', 100),
        duration: this.configService.get('queue.rateLimits.catho.duration', 60),
      },
      indeed: {
        points: this.configService.get('queue.rateLimits.indeed.points', 100),
        duration: this.configService.get('queue.rateLimits.indeed.duration', 60),
      },
    };

    // Define tier multipliers
    this.tierMultipliers = {
      [UserSubscriptionTier.BASIC]: 1,
      [UserSubscriptionTier.PLUS]: 2,
      [UserSubscriptionTier.PREMIUM]: 3,
    };
  }

  /**
   * Consume a point from the rate limiter
   * Returns true if the request can proceed, false if rate limited
   */
  async consume(platform: string, userId: string): Promise<boolean> {
    try {
      // Get rate limit config for the platform
      const config = this.rateLimits[platform];
      if (!config) {
        this.logger.warn(`No rate limit config found for platform ${platform}`);
        return true; // Allow if no config
      }

      // Get user subscription tier
      const user = await this.usersService.findById(userId);
      const tier = user?.subscription?.tier || UserSubscriptionTier.BASIC;
      
      // Calculate points based on tier
      const tierMultiplier = this.tierMultipliers[tier] || 1;
      const maxPoints = config.points * tierMultiplier;
      
      // Create Redis key
      const key = `ratelimit:${platform}:${userId}`;
      
      // Check if key exists
      const exists = await this.redis.exists(key);
      
      if (!exists) {
        // Key doesn't exist, create it with initial value of 1
        await this.redis.set(key, 1, 'EX', config.duration);
        return true;
      }
      
      // Get current value
      const current = await this.redis.get(key);
      const currentPoints = parseInt(current, 10);
      
      if (currentPoints >= maxPoints) {
        // Rate limit exceeded
        this.logger.warn(`Rate limit exceeded for ${platform} by user ${userId}: ${currentPoints}/${maxPoints}`);
        return false;
      }
      
      // Increment counter
      await this.redis.incr(key);
      
      return true;
    } catch (error) {
      this.logger.error(`Error in rate limiter: ${error.message}`);
      return true; // Allow in case of error
    }
  }

  /**
   * Get current rate limit status for a user and platform
   */
  async getStatus(platform: string, userId: string): Promise<any> {
    try {
      // Get rate limit config for the platform
      const config = this.rateLimits[platform];
      if (!config) {
        return {
          platform,
          userId,
          allowed: true,
          message: 'No rate limit configured',
        };
      }

      // Get user subscription tier
      const user = await this.usersService.findById(userId);
      const tier = user?.subscription?.tier || UserSubscriptionTier.BASIC;
      
      // Calculate points based on tier
      const tierMultiplier = this.tierMultipliers[tier] || 1;
      const maxPoints = config.points * tierMultiplier;
      
      // Create Redis key
      const key = `ratelimit:${platform}:${userId}`;
      
      // Check if key exists
      const exists = await this.redis.exists(key);
      
      if (!exists) {
        return {
          platform,
          userId,
          allowed: true,
          points: 0,
          maxPoints,
          remaining: maxPoints,
          resetIn: 0,
        };
      }
      
      // Get current value and TTL
      const [current, ttl] = await Promise.all([
        this.redis.get(key),
        this.redis.ttl(key),
      ]);
      
      const currentPoints = parseInt(current, 10);
      const remaining = Math.max(0, maxPoints - currentPoints);
      
      return {
        platform,
        userId,
        allowed: currentPoints < maxPoints,
        points: currentPoints,
        maxPoints,
        remaining,
        resetIn: ttl,
      };
    } catch (error) {
      this.logger.error(`Error getting rate limit status: ${error.message}`);
      return {
        platform,
        userId,
        allowed: true,
        error: error.message,
      };
    }
  }

  /**
   * Reset rate limit for a user and platform
   */
  async reset(platform: string, userId: string): Promise<boolean> {
    try {
      const key = `ratelimit:${platform}:${userId}`;
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error resetting rate limit: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all rate limits for a user
   */
  async getAllForUser(userId: string): Promise<any[]> {
    const platforms = Object.keys(this.rateLimits);
    const results = await Promise.all(
      platforms.map(platform => this.getStatus(platform, userId)),
    );
    return results;
  }
}
