import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class HumanBehaviorSimulatorService {
  /**
   * Adds a random delay within a specified range
   */
  async randomDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulates human-like delay based on action type
   */
  async humanDelay(actionType: 'navigation' | 'click' | 'typing' | 'thinking' | 'reading'): Promise<void> {
    switch (actionType) {
      case 'navigation':
        return this.randomDelay(1000, 3000);
      case 'click':
        return this.randomDelay(300, 1500);
      case 'typing':
        return this.randomDelay(50, 200);
      case 'thinking':
        return this.randomDelay(1000, 5000);
      case 'reading':
        return this.randomDelay(2000, 10000);
    }
  }

  /**
   * Simulates human-like typing
   */
  async typeHumanLike(page: puppeteer.Page, selector: string, text: string): Promise<void> {
    await page.waitForSelector(selector);
    
    // Click on the input field
    await page.click(selector);
    await this.humanDelay('click');
    
    // Type with random delays between keystrokes
    for (const char of text) {
      await page.type(selector, char, { delay: Math.random() * 150 + 50 });
      await this.randomDelay(10, 100);
    }
    
    await this.humanDelay('thinking');
  }

  /**
   * Simulates human-like scrolling
   */
  async scrollHumanLike(page: puppeteer.Page, distance: number): Promise<void> {
    const scrollSteps = Math.floor(Math.random() * 5) + 3; // 3-7 steps
    const stepSize = distance / scrollSteps;
    
    for (let i = 0; i < scrollSteps; i++) {
      await page.evaluate((step) => {
        window.scrollBy(0, step);
      }, stepSize);
      
      await this.randomDelay(300, 800);
    }
  }

  /**
   * Simulates human-like navigation to a URL
   */
  async navigateHumanLike(page: puppeteer.Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await this.humanDelay('navigation');
    
    // Simulate looking at the page
    await this.randomDelay(1000, 3000);
    
    // Scroll down a bit
    await this.scrollHumanLike(page, Math.random() * 500 + 200);
  }

  /**
   * Simulates human-like clicking
   */
  async clickHumanLike(page: puppeteer.Page, selector: string): Promise<void> {
    await page.waitForSelector(selector);
    
    // Move mouse to element with some randomness
    const element = await page.$(selector);
    const box = await element.boundingBox();
    
    const x = box.x + box.width / 2 + (Math.random() * 10 - 5);
    const y = box.y + box.height / 2 + (Math.random() * 10 - 5);
    
    await page.mouse.move(x, y, { steps: 10 });
    await this.randomDelay(100, 500);
    
    await page.click(selector);
    await this.humanDelay('click');
  }
}
