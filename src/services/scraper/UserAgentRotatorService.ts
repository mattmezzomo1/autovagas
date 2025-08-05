/**
 * Service for rotating user agents
 */
export class UserAgentRotatorService {
  private userAgents: {
    chrome: {
      desktop: string[],
      mobile: string[]
    },
    firefox: {
      desktop: string[],
      mobile: string[]
    },
    safari: {
      desktop: string[],
      mobile: string[]
    },
    edge: {
      desktop: string[],
      mobile: string[]
    }
  } = {
    chrome: {
      desktop: [],
      mobile: []
    },
    firefox: {
      desktop: [],
      mobile: []
    },
    safari: {
      desktop: [],
      mobile: []
    },
    edge: {
      desktop: [],
      mobile: []
    }
  };

  private lastUsedIndices: {
    chrome: {
      desktop: number,
      mobile: number
    },
    firefox: {
      desktop: number,
      mobile: number
    },
    safari: {
      desktop: number,
      mobile: number
    },
    edge: {
      desktop: number,
      mobile: number
    },
    all: number
  } = {
    chrome: {
      desktop: -1,
      mobile: -1
    },
    firefox: {
      desktop: -1,
      mobile: -1
    },
    safari: {
      desktop: -1,
      mobile: -1
    },
    edge: {
      desktop: -1,
      mobile: -1
    },
    all: -1
  };

  private allUserAgents: string[] = [];

  constructor() {
    this.initializeUserAgents();
  }

  /**
   * Initialize user agents
   */
  private initializeUserAgents(): void {
    // Desktop Chrome - Latest versions
    this.userAgents.chrome.desktop = [
      // Chrome 120-123 (Latest versions as of 2024)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    // Mobile Chrome
    this.userAgents.chrome.mobile = [
      // Android
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; SM-S918U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
      // iOS
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.0.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1'
    ];

    // Desktop Firefox
    this.userAgents.firefox.desktop = [
      // Firefox 123-120 (Latest versions as of 2024)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0'
    ];

    // Mobile Firefox
    this.userAgents.firefox.mobile = [
      // Android
      'Mozilla/5.0 (Android 14; Mobile; rv:123.0) Gecko/123.0 Firefox/123.0',
      'Mozilla/5.0 (Android 14; Mobile; rv:122.0) Gecko/122.0 Firefox/122.0',
      'Mozilla/5.0 (Android 13; Mobile; rv:123.0) Gecko/123.0 Firefox/123.0',
      // iOS
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15'
    ];

    // Desktop Safari
    this.userAgents.safari.desktop = [
      // Safari 17.4-17.0 (Latest versions as of 2024)
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    ];

    // Mobile Safari
    this.userAgents.safari.mobile = [
      // iOS Safari
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1'
    ];

    // Desktop Edge
    this.userAgents.edge.desktop = [
      // Edge 123-120 (Latest versions as of 2024)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
    ];

    // Mobile Edge
    this.userAgents.edge.mobile = [
      // Android
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 EdgA/123.0.0.0',
      'Mozilla/5.0 (Linux; Android 14; SM-S918U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.0.0',
      // iOS
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/123.0.0.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/123.0.0.0 Mobile/15E148 Safari/605.1.15'
    ];

    // Combine all user agents into a single array for random selection
    this.allUserAgents = [
      ...this.userAgents.chrome.desktop,
      ...this.userAgents.chrome.mobile,
      ...this.userAgents.firefox.desktop,
      ...this.userAgents.firefox.mobile,
      ...this.userAgents.safari.desktop,
      ...this.userAgents.safari.mobile,
      ...this.userAgents.edge.desktop,
      ...this.userAgents.edge.mobile
    ];

    console.log(`Initialized ${this.allUserAgents.length} user agents`);
  }

  /**
   * Get a random user agent from all available user agents
   */
  getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * this.allUserAgents.length);
    return this.allUserAgents[randomIndex];
  }

  /**
   * Get the next user agent in sequence from all available user agents
   */
  getNextUserAgent(): string {
    this.lastUsedIndices.all = (this.lastUsedIndices.all + 1) % this.allUserAgents.length;
    return this.allUserAgents[this.lastUsedIndices.all];
  }

  /**
   * Get a random desktop user agent
   */
  getDesktopUserAgent(): string {
    // Combine all desktop user agents
    const desktopAgents = [
      ...this.userAgents.chrome.desktop,
      ...this.userAgents.firefox.desktop,
      ...this.userAgents.safari.desktop,
      ...this.userAgents.edge.desktop
    ];

    const randomIndex = Math.floor(Math.random() * desktopAgents.length);
    return desktopAgents[randomIndex];
  }

  /**
   * Get a random mobile user agent
   */
  getMobileUserAgent(): string {
    // Combine all mobile user agents
    const mobileAgents = [
      ...this.userAgents.chrome.mobile,
      ...this.userAgents.firefox.mobile,
      ...this.userAgents.safari.mobile,
      ...this.userAgents.edge.mobile
    ];

    const randomIndex = Math.floor(Math.random() * mobileAgents.length);
    return mobileAgents[randomIndex];
  }

  /**
   * Get a random user agent for a specific browser
   */
  getBrowserUserAgent(browser: 'chrome' | 'firefox' | 'safari' | 'edge'): string {
    // Combine desktop and mobile user agents for the specified browser
    const browserAgents = [
      ...this.userAgents[browser].desktop,
      ...this.userAgents[browser].mobile
    ];

    const randomIndex = Math.floor(Math.random() * browserAgents.length);
    return browserAgents[randomIndex];
  }

  /**
   * Get a random desktop user agent for a specific browser
   */
  getDesktopBrowserUserAgent(browser: 'chrome' | 'firefox' | 'safari' | 'edge'): string {
    const browserAgents = this.userAgents[browser].desktop;
    const randomIndex = Math.floor(Math.random() * browserAgents.length);
    return browserAgents[randomIndex];
  }

  /**
   * Get a random mobile user agent for a specific browser
   */
  getMobileBrowserUserAgent(browser: 'chrome' | 'firefox' | 'safari' | 'edge'): string {
    const browserAgents = this.userAgents[browser].mobile;
    const randomIndex = Math.floor(Math.random() * browserAgents.length);
    return browserAgents[randomIndex];
  }

  /**
   * Get a user agent that's appropriate for the target website
   * This helps avoid detection by using the most common browser for each site
   */
  getTargetOptimizedUserAgent(target: 'linkedin' | 'indeed' | 'infojobs' | 'catho'): string {
    switch (target) {
      case 'linkedin':
        // LinkedIn works best with Chrome or Edge
        return Math.random() > 0.5 ?
          this.getDesktopBrowserUserAgent('chrome') :
          this.getDesktopBrowserUserAgent('edge');

      case 'indeed':
        // Indeed works with most browsers, but Chrome is most common
        return this.getDesktopBrowserUserAgent('chrome');

      case 'infojobs':
        // InfoJobs is popular in Brazil, where Chrome dominates
        return Math.random() > 0.3 ?
          this.getDesktopBrowserUserAgent('chrome') :
          this.getDesktopBrowserUserAgent('firefox');

      case 'catho':
        // Catho is also popular in Brazil
        return Math.random() > 0.3 ?
          this.getDesktopBrowserUserAgent('chrome') :
          this.getDesktopBrowserUserAgent('firefox');

      default:
        return this.getDesktopUserAgent();
    }
  }
}
