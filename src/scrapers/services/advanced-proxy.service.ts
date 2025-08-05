import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface Proxy {
  id?: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  country?: string;
  city?: string;
  state?: string;
  residential: boolean;
  provider: string;
  lastUsed?: Date;
  successCount: number;
  failureCount: number;
  banCount: number;
  responseTime: number; // in milliseconds
  lastChecked?: Date;
  isHealthy: boolean;
  blacklistedUntil?: Date;
  blacklistedFor?: string[];
}

export interface ProxyProvider {
  name: string;
  enabled: boolean;
  apiUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  proxyListPath?: string;
  getProxies(): Promise<Proxy[]>;
}

export interface ProxySelectionOptions {
  country?: string;
  city?: string;
  state?: string;
  residential?: boolean;
  provider?: string;
  excludeIds?: string[];
  minSuccessRate?: number;
  platform?: 'linkedin' | 'indeed' | 'infojobs' | 'catho';
  forceHealthCheck?: boolean;
}

@Injectable()
export class AdvancedProxyService implements OnModuleInit {
  private readonly logger = new Logger(AdvancedProxyService.name);
  private proxies: Map<string, Proxy> = new Map();
  private providers: ProxyProvider[] = [];
  private proxyRefreshInterval: NodeJS.Timeout | null = null;
  private proxyHealthCheckInterval: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;
  private isCheckingHealth: boolean = false;
  private blacklistedProxies: Map<string, { until: Date, platforms: string[] }> = new Map();
  
  // Test URLs for different platforms
  private testUrls = {
    default: 'https://www.google.com',
    linkedin: 'https://www.linkedin.com/robots.txt',
    indeed: 'https://www.indeed.com/robots.txt',
    infojobs: 'https://www.infojobs.com.br/robots.txt',
    catho: 'https://www.catho.com.br/robots.txt'
  };

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialize providers
    this.initializeProviders();
    
    // Load proxies from disk if available
    await this.loadProxiesFromDisk();
    
    // Initial proxy refresh
    await this.refreshProxies();
    
    // Start periodic proxy refresh (every 1 hour)
    this.proxyRefreshInterval = setInterval(() => {
      this.refreshProxies().catch(err => 
        this.logger.error(`Error refreshing proxies: ${err.message}`)
      );
    }, 60 * 60 * 1000);
    
