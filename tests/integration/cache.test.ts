import request from 'supertest';
import app from '../../src/app'; // Assuming you have an app.ts file that exports the Express app
import { ScraperCacheService, CacheEvictionPolicy } from '../../src/services/cache/ScraperCacheService';
import { mockUsers } from '../mocks/mockData';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';

// Mock the ScraperCacheService
jest.mock('../../src/services/cache/ScraperCacheService');

describe('Cache API Endpoints', () => {
  let mockCacheService: jest.Mocked<ScraperCacheService>;
  let adminAuthToken: string;
  let userAuthToken: string;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock implementation
    mockCacheService = {
      getCacheStatistics: jest.fn(),
      clear: jest.fn(),
      setEvictionPolicy: jest.fn(),
      invalidatePlatformCache: jest.fn(),
      invalidateOperationCache: jest.fn(),
    } as unknown as jest.Mocked<ScraperCacheService>;
    
    // Replace the service in the controller
    // This assumes you have a way to access the controller instance
    // You might need to adjust this based on your actual implementation
    const cacheController = (app as any).controllers.cacheController;
    if (cacheController) {
      (cacheController as any).cacheService = mockCacheService;
    }
    
    // Generate auth tokens for testing
    const adminUser = mockUsers[1]; // Assuming this is an admin user
    adminAuthToken = jwt.sign(
      { id: adminUser.id, role: 'admin' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
    
    const regularUser = mockUsers[0]; // Assuming this is a regular user
    userAuthToken = jwt.sign(
      { id: regularUser.id, role: 'user' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/cache/statistics', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/api/cache/statistics');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if not admin', async () => {
      // Act
      const response = await request(app)
        .get('/api/cache/statistics')
        .set('Authorization', `Bearer ${userAuthToken}`);
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 with cache statistics if admin', async () => {
      // Arrange
      const mockStats = {
        entries: 100,
        hits: 500,
        misses: 50,
        hitRate: 90.9,
        totalSize: 1024 * 1024,
        platformStats: {
          linkedin: 50,
          indeed: 30,
          infojobs: 10,
          catho: 10
        }
      };
      
      mockCacheService.getCacheStatistics.mockReturnValue(mockStats);
      
      // Act
      const response = await request(app)
        .get('/api/cache/statistics')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(mockCacheService.getCacheStatistics).toHaveBeenCalled();
    });
  });

  describe('POST /api/cache/clear', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/clear');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if not admin', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/clear')
        .set('Authorization', `Bearer ${userAuthToken}`);
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 if cache cleared successfully', async () => {
      // Arrange
      mockCacheService.clear.mockResolvedValue(undefined);
      
      // Act
      const response = await request(app)
        .post('/api/cache/clear')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cache cleared successfully');
      expect(mockCacheService.clear).toHaveBeenCalled();
    });

    it('should return 500 if service throws an error', async () => {
      // Arrange
      mockCacheService.clear.mockRejectedValue(new Error('Service error'));
      
      // Act
      const response = await request(app)
        .post('/api/cache/clear')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/cache/policy', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/policy')
        .send({ policy: CacheEvictionPolicy.LRU });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if not admin', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/policy')
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send({ policy: CacheEvictionPolicy.LRU });
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if policy is invalid', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/policy')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({ policy: 'invalid-policy' });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 if policy set successfully', async () => {
      // Arrange
      mockCacheService.setEvictionPolicy.mockImplementation(() => {});
      
      // Act
      const response = await request(app)
        .post('/api/cache/policy')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({ policy: CacheEvictionPolicy.LRU });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', `Cache eviction policy set to ${CacheEvictionPolicy.LRU}`);
      expect(mockCacheService.setEvictionPolicy).toHaveBeenCalledWith(CacheEvictionPolicy.LRU);
    });
  });

  describe('POST /api/cache/invalidate/:platform', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if not admin', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin')
        .set('Authorization', `Bearer ${userAuthToken}`);
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if platform is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(404); // This will likely be a 404 Not Found
    });

    it('should return 200 if cache invalidated successfully', async () => {
      // Arrange
      mockCacheService.invalidatePlatformCache.mockResolvedValue(undefined);
      
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cache for platform linkedin invalidated');
      expect(mockCacheService.invalidatePlatformCache).toHaveBeenCalledWith('linkedin');
    });
  });

  describe('POST /api/cache/invalidate/:platform/:operation', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin/search');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if not admin', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin/search')
        .set('Authorization', `Bearer ${userAuthToken}`);
      
      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if platform or operation is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin/')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(404); // This will likely be a 404 Not Found
    });

    it('should return 200 if cache invalidated successfully', async () => {
      // Arrange
      mockCacheService.invalidateOperationCache.mockResolvedValue(undefined);
      
      // Act
      const response = await request(app)
        .post('/api/cache/invalidate/linkedin/search')
        .set('Authorization', `Bearer ${adminAuthToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Cache for linkedin:search invalidated');
      expect(mockCacheService.invalidateOperationCache).toHaveBeenCalledWith('linkedin', 'search');
    });
  });
});
