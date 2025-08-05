import fs from 'fs';
import path from 'path';
import { ProxyProvider } from './ProxyProvider';
import { ProxyConfig } from '../ProxyRotationService';
import { config } from '../../../config';

/**
 * Local proxy provider for self-hosted or manually configured proxies
 */
export class LocalProxyProvider implements ProxyProvider {
  private proxyListPath: string;
  private enabled: boolean;
  
  constructor() {
    // Load configuration
    this.proxyListPath = config.proxy.local.proxyListPath;
    this.enabled = config.proxy.local.enabled;
  }
  
  /**
   * Get proxies from local file
   */
  async getProxies(): Promise<ProxyConfig[]> {
    if (!this.isEnabled()) {
      console.log('Local proxy provider is disabled');
      return [];
    }
    
    try {
      // Check if proxy list file exists
      if (!fs.existsSync(this.proxyListPath)) {
        console.error(`Proxy list file not found: ${this.proxyListPath}`);
        return [];
      }
      
      // Read proxy list file
      const fileContent = fs.readFileSync(this.proxyListPath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      const proxies: ProxyConfig[] = [];
      
      // Parse each line
      for (const line of lines) {
        try {
          // Expected format: host:port:username:password:protocol:country:city:state:residential
          const parts = line.split(':');
          
          if (parts.length < 5) {
            console.warn(`Invalid proxy format: ${line}`);
            continue;
          }
          
          const [host, portStr, username, password, protocol, country, city, state, residentialStr] = parts;
          const port = parseInt(portStr, 10);
          const residential = residentialStr === 'residential';
          
          if (isNaN(port)) {
            console.warn(`Invalid port number: ${portStr}`);
            continue;
          }
          
          if (!['http', 'https', 'socks4', 'socks5'].includes(protocol)) {
            console.warn(`Invalid protocol: ${protocol}`);
            continue;
          }
          
          proxies.push({
            host,
            port,
            username: username || undefined,
            password: password || undefined,
            protocol: protocol as 'http' | 'https' | 'socks4' | 'socks5',
            country: country || undefined,
            city: city || undefined,
            state: state || undefined,
            residential,
            provider: 'local',
            successCount: 0,
            failureCount: 0,
            banCount: 0,
            responseTime: 0
          });
        } catch (error) {
          console.warn(`Error parsing proxy line: ${line}`, error);
        }
      }
      
      console.log(`Loaded ${proxies.length} proxies from local file`);
      return proxies;
    } catch (error) {
      console.error('Error loading local proxies:', error);
      return [];
    }
  }
  
  /**
   * Get provider name
   */
  getName(): string {
    return 'Local';
  }
  
  /**
   * Get provider description
   */
  getDescription(): string {
    return 'Local proxy provider for self-hosted or manually configured proxies';
  }
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.proxyListPath;
  }
}
