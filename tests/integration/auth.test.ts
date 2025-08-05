import request from 'supertest';
import app from '../../src/app'; // Assuming you have an app.ts file that exports the Express app
import { UserRepository } from '../../src/repositories/UserRepository';
import { mockUsers } from '../mocks/mockData';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../src/config';

// Mock the UserRepository
jest.mock('../../src/repositories/UserRepository');

describe('Auth API Endpoints', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock implementation
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    
    // Replace the repository in the auth controller
    // This assumes you have a way to access the controller instance
    // You might need to adjust this based on your actual implementation
    const authController = (app as any).controllers.authController;
    if (authController) {
      (authController as any).userRepository = mockUserRepository;
    }
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if user not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should return 401 if password is incorrect', async () => {
      // Arrange
      const mockUser = { ...mockUsers[0] };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare to return false (password mismatch)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: mockUser.email, password: 'wrong-password' });
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it('should return 200 with token if login successful', async () => {
      // Arrange
      const mockUser = { ...mockUsers[0] };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare to return true (password match)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-token');
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: mockUser.email, password: 'password123' });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', mockUser.id);
      expect(response.body.user).toHaveProperty('email', mockUser.email);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing name and password
      
      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if email already exists', async () => {
      // Arrange
      const existingUser = { ...mockUsers[0] };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: existingUser.email,
          password: 'password123'
        });
      
      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(existingUser.email);
    });

    it('should return 201 with token if registration successful', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const newUser = {
        id: '3',
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockUserRepository.create.mockResolvedValue(newUser);
      
      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-token');
      
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: newUser.name,
          email: newUser.email,
          password: 'password123'
        });
      
      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token', 'mock-token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', newUser.id);
      expect(response.body.user).toHaveProperty('email', newUser.email);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newUser.email);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/validate', () => {
    it('should return 401 if no token provided', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/validate');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if token is invalid', async () => {
      // Arrange
      // Mock jwt.verify to throw an error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalid-token');
      
      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(jwt.verify).toHaveBeenCalled();
    });

    it('should return 200 if token is valid', async () => {
      // Arrange
      const mockUser = { ...mockUsers[0] };
      
      // Mock jwt.verify to return decoded token
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        id: mockUser.id,
        role: mockUser.role
      }));
      
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer valid-token');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(jwt.verify).toHaveBeenCalled();
    });
  });
});
