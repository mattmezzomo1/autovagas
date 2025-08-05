import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'jwt.accessTokenExpiresIn') return '15m';
      if (key === 'jwt.refreshTokenExpiresIn') return '7d';
      return undefined;
    });
    
    mockJwtService.sign.mockImplementation(() => 'jwt_token');
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await authService.validateUser('nonexistent@example.com', 'password');

      // Assert
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    });

    it('should return null when user is not active', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);

      // Act
      const result = await authService.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      // Arrange
      mockJwtService.sign.mockImplementationOnce(() => 'access_token');
      mockJwtService.sign.mockImplementationOnce(() => 'refresh_token');

      // Act
      const result = await authService.login(mockUser);

      // Assert
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
      
      // Check first call for access token
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, 
        { 
          sub: mockUser.id, 
          email: mockUser.email,
          role: mockUser.role,
        }, 
        expect.objectContaining({ expiresIn: '15m' })
      );
      
      // Check second call for refresh token
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, 
        { sub: mockUser.id }, 
        expect.objectContaining({ expiresIn: '7d' })
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      mockJwtService.verify.mockReturnValue({ sub: '1' });
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result).toEqual({
        accessToken: 'new_access_token',
      });
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, expect.anything());
      expect(usersService.findById).toHaveBeenCalledWith('1');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { 
          sub: mockUser.id, 
          email: mockUser.email,
          role: mockUser.role,
        }, 
        expect.objectContaining({ expiresIn: '15m' })
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      const refreshToken = 'invalid_refresh_token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, expect.anything());
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      mockJwtService.verify.mockReturnValue({ sub: '999' });
      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, expect.anything());
      expect(usersService.findById).toHaveBeenCalledWith('999');
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      mockJwtService.verify.mockReturnValue({ sub: '1' });
      mockUsersService.findById.mockResolvedValue({ ...mockUser, isActive: false });

      // Act & Assert
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, expect.anything());
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });
  });
});
