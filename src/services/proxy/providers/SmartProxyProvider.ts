import axios from 'axios';
import { ProxyProvider } from './ProxyProvider';
import { ProxyConfig } from '../ProxyRotationService';
import { config } from '../../../config';

/**
 * SmartProxy provider
 */
export class SmartProxyProvider implements ProxyProvider {
  private username: string;
  private password: string;
  private enabled: boolean;
  
  constructor() {
    // Load configuration
    this.username = config.proxy.smartproxy.username;
    this.password = config.proxy.smartproxy.password;
    this.enabled = config.proxy.smartproxy.enabled;
  }
  
  /**
   * Get proxies from SmartProxy
   */
  async getProxies(): Promise<ProxyConfig[]> {
    if (!this.isEnabled()) {
      console.log('SmartProxy provider is disabled');
      return [];
    }
    
    try {
      // For SmartProxy, we use different endpoints for different proxy types
      const countries = ['br', 'us', 'ca', 'mx', 'ar', 'cl', 'co', 'pe'];
      const proxies: ProxyConfig[] = [];
      
      // Create residential proxies
      for (const country of countries) {
        proxies.push({
          host: 'residential.smartproxy.com',
          port: 10000,
          username: this.username,
          password: this.password,
          protocol: 'http',
          country,
          residential: true,
          provider: 'smartproxy',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      // Create datacenter proxies
      for (const country of countries) {
        proxies.push({
          host: 'dc.smartproxy.com',
          port: 20000,
          username: this.username,
          password: this.password,
          protocol: 'http',
          country,
          residential: false,
          provider: 'smartproxy',
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
          host: 'residential.smartproxy.com',
          port: 10000,
          username: `${this.username}-country-br-city-${city.replace(' ', '_')}`,
          password: this.password,
          protocol: 'http',
          country: 'br',
          city,
          residential: true,
          provider: 'smartproxy',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      return proxies;
    } catch (error) {
      console.error('Error fetching proxies from SmartProxy:', error);
      return [];
    }
  }
  
  /**
   * Get provider name
   */
  getName(): string {
    return 'SmartProxy';
  }
  
  /**
   * Get provider description
   */
  getDescription(): string {
    return 'SmartProxy provider with residential and datacenter proxies';
  }
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.username && !!this.password;
  }
}
