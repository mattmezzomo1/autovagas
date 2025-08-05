import { ScraperCacheService, CacheEvictionPolicy } from '../../src/services/cache/ScraperCacheService';
import { config } from '../../src/config';

// Mock the config
jest.mock('../../src/config', () => ({
  config: {
    scraper: {
      cache: {
        ttl: 60000, // 1 minute
        maxSize: 5, // Small size for testing
      },
    },
  },
}));

describe('ScraperCacheService', () => {
  let cacheService: ScraperCacheService;

  beforeEach(() => {
    // Create a new instance for each test
    cacheService = new ScraperCacheService();
    
    // Clear any timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      // Act
      await cacheService.set(key, value);
      const result = await cacheService.get(key);
      
      // Assert
      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      // Act
      const result = await cacheService.get('non-existent-key');
      
      // Assert
      expect(result).toBeNull();
    });

    it('should return null for expired key', async () => {
      // Arrange
      const key = 'expired-key';
      const value = { data: 'test-data' };
      
      // Set with a very short TTL
      await cacheService.set(key, value, 10); // 10ms TTL
      
      // Advance time past TTL
      jest.advanceTimersByTime(20);
      
      // Act
      const result = await cacheService.get(key);
      
      // Assert
      expect(result).toBeNull();
    });

    it('should update access statistics on get', async () => {
      // Arrange
      const key = 'stats-key';
      const value = { data: 'test-data' };
      
      // Act
      await cacheService.set(key, value);
      
      // Get the value multiple times
      await cacheService.get(key);
      await cacheService.get(key);
      await cacheService.get(key);
      
      // Assert - check hits count
      const stats = cacheService.getCacheStatistics();
      expect(stats.hits).toBe(3);
    });

    it('should increment miss count for non-existent keys', async () => {
      // Act
      await cacheService.get('non-existent-key-1');
      await cacheService.get('non-existent-key-2');
      
      // Assert
      const stats = cacheService.getCacheStatistics();
      expect(stats.misses).toBe(2);
    });
  });

  describe('eviction policies', () => {
    it('should evict entries when cache is full (LRU policy)', async () => {
      // Arrange
      cacheService.setEvictionPolicy(CacheEvictionPolicy.LRU);
      
      // Fill the cache to its max size
      for (let i = 0; i < config.scraper.cache.maxSize; i++) {
        await cacheService.set(`key-${i}`, { data: `value-${i}` });
      }
      
      // Access some keys to update their lastAccessed time
      await cacheService.get('key-1');
      await cacheService.get('key-3');
      
      // Add one more entry to trigger eviction
      await cacheService.set('new-key', { data: 'new-value' });
      
      // Act & Assert
      // The least recently used key should be evicted (key-0, key-2, key-4)
      // The most recently used keys should still be in cache (key-1, key-3, new-key)
      expect(await cacheService.get('key-0')).toBeNull();
      expect(await cacheService.get('key-1')).not.toBeNull();
      expect(await cacheService.get('key-3')).not.toBeNull();
      expect(await cacheService.get('new-key')).not.toBeNull();
      
      // Check eviction count
      const stats = cacheService.getCacheStatistics();
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should evict entries when cache is full (FIFO policy)', async () => {
      // Arrange
      cacheService.setEvictionPolicy(CacheEvictionPolicy.FIFO);
      
      // Fill the cache to its max size
      for (let i = 0; i < config.scraper.cache.maxSize; i++) {
        await cacheService.set(`key-${i}`, { data: `value-${i}` });
      }
      
      // Add one more entry to trigger eviction
      await cacheService.set('new-key', { data: 'new-value' });
      
      // Act & Assert
      // The first key added should be evicted (key-0)
      expect(await cacheService.get('key-0')).toBeNull();
      expect(await cacheService.get('key-1')).not.toBeNull();
      expect(await cacheService.get('new-key')).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all entries from the cache', async () => {
      // Arrange
      await cacheService.set('key-1', { data: 'value-1' });
      await cacheService.set('key-2', { data: 'value-2' });
      
      // Act
      await cacheService.clear();
      
      // Assert
      expect(await cacheService.get('key-1')).toBeNull();
      expect(await cacheService.get('key-2')).toBeNull();
      
      const stats = cacheService.getCacheStatistics();
      expect(stats.entries).toBe(0);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate a consistent cache key', () => {
      // Arrange
      const platform = 'linkedin';
      const operation = 'search';
      const params = { keywords: ['software engineer'], location: 'San Francisco' };
      
      // Act
      const key = cacheService.generateCacheKey(platform, operation, params);
      
      // Assert
      expect(key).toBe('linkedin:search:{"keywords":["software engineer"],"location":"San Francisco"}');
    });
  });

  describe('invalidatePlatformCache', () => {
    it('should invalidate cache for a specific platform', async () => {
      // Arrange
      await cacheService.set(
        cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] }),
        { data: 'linkedin-data' }
      );
      
      await cacheService.set(
        cacheService.generateCacheKey('indeed', 'search', { keywords: ['test'] }),
        { data: 'indeed-data' }
      );
      
      // Act
      await cacheService.invalidatePlatformCache('linkedin');
      
      // Assert
      expect(await cacheService.get(
        cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] })
      )).toBeNull();
      
      expect(await cacheService.get(
        cacheService.generateCacheKey('indeed', 'search', { keywords: ['test'] })
      )).not.toBeNull();
    });
  });

  describe('invalidateOperationCache', () => {
    it('should invalidate cache for a specific operation on a platform', async () => {
      // Arrange
      await cacheService.set(
        cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] }),
        { data: 'search-data' }
      );
      
      await cacheService.set(
        cacheService.generateCacheKey('linkedin', 'details', { jobId: '123' }),
        { data: 'details-data' }
      );
      
      // Act
      await cacheService.invalidateOperationCache('linkedin', 'search');
      
      // Assert
      expect(await cacheService.get(
        cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] })
      )).toBeNull();
      
      expect(await cacheService.get(
        cacheService.generateCacheKey('linkedin', 'details', { jobId: '123' })
      )).not.toBeNull();
    });
  });

  describe('getCacheStatistics', () => {
    it('should return accurate cache statistics', async () => {
      // Arrange
      await cacheService.set(
        cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] }),
        { data: 'linkedin-search-data' }
      );
      
      await cacheService.set(
        cacheService.generateCacheKey('linkedin', 'details', { jobId: '123' }),
        { data: 'linkedin-details-data' }
      );
      
      await cacheService.set(
        cacheService.generateCacheKey('indeed', 'search', { keywords: ['test'] }),
        { data: 'indeed-search-data' }
      );
      
      // Get some values to update hit statistics
      await cacheService.get(cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] }));
      await cacheService.get(cacheService.generateCacheKey('linkedin', 'search', { keywords: ['test'] }));
      await cacheService.get('non-existent-key');
      
      // Act
      const stats = cacheService.getCacheStatistics();
      
      // Assert
      expect(stats.entries).toBe(3);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.platformStats.linkedin).toBe(2);
      expect(stats.platformStats.indeed).toBe(1);
      expect(stats.operationStats.search).toBe(2);
      expect(stats.operationStats.details).toBe(1);
    });
  });
});
