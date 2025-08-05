import { ProxyConfig } from '../ProxyRotationService';

/**
 * Interface for proxy providers
 */
export interface ProxyProvider {
  /**
   * Get proxies from the provider
   */
  getProxies(): Promise<ProxyConfig[]>;
  
  /**
   * Get provider name
   */
  getName(): string;
  
  /**
   * Get provider description
   */
  getDescription(): string;
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean;
}
