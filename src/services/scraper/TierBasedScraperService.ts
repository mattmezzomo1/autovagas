import { ProxyScraperService } from './ProxyScraperService';
import { ScraperCacheService } from '../cache/ScraperCacheService';
import { config } from '../../config';
import { JobSearchParams, ScrapedJob } from '../webscraper/types';

/**
 * User tier types
 */
export enum UserTier {
  BASIC = 'basic',
  PLUS = 'plus',
  PREMIUM = 'premium'
}

/**
 * Service for managing tier-based scraping
 */
export class TierBasedScraperService {
  private proxyScraperService: ProxyScraperService;
  private cacheService: ScraperCacheService;

  // Track usage limits by user
  private userSearchCounts: Map<string, number> = new Map();
  private userJobDetailsCounts: Map<string, number> = new Map();

  // Reset counters daily
  private lastResetDate: Date = new Date();

  constructor() {
    this.proxyScraperService = new ProxyScraperService();
    this.cacheService = new ScraperCacheService();

    // Reset usage counters daily
    setInterval(() => this.resetDailyCounters(), 60 * 60 * 1000); // Check every hour
  }

  /**
   * Reset daily counters if it's a new day
   */
  private resetDailyCounters(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastReset = new Date(this.lastResetDate.getFullYear(), this.lastResetDate.getMonth(), this.lastResetDate.getDate());

    if (today > lastReset) {
      console.log('Resetting daily usage counters');
      this.userSearchCounts.clear();
      this.userJobDetailsCounts.clear();
      this.lastResetDate = now;
    }
  }

  /**
   * Check if user can perform a search
   */
  canPerformSearch(userId: string, tier: UserTier): boolean {
    const currentCount = this.userSearchCounts.get(userId) || 0;
    const limit = this.getSearchLimit(tier);

    return currentCount < limit;
  }

  /**
   * Check if user can fetch job details
   */
  canFetchJobDetails(userId: string, tier: UserTier): boolean {
    const currentCount = this.userJobDetailsCounts.get(userId) || 0;
    const limit = this.getJobDetailsLimit(tier);

    return currentCount < limit;
  }

  /**
   * Get search limit for a tier
   */
  private getSearchLimit(tier: UserTier): number {
    switch (tier) {
      case UserTier.BASIC:
        return config.userTiers.basic.maxSearchesPerDay;
      case UserTier.PLUS:
        return config.userTiers.plus.maxSearchesPerDay;
      case UserTier.PREMIUM:
        return config.userTiers.premium.maxSearchesPerDay;
      default:
        return 0;
    }
  }

  /**
   * Get job details limit for a tier
   */
  private getJobDetailsLimit(tier: UserTier): number {
    switch (tier) {
      case UserTier.BASIC:
        return config.userTiers.basic.maxJobDetailsPerDay;
      case UserTier.PLUS:
        return config.userTiers.plus.maxJobDetailsPerDay;
      case UserTier.PREMIUM:
        return config.userTiers.premium.maxJobDetailsPerDay;
      default:
        return 0;
    }
  }

  /**
   * Check if tier uses server-side scraping
   */
  private usesServerSideScraping(tier: UserTier): boolean {
    switch (tier) {
      case UserTier.BASIC:
        return config.userTiers.basic.useServerSideScraping;
      case UserTier.PLUS:
        return config.userTiers.plus.useServerSideScraping;
      case UserTier.PREMIUM:
        return config.userTiers.premium.useServerSideScraping;
      default:
        return false;
    }
  }

  /**
   * Increment search count for a user
   */
  private incrementSearchCount(userId: string): void {
    const currentCount = this.userSearchCounts.get(userId) || 0;
    this.userSearchCounts.set(userId, currentCount + 1);
  }

  /**
   * Increment job details count for a user
   */
  private incrementJobDetailsCount(userId: string): void {
    const currentCount = this.userJobDetailsCounts.get(userId) || 0;
    this.userJobDetailsCounts.set(userId, currentCount + 1);
  }

  /**
   * Search for jobs based on user tier
   */
  async searchJobs(userId: string, tier: UserTier, platform: string, params: JobSearchParams): Promise<ScrapedJob[]> {
    // Check if user can perform search
    if (!this.canPerformSearch(userId, tier)) {
      throw new Error(`Daily search limit reached for ${tier} tier`);
    }

    // Check if tier uses server-side scraping
    if (!this.usesServerSideScraping(tier)) {
      throw new Error(`${tier} tier requires client-side scraping`);
    }

    // Increment search count
    this.incrementSearchCount(userId);

    // Perform search based on platform
    let results: ScrapedJob[] = [];

    switch (platform) {
      case 'linkedin':
        results = await this.proxyScraperService.searchLinkedInJobs(params);
        break;
      case 'indeed':
        results = await this.proxyScraperService.searchIndeedJobs(params);
        break;
      case 'infojobs':
        results = await this.proxyScraperService.searchInfoJobsJobs(params);
        break;
      case 'catho':
        results = await this.proxyScraperService.searchCathoJobs(params);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return results;
  }

  /**
   * Get job details based on user tier
   */
  async getJobDetails(userId: string, tier: UserTier, platform: string, jobId: string, url: string): Promise<any> {
    // Check if user can fetch job details
    if (!this.canFetchJobDetails(userId, tier)) {
      throw new Error(`Daily job details limit reached for ${tier} tier`);
    }

    // Check if tier uses server-side scraping
    if (!this.usesServerSideScraping(tier)) {
      throw new Error(`${tier} tier requires client-side scraping`);
    }

    // Increment job details count
    this.incrementJobDetailsCount(userId);

    // Get job details based on platform
    let details: any = {};

    switch (platform) {
      case 'linkedin':
        details = await this.proxyScraperService.getLinkedInJobDetails(jobId, url);
        break;
      case 'indeed':
        details = await this.proxyScraperService.getIndeedJobDetails(jobId, url);
        break;
      case 'infojobs':
        details = await this.proxyScraperService.getInfoJobsJobDetails(jobId, url);
        break;
      case 'catho':
        details = await this.proxyScraperService.getCathoJobDetails(jobId, url);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return details;
  }

  /**
   * Get usage statistics for a user
   */
  getUserUsageStatistics(userId: string, tier: UserTier): any {
    const searchCount = this.userSearchCounts.get(userId) || 0;
    const jobDetailsCount = this.userJobDetailsCounts.get(userId) || 0;

    return {
      userId,
      tier,
      searchCount,
      searchLimit: this.getSearchLimit(tier),
      searchRemaining: Math.max(0, this.getSearchLimit(tier) - searchCount),
      jobDetailsCount,
      jobDetailsLimit: this.getJobDetailsLimit(tier),
      jobDetailsRemaining: Math.max(0, this.getJobDetailsLimit(tier) - jobDetailsCount),
      usesServerSideScraping: this.usesServerSideScraping(tier),
      resetDate: new Date(this.lastResetDate.getFullYear(), this.lastResetDate.getMonth(), this.lastResetDate.getDate() + 1)
    };
  }
}
