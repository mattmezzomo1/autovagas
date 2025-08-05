import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LinkedInScraperService } from './linkedin-scraper.service';
import { ScraperJobService } from './scraper-job.service';
import { ProxyService } from './proxy.service';
import { ScraperJob, ScraperJobStatus, ScraperPlatform } from '../entities/scraper-job.entity';
import { JobType, JobLevel, JobLocation } from '../../jobs/entities/job.entity';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

// Mock puppeteer
jest.mock('puppeteer-extra', () => {
  return {
    use: jest.fn().mockReturnThis(),
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setUserAgent: jest.fn(),
        setExtraHTTPHeaders: jest.fn(),
        setViewport: jest.fn(),
        goto: jest.fn(),
        waitForSelector: jest.fn(),
        $: jest.fn(),
        $$: jest.fn(),
        $eval: jest.fn(),
        $$eval: jest.fn(),
        evaluate: jest.fn(),
        type: jest.fn(),
        click: jest.fn(),
        waitForNavigation: jest.fn(),
        close: jest.fn(),
      }),
      close: jest.fn(),
    }),
  };
});

describe('LinkedInScraperService', () => {
  let linkedInScraperService: LinkedInScraperService;
  let scraperJobService: ScraperJobService;
  let proxyService: ProxyService;
  let httpService: HttpService;

  const mockScraperJobService = {
    findById: jest.fn(),
    update: jest.fn(),
    createJob: jest.fn(),
    saveJobResults: jest.fn(),
    markJobAsFailed: jest.fn(),
  };

  const mockProxyService = {
    getProxy: jest.fn(),
    markProxyAsUsed: jest.fn(),
    markProxyAsFailed: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockScraperJob: ScraperJob = {
    id: '1',
    userId: 'user-1',
    platform: ScraperPlatform.LINKEDIN,
    status: ScraperJobStatus.PENDING,
    parameters: {
      query: 'software engineer',
      location: 'São Paulo',
      jobType: JobType.FULL_TIME,
      jobLevel: JobLevel.MID_LEVEL,
      jobLocation: JobLocation.REMOTE,
      page: 1,
      limit: 10,
    },
    results: null,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedInScraperService,
        {
          provide: ScraperJobService,
          useValue: mockScraperJobService,
        },
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    linkedInScraperService = module.get<LinkedInScraperService>(LinkedInScraperService);
    scraperJobService = module.get<ScraperJobService>(ScraperJobService);
    proxyService = module.get<ProxyService>(ProxyService);
    httpService = module.get<HttpService>(HttpService);

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'scrapers.linkedin.baseUrl': 'https://www.linkedin.com',
        'scrapers.linkedin.jobsUrl': 'https://www.linkedin.com/jobs/search',
        'scrapers.linkedin.username': 'test@example.com',
        'scrapers.linkedin.password': 'password123',
        'scrapers.userAgents': ['Mozilla/5.0'],
        'scrapers.headless': true,
      };
      return config[key];
    });
    
    mockProxyService.getProxy.mockResolvedValue({
      id: 'proxy-1',
      host: '127.0.0.1',
      port: 8080,
      username: 'proxyuser',
      password: 'proxypass',
      protocol: 'http',
      country: 'BR',
      lastUsed: null,
      failCount: 0,
      isActive: true,
    });
  });

  describe('processJob', () => {
    it('should process a scraper job successfully', async () => {
      // Arrange
      mockScraperJobService.findById.mockResolvedValue(mockScraperJob);
      
      // Mock the search method
      linkedInScraperService.search = jest.fn().mockResolvedValue({
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'São Paulo, Brazil',
            url: 'https://www.linkedin.com/jobs/view/job-1',
            description: 'Job description',
            salary: 'R$5,000 - R$8,000',
            postedAt: '2023-05-01',
          },
        ],
        totalJobs: 1,
        page: 1,
        totalPages: 1,
      });
      
      // Act
      await linkedInScraperService.processJob('1');

      // Assert
      expect(mockScraperJobService.findById).toHaveBeenCalledWith('1');
      expect(mockScraperJobService.update).toHaveBeenCalledWith('1', {
        status: ScraperJobStatus.PROCESSING,
        startedAt: expect.any(Date),
      });
      expect(linkedInScraperService.search).toHaveBeenCalledWith(mockScraperJob.parameters);
      expect(mockScraperJobService.saveJobResults).toHaveBeenCalledWith('1', {
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'São Paulo, Brazil',
            url: 'https://www.linkedin.com/jobs/view/job-1',
            description: 'Job description',
            salary: 'R$5,000 - R$8,000',
            postedAt: '2023-05-01',
          },
        ],
        totalJobs: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should handle errors during job processing', async () => {
      // Arrange
      mockScraperJobService.findById.mockResolvedValue(mockScraperJob);
      
      // Mock the search method to throw an error
      linkedInScraperService.search = jest.fn().mockRejectedValue(new Error('Scraping failed'));
      
      // Act
      await linkedInScraperService.processJob('1');

      // Assert
      expect(mockScraperJobService.findById).toHaveBeenCalledWith('1');
      expect(mockScraperJobService.update).toHaveBeenCalledWith('1', {
        status: ScraperJobStatus.PROCESSING,
        startedAt: expect.any(Date),
      });
      expect(linkedInScraperService.search).toHaveBeenCalledWith(mockScraperJob.parameters);
      expect(mockScraperJobService.markJobAsFailed).toHaveBeenCalledWith('1', 'Scraping failed');
    });

    it('should throw error if job not found', async () => {
      // Arrange
      mockScraperJobService.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(linkedInScraperService.processJob('999')).rejects.toThrow();
      expect(mockScraperJobService.findById).toHaveBeenCalledWith('999');
      expect(mockScraperJobService.update).not.toHaveBeenCalled();
      expect(linkedInScraperService.search).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search for jobs using API approach', async () => {
      // Arrange
      const searchParams = {
        query: 'software engineer',
        location: 'São Paulo',
        jobType: JobType.FULL_TIME,
        jobLevel: JobLevel.MID_LEVEL,
        jobLocation: JobLocation.REMOTE,
        page: 1,
        limit: 10,
      };
      
      // Mock the API response
      const mockApiResponse = {
        data: {
          elements: [
            {
              jobPostings: [
                {
                  jobPosting: {
                    title: 'Software Engineer',
                    companyName: 'Tech Company',
                    formattedLocation: 'São Paulo, Brazil',
                    jobPostingId: 'job-1',
                    description: 'Job description',
                    formattedSalary: 'R$5,000 - R$8,000',
                    listedAt: '2023-05-01T00:00:00Z',
                  },
                },
              ],
              paging: {
                count: 10,
                start: 0,
                total: 100,
              },
            },
          ],
        },
      };
      
      mockHttpService.get.mockReturnValue(of(mockApiResponse));
      
      // Mock the useApiApproach method to return true
      linkedInScraperService['useApiApproach'] = jest.fn().mockReturnValue(true);
      
      // Act
      const result = await linkedInScraperService.search(searchParams);

      // Assert
      expect(result).toEqual({
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'São Paulo, Brazil',
            url: 'https://www.linkedin.com/jobs/view/job-1',
            description: 'Job description',
            salary: 'R$5,000 - R$8,000',
            postedAt: '2023-05-01T00:00:00Z',
          },
        ],
        totalJobs: 100,
        page: 1,
        totalPages: 10,
      });
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockProxyService.getProxy).toHaveBeenCalled();
      expect(mockProxyService.markProxyAsUsed).toHaveBeenCalledWith('proxy-1');
    });
  });

  describe('searchWithBrowser', () => {
    it('should search for jobs using browser approach', async () => {
      // This test is more complex due to puppeteer mocking
      // We'll just test that the method doesn't throw an error
      
      // Arrange
      const searchParams = {
        query: 'software engineer',
        location: 'São Paulo',
        jobType: JobType.FULL_TIME,
        jobLevel: JobLevel.MID_LEVEL,
        jobLocation: JobLocation.REMOTE,
        page: 1,
        limit: 10,
      };
      
      // Mock puppeteer page methods
      const puppeteer = require('puppeteer-extra');
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      page.$$eval.mockResolvedValue([
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'São Paulo, Brazil',
          id: 'job-1',
          url: 'https://www.linkedin.com/jobs/view/job-1',
        },
      ]);
      
      page.$eval.mockImplementation((selector, fn) => {
        if (selector.includes('pagination')) {
          return '1 of 10';
        }
        return null;
      });
      
      // Act & Assert
      await expect(linkedInScraperService['searchWithBrowser'](searchParams)).resolves.not.toThrow();
    });
  });
});
