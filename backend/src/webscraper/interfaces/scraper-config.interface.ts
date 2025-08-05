export interface ScraperConfig {
  headless: boolean;
  timeout: number;
  userAgent: string;
  maxRetries: number;
  delayBetweenActions: number;
  humanEmulation: boolean;
  randomizeUserAgent: boolean;
  useProxy: boolean;
  proxyList: string[];
  viewportWidth: number;
  viewportHeight: number;
  minDelayMs: number;
  maxDelayMs: number;
}
