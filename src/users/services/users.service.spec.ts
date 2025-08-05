import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole } from '../entities/user.entity';
import { UserSubscription, UserSubscriptionTier } from '../entities/user-subscription.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let userSubscriptionRepository: Repository<UserSubscription>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockUserSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

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

  const mockUserSubscription: UserSubscription = {
    id: '1',
    userId: '1',
    tier: UserSubscriptionTier.BASIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserSubscription),
          useValue: mockUserSubscriptionRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userSubscriptionRepository = module.get<Repository<UserSubscription>>(
      getRepositoryToken(UserSubscription),
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with basic subscription', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'New User',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...createUserDto, id: '2' });
      mockUserRepository.save.mockResolvedValue({
        id: '2',
        email: createUserDto.email,
        password: 'hashedPassword',
        name: createUserDto.name,
        role: createUserDto.role,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      mockUserSubscriptionRepository.create.mockReturnValue({
        userId: '2',
        tier: UserSubscriptionTier.BASIC,
      });
      mockUserSubscriptionRepository.save.mockResolvedValue({
        id: '2',
        userId: '2',
        tier: UserSubscriptionTier.BASIC,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await usersService.create(createUserDto);

      // Assert
      expect(result).toEqual({
        id: '2',
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: 'hashedPassword',
        name: createUserDto.name,
        role: createUserDto.role,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(userSubscriptionRepository.create).toHaveBeenCalledWith({
        userId: '2',
        tier: UserSubscriptionTier.BASIC,
      });
      expect(userSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'Existing User',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '3', email: 'existing@example.com' });

      // Act & Assert
      await expect(usersService.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id with subscription', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserSubscriptionRepository.findOne.mockResolvedValue(mockUserSubscription);

      // Act
      const result = await usersService.findById('1');

      // Assert
      expect(result).toEqual({
        ...mockUser,
        subscription: mockUserSubscription,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(userSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await usersService.findById('999');

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(userSubscriptionRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await usersService.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await usersService.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await usersService.update('1', updateUserDto);

      // Assert
      expect(result).toEqual({
        ...mockUser,
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      });
    });

    it('should update user password if provided', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        currentPassword: 'OldPassword123!',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await usersService.update('1', updateUserDto);

      // Assert
      expect(result).toEqual({
        ...mockUser,
        updatedAt: expect.any(Date),
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('OldPassword123!', mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedPassword',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(usersService.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        currentPassword: 'WrongPassword',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(usersService.update('1', updateUserDto)).rejects.toThrow();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword', mockUser.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
