import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedProxyService } from './advanced-proxy.service';
import { UserAgentService } from './user-agent.service';
import * as puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// Add stealth plugin
puppeteer.use(StealthPlugin());

export interface BrowserFingerprint {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
    isLandscape: boolean;
  };
  platform: string;
  acceptLanguage: string;
  timezone: string;
  webglVendor?: string;
  webglRenderer?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  plugins?: string[];
  fonts?: string[];
  cookieEnabled?: boolean;
  doNotTrack?: string;
  sessionStorage?: boolean;
  localStorage?: boolean;
  indexedDB?: boolean;
  addBehavior?: boolean;
  openDatabase?: boolean;
  cpuClass?: string;
  platform2?: string;
  plugins2?: string[];
  canvas?: string;
  webgl?: string;
  webglExtensions?: string[];
  touchSupport?: any;
  screenResolution?: number[];
  availableScreenResolution?: number[];
  colorDepth?: number;
  pixelRatio?: number;
  language?: string;
  systemLanguage?: string;
  languages?: string[];
  mediaDevices?: any;
  audioContext?: any;
  webrtc?: any;
}

export interface AntiDetectionOptions {
  platform?: 'linkedin' | 'indeed' | 'infojobs' | 'catho';
  country?: string;
  mobile?: boolean;
  headless?: boolean;
  useProxy?: boolean;
  useFingerprinting?: boolean;
  useCaptchaSolver?: boolean;
  useHumanBehavior?: boolean;
  persistSession?: boolean;
  sessionId?: string;
}

@Injectable()
export class AntiDetectionService {
  private readonly logger = new Logger(AntiDetectionService.name);
  private readonly captchaApiKey: string;
  private readonly sessionsDir: string;
  private readonly fingerprints: Map<string, BrowserFingerprint[]> = new Map();
  
  // Platform-specific settings
  private readonly platformSettings = {
    linkedin: {
      delayMin: 2000,
      delayMax: 5000,
      humanBehaviorIntensity: 0.8,
      captchaTypes: ['recaptcha', 'hcaptcha'],
      fingerprintRotationFrequency: 0.2, // 20% chance to rotate fingerprint
    },
    indeed: {
      delayMin: 1500,
      delayMax: 4000,
      humanBehaviorIntensity: 0.7,
      captchaTypes: ['recaptcha'],
      fingerprintRotationFrequency: 0.15,
    },
    infojobs: {
      delayMin: 1000,
      delayMax: 3000,
      humanBehaviorIntensity: 0.6,
      captchaTypes: ['recaptcha'],
      fingerprintRotationFrequency: 0.1,
    },
    catho: {
      delayMin: 1000,
      delayMax: 3000,
      humanBehaviorIntensity: 0.6,
      captchaTypes: ['recaptcha'],
      fingerprintRotationFrequency: 0.1,
    },
  };

  constructor(
    private configService: ConfigService,
    private proxyService: AdvancedProxyService,
    private userAgentService: UserAgentService,
  ) {
    this.captchaApiKey = this.configService.get<string>('captcha.apiKey');
    this.sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    
    // Create sessions directory if it doesn't exist
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
    
    // Load fingerprints
    this.loadFingerprints();
  }

