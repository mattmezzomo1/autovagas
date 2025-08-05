import { Request, Response } from 'express';
import { ProxyRotationService } from '../services/proxy/ProxyRotationService';

/**
 * Controller for proxy management
 */
export class ProxyController {
  private proxyRotationService: ProxyRotationService;
  
  constructor() {
    this.proxyRotationService = new ProxyRotationService();
  }
  
  /**
   * Get proxy statistics
   */
  async getProxyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.proxyRotationService.getProxyStatistics();
      res.json(statistics);
    } catch (error) {
      console.error('Error getting proxy statistics:', error);
      res.status(500).json({ error: 'Failed to get proxy statistics' });
    }
  }
  
  /**
   * Refresh proxies
   */
  async refreshProxies(req: Request, res: Response): Promise<void> {
    try {
      await this.proxyRotationService.refreshProxies();
      res.json({ success: true, message: 'Proxies refreshed successfully' });
    } catch (error) {
      console.error('Error refreshing proxies:', error);
      res.status(500).json({ error: 'Failed to refresh proxies' });
    }
  }
  
  /**
   * Test proxies
   */
  async testProxies(req: Request, res: Response): Promise<void> {
    try {
      await this.proxyRotationService.testProxies();
      res.json({ success: true, message: 'Proxy testing initiated' });
    } catch (error) {
      console.error('Error testing proxies:', error);
      res.status(500).json({ error: 'Failed to test proxies' });
    }
  }
  
  /**
   * Get a proxy for testing
   */
  async getTestProxy(req: Request, res: Response): Promise<void> {
    try {
      const { country, residential, provider } = req.query;
      
      const options = {
        country: country as string,
        residential: residential === 'true',
        provider: provider as string
      };
      
      const proxy = this.proxyRotationService.getProxy(options);
      
      if (!proxy) {
        res.status(404).json({ error: 'No proxy found matching the criteria' });
        return;
      }
      
      // Remove sensitive information
      const safeProxy = {
        ...proxy,
        password: proxy.password ? '********' : undefined
      };
      
      res.json(safeProxy);
    } catch (error) {
      console.error('Error getting test proxy:', error);
      res.status(500).json({ error: 'Failed to get test proxy' });
    }
  }
}
