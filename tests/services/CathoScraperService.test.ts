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

describe('Catho Scraper', () => {
  let service: ProxyScraperService;
  let mockCacheService: jest.Mocked<ScraperCacheService>;
  let mockProxyRotationService: jest.Mocked<ProxyRotationService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockCacheService = new ScraperCacheService() as jest.Mocked<ScraperCacheService>;
    mockProxyRotationService = new ProxyRotationService() as jest.Mocked<ProxyRotationService>;
    
    // Setup mock behavior
    mockCacheService.generateCacheKey = jest.fn().mockReturnValue('test-cache-key');
    mockCacheService.get = jest.fn().mockResolvedValue(null);
    mockCacheService.set = jest.fn().mockResolvedValue(true);
    
    mockProxyRotationService.getProxy = jest.fn().mockResolvedValue({
      host: 'test-proxy.com',
      port: 8080,
      username: 'user',
      password: 'pass',
      protocol: 'http',
      country: 'br',
      city: 'sao paulo',
      state: 'sp',
      residential: true,
      successRate: 95,
      provider: 'test',
      successCount: 10,
      failureCount: 0,
      banCount: 0,
      responseTime: 200
    });
    mockProxyRotationService.reportProxySuccess = jest.fn();
    mockProxyRotationService.reportProxyFailure = jest.fn();
    
    // Create service instance
    service = new ProxyScraperService();
    
    // Replace dependencies with mocks
    (service as any).cacheService = mockCacheService;
    (service as any).proxyRotationService = mockProxyRotationService;
    
    // Mock the createProxyPage method
    (service as any).createProxyPage = jest.fn().mockResolvedValue({
      page: {
        goto: jest.fn().mockResolvedValue(undefined),
        waitForSelector: jest.fn().mockResolvedValue(undefined),
        evaluate: jest.fn().mockResolvedValue([
          {
            id: 'catho-123',
            platform: 'catho',
            title: 'Analista de Sistemas',
            company: 'Empresa Teste',
            location: 'São Paulo, SP',
            salary: 'R$ 5.000 - R$ 7.000',
            url: 'https://www.catho.com.br/vagas/analista-de-sistemas/123',
            postedDate: 'Hoje',
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
        country: 'br',
        city: 'sao paulo',
        state: 'sp',
        residential: true,
        successRate: 95,
        provider: 'test',
        successCount: 10,
        failureCount: 0,
        banCount: 0,
        responseTime: 200
      }
    });
    
    // Mock the humanBehaviorSimulator
    (service as any).humanBehaviorSimulator = {
      randomDelay: jest.fn().mockResolvedValue(undefined),
      simulateScrolling: jest.fn().mockResolvedValue(undefined),
      simulateMouseMovement: jest.fn().mockResolvedValue(undefined),
      simulateTyping: jest.fn().mockResolvedValue(undefined),
      simulatePageVisit: jest.fn().mockResolvedValue(undefined),
      addRandomMouseMovements: jest.fn().mockResolvedValue(undefined),
      simulateClick: jest.fn().mockResolvedValue(undefined)
    };
  });

  describe('searchCathoJobs', () => {
    it('should search for jobs on Catho', async () => {
      const params: JobSearchParams = {
        keywords: ['analista', 'sistemas'],
        locations: ['São Paulo'],
        remote: true,
        jobTypes: ['CLT']
      };
      
      const result = await service.searchCathoJobs(params);
      
      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe('catho');
      expect(result[0].title).toBe('Analista de Sistemas');
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockProxyRotationService.reportProxySuccess).toHaveBeenCalled();
      
      // Verify human behavior simulation was used
      expect((service as any).humanBehaviorSimulator.simulatePageVisit).toHaveBeenCalled();
      expect((service as any).humanBehaviorSimulator.addRandomMouseMovements).toHaveBeenCalled();
      expect((service as any).humanBehaviorSimulator.simulateScrolling).toHaveBeenCalled();
      expect((service as any).humanBehaviorSimulator.randomDelay).toHaveBeenCalled();
    });

    it('should use cached results if available', async () => {
      const cachedResults = [
        {
          id: 'catho-456',
          platform: 'catho',
          title: 'Desenvolvedor Java',
          company: 'Empresa Cached',
          location: 'Rio de Janeiro, RJ',
          salary: 'R$ 6.000 - R$ 8.000',
          url: 'https://www.catho.com.br/vagas/desenvolvedor-java/456',
          postedDate: 'Hoje',
          scrapedAt: new Date().toISOString()
        }
      ];
      
      mockCacheService.get = jest.fn().mockResolvedValue(cachedResults);
      
      const params: JobSearchParams = {
        keywords: ['desenvolvedor', 'java'],
        locations: ['Rio de Janeiro']
      };
      
      const result = await service.searchCathoJobs(params);
      
      expect(result).toBe(cachedResults);
      expect((service as any).createProxyPage).not.toHaveBeenCalled();
      expect((service as any).humanBehaviorSimulator.simulatePageVisit).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (service as any).createProxyPage = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const params: JobSearchParams = {
        keywords: ['analista'],
        locations: ['São Paulo']
      };
      
      const result = await service.searchCathoJobs(params);
      
      expect(result).toEqual([]);
      expect(mockProxyRotationService.reportProxyFailure).not.toHaveBeenCalled(); // No proxy to report
    });
  });

  describe('getCathoJobDetails', () => {
    beforeEach(() => {
      // Mock the page.evaluate for job details
      const mockPage = (service as any).createProxyPage().page;
      mockPage.evaluate = jest.fn().mockResolvedValue({
        title: 'Analista de Sistemas',
        company: 'Empresa Teste',
        location: 'São Paulo, SP',
        description: 'Descrição da vaga para analista de sistemas...',
        requirements: ['Java', 'SQL', 'Agile', '3+ anos de experiência'],
        jobType: 'CLT',
        workModel: 'Híbrido',
        salary: 'R$ 5.000 - R$ 7.000',
        applicationUrl: 'https://www.catho.com.br/apply/123',
        scrapedAt: new Date().toISOString()
      });
    });

    it('should get job details from Catho', async () => {
      const jobId = 'catho-123';
      const url = 'https://www.catho.com.br/vagas/analista-de-sistemas/123';
      
      const result = await service.getCathoJobDetails(jobId, url);
      
      expect(result).toHaveProperty('title', 'Analista de Sistemas');
      expect(result).toHaveProperty('company', 'Empresa Teste');
      expect(result).toHaveProperty('requirements');
      expect(Array.isArray(result.requirements)).toBe(true);
      expect(result.requirements).toContain('Java');
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockProxyRotationService.reportProxySuccess).toHaveBeenCalled();
      
      // Verify human behavior simulation was used
      expect((service as any).humanBehaviorSimulator.simulatePageVisit).toHaveBeenCalled();
      expect((service as any).humanBehaviorSimulator.simulateScrolling).toHaveBeenCalled();
    });

    it('should use cached results if available', async () => {
      const cachedResult = {
        title: 'Desenvolvedor Java Cached',
        company: 'Empresa Cached',
        location: 'Rio de Janeiro, RJ',
        description: 'Descrição da vaga cached...',
        requirements: ['Java', 'Spring', 'SQL'],
        jobType: 'CLT',
        workModel: 'Remoto',
        salary: 'R$ 6.000 - R$ 8.000',
        applicationUrl: 'https://www.catho.com.br/apply/456',
        scrapedAt: new Date().toISOString()
      };
      
      mockCacheService.get = jest.fn().mockResolvedValue(cachedResult);
      
      const jobId = 'catho-456';
      const url = 'https://www.catho.com.br/vagas/desenvolvedor-java/456';
      
      const result = await service.getCathoJobDetails(jobId, url);
      
      expect(result).toBe(cachedResult);
      expect((service as any).createProxyPage).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (service as any).createProxyPage = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const jobId = 'catho-123';
      const url = 'https://www.catho.com.br/vagas/analista-de-sistemas/123';
      
      const result = await service.getCathoJobDetails(jobId, url);
      
      expect(result).toEqual({});
    });
    
    it('should handle cookie consent', async () => {
      const jobId = 'catho-123';
      const url = 'https://www.catho.com.br/vagas/analista-de-sistemas/123';
      
      // Mock the page.evaluate to simulate cookie consent handling
      const mockPage = (service as any).createProxyPage().page;
      mockPage.evaluate = jest.fn()
        .mockImplementationOnce(() => true) // First call for cookie consent
        .mockImplementationOnce({ // Second call for job details
          title: 'Analista de Sistemas',
          company: 'Empresa Teste',
          location: 'São Paulo, SP',
          description: 'Descrição da vaga para analista de sistemas...',
          requirements: ['Java', 'SQL', 'Agile'],
          jobType: 'CLT',
          workModel: 'Híbrido',
          salary: 'R$ 5.000 - R$ 7.000',
          applicationUrl: 'https://www.catho.com.br/apply/123',
          scrapedAt: new Date().toISOString()
        });
      
      const result = await service.getCathoJobDetails(jobId, url);
      
      expect(result).toHaveProperty('title', 'Analista de Sistemas');
      expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    });
  });
});
