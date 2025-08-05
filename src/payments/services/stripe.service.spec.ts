import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { User, UserRole } from '../../users/entities/user.entity';
import { SubscriptionPlan, SubscriptionInterval } from '../entities/subscription.entity';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    paymentMethods: {
      attach: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    invoices: {
      retrieve: jest.fn(),
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('StripeService', () => {
  let stripeService: StripeService;
  let configService: ConfigService;
  let stripeMock: any;

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

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'stripe.secretKey': 'sk_test_123',
        'stripe.publicKey': 'pk_test_123',
        'stripe.webhookSecret': 'whsec_123',
        'stripe.basicPlanId': 'price_basic_123',
        'stripe.plusPlanId': 'price_plus_123',
        'stripe.premiumPlanId': 'price_premium_123',
        'stripe.currency': 'brl',
        'stripe.trialPeriodDays': 7,
        'stripe.gracePeriodDays': 3,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    stripeService = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Get the Stripe instance
    stripeMock = (Stripe as unknown as jest.Mock).mock.results[0].value;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a Stripe customer', async () => {
      // Arrange
      const mockStripeCustomer = {
        id: 'cus_123',
        email: mockUser.email,
        name: mockUser.name,
        metadata: {
          userId: mockUser.id,
        },
      };
      
      stripeMock.customers.create.mockResolvedValue(mockStripeCustomer);

      // Act
      const result = await stripeService.createCustomer(mockUser);

      // Assert
      expect(result).toEqual(mockStripeCustomer);
      expect(stripeMock.customers.create).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
        metadata: {
          userId: mockUser.id,
        },
      });
    });

    it('should throw an error if Stripe API fails', async () => {
      // Arrange
      stripeMock.customers.create.mockRejectedValue(new Error('Stripe API error'));

      // Act & Assert
      await expect(stripeService.createCustomer(mockUser)).rejects.toThrow('Stripe API error');
      expect(stripeMock.customers.create).toHaveBeenCalled();
    });
  });

  describe('createSubscriptionCheckoutSession', () => {
    it('should create a checkout session for subscription', async () => {
      // Arrange
      const customerId = 'cus_123';
      const plan = SubscriptionPlan.PREMIUM;
      const interval = SubscriptionInterval.MONTH;
      const successUrl = 'https://example.com/success';
      const cancelUrl = 'https://example.com/cancel';
      
      const mockSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/123',
      };
      
      stripeMock.checkout.sessions.create.mockResolvedValue(mockSession);

      // Act
      const result = await stripeService.createSubscriptionCheckoutSession(
        mockUser,
        customerId,
        plan,
        interval,
        7,
        successUrl,
        cancelUrl,
      );

      // Assert
      expect(result).toEqual(mockSession);
      expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith({
        customer: customerId,
        payment_method_types: ['card', 'boleto', 'pix'],
        line_items: [
          {
            price: 'price_premium_123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId: mockUser.id,
            plan,
            interval,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: mockUser.id,
          plan,
          interval,
        },
      });
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription directly', async () => {
      // Arrange
      const customerId = 'cus_123';
      const plan = SubscriptionPlan.PLUS;
      const paymentMethodId = 'pm_123';
      const interval = SubscriptionInterval.MONTH;
      
      const mockSubscription = {
        id: 'sub_123',
        customer: customerId,
        items: {
          data: [
            {
              price: {
                id: 'price_plus_123',
              },
            },
          ],
        },
      };
      
      stripeMock.paymentMethods.attach.mockResolvedValue({});
      stripeMock.customers.update.mockResolvedValue({});
      stripeMock.subscriptions.create.mockResolvedValue(mockSubscription);

      // Act
      const result = await stripeService.createSubscription(
        customerId,
        plan,
        paymentMethodId,
        interval,
        7,
        { additionalData: 'test' },
      );

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(stripeMock.paymentMethods.attach).toHaveBeenCalledWith(paymentMethodId, {
        customer: customerId,
      });
      expect(stripeMock.customers.update).toHaveBeenCalledWith(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      expect(stripeMock.subscriptions.create).toHaveBeenCalledWith({
        customer: customerId,
        items: [
          {
            price: 'price_plus_123',
          },
        ],
        trial_period_days: 7,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          additionalData: 'test',
          plan,
          interval,
        },
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should update subscription to cancel at period end', async () => {
      // Arrange
      const subscriptionId = 'sub_123';
      const mockUpdatedSubscription = {
        id: subscriptionId,
        cancel_at_period_end: true,
      };
      
      stripeMock.subscriptions.update.mockResolvedValue(mockUpdatedSubscription);

      // Act
      const result = await stripeService.cancelSubscription(subscriptionId, true);

      // Assert
      expect(result).toEqual(mockUpdatedSubscription);
      expect(stripeMock.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        cancel_at_period_end: true,
      });
      expect(stripeMock.subscriptions.cancel).not.toHaveBeenCalled();
    });

    it('should cancel subscription immediately', async () => {
      // Arrange
      const subscriptionId = 'sub_123';
      const mockCanceledSubscription = {
        id: subscriptionId,
        status: 'canceled',
      };
      
      stripeMock.subscriptions.cancel.mockResolvedValue(mockCanceledSubscription);

      // Act
      const result = await stripeService.cancelSubscription(subscriptionId, false);

      // Assert
      expect(result).toEqual(mockCanceledSubscription);
      expect(stripeMock.subscriptions.cancel).toHaveBeenCalledWith(subscriptionId);
      expect(stripeMock.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe('changeSubscriptionPlan', () => {
    it('should update subscription with new plan', async () => {
      // Arrange
      const subscriptionId = 'sub_123';
      const newPlan = SubscriptionPlan.PREMIUM;
      
      const mockSubscription = {
        id: subscriptionId,
        items: {
          data: [
            {
              id: 'si_123',
            },
          ],
        },
        metadata: {
          userId: '1',
        },
      };
      
      const mockUpdatedSubscription = {
        id: subscriptionId,
        items: {
          data: [
            {
              id: 'si_123',
              price: {
                id: 'price_premium_123',
              },
            },
          ],
        },
        metadata: {
          userId: '1',
          plan: newPlan,
        },
      };
      
      stripeMock.subscriptions.retrieve.mockResolvedValue(mockSubscription);
      stripeMock.subscriptions.update.mockResolvedValue(mockUpdatedSubscription);

      // Act
      const result = await stripeService.changeSubscriptionPlan(subscriptionId, newPlan, true);

      // Assert
      expect(result).toEqual(mockUpdatedSubscription);
      expect(stripeMock.subscriptions.retrieve).toHaveBeenCalledWith(subscriptionId);
      expect(stripeMock.subscriptions.update).toHaveBeenCalledWith(subscriptionId, {
        proration_behavior: 'create_prorations',
        items: [
          {
            id: 'si_123',
            price: 'price_premium_123',
          },
        ],
        metadata: {
          userId: '1',
          plan: newPlan,
        },
      });
    });
  });

  describe('constructEvent', () => {
    it('should verify webhook signature and construct event', () => {
      // Arrange
      const payload = Buffer.from('payload');
      const signature = 'signature';
      const mockEvent = { id: 'evt_123', type: 'payment_intent.succeeded' };
      
      stripeMock.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Act
      const result = stripeService.constructEvent(payload, signature);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_123',
      );
    });

    it('should throw an error if signature verification fails', () => {
      // Arrange
      const payload = Buffer.from('payload');
      const signature = 'invalid_signature';
      
      stripeMock.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      // Act & Assert
      expect(() => stripeService.constructEvent(payload, signature)).toThrow('Invalid signature');
      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_123',
      );
    });
  });
});
