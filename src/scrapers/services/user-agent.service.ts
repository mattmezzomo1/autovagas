import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UserAgentStats {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  mobile: boolean;
  successCount: number;
  failureCount: number;
  banCount: number;
  lastUsed?: Date;
  blacklistedUntil?: Date;
  blacklistedFor?: string[];
}

export interface UserAgentOptions {
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera';
  os?: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
  mobile?: boolean;
  minVersion?: number;
  platform?: 'linkedin' | 'indeed' | 'infojobs' | 'catho';
  excludeUserAgents?: string[];
}

@Injectable()
export class UserAgentService implements OnModuleInit {
  private readonly logger = new Logger(UserAgentService.name);
  private userAgents: Map<string, UserAgentStats> = new Map();
  
  // Browser fingerprints for different platforms
  private platformFingerprints = {
    linkedin: {
      preferredBrowsers: ['chrome', 'edge'],
      preferredOs: ['windows', 'macos'],
      mobile: false,
      minVersion: 90
    },
    indeed: {
      preferredBrowsers: ['chrome', 'firefox'],
      preferredOs: ['windows', 'macos'],
      mobile: false,
      minVersion: 90
    },
    infojobs: {
      preferredBrowsers: ['chrome', 'firefox'],
      preferredOs: ['windows'],
      mobile: false,
      minVersion: 90
    },
    catho: {
      preferredBrowsers: ['chrome', 'firefox'],
      preferredOs: ['windows'],
      mobile: false,
      minVersion: 90
    }
  };

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialize user agents
    await this.initializeUserAgents();
    
    // Load user agent stats from disk
    await this.loadUserAgentStatsFromDisk();
    
