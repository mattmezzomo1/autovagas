import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { UserSubscription, UserSubscriptionTier } from '../../src/users/entities/user-subscription.entity';
import { Subscription, SubscriptionPlan, SubscriptionStatus, SubscriptionInterval } from '../../src/payments/entities/subscription.entity';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from '../../src/payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { StripeService } from '../../src/payments/services/stripe.service';

// Mock Stripe service
jest.mock('../../src/payments/services/stripe.service');

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userSubscriptionRepository: Repository<UserSubscription>;
  let subscriptionRepository: Repository<Subscription>;
  let paymentRepository: Repository<Payment>;
  let jwtService: JwtService;
  let stripeService: StripeService;
  let accessToken: string;
  let testUserId: string;
  let testSubscriptionId: string;

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
    subscriptionRepository = moduleFixture.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    paymentRepository = moduleFixture.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);
    stripeService = moduleFixture.get<StripeService>(StripeService);

    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const testUser = userRepository.create({
      email: 'test-payments@example.com',
      password: hashedPassword,
      name: 'Test Payments User',
      role: UserRole.USER,
      isActive: true,
      stripeCustomerId: 'cus_test123',
    });

    const savedUser = await userRepository.save(testUser);
    testUserId = savedUser.id;

    // Create a subscription for the test user
    const testUserSubscription = userSubscriptionRepository.create({
      userId: testUserId,
      tier: UserSubscriptionTier.PLUS,
    });

    await userSubscriptionRepository.save(testUserSubscription);

    // Create a Stripe subscription
    const testSubscription = subscriptionRepository.create({
      userId: testUserId,
      status: SubscriptionStatus.ACTIVE,
      plan: SubscriptionPlan.PLUS,
      interval: SubscriptionInterval.MONTH,
      amount: 49.90,
      currency: 'BRL',
      stripePriceId: 'price_test123',
      stripeSubscriptionId: 'sub_test123',
      stripeCustomerId: 'cus_test123',
      startDate: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const savedSubscription = await subscriptionRepository.save(testSubscription);
    testSubscriptionId = savedSubscription.id;

    // Create a payment
    const testPayment = paymentRepository.create({
      userId: testUserId,
      subscriptionId: testSubscriptionId,
      amount: 49.90,
      currency: 'BRL',
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentType: PaymentType.SUBSCRIPTION,
      stripePaymentIntentId: 'pi_test123',
      stripeCustomerId: 'cus_test123',
      paidAt: new Date(),
    });

    await paymentRepository.save(testPayment);

    // Generate access token
    accessToken = jwtService.sign(
      { 
        sub: testUserId, 
        email: savedUser.email,
        role: savedUser.role,
      },
      {
        secret: 'test-secret',
        expiresIn: '1h',
      },
    );

    // Mock Stripe service methods
    (stripeService.createSubscriptionCheckoutSession as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/test',
    });
    
    (stripeService.createPortalSession as jest.Mock).mockResolvedValue({
      url: 'https://billing.stripe.com/test',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await paymentRepository.delete({ userId: testUserId });
    await subscriptionRepository.delete({ userId: testUserId });
    await userSubscriptionRepository.delete({ userId: testUserId });
    await userRepository.delete({ id: testUserId });
    
    await app.close();
  });

  describe('/payments (GET)', () => {
    it('should return user payments when authenticated', () => {
      return request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('payments');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data.payments.length).toBeGreaterThan(0);
          expect(res.body.data.payments[0].userId).toBe(testUserId);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/payments')
        .expect(401);
    });
  });

  describe('/payments/:id (GET)', () => {
    it('should return a payment by id when authenticated', async () => {
      // Get a payment id first
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      const paymentId = response.body.data.payments[0].id;

      return request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(paymentId);
          expect(res.body.data.userId).toBe(testUserId);
        });
    });

    it('should return 401 when not authenticated', async () => {
      // Get a payment id first
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      const paymentId = response.body.data.payments[0].id;

      return request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .expect(401);
    });
  });

  describe('/payments/checkout (POST)', () => {
    it('should create a checkout session when authenticated', () => {
      return request(app.getHttpServer())
        .post('/payments/checkout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          plan: SubscriptionPlan.PREMIUM,
          interval: SubscriptionInterval.MONTH,
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('url');
          expect(res.body.data.url).toBe('https://checkout.stripe.com/test');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .post('/payments/checkout')
        .send({
          plan: SubscriptionPlan.PREMIUM,
          interval: SubscriptionInterval.MONTH,
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/payments/checkout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          plan: 'INVALID_PLAN',
          interval: SubscriptionInterval.MONTH,
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  describe('/payments/portal (GET)', () => {
    it('should create a portal session when authenticated', () => {
      return request(app.getHttpServer())
        .get('/payments/portal')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('url');
          expect(res.body.data.url).toBe('https://billing.stripe.com/test');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/payments/portal')
        .expect(401);
    });
  });

  describe('/subscriptions/active (GET)', () => {
    it('should return active subscription when authenticated', () => {
      return request(app.getHttpServer())
        .get('/subscriptions/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('active');
          expect(res.body.data.active).toBe(true);
          expect(res.body.data).toHaveProperty('subscription');
          expect(res.body.data.subscription.id).toBe(testSubscriptionId);
          expect(res.body.data.subscription.userId).toBe(testUserId);
          expect(res.body.data.subscription.plan).toBe(SubscriptionPlan.PLUS);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/subscriptions/active')
        .expect(401);
    });
  });

  describe('/subscriptions/:id (GET)', () => {
    it('should return a subscription by id when authenticated', () => {
      return request(app.getHttpServer())
        .get(`/subscriptions/${testSubscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.id).toBe(testSubscriptionId);
          expect(res.body.data.userId).toBe(testUserId);
          expect(res.body.data.plan).toBe(SubscriptionPlan.PLUS);
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/subscriptions/${testSubscriptionId}`)
        .expect(401);
    });
  });
});
