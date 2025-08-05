import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens when login is successful', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockTokens);

      // Act
      const result = await authController.login(loginDto);

      // Assert
      expect(result).toEqual(mockTokens);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer refresh_token',
        },
      };

      const mockResponse = {
        accessToken: 'new_access_token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      // Act
      const result = await authController.refreshToken(mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith('refresh_token');
    });

    it('should throw UnauthorizedException when refresh token is missing', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(UnauthorizedException);
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is invalid', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'InvalidHeader',
        },
      };

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(UnauthorizedException);
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '1',
          email: 'test@example.com',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        subscription: {
          tier: 'BASIC',
        },
      });

      // Act
      const result = await authController.getProfile(mockRequest);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        subscription: {
          tier: 'BASIC',
        },
      });
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: '999',
          email: 'nonexistent@example.com',
          role: UserRole.USER,
        },
      };

      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authController.getProfile(mockRequest)).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.findById).toHaveBeenCalledWith('999');
    });
  });
});