    this.logger.log(`Initialized with ${this.userAgents.size} user agents`);
  }

  private async initializeUserAgents() {
    // Chrome Desktop - Latest versions
    this.addUserAgents([
      // Chrome 120-123 (Latest versions as of 2024)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    ], 'chrome', false);
    
    // Chrome Mobile
    this.addUserAgents([
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.0.0 Mobile/15E148 Safari/604.1',
    ], 'chrome', true);
    
    // Firefox Desktop
    this.addUserAgents([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0',
    ], 'firefox', false);
    
    // Firefox Mobile
    this.addUserAgents([
      'Mozilla/5.0 (Android 13; Mobile; rv:123.0) Gecko/123.0 Firefox/123.0',
      'Mozilla/5.0 (Android 13; Mobile; rv:122.0) Gecko/122.0 Firefox/122.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/122.0 Mobile/15E148 Safari/605.1.15',
    ], 'firefox', true);
    
    // Safari Desktop
    this.addUserAgents([
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    ], 'safari', false);
    
    // Safari Mobile
    this.addUserAgents([
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    ], 'safari', true);
    
    // Edge Desktop
    this.addUserAgents([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    ], 'edge', false);
    
    // Edge Mobile
    this.addUserAgents([
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 EdgA/123.0.0.0',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.0.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 EdgiOS/123.0.0.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 EdgiOS/122.0.0.0 Mobile/15E148 Safari/605.1.15',
    ], 'edge', true);
    
    // Opera Desktop
    this.addUserAgents([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0',
    ], 'opera', false);
    
    // Opera Mobile
    this.addUserAgents([
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 OPR/76.0.0.0',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 OPR/75.0.0.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/3.4.0 Mobile/15E148',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/3.3.0 Mobile/15E148',
    ], 'opera', true);
  }

  private addUserAgents(userAgents: string[], browser: string, mobile: boolean) {
    for (const ua of userAgents) {
      // Extract browser version
      let browserVersion = '0';
      
      if (browser === 'chrome') {
        const match = ua.match(/Chrome\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (browser === 'firefox') {
        const match = ua.match(/Firefox\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (browser === 'safari') {
        const match = ua.match(/Version\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (browser === 'edge') {
        const match = ua.match(/Edg[A]?\/(\d+)/);
        if (match) browserVersion = match[1];
      } else if (browser === 'opera') {
        const match = ua.match(/OPR\/(\d+)/);
        if (match) browserVersion = match[1];
      }
      
      // Determine OS
      let os = 'unknown';
      if (ua.includes('Windows')) {
        os = 'windows';
      } else if (ua.includes('Macintosh')) {
        os = 'macos';
      } else if (ua.includes('Linux') && !ua.includes('Android')) {
        os = 'linux';
      } else if (ua.includes('Android')) {
        os = 'android';
      } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'ios';
      }
      
      // Add to user agents map
      this.userAgents.set(ua, {
        userAgent: ua,
        browser,
        browserVersion,
        os,
        mobile,
        successCount: 0,
        failureCount: 0,
        banCount: 0
      });
    }
  }

  getUserAgent(options: UserAgentOptions = {}): string {
    // Filter user agents based on options
    let filteredUserAgents = Array.from(this.userAgents.values());
    
    // Filter by browser
    if (options.browser) {
      filteredUserAgents = filteredUserAgents.filter(ua => 
        ua.browser === options.browser
      );
    }
    
    // Filter by OS
    if (options.os) {
      filteredUserAgents = filteredUserAgents.filter(ua => 
        ua.os === options.os
      );
    }
    
    // Filter by mobile
    if (options.mobile !== undefined) {
      filteredUserAgents = filteredUserAgents.filter(ua => 
        ua.mobile === options.mobile
      );
    }
    
    // Filter by minimum version
    if (options.minVersion) {
      filteredUserAgents = filteredUserAgents.filter(ua => 
        parseInt(ua.browserVersion) >= options.minVersion
      );
    }
    
    // Filter out excluded user agents
    if (options.excludeUserAgents && options.excludeUserAgents.length > 0) {
      filteredUserAgents = filteredUserAgents.filter(ua => 
        !options.excludeUserAgents.includes(ua.userAgent)
      );
    }
    
    // Filter out blacklisted user agents for the specific platform
    filteredUserAgents = filteredUserAgents.filter(ua => {
      if (!ua.blacklistedUntil) return true;
      
      // If blacklist has expired, clear it
      if (ua.blacklistedUntil < new Date()) {
        ua.blacklistedUntil = undefined;
        ua.blacklistedFor = undefined;
        return true;
      }
      
      // If blacklisted for all platforms or the specific platform
      if (!ua.blacklistedFor || 
          !options.platform || 
          ua.blacklistedFor.includes(options.platform)) {
        return false;
      }
      
      return true;
    });
    
    // If platform is specified, use platform-specific fingerprints
    if (options.platform && this.platformFingerprints[options.platform]) {
      const fingerprint = this.platformFingerprints[options.platform];
      
      // Apply platform-specific filters if we have enough user agents
      let platformFiltered = filteredUserAgents.filter(ua => 
        fingerprint.preferredBrowsers.includes(ua.browser) &&
        (fingerprint.preferredOs.includes(ua.os)) &&
        ua.mobile === fingerprint.mobile &&
        parseInt(ua.browserVersion) >= fingerprint.minVersion
      );
      
      // If we have enough user agents after filtering, use them
      if (platformFiltered.length >= 5) {
        filteredUserAgents = platformFiltered;
      }
    }
    
    if (filteredUserAgents.length === 0) {
      this.logger.warn('No suitable user agents found with the given criteria, using random one');
      filteredUserAgents = Array.from(this.userAgents.values());
    }
    
    // Select user agent using weighted random selection
    const selectedUserAgent = this.selectUserAgentWithWeightedRandom(filteredUserAgents);
    
    // Update last used time
    selectedUserAgent.lastUsed = new Date();
    
    // Save stats periodically
    this.saveUserAgentStatsToDisk().catch(err => 
      this.logger.error(`Error saving user agent stats: ${err.message}`)
    );
    
    return selectedUserAgent.userAgent;
  }

  private selectUserAgentWithWeightedRandom(userAgents: UserAgentStats[]): UserAgentStats {
    // Calculate weights for each user agent
    const weights = userAgents.map(ua => {
      // Base weight starts at 1
      let weight = 1;
      
      // Add weight based on success rate (0-5)
      const totalRequests = ua.successCount + ua.failureCount;
      if (totalRequests > 0) {
        const successRate = ua.successCount / totalRequests;
        weight += successRate * 5;
      }
      
      // Subtract weight based on ban count (0-3)
      weight -= Math.min(3, ua.banCount * 0.5);
      
      // Prefer user agents that haven't been used recently
      if (ua.lastUsed) {
        const hoursSinceLastUse = (Date.now() - ua.lastUsed.getTime()) / (1000 * 60 * 60);
        weight += Math.min(2, hoursSinceLastUse / 12); // Up to 2 points for not being used in 24 hours
      } else {
        weight += 1; // Bonus for never-used user agents
      }
      
      return Math.max(0.1, weight); // Ensure minimum weight of 0.1
    });
    
    // Calculate cumulative weights
    const cumulativeWeights = [];
    let sum = 0;
    
    for (const weight of weights) {
      sum += weight;
      cumulativeWeights.push(sum);
    }
    
    // Select a user agent based on weights
    const random = Math.random() * sum;
    const index = cumulativeWeights.findIndex(w => w >= random);
    
    return userAgents[index >= 0 ? index : 0];
  }

  async reportUserAgentSuccess(userAgent: string): Promise<void> {
    const ua = this.userAgents.get(userAgent);
    if (ua) {
      ua.successCount++;
      await this.saveUserAgentStatsToDisk();
    }
  }

  async reportUserAgentFailure(userAgent: string, platform?: string, isBanned: boolean = false): Promise<void> {
    const ua = this.userAgents.get(userAgent);
    if (ua) {
      if (isBanned) {
        ua.banCount++;
        if (platform) {
          this.blacklistUserAgent(userAgent, platform);
        }
      } else {
        ua.failureCount++;
      }
      await this.saveUserAgentStatsToDisk();
    }
  }

  blacklistUserAgent(userAgent: string, platform: string, durationHours: number = 24): void {
    const ua = this.userAgents.get(userAgent);
    if (ua) {
      const until = new Date(Date.now() + durationHours * 60 * 60 * 1000);
      
      ua.blacklistedUntil = until;
      ua.blacklistedFor = ua.blacklistedFor || [];
      
      if (!ua.blacklistedFor.includes(platform)) {
        ua.blacklistedFor.push(platform);
      }
      
      this.logger.warn(`Blacklisted user agent for ${platform} until ${until.toISOString()}: ${userAgent.substring(0, 50)}...`);
    }
  }

  private async saveUserAgentStatsToDisk(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'user-agents.json');
      const userAgentsArray = Array.from(this.userAgents.values());
      
      await fs.promises.writeFile(filePath, JSON.stringify(userAgentsArray, null, 2));
      this.logger.debug(`Saved ${userAgentsArray.length} user agent stats to disk`);
    } catch (error) {
      this.logger.error(`Error saving user agent stats to disk: ${error.message}`);
    }
  }

  private async loadUserAgentStatsFromDisk(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'data', 'user-agents.json');
      
      if (fs.existsSync(filePath)) {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const userAgentsArray = JSON.parse(data) as UserAgentStats[];
        
        // Convert dates from strings back to Date objects
        userAgentsArray.forEach(ua => {
          if (ua.lastUsed) ua.lastUsed = new Date(ua.lastUsed);
          if (ua.blacklistedUntil) ua.blacklistedUntil = new Date(ua.blacklistedUntil);
        });
        
        // Update existing user agents with stats
        for (const ua of userAgentsArray) {
          if (this.userAgents.has(ua.userAgent)) {
            const existingUa = this.userAgents.get(ua.userAgent);
            existingUa.successCount = ua.successCount || 0;
            existingUa.failureCount = ua.failureCount || 0;
            existingUa.banCount = ua.banCount || 0;
            existingUa.lastUsed = ua.lastUsed;
            existingUa.blacklistedUntil = ua.blacklistedUntil;
            existingUa.blacklistedFor = ua.blacklistedFor;
          }
        }
        
        this.logger.log(`Loaded stats for ${userAgentsArray.length} user agents from disk`);
      }
    } catch (error) {
      this.logger.error(`Error loading user agent stats from disk: ${error.message}`);
    }
  }

  getUserAgentStats(): any {
    const userAgents = Array.from(this.userAgents.values());
    
    return {
      totalUserAgents: userAgents.length,
      byBrowser: Object.fromEntries(
        Array.from(
          new Set(userAgents.map(ua => ua.browser))
        ).map(browser => [
          browser,
          userAgents.filter(ua => ua.browser === browser).length
        ])
      ),
      byOs: Object.fromEntries(
        Array.from(
          new Set(userAgents.map(ua => ua.os))
        ).map(os => [
          os,
          userAgents.filter(ua => ua.os === os).length
        ])
      ),
      byMobile: {
        desktop: userAgents.filter(ua => !ua.mobile).length,
        mobile: userAgents.filter(ua => ua.mobile).length
      },
      blacklisted: userAgents.filter(ua => ua.blacklistedUntil && ua.blacklistedUntil > new Date()).length
    };
  }
}
