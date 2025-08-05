import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Browser, Page } from 'puppeteer';
import { AntiDetectionService, AntiDetectionOptions } from './anti-detection.service';

export interface SessionData {
  id: string;
  userId: string;
  platform: string;
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  createdAt: Date;
  lastUsedAt: Date;
  userAgent: string;
  proxyId?: string;
  fingerprintId?: string;
  isActive: boolean;
  failureCount: number;
  successCount: number;
}

@Injectable()
export class SessionManagerService {
  private readonly logger = new Logger(SessionManagerService.name);
  private readonly sessionsDir: string;
  private sessions: Map<string, SessionData> = new Map();
  private activeBrowsers: Map<string, Browser> = new Map();

  constructor(
    private configService: ConfigService,
    private antiDetectionService: AntiDetectionService,
  ) {
    this.sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
    
    // Load existing sessions
    this.loadSessions();
  }

  private loadSessions() {
    try {
      const files = fs.readdirSync(this.sessionsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const session = JSON.parse(data) as SessionData;
          
          // Convert date strings to Date objects
          session.createdAt = new Date(session.createdAt);
          session.lastUsedAt = new Date(session.lastUsedAt);
          
          this.sessions.set(session.id, session);
        }
      }
      
      this.logger.log(`Loaded ${this.sessions.size} sessions`);
    } catch (error) {
      this.logger.error(`Error loading sessions: ${error.message}`);
    }
  }

  private async saveSession(session: SessionData) {
    try {
      const filePath = path.join(this.sessionsDir, `${session.id}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      this.logger.error(`Error saving session ${session.id}: ${error.message}`);
    }
  }

  async createSession(
    userId: string,
    platform: string,
    options: AntiDetectionOptions = {},
  ): Promise<string> {
    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Create session data
    const session: SessionData = {
      id: sessionId,
      userId,
      platform,
      cookies: [],
      localStorage: {},
      sessionStorage: {},
      createdAt: new Date(),
      lastUsedAt: new Date(),
      userAgent: '',
      isActive: true,
      failureCount: 0,
      successCount: 0,
    };
    
    // Store session
    this.sessions.set(sessionId, session);
    await this.saveSession(session);
    
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getUserSessions(userId: string, platform?: string): Promise<SessionData[]> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive);
    
    if (platform) {
      return userSessions.filter(session => session.platform === platform);
    }
    
    return userSessions;
  }

  async getBrowser(sessionId: string, url?: string): Promise<Browser> {
    // Check if browser already exists for this session
    if (this.activeBrowsers.has(sessionId)) {
      return this.activeBrowsers.get(sessionId);
    }
    
    // Get session data
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Create browser with anti-detection
    const browser = await this.antiDetectionService.createBrowser({
      platform: session.platform as any,
      useProxy: true,
      useFingerprinting: true,
      useCaptchaSolver: true,
      useHumanBehavior: true,
      persistSession: true,
      sessionId,
    });
    
    // Store browser
    this.activeBrowsers.set(sessionId, browser);
    
    // Handle browser disconnection
    browser.on('disconnected', () => {
      this.activeBrowsers.delete(sessionId);
    });
    
    return browser;
  }

  async getPage(sessionId: string, url?: string): Promise<Page> {
    // Get browser
    const browser = await this.getBrowser(sessionId);
    
    // Create page with anti-detection
    const page = await this.antiDetectionService.setupPage(browser, url);
    
    // Get session data
    const session = await this.getSession(sessionId);
    
    // Restore cookies if available
    if (session.cookies && session.cookies.length > 0) {
      await page.setCookie(...session.cookies);
    }
    
    // Restore localStorage and sessionStorage if available
    if (Object.keys(session.localStorage).length > 0 || Object.keys(session.sessionStorage).length > 0) {
      await page.evaluateOnNewDocument((data) => {
        // Restore localStorage
        for (const [key, value] of Object.entries(data.localStorage)) {
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            console.error(`Error setting localStorage item ${key}:`, e);
          }
        }
        
        // Restore sessionStorage
        for (const [key, value] of Object.entries(data.sessionStorage)) {
          try {
            sessionStorage.setItem(key, value);
          } catch (e) {
            console.error(`Error setting sessionStorage item ${key}:`, e);
          }
        }
      }, {
        localStorage: session.localStorage,
        sessionStorage: session.sessionStorage,
      });
    }
    
    // Update session data
    session.lastUsedAt = new Date();
    await this.saveSession(session);
    
    return page;
  }

  async savePageState(sessionId: string, page: Page): Promise<void> {
    // Get session data
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Get cookies
    session.cookies = await page.cookies();
    
    // Get localStorage and sessionStorage
    const storageData = await page.evaluate(() => {
      const localStorage: Record<string, string> = {};
      const sessionStorage: Record<string, string> = {};
      
      // Get localStorage
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        localStorage[key] = window.localStorage.getItem(key);
      }
      
      // Get sessionStorage
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        sessionStorage[key] = window.sessionStorage.getItem(key);
      }
      
      return { localStorage, sessionStorage };
    });
    
    session.localStorage = storageData.localStorage;
    session.sessionStorage = storageData.sessionStorage;
    
    // Get user agent
    session.userAgent = await page.evaluate(() => navigator.userAgent);
    
    // Update session data
    session.lastUsedAt = new Date();
    await this.saveSession(session);
  }

  async closeBrowser(sessionId: string): Promise<void> {
    // Check if browser exists
    if (this.activeBrowsers.has(sessionId)) {
      const browser = this.activeBrowsers.get(sessionId);
      
      // Close browser
      await browser.close();
      
      // Remove from active browsers
      this.activeBrowsers.delete(sessionId);
    }
  }

  async closeAllBrowsers(): Promise<void> {
    // Close all browsers
    for (const [sessionId, browser] of this.activeBrowsers.entries()) {
      try {
        await browser.close();
      } catch (error) {
        this.logger.error(`Error closing browser for session ${sessionId}: ${error.message}`);
      }
    }
    
    // Clear active browsers
    this.activeBrowsers.clear();
  }

  async deactivateSession(sessionId: string): Promise<void> {
    // Get session data
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Close browser if active
    await this.closeBrowser(sessionId);
    
    // Deactivate session
    session.isActive = false;
    await this.saveSession(session);
  }

  async reportSessionSuccess(sessionId: string): Promise<void> {
    // Get session data
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Update success count
    session.successCount++;
    await this.saveSession(session);
  }

  async reportSessionFailure(sessionId: string): Promise<void> {
    // Get session data
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Update failure count
    session.failureCount++;
    
    // Deactivate session if too many failures
    if (session.failureCount >= 5) {
      session.isActive = false;
    }
    
    await this.saveSession(session);
  }

  async cleanupSessions(): Promise<void> {
    // Get all sessions
    const sessions = Array.from(this.sessions.values());
    
    // Find inactive or old sessions
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const sessionsToRemove = sessions.filter(session => 
      !session.isActive || session.lastUsedAt < thirtyDaysAgo
    );
    
    // Remove sessions
    for (const session of sessionsToRemove) {
      // Close browser if active
      await this.closeBrowser(session.id);
      
      // Remove session
      this.sessions.delete(session.id);
      
      // Remove session file
      const filePath = path.join(this.sessionsDir, `${session.id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    this.logger.log(`Cleaned up ${sessionsToRemove.length} sessions`);
  }
}
