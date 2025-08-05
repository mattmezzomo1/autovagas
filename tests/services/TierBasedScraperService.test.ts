import { TierBasedScraperService, UserTier } from '../../src/services/scraper/TierBasedScraperService';
import { ProxyScraperService } from '../../src/services/scraper/ProxyScraperService';
import { ScraperCacheService } from '../../src/services/cache/ScraperCacheService';
import { config } from '../../src/config';

// Mock dependencies
jest.mock('../../src/services/scraper/ProxyScraperService');
jest.mock('../../src/services/cache/ScraperCacheService');
jest.mock('../../src/config', () => ({
  config: {
    userTiers: {
      basic: {
        maxSearchesPerDay: 10,
        maxJobDetailsPerDay: 50,
        useServerSideScraping: false
      },
      plus: {
        maxSearchesPerDay: 30,
        maxJobDetailsPerDay: 150,
        useServerSideScraping: true
      },
      premium: {
        maxSearchesPerDay: 100,
        maxJobDetailsPerDay: 500,
        useServerSideScraping: true
      }
    }
  }
}));

describe('TierBasedScraperService', () => {
  let tierScraperService: TierBasedScraperService;
  let mockProxyScraperService: jest.Mocked<ProxyScraperService>;
  let mockCacheService: jest.Mocked<ScraperCacheService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock implementations
    mockProxyScraperService = {
      searchLinkedInJobs: jest.fn(),
      getLinkedInJobDetails: jest.fn(),
    } as unknown as jest.Mocked<ProxyScraperService>;
    
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      generateCacheKey: jest.fn(),
    } as unknown as jest.Mocked<ScraperCacheService>;
    
    // Create service instance with mocked dependencies
    tierScraperService = new TierBasedScraperService();
    
    // Replace the dependencies with mocks
    (tierScraperService as any).proxyScraperService = mockProxyScraperService;
    (tierScraperService as any).cacheService = mockCacheService;
    
    // Reset usage counters
    (tierScraperService as any).userSearchCounts = new Map();
    (tierScraperService as any).userJobDetailsCounts = new Map();
  });

  describe('canPerformSearch', () => {
    it('should return true if user has not reached search limit', () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      
      // Act
      const result = tierScraperService.canPerformSearch(userId, tier);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has reached search limit', () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      
      // Set search count to the limit
      (tierScraperService as any).userSearchCounts.set(userId, config.userTiers.basic.maxSearchesPerDay);
      
      // Act
      const result = tierScraperService.canPerformSearch(userId, tier);
      
      // Assert
      expect(result).toBe(false);
    });

    it('should use different limits for different tiers', () => {
      // Arrange
      const userId = 'user1';
      
      // Set search count to just below the basic limit
      (tierScraperService as any).userSearchCounts.set(userId, config.userTiers.basic.maxSearchesPerDay - 1);
      
      // Act & Assert
      expect(tierScraperService.canPerformSearch(userId, UserTier.BASIC)).toBe(true);
      expect(tierScraperService.canPerformSearch(userId, UserTier.PLUS)).toBe(true);
      expect(tierScraperService.canPerformSearch(userId, UserTier.PREMIUM)).toBe(true);
      
      // Set search count to the basic limit
      (tierScraperService as any).userSearchCounts.set(userId, config.userTiers.basic.maxSearchesPerDay);
      
      // Act & Assert
      expect(tierScraperService.canPerformSearch(userId, UserTier.BASIC)).toBe(false);
      expect(tierScraperService.canPerformSearch(userId, UserTier.PLUS)).toBe(true);
      expect(tierScraperService.canPerformSearch(userId, UserTier.PREMIUM)).toBe(true);
    });
  });

  describe('canFetchJobDetails', () => {
    it('should return true if user has not reached job details limit', () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      
      // Act
      const result = tierScraperService.canFetchJobDetails(userId, tier);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has reached job details limit', () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      
      // Set job details count to the limit
      (tierScraperService as any).userJobDetailsCounts.set(userId, config.userTiers.basic.maxJobDetailsPerDay);
      
      // Act
      const result = tierScraperService.canFetchJobDetails(userId, tier);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('searchJobs', () => {
    it('should throw error if user cannot perform search', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      const platform = 'linkedin';
      const params = { keywords: ['test'] };
      
      // Set search count to the limit
      (tierScraperService as any).userSearchCounts.set(userId, config.userTiers.basic.maxSearchesPerDay);
      
      // Act & Assert
      await expect(tierScraperService.searchJobs(userId, tier, platform, params))
        .rejects.toThrow(`Daily search limit reached for ${tier} tier`);
    });

    it('should throw error if tier does not use server-side scraping', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC; // Basic tier doesn't use server-side scraping
      const platform = 'linkedin';
      const params = { keywords: ['test'] };
      
      // Act & Assert
      await expect(tierScraperService.searchJobs(userId, tier, platform, params))
        .rejects.toThrow(`${tier} tier requires client-side scraping`);
    });

    it('should increment search count and call platform-specific search method', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.PLUS; // Plus tier uses server-side scraping
      const platform = 'linkedin';
      const params = { keywords: ['test'] };
      const mockResults = [{ id: 'job1', title: 'Test Job' }];
      
      mockProxyScraperService.searchLinkedInJobs.mockResolvedValue(mockResults);
      
      // Act
      const results = await tierScraperService.searchJobs(userId, tier, platform, params);
      
      // Assert
      expect(results).toEqual(mockResults);
      expect(mockProxyScraperService.searchLinkedInJobs).toHaveBeenCalledWith(params);
      expect((tierScraperService as any).userSearchCounts.get(userId)).toBe(1);
    });

    it('should throw error for unsupported platform', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.PLUS;
      const platform = 'unsupported';
      const params = { keywords: ['test'] };
      
      // Act & Assert
      await expect(tierScraperService.searchJobs(userId, tier, platform, params))
        .rejects.toThrow(`Unsupported platform: ${platform}`);
    });
  });

  describe('getJobDetails', () => {
    it('should throw error if user cannot fetch job details', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC;
      const platform = 'linkedin';
      const jobId = 'job1';
      const url = 'https://example.com/job1';
      
      // Set job details count to the limit
      (tierScraperService as any).userJobDetailsCounts.set(userId, config.userTiers.basic.maxJobDetailsPerDay);
      
      // Act & Assert
      await expect(tierScraperService.getJobDetails(userId, tier, platform, jobId, url))
        .rejects.toThrow(`Daily job details limit reached for ${tier} tier`);
    });

    it('should throw error if tier does not use server-side scraping', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.BASIC; // Basic tier doesn't use server-side scraping
      const platform = 'linkedin';
      const jobId = 'job1';
      const url = 'https://example.com/job1';
      
      // Act & Assert
      await expect(tierScraperService.getJobDetails(userId, tier, platform, jobId, url))
        .rejects.toThrow(`${tier} tier requires client-side scraping`);
    });

    it('should increment job details count and call platform-specific details method', async () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.PLUS; // Plus tier uses server-side scraping
      const platform = 'linkedin';
      const jobId = 'job1';
      const url = 'https://example.com/job1';
      const mockDetails = { id: 'job1', title: 'Test Job', description: 'Test Description' };
      
      mockProxyScraperService.getLinkedInJobDetails.mockResolvedValue(mockDetails);
      
      // Act
      const details = await tierScraperService.getJobDetails(userId, tier, platform, jobId, url);
      
      // Assert
      expect(details).toEqual(mockDetails);
      expect(mockProxyScraperService.getLinkedInJobDetails).toHaveBeenCalledWith(jobId, url);
      expect((tierScraperService as any).userJobDetailsCounts.get(userId)).toBe(1);
    });
  });

  describe('getUserUsageStatistics', () => {
    it('should return accurate usage statistics', () => {
      // Arrange
      const userId = 'user1';
      const tier = UserTier.PLUS;
      
      // Set some usage counts
      (tierScraperService as any).userSearchCounts.set(userId, 5);
      (tierScraperService as any).userJobDetailsCounts.set(userId, 10);
      
      // Act
      const stats = tierScraperService.getUserUsageStatistics(userId, tier);
      
      // Assert
      expect(stats.userId).toBe(userId);
      expect(stats.tier).toBe(tier);
      expect(stats.searchCount).toBe(5);
      expect(stats.searchLimit).toBe(config.userTiers.plus.maxSearchesPerDay);
      expect(stats.searchRemaining).toBe(config.userTiers.plus.maxSearchesPerDay - 5);
      expect(stats.jobDetailsCount).toBe(10);
      expect(stats.jobDetailsLimit).toBe(config.userTiers.plus.maxJobDetailsPerDay);
      expect(stats.jobDetailsRemaining).toBe(config.userTiers.plus.maxJobDetailsPerDay - 10);
      expect(stats.usesServerSideScraping).toBe(config.userTiers.plus.useServerSideScraping);
    });
  });

  describe('resetDailyCounters', () => {
    it('should reset counters when a new day starts', () => {
      // Arrange
      const userId = 'user1';
      
      // Set some usage counts
      (tierScraperService as any).userSearchCounts.set(userId, 5);
      (tierScraperService as any).userJobDetailsCounts.set(userId, 10);
      
      // Set last reset date to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      (tierScraperService as any).lastResetDate = yesterday;
      
      // Act
      (tierScraperService as any).resetDailyCounters();
      
      // Assert
      expect((tierScraperService as any).userSearchCounts.size).toBe(0);
      expect((tierScraperService as any).userJobDetailsCounts.size).toBe(0);
      
      // Check that last reset date was updated
      expect((tierScraperService as any).lastResetDate.getDate()).toBe(new Date().getDate());
    });

    it('should not reset counters if still the same day', () => {
      // Arrange
      const userId = 'user1';
      
      // Set some usage counts
      (tierScraperService as any).userSearchCounts.set(userId, 5);
      (tierScraperService as any).userJobDetailsCounts.set(userId, 10);
      
      // Set last reset date to today
      (tierScraperService as any).lastResetDate = new Date();
      
      // Act
      (tierScraperService as any).resetDailyCounters();
      
      // Assert
      expect((tierScraperService as any).userSearchCounts.get(userId)).toBe(5);
      expect((tierScraperService as any).userJobDetailsCounts.get(userId)).toBe(10);
    });
  });
});
