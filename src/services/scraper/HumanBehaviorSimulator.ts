import { Page } from 'puppeteer';

/**
 * Service for simulating human behavior in web scraping
 * This helps avoid detection by making the browser behave more like a human user
 */
export class HumanBehaviorSimulator {
  /**
   * Add a random delay between actions
   * @param min Minimum delay in milliseconds
   * @param max Maximum delay in milliseconds
   */
  async randomDelay(min: number = 500, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Simulate human-like scrolling behavior
   * @param page Puppeteer page
   * @param scrollDistance Total distance to scroll
   * @param smooth Whether to scroll smoothly or in chunks
   */
  async simulateScrolling(page: Page, scrollDistance: number = 1000, smooth: boolean = true): Promise<void> {
    if (smooth) {
      // Smooth scrolling with variable speed
      const steps = Math.floor(Math.random() * 10) + 5; // 5-15 steps
      const stepSize = scrollDistance / steps;
      
      for (let i = 0; i < steps; i++) {
        await page.evaluate((distance) => {
          window.scrollBy(0, distance);
        }, stepSize);
        
        // Random delay between scroll steps
        await this.randomDelay(100, 300);
      }
    } else {
      // Chunky scrolling (more like pressing Page Down)
      const chunks = Math.floor(Math.random() * 3) + 1; // 1-3 chunks
      const chunkSize = scrollDistance / chunks;
      
      for (let i = 0; i < chunks; i++) {
        await page.evaluate((distance) => {
          window.scrollBy(0, distance);
        }, chunkSize);
        
        // Longer delay between chunks
        await this.randomDelay(300, 800);
      }
    }
  }
  
  /**
   * Simulate human-like mouse movement
   * @param page Puppeteer page
   * @param selector Element selector to move to
   */
  async simulateMouseMovement(page: Page, selector: string): Promise<void> {
    // Check if element exists
    const elementHandle = await page.$(selector);
    if (!elementHandle) {
      console.log(`Element with selector "${selector}" not found`);
      return;
    }
    
    // Get element position
    const box = await elementHandle.boundingBox();
    if (!box) {
      console.log(`Could not get bounding box for element with selector "${selector}"`);
      return;
    }
    
    // Calculate target position (random point within the element)
    const targetX = box.x + Math.random() * box.width;
    const targetY = box.y + Math.random() * box.height;
    
    // Move mouse in a natural curve
    await page.mouse.move(targetX, targetY, { steps: 10 });
  }
  
  /**
   * Simulate human-like typing
   * @param page Puppeteer page
   * @param selector Element selector to type into
   * @param text Text to type
   */
  async simulateTyping(page: Page, selector: string, text: string): Promise<void> {
    // Click on the element first
    await page.click(selector);
    
    // Type with variable speed
    for (const char of text) {
      await page.keyboard.type(char);
      
      // Random delay between keystrokes
      await this.randomDelay(50, 150);
    }
  }
  
  /**
   * Simulate a human-like page visit
   * @param page Puppeteer page
   * @param url URL to visit
   */
  async simulatePageVisit(page: Page, url: string): Promise<void> {
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Initial pause as a human would take time to look at the page
    await this.randomDelay(1000, 3000);
    
    // Scroll down a bit
    await this.simulateScrolling(page, 500, true);
    
    // Pause again
    await this.randomDelay(500, 1500);
    
    // Scroll more
    await this.simulateScrolling(page, 1000, false);
  }
  
  /**
   * Add random mouse movements to make behavior more human-like
   * @param page Puppeteer page
   */
  async addRandomMouseMovements(page: Page): Promise<void> {
    // Get viewport size
    const dimensions = await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    });
    
    // Move to random positions
    const numMovements = Math.floor(Math.random() * 3) + 1; // 1-3 movements
    
    for (let i = 0; i < numMovements; i++) {
      const x = Math.floor(Math.random() * dimensions.width);
      const y = Math.floor(Math.random() * dimensions.height);
      
      await page.mouse.move(x, y, { steps: 5 });
      await this.randomDelay(100, 500);
    }
  }
  
  /**
   * Simulate clicking a button or link
   * @param page Puppeteer page
   * @param selector Element selector to click
   */
  async simulateClick(page: Page, selector: string): Promise<void> {
    // Move mouse to the element first
    await this.simulateMouseMovement(page, selector);
    
    // Small delay before clicking
    await this.randomDelay(100, 300);
    
    // Click the element
    await page.click(selector);
  }
}
