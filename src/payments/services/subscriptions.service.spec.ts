import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { UsersService } from '../../users/services/users.service';
import { PaymentAuditLogService } from './payment-audit-log.service';
import { Subscription, SubscriptionStatus, SubscriptionPlan, SubscriptionInterval } from '../entities/subscription.entity';
import { UserSubscriptionTier } from '../../users/entities/user-subscription.entity';
import { BadRequestException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let subscriptionsService: SubscriptionsService;
  let subscriptionRepository: Repository<Subscription>;
  let stripeService: StripeService;
  let usersService: UsersService;
  let paymentAuditLogService: PaymentAuditLogService;

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockStripeService = {
    createSubscriptionCheckoutSession: jest.fn(),
    getSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    changeSubscriptionPlan: jest.fn(),
    createCustomer: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    updateSubscription: jest.fn(),
  };

  const mockPaymentAuditLogService = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSubscription: Subscription = {
    id: '1',
    userId: 'user-1',
    status: SubscriptionStatus.ACTIVE,
    plan: SubscriptionPlan.BASIC,
    interval: SubscriptionInterval.MONTH,
    amount: 29.90,
    currency: 'BRL',
    stripePriceId: 'price_123',
    stripeSubscriptionId: 'sub_123',
    stripeCustomerId: 'cus_123',
    failedPaymentCount: 0,
    cancelAtPeriodEnd: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    endDate: null,
    trialStartDate: null,
    trialEndDate: null,
    canceledAt: null,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    gracePeriodEnd: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PaymentAuditLogService,
          useValue: mockPaymentAuditLogService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionRepository = module.get<Repository<Subscription>>(getRepositoryToken(Subscription));
    stripeService = module.get<StripeService>(StripeService);
    usersService = module.get<UsersService>(UsersService);
    paymentAuditLogService = module.get<PaymentAuditLogService>(PaymentAuditLogService);

    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'stripe.gracePeriodDays') return 3;
      if (key === 'stripe.trialPeriodDays') return 7;
      return undefined;
    });
  });

  describe('create', () => {
    it('should create a subscription and update user subscription tier', async () => {
      // Arrange
      const subscriptionData = {
        userId: 'user-1',
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.BASIC,
        interval: SubscriptionInterval.MONTH,
        amount: 29.90,
        currency: 'BRL',
        stripePriceId: 'price_123',
        stripeSubscriptionId: 'sub_123',
        stripeCustomerId: 'cus_123',
      };

      mockSubscriptionRepository.create.mockReturnValue(subscriptionData);
      mockSubscriptionRepository.save.mockResolvedValue({
        id: '1',
        ...subscriptionData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Act
      const result = await subscriptionsService.create(subscriptionData);

      // Assert
      expect(result).toEqual({
        id: '1',
        ...subscriptionData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(subscriptionData);
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
      expect(mockPaymentAuditLogService.create).toHaveBeenCalledWith({
        userId: subscriptionData.userId,
        subscriptionId: '1',
        action: 'SUBSCRIPTION_CREATED',
        data: subscriptionData,
      });
      expect(mockUsersService.updateSubscription).toHaveBeenCalledWith(
        subscriptionData.userId,
        {
          tier: UserSubscriptionTier.BASIC,
          updatedAt: expect.any(Date),
        },
      );
    });
  });

  describe('findById', () => {
    it('should return a subscription by id', async () => {
      // Arrange
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      // Act
      const result = await subscriptionsService.findById('1');

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException if subscription not found', async () => {
      // Arrange
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(subscriptionsService.findById('999')).rejects.toThrow();
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
        relations: ['user'],
      });
    });
  });

  describe('findActiveByUserId', () => {
    it('should return active subscription for user', async () => {
      // Arrange
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      // Act
      const result = await subscriptionsService.findActiveByUserId('user-1');

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: SubscriptionStatus.ACTIVE,
        },
      });
    });

    it('should return null if no active subscription found', async () => {
      // Arrange
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await subscriptionsService.findActiveByUserId('user-1');

      // Assert
      expect(result).toBeNull();
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: SubscriptionStatus.ACTIVE,
        },
      });
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session for a new subscription', async () => {
      // Arrange
      const userId = 'user-1';
      const plan = SubscriptionPlan.PREMIUM;
      const interval = SubscriptionInterval.MONTH;
      const successUrl = 'https://example.com/success';
      const cancelUrl = 'https://example.com/cancel';
      
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        stripeCustomerId: null,
      };
      
      const mockCustomer = {
        id: 'cus_123',
      };
      
      const mockSession = {
        url: 'https://checkout.stripe.com/123',
      };
      
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockSubscriptionsService.findActiveByUserId = jest.fn().mockResolvedValue(null);
      mockStripeService.createCustomer.mockResolvedValue(mockCustomer);
      mockStripeService.createSubscriptionCheckoutSession.mockResolvedValue(mockSession);

      // Act
      const result = await subscriptionsService.createCheckoutSession(
        userId,
        plan,
        interval,
        successUrl,
        cancelUrl,
      );

      // Assert
      expect(result).toEqual({ url: mockSession.url });
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(mockSubscriptionsService.findActiveByUserId).toHaveBeenCalledWith(userId);
      expect(mockStripeService.createCustomer).toHaveBeenCalledWith(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, { stripeCustomerId: 'cus_123' });
      expect(mockStripeService.createSubscriptionCheckoutSession).toHaveBeenCalledWith(
        mockUser,
        'cus_123',
        plan,
        interval,
        7,
        successUrl,
        cancelUrl,
      );
    });

    it('should throw BadRequestException if user already has active subscription', async () => {
      // Arrange
      const userId = 'user-1';
      const plan = SubscriptionPlan.PREMIUM;
      
      mockUsersService.findById.mockResolvedValue({ id: userId });
      mockSubscriptionsService.findActiveByUserId = jest.fn().mockResolvedValue(mockSubscription);

      // Act & Assert
      await expect(
        subscriptionsService.createCheckoutSession(
          userId,
          plan,
          SubscriptionInterval.MONTH,
          'success',
          'cancel',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(mockSubscriptionsService.findActiveByUserId).toHaveBeenCalledWith(userId);
      expect(mockStripeService.createCustomer).not.toHaveBeenCalled();
      expect(mockStripeService.createSubscriptionCheckoutSession).not.toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end', async () => {
      // Arrange
      const userId = 'user-1';
      const subscriptionId = '1';
      
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockStripeService.cancelSubscription.mockResolvedValue({
        ...mockSubscription,
        cancel_at_period_end: true,
      });
      
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      });

      // Act
      const result = await subscriptionsService.cancelSubscription(userId, subscriptionId, true);

      // Assert
      expect(result).toEqual({
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      });
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriptionId },
        relations: ['user'],
      });
      expect(mockStripeService.cancelSubscription).toHaveBeenCalledWith(
        mockSubscription.stripeSubscriptionId,
        true,
      );
      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith({
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      });
      expect(mockPaymentAuditLogService.create).toHaveBeenCalledWith({
        userId,
        subscriptionId,
        action: 'SUBSCRIPTION_CANCELED',
        data: { 
          cancelAtPeriodEnd: true,
        },
      });
    });

    it('should cancel subscription immediately', async () => {
      // Arrange
      const userId = 'user-1';
      const subscriptionId = '1';
      
      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockStripeService.cancelSubscription.mockResolvedValue({
        ...mockSubscription,
        status: 'canceled',
      });
      
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: expect.any(Date),
      });

      // Act
      const result = await subscriptionsService.cancelSubscription(userId, subscriptionId, false);

      // Assert
      expect(result).toEqual({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: expect.any(Date),
      });
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriptionId },
        relations: ['user'],
      });
      expect(mockStripeService.cancelSubscription).toHaveBeenCalledWith(
        mockSubscription.stripeSubscriptionId,
        false,
      );
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
      expect(mockPaymentAuditLogService.create).toHaveBeenCalledWith({
        userId,
        subscriptionId,
        action: 'SUBSCRIPTION_CANCELED',
        data: { 
          cancelAtPeriodEnd: false,
        },
      });
      expect(mockUsersService.updateSubscription).toHaveBeenCalledWith(
        userId,
        {
          tier: UserSubscriptionTier.BASIC,
          updatedAt: expect.any(Date),
        },
      );
    });
  });

  describe('updateAfterFailedPayment', () => {
    it('should set status to PAST_DUE on first failed payment', async () => {
      // Arrange
      const subscriptionId = '1';
      
      mockSubscriptionRepository.findOne.mockResolvedValue({
        ...mockSubscription,
        failedPaymentCount: 0,
      });
      
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        failedPaymentCount: 1,
        status: SubscriptionStatus.PAST_DUE,
        gracePeriodEnd: expect.any(Date),
      });

      // Act
      const result = await subscriptionsService.updateAfterFailedPayment(subscriptionId);

      // Assert
      expect(result).toEqual({
        ...mockSubscription,
        failedPaymentCount: 1,
        status: SubscriptionStatus.PAST_DUE,
        gracePeriodEnd: expect.any(Date),
      });
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriptionId },
        relations: ['user'],
      });
      expect(mockPaymentAuditLogService.create).toHaveBeenCalledWith({
        userId: mockSubscription.userId,
        subscriptionId: mockSubscription.id,
        action: 'SUBSCRIPTION_GRACE_PERIOD_STARTED',
        data: expect.objectContaining({
          gracePeriodEnd: expect.any(Date),
          failedPaymentCount: 1,
        }),
      });
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should set status to UNPAID after 3 failed payments', async () => {
      // Arrange
      const subscriptionId = '1';
      
      mockSubscriptionRepository.findOne.mockResolvedValue({
        ...mockSubscription,
        failedPaymentCount: 2,
        status: SubscriptionStatus.PAST_DUE,
      });
      
      mockSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        failedPaymentCount: 3,
        status: SubscriptionStatus.UNPAID,
      });

      // Act
      const result = await subscriptionsService.updateAfterFailedPayment(subscriptionId);

      // Assert
      expect(result).toEqual({
        ...mockSubscription,
        failedPaymentCount: 3,
        status: SubscriptionStatus.UNPAID,
      });
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriptionId },
        relations: ['user'],
      });
      expect(mockPaymentAuditLogService.create).toHaveBeenCalledWith({
        userId: mockSubscription.userId,
        subscriptionId: mockSubscription.id,
        action: 'SUBSCRIPTION_GRACE_PERIOD_ENDED',
        data: {
          failedPaymentCount: 3,
        },
      });
      expect(mockUsersService.updateSubscription).toHaveBeenCalledWith(
        mockSubscription.userId,
        {
          tier: UserSubscriptionTier.BASIC,
          updatedAt: expect.any(Date),
        },
      );
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });
  });
});
