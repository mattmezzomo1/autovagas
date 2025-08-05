import { ProxyScraperService } from '../../src/services/scraper/ProxyScraperService';
import { ScraperCacheService } from '../../src/services/cache/ScraperCacheService';
import { ProxyRotationService } from '../../src/services/proxy/ProxyRotationService';
import { JobSearchParams } from '../../src/services/webscraper/types';

// Mock dependencies
jest.mock('../../src/services/cache/ScraperCacheService');
jest.mock('../../src/services/proxy/ProxyRotationService');
jest.mock('puppeteer-extra', () => {
  return {
    use: jest.fn().mockReturnThis(),
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setUserAgent: jest.fn(),
        setExtraHTTPHeaders: jest.fn(),
        authenticate: jest.fn(),
        goto: jest.fn(),
        waitForSelector: jest.fn(),
        evaluate: jest.fn(),
        close: jest.fn()
      }),
      close: jest.fn()
    })
  };
});

jest.mock('puppeteer-extra-plugin-stealth', () => {
  return jest.fn().mockReturnValue({});
});

describe('ProxyScraperService', () => {
  let service: ProxyScraperService;
  let mockCacheService: jest.Mocked<ScraperCacheService>;
  let mockProxyRotationService: jest.Mocked<ProxyRotationService>;

  beforeEach(() => {
    mockCacheService = new ScraperCacheService() as jest.Mocked<ScraperCacheService>;
    mockProxyRotationService = new ProxyRotationService() as jest.Mocked<ProxyRotationService>;
    
    mockCacheService.generateCacheKey = jest.fn().mockReturnValue('test-cache-key');
    mockCacheService.get = jest.fn().mockResolvedValue(null);
    mockCacheService.set = jest.fn().mockResolvedValue(true);
    
    mockProxyRotationService.getProxy = jest.fn().mockResolvedValue({
      host: 'test-proxy.com',
      port: 8080,
      username: 'user',
      password: 'pass',
      protocol: 'http',
      country: 'us',
      city: 'new york',
      state: 'ny',
      residential: true,
      successRate: 95
    });
    mockProxyRotationService.reportProxySuccess = jest.fn();
    mockProxyRotationService.reportProxyFailure = jest.fn();
    
    service = new ProxyScraperService(mockCacheService, mockProxyRotationService);
    
    // Mock the createProxyPage method
    service['createProxyPage'] = jest.fn().mockResolvedValue({
      page: {
        goto: jest.fn().mockResolvedValue(undefined),
        waitForSelector: jest.fn().mockResolvedValue(undefined),
        evaluate: jest.fn().mockResolvedValue([
          {
            id: 'indeed-123',
            platform: 'indeed',
            title: 'Software Engineer',
            company: 'Test Company',
            location: 'Remote',
            salary: '$100k - $150k',
            snippet: 'Great job opportunity',
            url: 'https://www.indeed.com/viewjob?jk=123',
            postedDate: '1 day ago',
            scrapedAt: new Date().toISOString()
          }
        ]),
        waitForTimeout: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      },
      proxy: {
        host: 'test-proxy.com',
        port: 8080,
        username: 'user',
        password: 'pass',
        protocol: 'http',
        country: 'us',
        city: 'new york',
        state: 'ny',
        residential: true,
        successRate: 95
      }
    });
  });

  describe('searchIndeedJobs', () => {
    it('should search for jobs on Indeed', async () => {
      const params: JobSearchParams = {
        keywords: ['software engineer'],
        locations: ['Remote'],
        remote: true
      };
      
      const result = await service.searchIndeedJobs(params);
      
      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe('indeed');
      expect(result[0].title).toBe('Software Engineer');
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockProxyRotationService.reportProxySuccess).toHaveBeenCalled();
    });

    it('should use cached results if available', async () => {
      const cachedResults = [
        {
          id: 'indeed-456',
          platform: 'indeed',
          title: 'Senior Developer',
          company: 'Cached Company',
          location: 'New York',
          salary: '$120k - $180k',
          url: 'https://www.indeed.com/viewjob?jk=456',
          scrapedAt: new Date().toISOString()
        }
      ];
      
      mockCacheService.get = jest.fn().mockResolvedValue(cachedResults);
      
      const params: JobSearchParams = {
        keywords: ['senior developer'],
        locations: ['New York']
      };
      
      const result = await service.searchIndeedJobs(params);
      
      expect(result).toBe(cachedResults);
      expect(service['createProxyPage']).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      service['createProxyPage'] = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const params: JobSearchParams = {
        keywords: ['software engineer'],
        locations: ['Remote']
      };
      
      const result = await service.searchIndeedJobs(params);
      
      expect(result).toEqual([]);
      expect(mockProxyRotationService.reportProxyFailure).not.toHaveBeenCalled(); // No proxy to report
    });
  });
});
