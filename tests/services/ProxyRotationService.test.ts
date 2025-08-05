import { ProxyRotationService, ProxyConfig } from '../../src/services/proxy/ProxyRotationService';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({ status: 200 })
  })
}));

describe('ProxyRotationService', () => {
  let service: ProxyRotationService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the proxy providers
    const mockProviders = new Map();
    mockProviders.set('test', {
      getProxies: jest.fn().mockResolvedValue([
        createMockProxy('test1', 'br', 'sao paulo'),
        createMockProxy('test2', 'us', 'new york'),
        createMockProxy('test3', 'ca', 'toronto'),
        createMockProxy('test4', 'br', 'rio de janeiro'),
        createMockProxy('test5', 'mx', 'mexico city'),
        createMockProxy('test6', 'br', 'brasilia'),
        createMockProxy('test7', 'us', 'los angeles'),
        createMockProxy('test8', 'ca', 'vancouver'),
        createMockProxy('test9', 'br', 'fortaleza'),
        createMockProxy('test10', 'mx', 'guadalajara'),
        createMockProxy('test11', 'br', 'salvador'),
        createMockProxy('test12', 'us', 'chicago')
      ])
    });
    
    service = new ProxyRotationService();
    (service as any).providers = mockProviders;
    
    // Initialize proxies
    const proxies = new Map<string, ProxyConfig>();
    mockProviders.get('test').getProxies().then((proxyList: ProxyConfig[]) => {
      proxyList.forEach(proxy => {
        proxies.set((service as any).getProxyId(proxy), proxy);
      });
    });
    
    (service as any).proxies = proxies;
    
    // Mock setInterval to prevent actual intervals
    jest.spyOn(global, 'setInterval').mockReturnValue({} as any);
  });
  
  describe('getProxy', () => {
    it('should return a proxy matching the specified criteria', () => {
      // Add proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      proxies.set('test:test1:8080', createMockProxy('test1', 'br', 'sao paulo'));
      proxies.set('test:test2:8080', createMockProxy('test2', 'us', 'new york'));
      proxies.set('test:test3:8080', createMockProxy('test3', 'ca', 'toronto'));
      (service as any).proxies = proxies;
      
      const proxy = service.getProxy({ country: 'br' });
      
      expect(proxy).not.toBeNull();
      expect(proxy?.country).toBe('br');
      expect(proxy?.city).toBe('sao paulo');
    });
    
    it('should filter by multiple criteria', () => {
      // Add proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      proxies.set('test:test1:8080', createMockProxy('test1', 'br', 'sao paulo'));
      proxies.set('test:test2:8080', createMockProxy('test2', 'us', 'new york'));
      proxies.set('test:test3:8080', createMockProxy('test3', 'ca', 'toronto'));
      proxies.set('test:test4:8080', createMockProxy('test4', 'br', 'rio de janeiro'));
      (service as any).proxies = proxies;
      
      const proxy = service.getProxy({ 
        country: 'br', 
        residential: true,
        minSuccessRate: 80
      });
      
      expect(proxy).not.toBeNull();
      expect(proxy?.country).toBe('br');
      expect(proxy?.residential).toBe(true);
    });
    
    it('should filter out recently used proxies', () => {
      // Add proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      const proxy1 = createMockProxy('test1', 'br', 'sao paulo');
      const proxy2 = createMockProxy('test2', 'br', 'rio de janeiro');
      
      // Mark proxy1 as recently used
      proxy1.lastUsed = new Date();
      
      proxies.set('test:test1:8080', proxy1);
      proxies.set('test:test2:8080', proxy2);
      (service as any).proxies = proxies;
      
      const result = service.getProxy({ country: 'br' });
      
      expect(result).not.toBeNull();
      expect(result?.host).toBe('test2');
      expect(result?.city).toBe('rio de janeiro');
    });
    
    it('should filter out proxies with high ban counts', () => {
      // Add proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      const proxy1 = createMockProxy('test1', 'br', 'sao paulo');
      const proxy2 = createMockProxy('test2', 'br', 'rio de janeiro');
      
      // Mark proxy1 as banned multiple times
      proxy1.banCount = 6;
      
      proxies.set('test:test1:8080', proxy1);
      proxies.set('test:test2:8080', proxy2);
      (service as any).proxies = proxies;
      
      const result = service.getProxy({ country: 'br' });
      
      expect(result).not.toBeNull();
      expect(result?.host).toBe('test2');
      expect(result?.city).toBe('rio de janeiro');
    });
    
    it('should use weighted random selection with many proxies', () => {
      // Add many proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      for (let i = 1; i <= 15; i++) {
        const proxy = createMockProxy(`test${i}`, 'br', `city${i}`);
        // Vary success rates
        proxy.successCount = i * 10;
        proxy.failureCount = 100 - i * 5;
        proxies.set(`test:test${i}:8080`, proxy);
      }
      (service as any).proxies = proxies;
      
      // Call getProxy multiple times and verify we get different proxies
      const selectedProxies = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const proxy = service.getProxy();
        if (proxy) {
          selectedProxies.add(proxy.host);
        }
      }
      
      // We should get at least a few different proxies
      expect(selectedProxies.size).toBeGreaterThan(1);
    });
    
    it('should fall back to all proxies if no matches found', () => {
      // Add proxies directly to the service
      const proxies = new Map<string, ProxyConfig>();
      proxies.set('test:test1:8080', createMockProxy('test1', 'br', 'sao paulo'));
      proxies.set('test:test2:8080', createMockProxy('test2', 'us', 'new york'));
      (service as any).proxies = proxies;
      
      // Request a proxy from a country we don't have
      const proxy = service.getProxy({ country: 'fr' });
      
      // Should fall back to any available proxy
      expect(proxy).not.toBeNull();
    });
  });
  
  describe('reportProxySuccess', () => {
    it('should increment success count for the proxy', () => {
      // Add a proxy directly to the service
      const proxies = new Map<string, ProxyConfig>();
      const proxy = createMockProxy('test1', 'br', 'sao paulo');
      proxy.successCount = 5;
      proxies.set('test:test1:8080', proxy);
      (service as any).proxies = proxies;
      
      // Report success
      service.reportProxySuccess(proxy);
      
      // Verify success count was incremented
      const updatedProxy = (service as any).proxies.get('test:test1:8080');
      expect(updatedProxy.successCount).toBe(6);
    });
  });
  
  describe('reportProxyFailure', () => {
    it('should increment failure count for the proxy', () => {
      // Add a proxy directly to the service
      const proxies = new Map<string, ProxyConfig>();
      const proxy = createMockProxy('test1', 'br', 'sao paulo');
      proxy.failureCount = 3;
      proxies.set('test:test1:8080', proxy);
      (service as any).proxies = proxies;
      
      // Report failure
      service.reportProxyFailure(proxy, false);
      
      // Verify failure count was incremented
      const updatedProxy = (service as any).proxies.get('test:test1:8080');
      expect(updatedProxy.failureCount).toBe(4);
    });
    
    it('should increment ban count for the proxy when banned', () => {
      // Add a proxy directly to the service
      const proxies = new Map<string, ProxyConfig>();
      const proxy = createMockProxy('test1', 'br', 'sao paulo');
      proxy.banCount = 1;
      proxies.set('test:test1:8080', proxy);
      (service as any).proxies = proxies;
      
      // Report ban
      service.reportProxyFailure(proxy, true);
      
      // Verify ban count was incremented
      const updatedProxy = (service as any).proxies.get('test:test1:8080');
      expect(updatedProxy.banCount).toBe(2);
    });
  });
  
  describe('resetCircuitBreaker', () => {
    it('should reset circuit breaker for a platform', () => {
      // Initialize circuit breakers
      (service as any).circuitBreakers = {
        linkedin: {
          failures: 5,
          consecutiveFailures: 5,
          totalFailures: 10,
          lastFailure: new Date(),
          state: 'open',
          nextAttempt: new Date(Date.now() + 5 * 60 * 1000),
          failureThreshold: 3,
          resetTimeout: 5 * 60 * 1000,
          successesInHalfOpen: 0,
          requiredSuccessesForClose: 2
        }
      };
      
      // Reset circuit breaker
      const result = (service as any).resetCircuitBreaker('linkedin');
      
      // Verify result
      expect(result).toBe(true);
      
      // Verify circuit breaker was reset
      const cb = (service as any).circuitBreakers.linkedin;
      expect(cb.state).toBe('closed');
      expect(cb.failures).toBe(0);
      expect(cb.consecutiveFailures).toBe(0);
      expect(cb.totalFailures).toBe(0);
      expect(cb.lastFailure).toBeNull();
      expect(cb.nextAttempt).toBeNull();
    });
  });
});

// Helper function to create a mock proxy
function createMockProxy(host: string, country: string, city: string): ProxyConfig {
  return {
    host,
    port: 8080,
    username: 'user',
    password: 'pass',
    protocol: 'http',
    country,
    city,
    state: '',
    residential: true,
    provider: 'test',
    successCount: 10,
    failureCount: 2,
    banCount: 0,
    responseTime: 200,
    lastUsed: undefined
  };
}
