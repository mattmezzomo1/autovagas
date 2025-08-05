import { ScrapedJob } from '../webscraper/types';
import { config } from '../../config';

/**
 * Interface for a cache entry
 */
interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  size: number;
  key: string;
}

/**
 * Cache eviction policy
 */
export enum CacheEvictionPolicy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In First Out
  TTL = 'ttl' // Time To Live
}

/**
 * Service for managing scraping result cache with advanced strategies
 */
export class ScraperCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = config.scraper.cache.ttl || 30 * 60 * 1000; // 30 minutes in milliseconds
  private maxSize: number = config.scraper.cache.maxSize || 1000; // Maximum number of items in cache
  private evictionPolicy: CacheEvictionPolicy = CacheEvictionPolicy.LRU; // Default eviction policy
  private totalSize: number = 0; // Total size of cache in bytes (approximate)
  private hits: number = 0; // Number of cache hits
  private misses: number = 0; // Number of cache misses
  private evictions: number = 0; // Number of cache evictions

  constructor() {
    // Start periodic cache cleanup
    setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000); // Every 5 minutes

    // Start periodic cache size check
    setInterval(() => this.checkCacheSize(), 10 * 60 * 1000); // Every 10 minutes

    console.log(`Cache initialized with max size: ${this.maxSize} items, TTL: ${this.defaultTTL}ms, policy: ${this.evictionPolicy}`);
  }

  /**
   * Set the eviction policy
   */
  setEvictionPolicy(policy: CacheEvictionPolicy): void {
    this.evictionPolicy = policy;
    console.log(`Cache eviction policy set to: ${policy}`);
  }

  /**
   * Gera uma chave de cache com base nos parâmetros
   */
  generateCacheKey(platform: string, operation: string, params: any): string {
    return `${platform}:${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Get a value from the cache
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if cache has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.totalSize -= entry.size;
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.cache.set(key, entry);

    this.hits++;
    return entry.value;
  }

  /**
   * Store a value in the cache
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    // Check if cache is full before adding new entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictEntries(1);
    }

    const now = Date.now();
    const expiresAt = now + ttl;

    // Calculate approximate size of the value in bytes
    const valueString = JSON.stringify(value);
    const size = valueString.length * 2; // Approximate size in bytes

    // If entry already exists, subtract its size from total
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.totalSize -= oldEntry.size;
    }

    // Create new cache entry
    const entry: CacheEntry = {
      value,
      expiresAt,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      size,
      key
    };

    this.cache.set(key, entry);
    this.totalSize += size;
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Clean expired entries from the cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.totalSize -= entry.size;
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Cleaned ${removedCount} expired cache entries`);
    }
  }

  /**
   * Check cache size and evict entries if necessary
   */
  private checkCacheSize(): void {
    if (this.cache.size > this.maxSize) {
      const entriesToEvict = this.cache.size - this.maxSize;
      this.evictEntries(entriesToEvict);
    }
  }

  /**
   * Evict entries from the cache based on the eviction policy
   */
  private evictEntries(count: number): void {
    if (count <= 0 || this.cache.size === 0) {
      return;
    }

    const entries = Array.from(this.cache.values());
    let sortedEntries: CacheEntry[] = [];

    // Sort entries based on eviction policy
    switch (this.evictionPolicy) {
      case CacheEvictionPolicy.LRU:
        // Least Recently Used - sort by lastAccessed (oldest first)
        sortedEntries = entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
        break;

      case CacheEvictionPolicy.LFU:
        // Least Frequently Used - sort by accessCount (lowest first)
        sortedEntries = entries.sort((a, b) => a.accessCount - b.accessCount);
        break;

      case CacheEvictionPolicy.FIFO:
        // First In First Out - sort by createdAt (oldest first)
        sortedEntries = entries.sort((a, b) => a.createdAt - b.createdAt);
        break;

      case CacheEvictionPolicy.TTL:
        // Time To Live - sort by expiresAt (soonest first)
        sortedEntries = entries.sort((a, b) => a.expiresAt - b.expiresAt);
        break;
    }

    // Evict the selected entries
    const entriesToEvict = sortedEntries.slice(0, count);

    for (const entry of entriesToEvict) {
      this.cache.delete(entry.key);
      this.totalSize -= entry.size;
      this.evictions++;
    }

    console.log(`Evicted ${entriesToEvict.length} cache entries using ${this.evictionPolicy} policy`);
  }

  /**
   * Invalida cache relacionado a uma plataforma
   */
  async invalidatePlatformCache(platform: string): Promise<void> {
    const platformPrefix = `${platform}:`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(platformPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalida cache relacionado a uma operação específica
   */
  async invalidateOperationCache(platform: string, operation: string): Promise<void> {
    const operationPrefix = `${platform}:${operation}:`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(operationPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics() {
    const now = Date.now();
    let expired = 0;

    // Statistics by platform
    const platformStats = {
      linkedin: 0,
      indeed: 0,
      infojobs: 0,
      catho: 0
    };

    // Statistics by operation
    const operationStats = {
      search: 0,
      details: 0
    };

    // Statistics by age
    const ageStats = {
      lessThan1Hour: 0,
      lessThan1Day: 0,
      moreThan1Day: 0
    };

    // Statistics by size
    const sizeStats = {
      small: 0, // < 1KB
      medium: 0, // 1KB - 10KB
      large: 0, // 10KB - 100KB
      extraLarge: 0 // > 100KB
    };

    // Calculate cache statistics
    for (const [key, entry] of this.cache.entries()) {
      // Check if entry has expired
      if (now > entry.expiresAt) {
        expired++;
        continue;
      }

      // Increment platform counter
      for (const platform of Object.keys(platformStats)) {
        if (key.startsWith(`${platform}:`)) {
          platformStats[platform]++;
          break;
        }
      }

      // Increment operation counter
      if (key.includes(':search:')) {
        operationStats.search++;
      } else if (key.includes(':details:')) {
        operationStats.details++;
      }

      // Increment age counter
      const ageInMs = now - entry.createdAt;
      if (ageInMs < 60 * 60 * 1000) { // Less than 1 hour
        ageStats.lessThan1Hour++;
      } else if (ageInMs < 24 * 60 * 60 * 1000) { // Less than 1 day
        ageStats.lessThan1Day++;
      } else { // More than 1 day
        ageStats.moreThan1Day++;
      }

      // Increment size counter
      if (entry.size < 1024) { // < 1KB
        sizeStats.small++;
      } else if (entry.size < 10 * 1024) { // 1KB - 10KB
        sizeStats.medium++;
      } else if (entry.size < 100 * 1024) { // 10KB - 100KB
        sizeStats.large++;
      } else { // > 100KB
        sizeStats.extraLarge++;
      }
    }

    // Calculate hit rate
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    // Calculate average entry size
    const averageSize = this.cache.size > 0 ? this.totalSize / this.cache.size : 0;

    return {
      // Basic statistics
      entries: this.cache.size,
      maxEntries: this.maxSize,
      totalSize: this.totalSize,
      averageSize,

      // Hit/miss statistics
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
      expired,

      // Policy information
      evictionPolicy: this.evictionPolicy,

      // Detailed statistics
      platformStats,
      operationStats,
      ageStats,
      sizeStats,

      // Memory usage (approximate)
      memoryUsageMB: this.totalSize / (1024 * 1024)
    };
  }
}
