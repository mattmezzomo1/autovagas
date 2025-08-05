import { HumanBehaviorSimulator } from '../../src/services/scraper/HumanBehaviorSimulator';
import { Page } from 'puppeteer';

describe('HumanBehaviorSimulator', () => {
  let simulator: HumanBehaviorSimulator;
  let mockPage: Partial<Page>;
  
  beforeEach(() => {
    simulator = new HumanBehaviorSimulator();
    
    // Create mock Page object
    mockPage = {
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(undefined),
      click: jest.fn().mockResolvedValue(undefined),
      mouse: {
        move: jest.fn().mockResolvedValue(undefined)
      },
      keyboard: {
        type: jest.fn().mockResolvedValue(undefined)
      },
      $: jest.fn().mockResolvedValue({
        boundingBox: jest.fn().mockResolvedValue({
          x: 100,
          y: 100,
          width: 200,
          height: 50
        })
      })
    };
  });
  
  describe('randomDelay', () => {
    it('should delay execution for a random time within the specified range', async () => {
      jest.spyOn(global, 'setTimeout');
      
      await simulator.randomDelay(500, 1000);
      
      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Number)
      );
      
      const delay = (setTimeout as jest.Mock).mock.calls[0][1];
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1000);
    });
  });
  
  describe('simulateScrolling', () => {
    it('should perform smooth scrolling with variable speed', async () => {
      await simulator.simulateScrolling(mockPage as Page, 1000, true);
      
      expect(mockPage.evaluate).toHaveBeenCalledTimes(expect.any(Number));
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Number)
      );
    });
    
    it('should perform chunky scrolling', async () => {
      await simulator.simulateScrolling(mockPage as Page, 1000, false);
      
      expect(mockPage.evaluate).toHaveBeenCalledTimes(expect.any(Number));
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Number)
      );
    });
  });
  
  describe('simulateMouseMovement', () => {
    it('should move mouse to a random point within the element', async () => {
      await simulator.simulateMouseMovement(mockPage as Page, '.test-selector');
      
      expect(mockPage.$).toHaveBeenCalledWith('.test-selector');
      expect(mockPage.mouse.move).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        { steps: 10 }
      );
      
      // Check that coordinates are within the element bounds
      const coords = (mockPage.mouse.move as jest.Mock).mock.calls[0];
      expect(coords[0]).toBeGreaterThanOrEqual(100);
      expect(coords[0]).toBeLessThanOrEqual(300);
      expect(coords[1]).toBeGreaterThanOrEqual(100);
      expect(coords[1]).toBeLessThanOrEqual(150);
    });
    
    it('should handle element not found', async () => {
      mockPage.$ = jest.fn().mockResolvedValue(null);
      
      await simulator.simulateMouseMovement(mockPage as Page, '.not-found');
      
      expect(mockPage.$).toHaveBeenCalledWith('.not-found');
      expect(mockPage.mouse.move).not.toHaveBeenCalled();
    });
  });
  
  describe('simulateTyping', () => {
    it('should click on element and type with variable speed', async () => {
      await simulator.simulateTyping(mockPage as Page, '.input-field', 'test text');
      
      expect(mockPage.click).toHaveBeenCalledWith('.input-field');
      expect(mockPage.keyboard.type).toHaveBeenCalledTimes('test text'.length);
      
      // Check that each character was typed
      for (const char of 'test text') {
        expect(mockPage.keyboard.type).toHaveBeenCalledWith(char);
      }
    });
  });
  
  describe('simulatePageVisit', () => {
    it('should navigate to URL and perform human-like actions', async () => {
      await simulator.simulatePageVisit(mockPage as Page, 'https://example.com');
      
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', { waitUntil: 'networkidle2' });
      expect(mockPage.evaluate).toHaveBeenCalled();
    });
  });
  
  describe('simulateClick', () => {
    it('should move mouse to element and click', async () => {
      await simulator.simulateClick(mockPage as Page, '.button');
      
      expect(mockPage.$).toHaveBeenCalledWith('.button');
      expect(mockPage.mouse.move).toHaveBeenCalled();
      expect(mockPage.click).toHaveBeenCalledWith('.button');
    });
  });
});
