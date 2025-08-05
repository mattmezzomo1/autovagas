import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperSession, ScraperPlatform, SessionStatus } from '../entities/scraper-session.entity';
import { ProxyService } from './proxy.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { SubscriptionPlan } from '../../users/entities/user.entity';

@Injectable()
export class ScraperSessionService {
  private readonly logger = new Logger(ScraperSessionService.name);
  private readonly userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  ];

  constructor(
    @InjectRepository(ScraperSession)
    private scraperSessionRepository: Repository<ScraperSession>,
    private proxyService: ProxyService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async createSession(
    userId: string,
    platform: ScraperPlatform,
    cookies: any,
    headers?: any,
    isClientSide: boolean = false,
  ): Promise<ScraperSession> {
    // Check if user has an active session for this platform
    const existingSession = await this.findActiveSessionByUserAndPlatform(userId, platform);
    if (existingSession) {
      // Update existing session
      existingSession.cookies = cookies;
      if (headers) {
        existingSession.headers = headers;
      }
      existingSession.status = SessionStatus.ACTIVE;
      existingSession.lastRequestAt = new Date();
      existingSession.expiresAt = this.calculateExpirationDate(platform);
      existingSession.isClientSide = isClientSide;
      
      return this.scraperSessionRepository.save(existingSession);
    }

    // Get user to check subscription plan
    const user = await this.usersService.findById(userId);
    
    // Determine if proxy should be used based on subscription plan
    let proxyUrl = null;
    if (!isClientSide && user.subscriptionPlan !== SubscriptionPlan.BASIC) {
      const proxy = await this.proxyService.getProxy();
      if (proxy) {
        proxyUrl = this.proxyService.getProxyUrl(proxy);
      }
    }

    // Create new session
    const session = this.scraperSessionRepository.create({
      userId,
      platform,
      cookies,
      headers,
      status: SessionStatus.ACTIVE,
      userAgent: this.getRandomUserAgent(),
      proxyUrl,
      lastRequestAt: new Date(),
      expiresAt: this.calculateExpirationDate(platform),
      isClientSide,
    });

    return this.scraperSessionRepository.save(session);
  }

  async findById(id: string): Promise<ScraperSession> {
    const session = await this.scraperSessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async findActiveSessionByUserAndPlatform(
    userId: string,
    platform: ScraperPlatform,
  ): Promise<ScraperSession | null> {
    return this.scraperSessionRepository.findOne({
      where: {
        userId,
        platform,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async updateSession(
    id: string,
    updates: Partial<ScraperSession>,
  ): Promise<ScraperSession> {
    const session = await this.findById(id);
    
    // Apply updates
    Object.assign(session, updates);
    
    return this.scraperSessionRepository.save(session);
  }

  async invalidateSession(id: string, reason?: string): Promise<ScraperSession> {
    const session = await this.findById(id);
    
    session.status = SessionStatus.INVALID;
    if (reason) {
      session.errorMessage = reason;
    }
    
    return this.scraperSessionRepository.save(session);
  }

  async markSessionAsRateLimited(id: string): Promise<ScraperSession> {
    const session = await this.findById(id);
    
    session.status = SessionStatus.RATE_LIMITED;
    session.errorMessage = 'Rate limited by platform';
    
    return this.scraperSessionRepository.save(session);
  }

  async incrementRequestCount(id: string): Promise<ScraperSession> {
    const session = await this.findById(id);
    
    session.requestCount += 1;
    session.lastRequestAt = new Date();
    
    return this.scraperSessionRepository.save(session);
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    
    const result = await this.scraperSessionRepository.update(
      {
        status: SessionStatus.ACTIVE,
        expiresAt: { $lt: now },
      },
      {
        status: SessionStatus.EXPIRED,
      },
    );
    
    return result.affected || 0;
  }

  private getRandomUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }

  private calculateExpirationDate(platform: ScraperPlatform): Date {
    const now = new Date();
    let expirationHours = 24; // Default expiration
    
    // Platform-specific expiration times
    switch (platform) {
      case ScraperPlatform.LINKEDIN:
        expirationHours = 48; // LinkedIn sessions last longer
        break;
      case ScraperPlatform.INFOJOBS:
        expirationHours = 24;
        break;
      case ScraperPlatform.CATHO:
        expirationHours = 12;
        break;
      case ScraperPlatform.INDEED:
        expirationHours = 24;
        break;
    }
    
    return new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
  }
}
