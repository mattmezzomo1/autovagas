import { UserService } from '../../src/services/user/UserService';
import { UserRepository } from '../../src/repositories/UserRepository';
import { SubscriptionRepository } from '../../src/repositories/SubscriptionRepository';
import { mockUsers, mockSubscriptions } from '../mocks/mockData';

// Mock the repositories
jest.mock('../../src/repositories/UserRepository');
jest.mock('../../src/repositories/SubscriptionRepository');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockSubscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock implementations
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    
    mockSubscriptionRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findActiveSubscriptions: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
    
    // Create service instance with mocked repositories
    userService = new UserService();
    
    // Replace the repositories with mocks
    (userService as any).userRepository = mockUserRepository;
    (userService as any).subscriptionRepository = mockSubscriptionRepository;
  });

  describe('getUserById', () => {
    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act
      const result = await userService.getUserById('999');
      
      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('999');
      expect(mockSubscriptionRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should return user with subscription if user found', async () => {
      // Arrange
      const mockUser = { ...mockUsers[0] };
      const mockSubscription = { ...mockSubscriptions[0] };
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.getUserById('1');
      
      // Assert
      expect(result).toEqual({
        ...mockUser,
        subscription: mockSubscription,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'));
      
      // Act & Assert
      await expect(userService.getUserById('1')).rejects.toThrow('Database error');
    });
  });

  describe('getUserTier', () => {
    it('should return basic tier if no subscription found', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      
      // Act
      const result = await userService.getUserTier('1');
      
      // Assert
      expect(result).toBe('basic');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return premium tier for premium subscription', async () => {
      // Arrange
      const mockSubscription = {
        ...mockSubscriptions[1],
        plan: { name: 'Premium' },
      };
      
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.getUserTier('2');
      
      // Assert
      expect(result).toBe('premium');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('2');
    });

    it('should return plus tier for plus subscription', async () => {
      // Arrange
      const mockSubscription = {
        ...mockSubscriptions[0],
        plan: { name: 'Plus' },
      };
      
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.getUserTier('1');
      
      // Assert
      expect(result).toBe('plus');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should handle errors and return basic tier', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await userService.getUserTier('1');
      
      // Assert
      expect(result).toBe('basic');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return false if no subscription found', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);
      
      // Act
      const result = await userService.isSubscriptionActive('1');
      
      // Assert
      expect(result).toBe(false);
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return true for active subscription with future end date', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      
      const mockSubscription = {
        ...mockSubscriptions[0],
        status: 'active',
        endDate: futureDate,
      };
      
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.isSubscriptionActive('1');
      
      // Assert
      expect(result).toBe(true);
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return false for inactive subscription', async () => {
      // Arrange
      const mockSubscription = {
        ...mockSubscriptions[0],
        status: 'inactive',
      };
      
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.isSubscriptionActive('1');
      
      // Assert
      expect(result).toBe(false);
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should return false for expired subscription', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 1 day in the past
      
      const mockSubscription = {
        ...mockSubscriptions[0],
        status: 'active',
        endDate: pastDate,
      };
      
      mockSubscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      
      // Act
      const result = await userService.isSubscriptionActive('1');
      
      // Assert
      expect(result).toBe(false);
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });

    it('should handle errors and return false', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await userService.isSubscriptionActive('1');
      
      // Assert
      expect(result).toBe(false);
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('1');
    });
  });
});
