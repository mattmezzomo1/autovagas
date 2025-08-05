import { ScraperQueueService } from '../../src/services/queue/ScraperQueueService';

// Mock dependencies
jest.mock('../../src/services/webscraper/LinkedInScraperService', () => {
  return {
    LinkedInScraperService: jest.fn().mockImplementation(() => {
      return {
        searchJobs: jest.fn().mockResolvedValue([]),
        getJobDetails: jest.fn().mockResolvedValue({})
      };
    })
  };
});

jest.mock('../../src/services/webscraper/IndeedScraperService', () => {
  return {
    IndeedScraperService: jest.fn().mockImplementation(() => {
      return {
        searchJobs: jest.fn().mockResolvedValue([]),
        getJobDetails: jest.fn().mockResolvedValue({})
      };
    })
  };
});

jest.mock('../../src/services/webscraper/InfoJobsScraperService', () => {
  return {
    InfoJobsScraperService: jest.fn().mockImplementation(() => {
      return {
        searchJobs: jest.fn().mockResolvedValue([]),
        getJobDetails: jest.fn().mockResolvedValue({})
      };
    })
  };
});

jest.mock('../../src/services/webscraper/CathoScraperService', () => {
  return {
    CathoScraperService: jest.fn().mockImplementation(() => {
      return {
        searchJobs: jest.fn().mockResolvedValue([]),
        getJobDetails: jest.fn().mockResolvedValue({})
      };
    })
  };
});

describe('ScraperQueueService', () => {
  let service: ScraperQueueService;

  beforeEach(() => {
    service = new ScraperQueueService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Circuit Breaker', () => {
    it('should initialize circuit breakers for all platforms', () => {
      const status = service.getCircuitBreakersStatus();
      
      expect(status).toHaveProperty('linkedin');
      expect(status).toHaveProperty('indeed');
      expect(status).toHaveProperty('infojobs');
      expect(status).toHaveProperty('catho');
      
      // Check initial state
      expect(status.linkedin.state).toBe('closed');
      expect(status.linkedin.failures).toBe(0);
      expect(status.linkedin.consecutiveFailures).toBe(0);
      expect(status.linkedin.totalFailures).toBe(0);
      expect(status.linkedin.lastFailure).toBeNull();
      expect(status.linkedin.nextAttempt).toBeNull();
    });

    it('should reset circuit breaker for a specific platform', () => {
      // First, modify the circuit breaker state
      const circuitBreakers = service['circuitBreakers'];
      circuitBreakers.linkedin = {
        ...circuitBreakers.linkedin,
        state: 'open',
        failures: 5,
        consecutiveFailures: 5,
        totalFailures: 10,
        lastFailure: new Date(),
        nextAttempt: new Date(Date.now() + 5 * 60 * 1000)
      };
      
      // Reset the circuit breaker
      const result = service.resetCircuitBreaker('linkedin');
      
      // Check result
      expect(result).toBe(true);
      
      // Check circuit breaker state
      const status = service.getCircuitBreakersStatus();
      expect(status.linkedin.state).toBe('closed');
      expect(status.linkedin.failures).toBe(0);
      expect(status.linkedin.consecutiveFailures).toBe(0);
      expect(status.linkedin.totalFailures).toBe(0);
      expect(status.linkedin.lastFailure).toBeNull();
      expect(status.linkedin.nextAttempt).toBeNull();
    });

    it('should return false when resetting an invalid platform', () => {
      const result = service.resetCircuitBreaker('invalid-platform');
      expect(result).toBe(false);
    });
  });
});
