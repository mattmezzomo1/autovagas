import axios from 'axios';
import { ProxyProvider } from './providers/ProxyProvider';
import { BrightDataProvider } from './providers/BrightDataProvider';
import { OxylabsProvider } from './providers/OxylabsProvider';
import { SmartProxyProvider } from './providers/SmartProxyProvider';
import { LocalProxyProvider } from './providers/LocalProxyProvider';

/**
 * Interface for a proxy configuration
 */
export interface ProxyConfig {
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
}

/**
 * Interface for proxy selection options
 */
export interface ProxySelectionOptions {
  country?: string;
  city?: string;
  state?: string;
  residential?: boolean;
  provider?: string;
  excludeIds?: string[];
  minSuccessRate?: number;
  platform?: 'linkedin' | 'indeed' | 'infojobs' | 'catho';
}

/**
 * Service for managing and rotating proxies
 */
export class ProxyRotationService {
  private proxies: Map<string, ProxyConfig> = new Map();
  private providers: Map<string, ProxyProvider> = new Map();
  private proxyRefreshInterval: NodeJS.Timeout | null = null;
  private proxyTestInterval: NodeJS.Timeout | null = null;
  private isRefreshing: boolean = false;
  private isTestingProxies: boolean = false;

  constructor() {
    // Initialize proxy providers
    this.initializeProviders();

    // Start periodic proxy refresh
    this.proxyRefreshInterval = setInterval(() => this.refreshProxies(), 3600000); // Every hour

    // Start periodic proxy testing
    this.proxyTestInterval = setInterval(() => this.testProxies(), 1800000); // Every 30 minutes

    // Initial proxy load
    this.refreshProxies();
  }

  /**
   * Initialize proxy providers
   */
  private initializeProviders(): void {
    // Add proxy providers
    this.providers.set('brightdata', new BrightDataProvider());
    this.providers.set('oxylabs', new OxylabsProvider());
    this.providers.set('smartproxy', new SmartProxyProvider());
    this.providers.set('local', new LocalProxyProvider());

    console.log(`Initialized ${this.providers.size} proxy providers`);
  }

