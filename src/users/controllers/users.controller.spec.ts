import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { User, UserRole } from '../entities/user.entity';
import { UserSubscriptionTier } from '../entities/user-subscription.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithSubscription = {
    ...mockUser,
    subscription: {
      id: '1',
      userId: '1',
      tier: UserSubscriptionTier.BASIC,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'New User',
        role: UserRole.USER,
      };

      const expectedResult = {
        id: '2',
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await usersController.create(createUserDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUserWithSubscription);

      // Act
      const result = await usersController.findOne('1', mockRequest);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isActive: mockUser.isActive,
        subscription: mockUserWithSubscription.subscription,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(usersController.findOne('999', mockRequest)).rejects.toThrow(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith('999');
    });

    it('should throw ForbiddenException if user tries to access another user profile', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUserWithSubscription);

      // Act & Assert
      await expect(usersController.findOne('1', mockRequest)).rejects.toThrow(ForbiddenException);
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });

    it('should allow admin to access any user profile', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.ADMIN,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUserWithSubscription);

      // Act
      const result = await usersController.findOne('1', mockRequest);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isActive: mockUser.isActive,
        subscription: mockUserWithSubscription.subscription,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      const expectedResult = {
        ...mockUser,
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await usersController.update('1', updateUserDto, mockRequest);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(usersController.update('999', updateUserDto, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findById).toHaveBeenCalledWith('999');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to update another user', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(usersController.update('1', updateUserDto, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should allow admin to update any user', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.ADMIN,
        },
      };

      const expectedResult = {
        ...mockUser,
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await usersController.update('1', updateUserDto, mockRequest);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.remove.mockResolvedValue(undefined);

      // Act
      const result = await usersController.remove('1', mockRequest);

      // Assert
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '1',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(usersController.remove('999', mockRequest)).rejects.toThrow(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith('999');
      expect(usersService.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user tries to remove another user', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(usersController.remove('1', mockRequest)).rejects.toThrow(ForbiddenException);
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.remove).not.toHaveBeenCalled();
    });

    it('should allow admin to remove any user', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '2',
          role: UserRole.ADMIN,
        },
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.remove.mockResolvedValue(undefined);

      // Act
      const result = await usersController.remove('1', mockRequest);

      // Assert
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(usersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
