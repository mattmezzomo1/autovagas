import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface Proxy {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  country?: string;
  lastUsed?: Date;
  successCount?: number;
  failureCount?: number;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private proxies: Proxy[] = [];
  private proxyApiUrl: string;
  private proxyApiKey: string;
  private lastProxyRefresh: Date = null;
  private readonly refreshInterval = 30 * 60 * 1000; // 30 minutes

  constructor(private configService: ConfigService) {
    this.proxyApiUrl = this.configService.get<string>('proxy.apiUrl');
    this.proxyApiKey = this.configService.get<string>('proxy.apiKey');
    
    // Initialize with some static proxies if configured
    const staticProxies = this.configService.get<Proxy[]>('proxy.staticProxies');
    if (staticProxies && staticProxies.length > 0) {
      this.proxies = [...staticProxies];
    }
  }

  async getProxy(country?: string): Promise<Proxy> {
    // Refresh proxies if needed
    await this.refreshProxiesIfNeeded();
    
    // Filter proxies by country if specified
    let availableProxies = this.proxies;
    if (country) {
      availableProxies = this.proxies.filter(p => p.country === country);
      if (availableProxies.length === 0) {
        this.logger.warn(`No proxies available for country ${country}, using any available proxy`);
        availableProxies = this.proxies;
      }
    }
    
    if (availableProxies.length === 0) {
      this.logger.error('No proxies available');
      return null;
    }
    
    // Sort by least recently used and success rate
    availableProxies.sort((a, b) => {
      // Calculate success rate
      const aSuccessRate = a.successCount / (a.successCount + a.failureCount || 1);
      const bSuccessRate = b.successCount / (b.successCount + b.failureCount || 1);
      
      // Prioritize success rate, then least recently used
      if (Math.abs(aSuccessRate - bSuccessRate) > 0.2) {
        return bSuccessRate - aSuccessRate;
      }
      
      return (a.lastUsed?.getTime() || 0) - (b.lastUsed?.getTime() || 0);
    });
    
    // Get the best proxy
    const proxy = availableProxies[0];
    
    // Update last used time
    proxy.lastUsed = new Date();
    
    return proxy;
  }

  async refreshProxiesIfNeeded(): Promise<void> {
    const now = new Date();
    
    // Check if refresh is needed
    if (this.lastProxyRefresh && (now.getTime() - this.lastProxyRefresh.getTime() < this.refreshInterval)) {
      return;
    }
    
    try {
      // Fetch new proxies from API
      if (this.proxyApiUrl && this.proxyApiKey) {
        const response = await axios.get(this.proxyApiUrl, {
          headers: {
            'Authorization': `Bearer ${this.proxyApiKey}`,
          },
        });
        
        if (response.data && Array.isArray(response.data.proxies)) {
          // Transform API response to our Proxy format
          const newProxies = response.data.proxies.map(p => ({
            host: p.ip,
            port: p.port,
            username: p.username,
            password: p.password,
            protocol: p.protocol,
            country: p.country,
            successCount: 0,
            failureCount: 0,
          }));
          
          // Merge with existing proxies, keeping stats
          this.mergeProxies(newProxies);
          
          this.logger.log(`Refreshed proxies, now have ${this.proxies.length} proxies`);
        }
      }
      
      this.lastProxyRefresh = now;
    } catch (error) {
      this.logger.error(`Failed to refresh proxies: ${error.message}`);
    }
  }

  private mergeProxies(newProxies: Proxy[]): void {
    // Create a map of existing proxies for quick lookup
    const existingProxiesMap = new Map<string, Proxy>();
    this.proxies.forEach(p => {
      const key = `${p.host}:${p.port}`;
      existingProxiesMap.set(key, p);
    });
    
    // Merge new proxies with existing ones
    const mergedProxies = newProxies.map(newProxy => {
      const key = `${newProxy.host}:${newProxy.port}`;
      const existingProxy = existingProxiesMap.get(key);
      
      if (existingProxy) {
        // Keep stats from existing proxy
        return {
          ...newProxy,
          lastUsed: existingProxy.lastUsed,
          successCount: existingProxy.successCount,
          failureCount: existingProxy.failureCount,
        };
      }
      
      return newProxy;
    });
    
    this.proxies = mergedProxies;
  }

  reportProxySuccess(proxy: Proxy): void {
    const proxyIndex = this.findProxyIndex(proxy);
    if (proxyIndex >= 0) {
      this.proxies[proxyIndex].successCount = (this.proxies[proxyIndex].successCount || 0) + 1;
    }
  }

  reportProxyFailure(proxy: Proxy): void {
    const proxyIndex = this.findProxyIndex(proxy);
    if (proxyIndex >= 0) {
      this.proxies[proxyIndex].failureCount = (this.proxies[proxyIndex].failureCount || 0) + 1;
    }
  }

  private findProxyIndex(proxy: Proxy): number {
    return this.proxies.findIndex(p => p.host === proxy.host && p.port === proxy.port);
  }

  getProxyUrl(proxy: Proxy): string {
    if (!proxy) return null;
    
    const auth = proxy.username && proxy.password 
      ? `${proxy.username}:${proxy.password}@` 
      : '';
    
    return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
  }
}
