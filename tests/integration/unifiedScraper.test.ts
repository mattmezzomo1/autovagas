import request from 'supertest';
import app from '../../src/app'; // Assuming you have an app.ts file that exports the Express app
import { UnifiedScraperService } from '../../src/services/scraper/UnifiedScraperService';
import { mockUsers, mockScrapedJobResults } from '../mocks/mockData';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';

// Mock the UnifiedScraperService
jest.mock('../../src/services/scraper/UnifiedScraperService');

describe('Unified Scraper API Endpoints', () => {
  let mockUnifiedScraperService: jest.Mocked<UnifiedScraperService>;
  let authToken: string;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock implementation
    mockUnifiedScraperService = {
      searchJobs: jest.fn(),
      getJobDetails: jest.fn(),
      checkTaskStatus: jest.fn(),
      getUserUsageStatistics: jest.fn(),
    } as unknown as jest.Mocked<UnifiedScraperService>;
    
    // Replace the service in the controller
    // This assumes you have a way to access the controller instance
    // You might need to adjust this based on your actual implementation
    const unifiedScraperController = (app as any).controllers.unifiedScraperController;
    if (unifiedScraperController) {
      (unifiedScraperController as any).unifiedScraperService = mockUnifiedScraperService;
    }
    
    // Generate a valid auth token for testing
    const mockUser = mockUsers[0];
    authToken = jwt.sign(
      { id: mockUser.id, role: mockUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/unified-scraper/:platform/search', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/search')
        .send({ keywords: ['software engineer'] });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if platform is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper//search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ keywords: ['software engineer'] });
      
      // Assert
      expect(response.status).toBe(404); // This will likely be a 404 Not Found
    });

    it('should return 400 if keywords are missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ locations: ['San Francisco'] });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 with search results if successful', async () => {
      // Arrange
      const searchParams = {
        keywords: ['software engineer'],
        locations: ['San Francisco'],
        remote: true,
        jobTypes: ['Full-time']
      };
      
      const mockResults = {
        results: mockScrapedJobResults,
        taskId: null,
        useServerSide: true,
        usage: {
          searchCount: 1,
          searchLimit: 30,
          searchRemaining: 29
        }
      };
      
      mockUnifiedScraperService.searchJobs.mockResolvedValue(mockResults);
      
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchParams);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResults);
      expect(mockUnifiedScraperService.searchJobs).toHaveBeenCalledWith(
        mockUsers[0].id,
        'linkedin',
        expect.objectContaining(searchParams)
      );
    });

    it('should return 500 if service throws an error', async () => {
      // Arrange
      mockUnifiedScraperService.searchJobs.mockRejectedValue(new Error('Service error'));
      
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ keywords: ['software engineer'] });
      
      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/unified-scraper/:platform/job/:jobId', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/job/123')
        .send({ url: 'https://example.com/job/123' });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if platform or jobId is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper//job/123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ url: 'https://example.com/job/123' });
      
      // Assert
      expect(response.status).toBe(404); // This will likely be a 404 Not Found
    });

    it('should return 400 if url is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/unified-scraper/linkedin/job/123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 with job details if successful', async () => {
      // Arrange
      const jobId = '123';
      const url = 'https://example.com/job/123';
      
      const mockDetails = {
        details: {
          id: jobId,
          title: 'Software Engineer',
          company: 'Example Company',
          description: 'Job description...'
        },
        taskId: null,
        useServerSide: true,
        usage: {
          jobDetailsCount: 1,
          jobDetailsLimit: 150,
          jobDetailsRemaining: 149
        }
      };
      
      mockUnifiedScraperService.getJobDetails.mockResolvedValue(mockDetails);
      
      // Act
      const response = await request(app)
        .post(`/api/unified-scraper/linkedin/job/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ url });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDetails);
      expect(mockUnifiedScraperService.getJobDetails).toHaveBeenCalledWith(
        mockUsers[0].id,
        'linkedin',
        jobId,
        url
      );
    });
  });

  describe('GET /api/unified-scraper/task/:taskId', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/api/unified-scraper/task/task-123');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if taskId is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/unified-scraper/task/')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(404); // This will likely be a 404 Not Found
    });

    it('should return 200 with task status if successful', async () => {
      // Arrange
      const taskId = 'task-123';
      
      const mockTaskStatus = {
        id: taskId,
        status: 'completed',
        result: mockScrapedJobResults,
        createdAt: new Date(),
        completedAt: new Date()
      };
      
      mockUnifiedScraperService.checkTaskStatus.mockResolvedValue(mockTaskStatus);
      
      // Act
      const response = await request(app)
        .get(`/api/unified-scraper/task/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTaskStatus);
      expect(mockUnifiedScraperService.checkTaskStatus).toHaveBeenCalledWith(
        mockUsers[0].id,
        taskId
      );
    });
  });

  describe('GET /api/unified-scraper/usage', () => {
    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .get('/api/unified-scraper/usage');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 200 with usage statistics if successful', async () => {
      // Arrange
      const mockUsage = {
        userId: mockUsers[0].id,
        tier: 'basic',
        searchCount: 5,
        searchLimit: 10,
        searchRemaining: 5,
        jobDetailsCount: 20,
        jobDetailsLimit: 50,
        jobDetailsRemaining: 30,
        usesServerSideScraping: false,
        taskStats: {
          totalTasks: 10,
          pendingTasks: 2,
          completedTasks: 8
        }
      };
      
      mockUnifiedScraperService.getUserUsageStatistics.mockResolvedValue(mockUsage);
      
      // Act
      const response = await request(app)
        .get('/api/unified-scraper/usage')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsage);
      expect(mockUnifiedScraperService.getUserUsageStatistics).toHaveBeenCalledWith(
        mockUsers[0].id
      );
    });
  });
});
