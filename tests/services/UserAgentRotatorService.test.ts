import { UserAgentRotatorService } from '../../src/services/scraper/UserAgentRotatorService';

describe('UserAgentRotatorService', () => {
  let userAgentRotator: UserAgentRotatorService;

  beforeEach(() => {
    userAgentRotator = new UserAgentRotatorService();
  });

  describe('getRandomUserAgent', () => {
    it('should return a valid user agent string', () => {
      // Act
      const userAgent = userAgentRotator.getRandomUserAgent();

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);
      expect(userAgent).toContain('Mozilla');
    });

    it('should return different user agents on multiple calls', () => {
      // Arrange
      const userAgents = new Set<string>();
      const iterations = 10;

      // Act
      for (let i = 0; i < iterations; i++) {
        userAgents.add(userAgentRotator.getRandomUserAgent());
      }

      // Assert
      // Note: There's a small chance this could fail due to random chance,
      // but it's very unlikely with 10 iterations
      expect(userAgents.size).toBeGreaterThan(1);
    });
  });

  describe('getNextUserAgent', () => {
    it('should cycle through user agents sequentially', () => {
      // Arrange
      const firstAgent = userAgentRotator.getNextUserAgent();

      // Get all agents in sequence
      const allAgents: string[] = [];
      const totalAgents = (userAgentRotator as any).allUserAgents.length;

      // We'll just test a few iterations to avoid a very long test
      const testIterations = Math.min(10, totalAgents - 1);

      for (let i = 0; i < testIterations; i++) {
        allAgents.push(userAgentRotator.getNextUserAgent());
      }

      // Check that all agents in our sample are different
      const uniqueAgents = new Set(allAgents);
      expect(uniqueAgents.size).toBe(allAgents.length);

      // Get the rest of the agents to complete the cycle
      for (let i = 0; i < totalAgents - testIterations - 1; i++) {
        userAgentRotator.getNextUserAgent();
      }

      // Act
      const cycledAgent = userAgentRotator.getNextUserAgent();

      // Assert
      expect(cycledAgent).toBe(firstAgent);
    });
  });

  describe('getDesktopUserAgent', () => {
    it('should return a desktop user agent', () => {
      // Act
      const userAgent = userAgentRotator.getDesktopUserAgent();

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Desktop agents typically don't contain 'Mobile'
      expect(userAgent).not.toContain('Mobile');

      // Desktop agents should contain desktop browser identifiers
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);
    });
  });

  describe('getMobileUserAgent', () => {
    it('should return a mobile user agent', () => {
      // Act
      const userAgent = userAgentRotator.getMobileUserAgent();

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Mobile agents typically contain 'Mobile' or specific mobile identifiers
      const isMobile = userAgent.includes('Mobile') ||
                       userAgent.includes('Android') ||
                       userAgent.includes('iPhone') ||
                       userAgent.includes('iPad');

      expect(isMobile).toBe(true);
    });
  });

  describe('getBrowserUserAgent', () => {
    it('should return a Chrome user agent when specified', () => {
      // Act
      const userAgent = userAgentRotator.getBrowserUserAgent('chrome');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Chrome agents contain 'Chrome' but not 'Edg'
      expect(userAgent).toContain('Chrome');
      expect(userAgent).not.toContain('Edg/');
    });

    it('should return a Firefox user agent when specified', () => {
      // Act
      const userAgent = userAgentRotator.getBrowserUserAgent('firefox');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Firefox agents contain 'Firefox'
      expect(userAgent).toContain('Firefox');
    });

    it('should return a Safari user agent when specified', () => {
      // Act
      const userAgent = userAgentRotator.getBrowserUserAgent('safari');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Safari agents contain 'Safari' and 'Version' but not 'Chrome'
      // or they contain 'CriOS' for iOS Chrome which is handled as Safari
      const isSafari = (userAgent.includes('Safari') &&
                        userAgent.includes('Version') &&
                        !userAgent.includes('Chrome')) ||
                        userAgent.includes('CriOS');

      expect(isSafari).toBe(true);
    });

    it('should return an Edge user agent when specified', () => {
      // Act
      const userAgent = userAgentRotator.getBrowserUserAgent('edge');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Edge agents contain 'Edg/'
      expect(userAgent).toContain('Edg/');
    });
  });

  describe('getDesktopBrowserUserAgent', () => {
    it('should return a desktop Chrome user agent', () => {
      // Act
      const userAgent = userAgentRotator.getDesktopBrowserUserAgent('chrome');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a Chrome agent
      expect(userAgent).toContain('Chrome');

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);
      expect(userAgent).not.toContain('Mobile');
    });

    it('should return a desktop Firefox user agent', () => {
      // Act
      const userAgent = userAgentRotator.getDesktopBrowserUserAgent('firefox');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a Firefox agent
      expect(userAgent).toContain('Firefox');

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);
      expect(userAgent).not.toContain('Mobile');
    });
  });

  describe('getMobileBrowserUserAgent', () => {
    it('should return a mobile Chrome user agent', () => {
      // Act
      const userAgent = userAgentRotator.getMobileBrowserUserAgent('chrome');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a Chrome agent
      const isChrome = userAgent.includes('Chrome') || userAgent.includes('CriOS');
      expect(isChrome).toBe(true);

      // Should be a mobile agent
      const isMobile = userAgent.includes('Mobile') ||
                       userAgent.includes('Android') ||
                       userAgent.includes('iPhone') ||
                       userAgent.includes('iPad');

      expect(isMobile).toBe(true);
    });

    it('should return a mobile Firefox user agent', () => {
      // Act
      const userAgent = userAgentRotator.getMobileBrowserUserAgent('firefox');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a Firefox agent
      const isFirefox = userAgent.includes('Firefox') || userAgent.includes('FxiOS');
      expect(isFirefox).toBe(true);

      // Should be a mobile agent
      const isMobile = userAgent.includes('Mobile') ||
                       userAgent.includes('Android') ||
                       userAgent.includes('iPhone') ||
                       userAgent.includes('iPad');

      expect(isMobile).toBe(true);
    });
  });

  describe('getTargetOptimizedUserAgent', () => {
    it('should return appropriate user agent for LinkedIn', () => {
      // Act
      const userAgent = userAgentRotator.getTargetOptimizedUserAgent('linkedin');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);

      // Should be Chrome or Edge
      const isChromeOrEdge = userAgent.includes('Chrome');
      expect(isChromeOrEdge).toBe(true);
    });

    it('should return appropriate user agent for Indeed', () => {
      // Act
      const userAgent = userAgentRotator.getTargetOptimizedUserAgent('indeed');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);

      // Should be Chrome
      expect(userAgent).toContain('Chrome');
    });

    it('should return appropriate user agent for InfoJobs', () => {
      // Act
      const userAgent = userAgentRotator.getTargetOptimizedUserAgent('infojobs');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);
    });

    it('should return appropriate user agent for Catho', () => {
      // Act
      const userAgent = userAgentRotator.getTargetOptimizedUserAgent('catho');

      // Assert
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);

      // Should be a desktop agent
      const isDesktop = userAgent.includes('Windows') ||
                        userAgent.includes('Macintosh') ||
                        userAgent.includes('Linux') && !userAgent.includes('Android');

      expect(isDesktop).toBe(true);
    });
  });
});