    // Start periodic health checks (every 15 minutes)
    this.proxyHealthCheckInterval = setInterval(() => {
      this.checkProxiesHealth().catch(err => 
        this.logger.error(`Error checking proxies health: ${err.message}`)
      );
    }, 15 * 60 * 1000);
  }

  private initializeProviders() {
    // Add API-based proxy provider if configured
    const apiUrl = this.configService.get<string>('proxy.apiUrl');
    const apiKey = this.configService.get<string>('proxy.apiKey');
    
    if (apiUrl && apiKey) {
      this.providers.push({
        name: 'api',
        enabled: true,
        apiUrl,
        apiKey,
        async getProxies(): Promise<Proxy[]> {
          try {
            const response = await axios.get(this.apiUrl, {
              headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            
            if (response.data && Array.isArray(response.data.proxies)) {
              return response.data.proxies.map(p => ({
                host: p.ip || p.host,
                port: p.port,
                username: p.username,
                password: p.password,
                protocol: p.protocol || 'http',
                country: p.country,
                city: p.city,
                state: p.state,
                residential: p.residential || false,
                provider: 'api',
                successCount: 0,
                failureCount: 0,
                banCount: 0,
                responseTime: 1000,
                isHealthy: true
              }));
            }
            return [];
          } catch (error) {
            console.error('Error fetching proxies from API:', error.message);
            return [];
          }
        }
      });
    }
    
    // Add static proxies provider
    const staticProxies = this.configService.get<any[]>('proxy.staticProxies');
    if (staticProxies && staticProxies.length > 0) {
      this.providers.push({
        name: 'static',
        enabled: true,
        async getProxies(): Promise<Proxy[]> {
          return staticProxies.map(p => ({
            host: p.host,
            port: p.port,
            username: p.username,
            password: p.password,
            protocol: p.protocol || 'http',
            country: p.country,
            residential: p.residential || false,
            provider: 'static',
            successCount: 0,
            failureCount: 0,
            banCount: 0,
            responseTime: 1000,
            isHealthy: true
          }));
        }
      });
    }
    
    this.logger.log(`Initialized ${this.providers.length} proxy providers`);
  }

  async refreshProxies(): Promise<void> {
    if (this.isRefreshing) {
      this.logger.debug('Proxy refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;
    this.logger.log('Starting proxy refresh');

    try {
      let newProxies: Proxy[] = [];
      
      // Get proxies from all providers
      for (const provider of this.providers) {
        if (!provider.enabled) continue;
        
        try {
          this.logger.debug(`Fetching proxies from ${provider.name}`);
          const providerProxies = await provider.getProxies();
          newProxies = [...newProxies, ...providerProxies];
          this.logger.debug(`Fetched ${providerProxies.length} proxies from ${provider.name}`);
        } catch (error) {
          this.logger.error(`Error fetching proxies from ${provider.name}: ${error.message}`);
        }
      }
      
      // Merge with existing proxies, preserving stats
      this.mergeProxies(newProxies);
      
      // Save proxies to disk
      await this.saveProxiesToDisk();
      
      this.logger.log(`Proxy refresh complete. Total proxies: ${this.proxies.size}`);
    } catch (error) {
      this.logger.error(`Error refreshing proxies: ${error.message}`);
    } finally {
      this.isRefreshing = false;
    }
  }

  private mergeProxies(newProxies: Proxy[]): void {
    // Process each new proxy
    for (const newProxy of newProxies) {
      // Generate ID if not present
      const proxyId = newProxy.id || this.generateProxyId(newProxy);
      newProxy.id = proxyId;
      
      // If proxy already exists, update it but preserve stats
      if (this.proxies.has(proxyId)) {
        const existingProxy = this.proxies.get(proxyId);
        
        // Keep existing stats
        newProxy.successCount = existingProxy.successCount || 0;
        newProxy.failureCount = existingProxy.failureCount || 0;
        newProxy.banCount = existingProxy.banCount || 0;
        newProxy.responseTime = existingProxy.responseTime || 1000;
        newProxy.lastUsed = existingProxy.lastUsed;
        newProxy.lastChecked = existingProxy.lastChecked;
        newProxy.isHealthy = existingProxy.isHealthy !== undefined ? existingProxy.isHealthy : true;
        newProxy.blacklistedUntil = existingProxy.blacklistedUntil;
        newProxy.blacklistedFor = existingProxy.blacklistedFor;
      }
      
      // Add to proxy pool
      this.proxies.set(proxyId, newProxy);
    }
    
    // Remove proxies that are no longer provided by any provider
    // but keep proxies that have been used successfully
    const newProxyIds = new Set(newProxies.map(p => p.id));
    
    for (const [proxyId, proxy] of this.proxies.entries()) {
      if (!newProxyIds.has(proxyId) && proxy.successCount === 0) {
        this.proxies.delete(proxyId);
      }
    }
  }

  private generateProxyId(proxy: Proxy): string {
    return `${proxy.host}:${proxy.port}:${proxy.protocol}`;
  }

  async getProxy(options: ProxySelectionOptions = {}): Promise<Proxy | null> {
    // Refresh proxies if needed
    if (this.proxies.size === 0) {
      await this.refreshProxies();
    }
    
    // Filter proxies based on options
    let filteredProxies = Array.from(this.proxies.values());
    
    // Filter by country
    if (options.country) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.country && proxy.country.toLowerCase() === options.country.toLowerCase()
      );
    }
    
    // Filter by city
    if (options.city) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.city && proxy.city.toLowerCase() === options.city.toLowerCase()
      );
    }
    
    // Filter by state
    if (options.state) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.state && proxy.state.toLowerCase() === options.state.toLowerCase()
      );
    }
    
    // Filter by residential
    if (options.residential !== undefined) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.residential === options.residential
      );
    }
    
    // Filter by provider
    if (options.provider) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.provider === options.provider
      );
    }
    
    // Filter out excluded proxies
    if (options.excludeIds && options.excludeIds.length > 0) {
      filteredProxies = filteredProxies.filter(proxy => 
        !options.excludeIds.includes(proxy.id)
      );
    }
    
    // Filter by minimum success rate
    if (options.minSuccessRate) {
      filteredProxies = filteredProxies.filter(proxy => {
        const totalRequests = proxy.successCount + proxy.failureCount;
        if (totalRequests === 0) return true; // Include untested proxies
        
        const successRate = proxy.successCount / totalRequests;
        return successRate >= options.minSuccessRate;
      });
    }
    
    // Filter out blacklisted proxies for the specific platform
    filteredProxies = filteredProxies.filter(proxy => {
      if (!proxy.blacklistedUntil) return true;
      
      // If blacklist has expired, clear it
      if (proxy.blacklistedUntil < new Date()) {
        proxy.blacklistedUntil = undefined;
        proxy.blacklistedFor = undefined;
        return true;
      }
      
      // If blacklisted for all platforms or the specific platform
      if (!proxy.blacklistedFor || 
          !options.platform || 
          proxy.blacklistedFor.includes(options.platform)) {
        return false;
      }
      
      return true;
    });
    
    // Filter out unhealthy proxies
    filteredProxies = filteredProxies.filter(proxy => proxy.isHealthy);
    
    if (filteredProxies.length === 0) {
      this.logger.warn('No suitable proxies found with the given criteria');
      return null;
    }
    
    // Select proxy using weighted random selection
    const selectedProxy = this.selectProxyWithWeightedRandom(filteredProxies, options.platform);
    
    // Force health check if requested
    if (options.forceHealthCheck) {
      const isHealthy = await this.checkProxyHealth(selectedProxy, options.platform);
      if (!isHealthy) {
        // Try again with this proxy excluded
        const newOptions = { 
          ...options, 
          excludeIds: [...(options.excludeIds || []), selectedProxy.id],
          forceHealthCheck: false // Avoid infinite recursion
        };
        return this.getProxy(newOptions);
      }
    }
    
    // Update last used time
    selectedProxy.lastUsed = new Date();
    
    return selectedProxy;
  }

  private selectProxyWithWeightedRandom(proxies: Proxy[], platform?: string): Proxy {
    // Calculate weights for each proxy
    const weights = proxies.map(proxy => {
      // Base weight starts at 1
      let weight = 1;
      
      // Add weight based on success rate (0-5)
      const totalRequests = proxy.successCount + proxy.failureCount;
      if (totalRequests > 0) {
        const successRate = proxy.successCount / totalRequests;
        weight += successRate * 5;
      }
      
      // Subtract weight based on ban count (0-3)
      weight -= Math.min(3, proxy.banCount * 0.5);
      
      // Add weight based on response time (0-3)
      // Faster proxies get higher weight
      if (proxy.responseTime > 0) {
        const responseTimeWeight = Math.min(3, 5000 / proxy.responseTime);
        weight += responseTimeWeight;
      }
      
      // Prefer proxies that haven't been used recently
      if (proxy.lastUsed) {
        const hoursSinceLastUse = (Date.now() - proxy.lastUsed.getTime()) / (1000 * 60 * 60);
        weight += Math.min(2, hoursSinceLastUse / 12); // Up to 2 points for not being used in 24 hours
      } else {
        weight += 1; // Bonus for never-used proxies
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
    
    // Select a proxy based on weights
    const random = Math.random() * sum;
    const index = cumulativeWeights.findIndex(w => w >= random);
    
    return proxies[index >= 0 ? index : 0];
  }

  async checkProxiesHealth(): Promise<void> {
    if (this.isCheckingHealth) {
      this.logger.debug('Health check already in progress, skipping');
      return;
    }
    
    this.isCheckingHealth = true;
    this.logger.log('Starting proxy health check');
    
    try {
      // Get proxies that haven't been checked recently (in the last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const proxiesToCheck = Array.from(this.proxies.values())
        .filter(proxy => !proxy.lastChecked || proxy.lastChecked < oneHourAgo);
      
      this.logger.log(`Checking health of ${proxiesToCheck.length} proxies`);
      
      // Check proxies in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < proxiesToCheck.length; i += batchSize) {
        const batch = proxiesToCheck.slice(i, i + batchSize);
        
        // Check proxies in parallel
        await Promise.all(batch.map(proxy => this.checkProxyHealth(proxy)));
        
        // Small delay between batches
        if (i + batchSize < proxiesToCheck.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Save updated proxies to disk
      await this.saveProxiesToDisk();
      
      this.logger.log('Proxy health check completed');
    } catch (error) {
      this.logger.error(`Error checking proxies health: ${error.message}`);
    } finally {
      this.isCheckingHealth = false;
    }
  }

  async checkProxyHealth(proxy: Proxy, platform?: string): Promise<boolean> {
    const testUrl = platform ? this.testUrls[platform] || this.testUrls.default : this.testUrls.default;
    const startTime = Date.now();
    
    try {
      // Create axios instance with proxy
      const axiosInstance = axios.create({
        timeout: 10000, // 10 seconds timeout
        proxy: {
          host: proxy.host,
          port: proxy.port,
          protocol: proxy.protocol,
          auth: proxy.username && proxy.password ? {
            username: proxy.username,
            password: proxy.password
          } : undefined
        }
      });
      
      // Make request
      await axiosInstance.get(testUrl);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Update proxy stats
      proxy.successCount++;
      proxy.responseTime = (proxy.responseTime * (proxy.successCount - 1) + responseTime) / proxy.successCount;
      proxy.lastChecked = new Date();
      proxy.isHealthy = true;
      
      // Remove from blacklist if it was blacklisted
      if (proxy.blacklistedUntil && platform && proxy.blacklistedFor) {
        const index = proxy.blacklistedFor.indexOf(platform);
        if (index !== -1) {
          proxy.blacklistedFor.splice(index, 1);
          if (proxy.blacklistedFor.length === 0) {
            proxy.blacklistedUntil = undefined;
            proxy.blacklistedFor = undefined;
          }
        }
      }
      
      return true;
    } catch (error) {
      // Check if error is due to proxy being banned
      const isBanned = error.response && (
        error.response.status === 403 ||
        error.response.status === 429 ||
        error.response.status === 503
      );
      
      if (isBanned) {
        proxy.banCount++;
        
        // Blacklist the proxy for this platform
        if (platform) {
          this.blacklistProxy(proxy, platform);
        }
      } else {
        proxy.failureCount++;
      }
      
      proxy.lastChecked = new Date();
      proxy.isHealthy = false;
      
      return false;
    }
  }

  blacklistProxy(proxy: Proxy, platform: string, durationHours: number = 24): void {
    const until = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    proxy.blacklistedUntil = until;
    proxy.blacklistedFor = proxy.blacklistedFor || [];
    
    if (!proxy.blacklistedFor.includes(platform)) {
      proxy.blacklistedFor.push(platform);
    }
    
    this.logger.warn(`Blacklisted proxy ${proxy.host}:${proxy.port} for ${platform} until ${until.toISOString()}`);
  }

  async reportProxySuccess(proxyId: string): Promise<void> {
    const proxy = this.proxies.get(proxyId);
    if (proxy) {
      proxy.successCount++;
      await this.saveProxiesToDisk();
    }
  }

  async reportProxyFailure(proxyId: string, platform?: string, isBanned: boolean = false): Promise<void> {
    const proxy = this.proxies.get(proxyId);
    if (proxy) {
      if (isBanned) {
        proxy.banCount++;
        if (platform) {
          this.blacklistProxy(proxy, platform);
        }
      } else {
        proxy.failureCount++;
      }
      await this.saveProxiesToDisk();
    }
  }

  private async saveProxiesToDisk(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'proxies.json');
      const proxiesArray = Array.from(this.proxies.values());
      
      await fs.promises.writeFile(filePath, JSON.stringify(proxiesArray, null, 2));
      this.logger.debug(`Saved ${proxiesArray.length} proxies to disk`);
    } catch (error) {
      this.logger.error(`Error saving proxies to disk: ${error.message}`);
    }
  }

  private async loadProxiesFromDisk(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'data', 'proxies.json');
      
      if (fs.existsSync(filePath)) {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const proxiesArray = JSON.parse(data) as Proxy[];
        
        // Convert dates from strings back to Date objects
        proxiesArray.forEach(proxy => {
          if (proxy.lastUsed) proxy.lastUsed = new Date(proxy.lastUsed);
          if (proxy.lastChecked) proxy.lastChecked = new Date(proxy.lastChecked);
          if (proxy.blacklistedUntil) proxy.blacklistedUntil = new Date(proxy.blacklistedUntil);
        });
        
        // Add to proxy pool
        for (const proxy of proxiesArray) {
          const proxyId = proxy.id || this.generateProxyId(proxy);
          proxy.id = proxyId;
          this.proxies.set(proxyId, proxy);
        }
        
        this.logger.log(`Loaded ${proxiesArray.length} proxies from disk`);
      }
    } catch (error) {
      this.logger.error(`Error loading proxies from disk: ${error.message}`);
    }
  }

  getProxyStats(): any {
    const proxies = Array.from(this.proxies.values());
    
    return {
      totalProxies: proxies.length,
      healthyProxies: proxies.filter(p => p.isHealthy).length,
      blacklistedProxies: proxies.filter(p => p.blacklistedUntil && p.blacklistedUntil > new Date()).length,
      byProvider: Object.fromEntries(
        Array.from(
          new Set(proxies.map(p => p.provider))
        ).map(provider => [
          provider,
          proxies.filter(p => p.provider === provider).length
        ])
      ),
      byCountry: Object.fromEntries(
        Array.from(
          new Set(proxies.filter(p => p.country).map(p => p.country))
        ).map(country => [
          country,
          proxies.filter(p => p.country === country).length
        ])
      )
    };
  }
}
