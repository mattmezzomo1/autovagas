import axios from 'axios';
import { ProxyProvider } from './ProxyProvider';
import { ProxyConfig } from '../ProxyRotationService';
import { config } from '../../../config';

/**
 * Bright Data proxy provider
 */
export class BrightDataProvider implements ProxyProvider {
  private apiKey: string;
  private zoneId: string;
  private enabled: boolean;
  
  constructor() {
    // Load configuration
    this.apiKey = config.proxy.brightdata.apiKey;
    this.zoneId = config.proxy.brightdata.zoneId;
    this.enabled = config.proxy.brightdata.enabled;
  }
  
  /**
   * Get proxies from Bright Data
   */
  async getProxies(): Promise<ProxyConfig[]> {
    if (!this.isEnabled()) {
      console.log('Bright Data provider is disabled');
      return [];
    }
    
    try {
      // For Bright Data, we typically use a single super proxy with different session IDs
      // Here we'll create multiple proxy configs with different country targeting
      const countries = ['br', 'us', 'ca', 'mx', 'ar', 'cl', 'co', 'pe'];
      const proxies: ProxyConfig[] = [];
      
      // Create proxy configs for each country
      for (const country of countries) {
        // Create residential proxy
        proxies.push({
          host: `brd.superproxy.io`,
          port: 22225,
          username: `${this.zoneId}-country-${country}`,
          password: this.apiKey,
          protocol: 'https',
          country,
          residential: true,
          provider: 'brightdata',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
        
        // Create datacenter proxy
        proxies.push({
          host: `brd.superproxy.io`,
          port: 22225,
          username: `${this.zoneId}-country-${country}-dc`,
          password: this.apiKey,
          protocol: 'https',
          country,
          residential: false,
          provider: 'brightdata',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      // Create city-specific proxies for Brazil
      const brCities = ['sao paulo', 'rio de janeiro', 'brasilia', 'salvador', 'fortaleza'];
      for (const city of brCities) {
        proxies.push({
          host: `brd.superproxy.io`,
          port: 22225,
          username: `${this.zoneId}-country-br-city-${city.replace(' ', '_')}`,
          password: this.apiKey,
          protocol: 'https',
          country: 'br',
          city,
          residential: true,
          provider: 'brightdata',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      return proxies;
    } catch (error) {
      console.error('Error fetching proxies from Bright Data:', error);
      return [];
    }
  }
  
  /**
   * Get provider name
   */
  getName(): string {
    return 'Bright Data';
  }
  
  /**
   * Get provider description
   */
  getDescription(): string {
    return 'Bright Data proxy provider with residential and datacenter proxies';
  }
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.apiKey && !!this.zoneId;
  }
}
