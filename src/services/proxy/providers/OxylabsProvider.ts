import axios from 'axios';
import { ProxyProvider } from './ProxyProvider';
import { ProxyConfig } from '../ProxyRotationService';
import { config } from '../../../config';

/**
 * Oxylabs proxy provider
 */
export class OxylabsProvider implements ProxyProvider {
  private username: string;
  private password: string;
  private enabled: boolean;
  
  constructor() {
    // Load configuration
    this.username = config.proxy.oxylabs.username;
    this.password = config.proxy.oxylabs.password;
    this.enabled = config.proxy.oxylabs.enabled;
  }
  
  /**
   * Get proxies from Oxylabs
   */
  async getProxies(): Promise<ProxyConfig[]> {
    if (!this.isEnabled()) {
      console.log('Oxylabs provider is disabled');
      return [];
    }
    
    try {
      // For Oxylabs, we use country-specific endpoints
      const countries = ['br', 'us', 'ca', 'mx', 'ar', 'cl', 'co', 'pe'];
      const proxies: ProxyConfig[] = [];
      
      // Create proxy configs for each country
      for (const country of countries) {
        // Create residential proxy
        proxies.push({
          host: `pr.oxylabs.io`,
          port: 7777,
          username: `${this.username}-country-${country}`,
          password: this.password,
          protocol: 'http',
          country,
          residential: true,
          provider: 'oxylabs',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
        
        // Create datacenter proxy
        proxies.push({
          host: `dc.pr.oxylabs.io`,
          port: 7777,
          username: `${this.username}-country-${country}`,
          password: this.password,
          protocol: 'http',
          country,
          residential: false,
          provider: 'oxylabs',
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
          host: `pr.oxylabs.io`,
          port: 7777,
          username: `${this.username}-country-br-city-${city.replace(' ', '_')}`,
          password: this.password,
          protocol: 'http',
          country: 'br',
          city,
          residential: true,
          provider: 'oxylabs',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      // Create state-specific proxies for Brazil
      const brStates = ['sp', 'rj', 'df', 'ba', 'ce'];
      for (const state of brStates) {
        proxies.push({
          host: `pr.oxylabs.io`,
          port: 7777,
          username: `${this.username}-country-br-state-${state}`,
          password: this.password,
          protocol: 'http',
          country: 'br',
          state,
          residential: true,
          provider: 'oxylabs',
          successCount: 0,
          failureCount: 0,
          banCount: 0,
          responseTime: 0
        });
      }
      
      return proxies;
    } catch (error) {
      console.error('Error fetching proxies from Oxylabs:', error);
      return [];
    }
  }
  
  /**
   * Get provider name
   */
  getName(): string {
    return 'Oxylabs';
  }
  
  /**
   * Get provider description
   */
  getDescription(): string {
    return 'Oxylabs proxy provider with residential and datacenter proxies';
  }
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.username && !!this.password;
  }
}
