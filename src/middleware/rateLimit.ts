import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user/UserService';
import { config } from '../config';

// Store request counts by user ID
const requestCounts: Map<string, { count: number, resetTime: number }> = new Map();

// Rate limits by tier (requests per minute)
const rateLimits = {
  basic: 10,
  plus: 30,
  premium: 60
};

/**
 * Middleware for rate limiting API requests based on user tier
 */
export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next();
    }
    
    // Get current time
    const now = Date.now();
    
    // Get or create user's request count
    let userRequests = requestCounts.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset count if time window has passed
      userRequests = {
        count: 0,
        resetTime: now + 60000 // 1 minute
      };
    }
    
    // Get user's tier
    const userService = new UserService();
    const tier = await userService.getUserTier(userId);
    
    // Get rate limit for user's tier
    const limit = rateLimits[tier] || rateLimits.basic;
    
    // Check if user has exceeded rate limit
    if (userRequests.count >= limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit,
        resetTime: userRequests.resetTime,
        tierLimit: `${limit} requests per minute for ${tier} tier`
      });
    }
    
    // Increment request count
    userRequests.count++;
    requestCounts.set(userId, userRequests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', userRequests.resetTime.toString());
    
    next();
  } catch (error) {
    console.error('Error in rate limit middleware:', error);
    next();
  }
};
