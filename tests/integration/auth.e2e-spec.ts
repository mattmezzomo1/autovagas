import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { UserSubscription, UserSubscriptionTier } from '../../src/users/entities/user-subscription.entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userSubscriptionRepository: Repository<UserSubscription>;
  let accessToken: string;
  let refreshToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    userSubscriptionRepository = moduleFixture.get<Repository<UserSubscription>>(
      getRepositoryToken(UserSubscription),
    );

    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const testUser = userRepository.create({
      email: 'test-integration@example.com',
      password: hashedPassword,
      name: 'Test Integration User',
      role: UserRole.USER,
      isActive: true,
    });

    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;

    // Create a subscription for the test user
    const testSubscription = userSubscriptionRepository.create({
      userId: testUserId,
      tier: UserSubscriptionTier.BASIC,
    });

    await userSubscriptionRepository.save(testSubscription);
  });

  afterAll(async () => {
    // Clean up test data
    await userSubscriptionRepository.delete({ userId: testUserId });
    await userRepository.delete({ id: testUserId });
    
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-integration@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toHaveProperty('email');
        });
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-integration@example.com',
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toHaveProperty('password');
        });
    });

    it('should return tokens for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-integration@example.com',
          password: 'TestPassword123!',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('name');
          expect(res.body.user).toHaveProperty('role');
          
          // Save tokens for later tests
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('subscription');
          expect(res.body.subscription).toHaveProperty('tier');
          expect(res.body.subscription.tier).toBe(UserSubscriptionTier.BASIC);
        });
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });

    it('should return new access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('accessToken');
          
          // Update access token for later tests
          accessToken = res.body.accessToken;
        });
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should successfully logout with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Logged out successfully');
        });
    });
  });
});