  /**
   * Refresh proxies from all providers
   */
  async refreshProxies(): Promise<void> {
    if (this.isRefreshing) {
      console.log('Proxy refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;
    console.log('Starting proxy refresh');

    try {
      // Get proxies from all providers
      for (const [providerName, provider] of this.providers.entries()) {
        try {
          console.log(`Fetching proxies from ${providerName}`);
          const proxies = await provider.getProxies();

          // Add proxies to the pool
          for (const proxy of proxies) {
            const proxyId = this.getProxyId(proxy);

            // If proxy already exists, update it but preserve stats
            if (this.proxies.has(proxyId)) {
              const existingProxy = this.proxies.get(proxyId)!;
              proxy.successCount = existingProxy.successCount;
              proxy.failureCount = existingProxy.failureCount;
              proxy.banCount = existingProxy.banCount;
              proxy.responseTime = existingProxy.responseTime;
              proxy.lastUsed = existingProxy.lastUsed;
            }

            this.proxies.set(proxyId, proxy);
          }

          console.log(`Added ${proxies.length} proxies from ${providerName}`);
        } catch (error) {
          console.error(`Error fetching proxies from ${providerName}:`, error);
        }
      }

      console.log(`Proxy refresh complete. Total proxies: ${this.proxies.size}`);
    } catch (error) {
      console.error('Error refreshing proxies:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Test proxies for availability and performance
   */
  async testProxies(): Promise<void> {
    if (this.isTestingProxies) {
      console.log('Proxy testing already in progress, skipping');
      return;
    }

    this.isTestingProxies = true;
    console.log('Starting proxy testing');

    const testUrl = 'https://www.google.com';
    const testBatchSize = 10; // Test 10 proxies at a time
    const proxiesToTest = Array.from(this.proxies.values());
    const batches = Math.ceil(proxiesToTest.length / testBatchSize);

    try {
      for (let i = 0; i < batches; i++) {
        const batchStart = i * testBatchSize;
        const batchEnd = Math.min((i + 1) * testBatchSize, proxiesToTest.length);
        const batch = proxiesToTest.slice(batchStart, batchEnd);

        console.log(`Testing proxy batch ${i + 1}/${batches} (${batch.length} proxies)`);

        // Test proxies in parallel
        await Promise.all(batch.map(proxy => this.testProxy(proxy, testUrl)));

        // Small delay between batches to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Proxy testing complete');
    } catch (error) {
      console.error('Error testing proxies:', error);
    } finally {
      this.isTestingProxies = false;
    }
  }

  /**
   * Test a single proxy
   */
  private async testProxy(proxy: ProxyConfig, testUrl: string): Promise<void> {
    const proxyId = this.getProxyId(proxy);

    try {
      const startTime = Date.now();

      // Create axios instance with proxy
      const axiosInstance = axios.create({
        proxy: {
          host: proxy.host,
          port: proxy.port,
          protocol: proxy.protocol,
          auth: proxy.username && proxy.password ? {
            username: proxy.username,
            password: proxy.password
          } : undefined
        },
        timeout: 10000 // 10 second timeout
      });

      // Make request
      await axiosInstance.get(testUrl);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Update proxy stats
      proxy.successCount++;
      proxy.responseTime = (proxy.responseTime * (proxy.successCount - 1) + responseTime) / proxy.successCount;

      this.proxies.set(proxyId, proxy);
    } catch (error) {
      // Check if error is due to proxy being banned
      const isBanned = error.response && (
        error.response.status === 403 ||
        error.response.status === 429 ||
        error.response.status === 503
      );

      if (isBanned) {
        proxy.banCount++;
      } else {
        proxy.failureCount++;
      }

      this.proxies.set(proxyId, proxy);
    }
  }

  /**
   * Get a proxy for a specific task
   */
  getProxy(options: ProxySelectionOptions = {}): ProxyConfig | null {
    // Filter proxies based on options
    let filteredProxies = Array.from(this.proxies.values());

    // Filter by country
    if (options.country) {
      filteredProxies = filteredProxies.filter(proxy =>
        !proxy.country || proxy.country.toLowerCase() === options.country!.toLowerCase()
      );
    }

    // Filter by city
    if (options.city) {
      filteredProxies = filteredProxies.filter(proxy =>
        !proxy.city || proxy.city.toLowerCase() === options.city!.toLowerCase()
      );
    }

    // Filter by state
    if (options.state) {
      filteredProxies = filteredProxies.filter(proxy =>
        !proxy.state || proxy.state.toLowerCase() === options.state!.toLowerCase()
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

    // Filter by excluded IDs
    if (options.excludeIds && options.excludeIds.length > 0) {
      filteredProxies = filteredProxies.filter(proxy =>
        !options.excludeIds!.includes(this.getProxyId(proxy))
      );
    }

    // Filter by minimum success rate
    if (options.minSuccessRate !== undefined) {
      filteredProxies = filteredProxies.filter(proxy => {
        const totalRequests = proxy.successCount + proxy.failureCount;
        if (totalRequests === 0) return true; // Include untested proxies

        const successRate = (proxy.successCount / totalRequests) * 100;
        return successRate >= options.minSuccessRate!;
      });
    }

    // Filter out proxies with high ban counts (more than 5 bans)
    filteredProxies = filteredProxies.filter(proxy => proxy.banCount < 5);

    // Filter out proxies that were used in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    filteredProxies = filteredProxies.filter(proxy =>
      !proxy.lastUsed || proxy.lastUsed < thirtySecondsAgo
    );

    if (filteredProxies.length === 0) {
      console.warn('No proxies match the specified criteria, falling back to all proxies');

      // Fall back to all proxies except banned ones
      filteredProxies = Array.from(this.proxies.values())
        .filter(proxy => proxy.banCount < 5);

      if (filteredProxies.length === 0) {
        console.error('No usable proxies available');
        return null;
      }
    }

    // Determine selection strategy based on the number of proxies
    let selectedProxy: ProxyConfig;

    if (filteredProxies.length > 10) {
      // If we have many proxies, use a weighted random selection
      // This helps distribute load and avoid detection patterns

      // Calculate weights based on success rate and response time
      const weights = filteredProxies.map(proxy => {
        const totalRequests = proxy.successCount + proxy.failureCount;
        const successRate = totalRequests > 0 ? (proxy.successCount / totalRequests) : 0.5;

        // Normalize response time (lower is better)
        const normalizedResponseTime = proxy.responseTime > 0 ?
          Math.min(1, 5000 / proxy.responseTime) : 0.5;

        // Combined weight (higher is better)
        return (successRate * 0.7) + (normalizedResponseTime * 0.3);
      });

      // Calculate cumulative weights
      const cumulativeWeights: number[] = [];
      let sum = 0;

      for (const weight of weights) {
        sum += weight;
        cumulativeWeights.push(sum);
      }

      // Random selection based on weights
      const random = Math.random() * sum;
      const index = cumulativeWeights.findIndex(w => w >= random);

      selectedProxy = filteredProxies[index >= 0 ? index : 0];
    } else {
      // With fewer proxies, sort by success rate and response time
      filteredProxies.sort((a, b) => {
        // Calculate success rates
        const aTotal = a.successCount + a.failureCount;
        const bTotal = b.successCount + b.failureCount;

        const aSuccessRate = aTotal > 0 ? (a.successCount / aTotal) : 0;
        const bSuccessRate = bTotal > 0 ? (b.successCount / bTotal) : 0;

        // First sort by success rate (higher is better)
        if (bSuccessRate !== aSuccessRate) {
          return bSuccessRate - aSuccessRate;
        }

        // Then by response time (lower is better)
        return a.responseTime - b.responseTime;
      });

      // Get the best proxy
      selectedProxy = filteredProxies[0];
    }

    // Update last used time
    selectedProxy.lastUsed = new Date();
    this.proxies.set(this.getProxyId(selectedProxy), selectedProxy);

    return selectedProxy;
  }

  /**
   * Report proxy success
   */
  reportProxySuccess(proxy: ProxyConfig): void {
    const proxyId = this.getProxyId(proxy);
    const existingProxy = this.proxies.get(proxyId);

    if (existingProxy) {
      existingProxy.successCount++;
      this.proxies.set(proxyId, existingProxy);
    }
  }

  /**
   * Report proxy failure
   */
  reportProxyFailure(proxy: ProxyConfig, isBanned: boolean = false): void {
    const proxyId = this.getProxyId(proxy);
    const existingProxy = this.proxies.get(proxyId);

    if (existingProxy) {
      if (isBanned) {
        existingProxy.banCount++;
      } else {
        existingProxy.failureCount++;
      }

      this.proxies.set(proxyId, existingProxy);
    }
  }

  /**
   * Get proxy statistics
   */
  getProxyStatistics() {
    const totalProxies = this.proxies.size;
    let residentialProxies = 0;
    let datacenterProxies = 0;
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    let totalBanCount = 0;

    // Provider stats
    const providerStats: Record<string, { count: number, success: number, failure: number, ban: number }> = {};

    // Country stats
    const countryStats: Record<string, number> = {};

    for (const proxy of this.proxies.values()) {
      // Count by type
      if (proxy.residential) {
        residentialProxies++;
      } else {
        datacenterProxies++;
      }

      // Count success/failure
      totalSuccessCount += proxy.successCount;
      totalFailureCount += proxy.failureCount;
      totalBanCount += proxy.banCount;

      // Count by provider
      if (!providerStats[proxy.provider]) {
        providerStats[proxy.provider] = { count: 0, success: 0, failure: 0, ban: 0 };
      }
      providerStats[proxy.provider].count++;
      providerStats[proxy.provider].success += proxy.successCount;
      providerStats[proxy.provider].failure += proxy.failureCount;
      providerStats[proxy.provider].ban += proxy.banCount;

      // Count by country
      if (proxy.country) {
        countryStats[proxy.country] = (countryStats[proxy.country] || 0) + 1;
      }
    }

    return {
      totalProxies,
      residentialProxies,
      datacenterProxies,
      totalSuccessCount,
      totalFailureCount,
      totalBanCount,
      successRate: totalSuccessCount + totalFailureCount > 0
        ? (totalSuccessCount / (totalSuccessCount + totalFailureCount)) * 100
        : 0,
      providerStats,
      countryStats
    };
  }

  /**
   * Generate a unique ID for a proxy
   */
  private getProxyId(proxy: ProxyConfig): string {
    return `${proxy.provider}:${proxy.host}:${proxy.port}`;
  }
}
