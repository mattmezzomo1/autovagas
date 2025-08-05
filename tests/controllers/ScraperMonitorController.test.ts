import { Request, Response } from 'express';
import { ScraperMonitorController } from '../../src/controllers/ScraperMonitorController';
import { ScraperQueueService } from '../../src/services/queue/ScraperQueueService';

// Mock the ScraperQueueService
jest.mock('../../src/services/queue/ScraperQueueService', () => {
  return {
    ScraperQueueService: jest.fn().mockImplementation(() => {
      return {
        getCircuitBreakersStatus: jest.fn().mockReturnValue({
          linkedin: {
            state: 'closed',
            failures: 0,
            consecutiveFailures: 0,
            totalFailures: 0,
            lastFailure: null,
            nextAttempt: null,
            successesInHalfOpen: 0,
            requiredSuccessesForClose: 2
          },
          indeed: {
            state: 'open',
            failures: 3,
            consecutiveFailures: 3,
            totalFailures: 5,
            lastFailure: new Date(),
            nextAttempt: new Date(Date.now() + 5 * 60 * 1000),
            successesInHalfOpen: 0,
            requiredSuccessesForClose: 2
          }
        }),
        resetCircuitBreaker: jest.fn().mockImplementation((platform) => {
          return platform === 'linkedin' || platform === 'indeed';
        })
      };
    })
  };
});

describe('ScraperMonitorController', () => {
  let controller: ScraperMonitorController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    controller = new ScraperMonitorController();
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    mockRequest = {};
    mockResponse = {
      json: jsonSpy,
      status: statusSpy
    };
  });

  describe('getCircuitBreakersStatus', () => {
    it('should return circuit breakers status', () => {
      controller.getCircuitBreakersStatus(mockRequest as Request, mockResponse as Response);
      
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          linkedin: expect.any(Object),
          indeed: expect.any(Object)
        })
      });
    });

    it('should handle errors', () => {
      const mockError = new Error('Test error');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(ScraperQueueService.prototype, 'getCircuitBreakersStatus').mockImplementation(() => {
        throw mockError;
      });

      controller.getCircuitBreakersStatus(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Falha ao obter status dos circuit breakers'
      });
    });
  });

  describe('resetCircuitBreaker', () => {
    it('should reset circuit breaker for valid platform', () => {
      mockRequest.params = { platform: 'linkedin' };
      
      controller.resetCircuitBreaker(mockRequest as Request, mockResponse as Response);
      
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: 'Circuit breaker para linkedin resetado com sucesso'
      });
    });

    it('should return 404 for invalid platform', () => {
      mockRequest.params = { platform: 'invalid-platform' };
      
      controller.resetCircuitBreaker(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Plataforma invalid-platform não encontrada'
      });
    });

    it('should return 400 if platform is not specified', () => {
      mockRequest.params = {};
      
      controller.resetCircuitBreaker(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Plataforma não especificada'
      });
    });

    it('should handle errors', () => {
      mockRequest.params = { platform: 'linkedin' };
      const mockError = new Error('Test error');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(ScraperQueueService.prototype, 'resetCircuitBreaker').mockImplementation(() => {
        throw mockError;
      });

      controller.resetCircuitBreaker(mockRequest as Request, mockResponse as Response);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Falha ao resetar circuit breaker'
      });
    });
  });
});