  private loadFingerprints() {
    try {
      // Load platform-specific fingerprints
      const platforms = ['linkedin', 'indeed', 'infojobs', 'catho'];
      
      for (const platform of platforms) {
        const filePath = path.join(__dirname, '..', '..', 'data', 'fingerprints', `${platform}.json`);
        
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf8');
          const fingerprints = JSON.parse(data) as BrowserFingerprint[];
          this.fingerprints.set(platform, fingerprints);
          this.logger.log(`Loaded ${fingerprints.length} fingerprints for ${platform}`);
        } else {
          // Create default fingerprints if file doesn't exist
          this.fingerprints.set(platform, this.generateDefaultFingerprints(platform));
          this.logger.log(`Created default fingerprints for ${platform}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error loading fingerprints: ${error.message}`);
      
      // Create default fingerprints for all platforms
      const platforms = ['linkedin', 'indeed', 'infojobs', 'catho'];
      for (const platform of platforms) {
        this.fingerprints.set(platform, this.generateDefaultFingerprints(platform));
      }
    }
  }

  private generateDefaultFingerprints(platform: string): BrowserFingerprint[] {
    const fingerprints: BrowserFingerprint[] = [];
    
    // Generate 10 default fingerprints
    for (let i = 0; i < 10; i++) {
      const isMobile = i >= 5; // 5 desktop, 5 mobile
      
      fingerprints.push({
        userAgent: this.userAgentService.getUserAgent({
          platform: platform as any,
          mobile: isMobile,
        }),
        viewport: isMobile ? {
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
          isLandscape: false,
        } : {
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          isLandscape: true,
        },
        platform: isMobile ? 'iPhone' : 'Win32',
        acceptLanguage: 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        timezone: 'America/Sao_Paulo',
        hardwareConcurrency: isMobile ? 4 : 8,
        deviceMemory: isMobile ? 4 : 8,
        cookieEnabled: true,
        doNotTrack: null,
        sessionStorage: true,
        localStorage: true,
        indexedDB: true,
        addBehavior: false,
        openDatabase: true,
        language: 'pt-BR',
        systemLanguage: 'pt-BR',
        languages: ['pt-BR', 'pt', 'en-US', 'en'],
        colorDepth: 24,
        pixelRatio: isMobile ? 3 : 1,
      });
    }
    
    return fingerprints;
  }

  async createBrowser(options: AntiDetectionOptions = {}): Promise<Browser> {
    // Set default options
    const defaultOptions: AntiDetectionOptions = {
      platform: 'linkedin',
      headless: true,
      useProxy: true,
      useFingerprinting: true,
      useCaptchaSolver: true,
      useHumanBehavior: true,
      persistSession: false,
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Get proxy if needed
    let proxy = null;
    if (mergedOptions.useProxy) {
      proxy = await this.proxyService.getProxy({
        platform: mergedOptions.platform,
        country: mergedOptions.country,
        forceHealthCheck: true,
      });
      
      if (!proxy) {
        this.logger.warn('No suitable proxy found, proceeding without proxy');
      }
    }
    
    // Get user agent
    const userAgent = this.userAgentService.getUserAgent({
      platform: mergedOptions.platform,
      mobile: mergedOptions.mobile,
    });
    
    // Get fingerprint
    let fingerprint: BrowserFingerprint = null;
    if (mergedOptions.useFingerprinting) {
      fingerprint = this.getFingerprint(mergedOptions.platform, mergedOptions.mobile);
    }
    
    // Launch browser
    const launchOptions: any = {
      headless: mergedOptions.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-infobars',
        '--window-size=1920,1080',
        '--disable-notifications',
      ],
    };
    
    // Add proxy if available
    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`);
    }
    
    // Launch browser
    const browser = await puppeteer.launch(launchOptions);
    
    // Store proxy and user agent in browser for later use
    (browser as any).__antiDetection = {
      proxy,
      userAgent,
      fingerprint,
      options: mergedOptions,
    };
    
    return browser;
  }

  async setupPage(browser: Browser, url?: string): Promise<Page> {
    const page = await browser.newPage();
    const antiDetection = (browser as any).__antiDetection;
    
    if (!antiDetection) {
      this.logger.warn('Browser was not created with AntiDetectionService, some features may not work');
      return page;
    }
    
    // Set user agent
    await page.setUserAgent(antiDetection.userAgent);
    
    // Set proxy authentication if needed
    if (antiDetection.proxy && antiDetection.proxy.username && antiDetection.proxy.password) {
      await page.authenticate({
        username: antiDetection.proxy.username,
        password: antiDetection.proxy.password,
      });
    }
    
    // Apply fingerprint if available
    if (antiDetection.fingerprint) {
      await this.applyFingerprint(page, antiDetection.fingerprint);
    }
    
    // Set up human behavior if enabled
    if (antiDetection.options.useHumanBehavior) {
      await this.setupHumanBehavior(page, antiDetection.options.platform);
    }
    
    // Set up captcha solver if enabled
    if (antiDetection.options.useCaptchaSolver && this.captchaApiKey) {
      await this.setupCaptchaSolver(page);
    }
    
    // Navigate to URL if provided
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle2' });
    }
    
    return page;
  }

  private async applyFingerprint(page: Page, fingerprint: BrowserFingerprint): Promise<void> {
    // Set viewport
    await page.setViewport(fingerprint.viewport);
    
    // Set user agent
    await page.setUserAgent(fingerprint.userAgent);
    
    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': fingerprint.acceptLanguage,
    });
    
    // Override timezone, locale, and platform
    await page.evaluateOnNewDocument((fingerprint) => {
      // Override timezone
      Object.defineProperty(Intl, 'DateTimeFormat', {
        get: function() {
          return function(...args) {
            if (args.length > 0 && args[1] && args[1].timeZone) {
              args[1].timeZone = fingerprint.timezone;
            }
            return Reflect.construct(Object.getPrototypeOf(Intl).DateTimeFormat, args);
          };
        }
      });
      
      // Override platform
      Object.defineProperty(navigator, 'platform', {
        get: function() { return fingerprint.platform; }
      });
      
      // Override languages
      if (fingerprint.languages) {
        Object.defineProperty(navigator, 'languages', {
          get: function() { return fingerprint.languages; }
        });
      }
      
      // Override hardware concurrency
      if (fingerprint.hardwareConcurrency) {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: function() { return fingerprint.hardwareConcurrency; }
        });
      }
      
      // Override device memory
      if (fingerprint.deviceMemory) {
        Object.defineProperty(navigator, 'deviceMemory', {
          get: function() { return fingerprint.deviceMemory; }
        });
      }
      
      // Override language
      if (fingerprint.language) {
        Object.defineProperty(navigator, 'language', {
          get: function() { return fingerprint.language; }
        });
      }
    }, fingerprint);
  }

  private async setupHumanBehavior(page: Page, platform: string): Promise<void> {
    const settings = this.platformSettings[platform] || this.platformSettings.linkedin;
    
    // Add random delays to all navigation
    page.on('framenavigated', async () => {
      const delay = Math.floor(Math.random() * (settings.delayMax - settings.delayMin + 1)) + settings.delayMin;
      await page.waitForTimeout(delay);
    });
    
    // Inject mouse movement script
    await page.evaluateOnNewDocument((intensity) => {
      // Simulate human-like mouse movements
      document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.9) {
          const randomX = e.clientX + (Math.random() * 10 - 5) * intensity;
          const randomY = e.clientY + (Math.random() * 10 - 5) * intensity;
          
          const mouseEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: randomX,
            clientY: randomY,
          });
          
          document.dispatchEvent(mouseEvent);
        }
      }, { passive: true });
      
      // Add random scrolling behavior
      window.addEventListener('scroll', () => {
        if (Math.random() > 0.8) {
          const direction = Math.random() > 0.5 ? 1 : -1;
          const amount = Math.floor(Math.random() * 100) * intensity;
          window.scrollBy(0, direction * amount);
        }
      }, { passive: true });
    }, settings.humanBehaviorIntensity);
  }

  private async setupCaptchaSolver(page: Page): Promise<void> {
    if (!this.captchaApiKey) {
      this.logger.warn('Captcha solver enabled but no API key provided');
      return;
    }
    
    // Inject captcha solver script
    await page.evaluateOnNewDocument((apiKey) => {
      window.addEventListener('load', () => {
        // Check for reCAPTCHA
        const checkForRecaptcha = () => {
          const recaptchaIframe = document.querySelector('iframe[src*="recaptcha/api2/anchor"]');
          if (recaptchaIframe) {
            console.log('reCAPTCHA detected, solving...');
            solveRecaptcha();
          }
        };
        
        // Check for hCaptcha
        const checkForHcaptcha = () => {
          const hcaptchaIframe = document.querySelector('iframe[src*="hcaptcha.com/captcha"]');
          if (hcaptchaIframe) {
            console.log('hCaptcha detected, solving...');
            solveHcaptcha();
          }
        };
        
        // Solve reCAPTCHA
        const solveRecaptcha = async () => {
          try {
            const sitekey = document.querySelector('div.g-recaptcha')?.getAttribute('data-sitekey');
            if (!sitekey) return;
            
            const response = await fetch('https://2captcha.com/in.php', {
              method: 'POST',
              body: new URLSearchParams({
                key: apiKey,
                method: 'userrecaptcha',
                googlekey: sitekey,
                pageurl: window.location.href,
                json: '1'
              })
            });
            
            const data = await response.json();
            if (data.status !== 1) throw new Error('Failed to submit captcha');
            
            // Poll for solution
            const captchaId = data.request;
            let solution = null;
            
            for (let i = 0; i < 30; i++) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              const checkResponse = await fetch(`https://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`);
              const checkData = await checkResponse.json();
              
              if (checkData.status === 1) {
                solution = checkData.request;
                break;
              }
            }
            
            if (!solution) throw new Error('Failed to solve captcha');
            
            // Apply solution
            window.grecaptcha.getResponse = () => solution;
            window.grecaptcha.execute();
            
            // Find and click submit button
            setTimeout(() => {
              const submitButton = document.querySelector('button[type="submit"]');
              if (submitButton) submitButton.click();
            }, 1000);
          } catch (error) {
            console.error('Error solving reCAPTCHA:', error);
          }
        };
        
        // Solve hCaptcha
        const solveHcaptcha = async () => {
          // Similar implementation for hCaptcha
        };
        
        // Check for captchas periodically
        setInterval(checkForRecaptcha, 3000);
        setInterval(checkForHcaptcha, 3000);
      });
    }, this.captchaApiKey);
  }

  private getFingerprint(platform: string, isMobile: boolean): BrowserFingerprint {
    const platformFingerprints = this.fingerprints.get(platform) || [];
    
    // Filter by mobile/desktop
    const filteredFingerprints = platformFingerprints.filter(fp => fp.viewport.isMobile === isMobile);
    
    if (filteredFingerprints.length === 0) {
      // Return a default fingerprint if none available
      return this.generateDefaultFingerprints(platform)[isMobile ? 5 : 0];
    }
    
    // Select a random fingerprint
    const randomIndex = Math.floor(Math.random() * filteredFingerprints.length);
    return filteredFingerprints[randomIndex];
  }

  async randomDelay(platform: string): Promise<void> {
    const settings = this.platformSettings[platform] || this.platformSettings.linkedin;
    const delay = Math.floor(Math.random() * (settings.delayMax - settings.delayMin + 1)) + settings.delayMin;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async simulateHumanBehavior(page: Page, platform: string): Promise<void> {
    const settings = this.platformSettings[platform] || this.platformSettings.linkedin;
    
    // Random scrolling
    const scrollCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < scrollCount; i++) {
      const scrollAmount = Math.floor(Math.random() * 500) + 100;
      await page.evaluate((amount) => {
        window.scrollBy(0, amount);
      }, scrollAmount);
      
      await page.waitForTimeout(Math.random() * 1000 + 500);
    }
    
    // Random mouse movements
    if (Math.random() < settings.humanBehaviorIntensity) {
      await page.mouse.move(
        Math.floor(Math.random() * 500) + 100,
        Math.floor(Math.random() * 500) + 100,
        { steps: 10 }
      );
    }
    
    // Random delay
    await this.randomDelay(platform);
  }

  async solveCaptcha(page: Page, captchaType: 'recaptcha' | 'hcaptcha'): Promise<boolean> {
    if (!this.captchaApiKey) {
      this.logger.warn('Captcha solver enabled but no API key provided');
      return false;
    }
    
    try {
      // Check if captcha exists
      const captchaExists = await page.evaluate((type) => {
        if (type === 'recaptcha') {
          return !!document.querySelector('iframe[src*="recaptcha/api2/anchor"]');
        } else if (type === 'hcaptcha') {
          return !!document.querySelector('iframe[src*="hcaptcha.com/captcha"]');
        }
        return false;
      }, captchaType);
      
      if (!captchaExists) {
        return false;
      }
      
      // Get site key
      const sitekey = await page.evaluate((type) => {
        if (type === 'recaptcha') {
          return document.querySelector('div.g-recaptcha')?.getAttribute('data-sitekey');
        } else if (type === 'hcaptcha') {
          return document.querySelector('div.h-captcha')?.getAttribute('data-sitekey');
        }
        return null;
      }, captchaType);
      
      if (!sitekey) {
        this.logger.warn('Captcha detected but could not find site key');
        return false;
      }
      
      // Submit captcha to 2Captcha
      const response = await axios.post('https://2captcha.com/in.php', null, {
        params: {
          key: this.captchaApiKey,
          method: captchaType === 'recaptcha' ? 'userrecaptcha' : 'hcaptcha',
          googlekey: sitekey,
          pageurl: page.url(),
          json: 1
        }
      });
      
      if (response.data.status !== 1) {
        this.logger.error(`Failed to submit captcha: ${response.data.error_text}`);
        return false;
      }
      
      // Poll for solution
      const captchaId = response.data.request;
      let solution = null;
      
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const checkResponse = await axios.get('https://2captcha.com/res.php', {
          params: {
            key: this.captchaApiKey,
            action: 'get',
            id: captchaId,
            json: 1
          }
        });
        
        if (checkResponse.data.status === 1) {
          solution = checkResponse.data.request;
          break;
        }
      }
      
      if (!solution) {
        this.logger.error('Failed to solve captcha: timeout');
        return false;
      }
      
      // Apply solution
      await page.evaluate((solution, type) => {
        if (type === 'recaptcha') {
          window.grecaptcha.getResponse = () => solution;
          window.grecaptcha.execute();
        } else if (type === 'hcaptcha') {
          window.hcaptcha.getResponse = () => solution;
          window.hcaptcha.execute();
        }
      }, solution, captchaType);
      
      // Wait for a moment and then click submit button
      await page.waitForTimeout(1000);
      
      const submitButtonClicked = await page.evaluate(() => {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.click();
          return true;
        }
        return false;
      });
      
      return submitButtonClicked;
    } catch (error) {
      this.logger.error(`Error solving captcha: ${error.message}`);
      return false;
    }
  }
}
