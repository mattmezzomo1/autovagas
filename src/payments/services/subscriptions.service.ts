import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionStatus, SubscriptionPlan, SubscriptionInterval } from '../entities/subscription.entity';
import { StripeService } from './stripe.service';
import { UsersService } from '../../users/services/users.service';
import { PaymentAuditLogService } from './payment-audit-log.service';
import { AuditLogAction } from '../entities/payment-audit-log.entity';
import { User } from '../../users/entities/user.entity';
import { UserSubscriptionTier } from '../../users/entities/user-subscription.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly gracePeriodDays: number;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly stripeService: StripeService,
    private readonly usersService: UsersService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
    private readonly configService: ConfigService,
  ) {
    this.gracePeriodDays = this.configService.get<number>('stripe.gracePeriodDays', 3);
  }

  /**
   * Create a subscription record
   */
  async create(data: Partial<Subscription>): Promise<Subscription> {
    try {
      const subscription = this.subscriptionRepository.create(data);
      const savedSubscription = await this.subscriptionRepository.save(subscription);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId: subscription.userId,
        subscriptionId: savedSubscription.id,
        action: AuditLogAction.SUBSCRIPTION_CREATED,
        data: subscription,
      });
      
      // Update user subscription tier
      await this.updateUserSubscriptionTier(subscription.userId, subscription.plan);
      
      return savedSubscription;
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find subscription by ID
   */
  async findById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }

  /**
   * Find active subscription by user ID
   */
  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
    });
  }

  /**
   * Update subscription status
   */
  async updateStatus(
    id: string,
    status: SubscriptionStatus,
    metadata: any = {},
  ): Promise<Subscription> {
    const subscription = await this.findById(id);
    
    // Update status and metadata
    subscription.status = status;
    subscription.metadata = { ...subscription.metadata, ...metadata };
    
    // Update timestamps based on status
    if (status === SubscriptionStatus.CANCELED) {
      subscription.canceledAt = new Date();
    }
    
    const updatedSubscription = await this.subscriptionRepository.save(subscription);
    
    // Log the action
    await this.paymentAuditLogService.create({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      action: this.mapStatusToAction(status),
      data: { 
        oldStatus: subscription.status, 
        newStatus: status,
        metadata,
      },
    });
    
    // Update user subscription tier if status changed
    if (status === SubscriptionStatus.ACTIVE) {
      await this.updateUserSubscriptionTier(subscription.userId, subscription.plan);
    } else if (status === SubscriptionStatus.CANCELED || status === SubscriptionStatus.UNPAID) {
      await this.updateUserSubscriptionTier(subscription.userId, SubscriptionPlan.BASIC);
    }
    
    return updatedSubscription;
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    interval: SubscriptionInterval = SubscriptionInterval.MONTH,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    try {
      // Get user
      const user = await this.usersService.findById(userId);
      
      // Check if user already has an active subscription
      const activeSubscription = await this.findActiveByUserId(userId);
      if (activeSubscription) {
        throw new BadRequestException('User already has an active subscription');
      }
      
      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await this.stripeService.createCustomer(user);
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await this.usersService.update(userId, { stripeCustomerId: customerId });
      }
      
      // Create checkout session
      const session = await this.stripeService.createSubscriptionCheckoutSession(
        user,
        customerId,
        plan,
        interval,
        this.configService.get<number>('stripe.trialPeriodDays', 7),
        successUrl,
        cancelUrl,
      );
      
      return { url: session.url };
    } catch (error) {
      this.logger.error(`Error creating checkout session for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a subscription from Stripe subscription
   */
  async createFromStripeSubscription(stripeSubscriptionId: string): Promise<Subscription> {
    try {
      // Get subscription from Stripe
      const stripeSubscription = await this.stripeService.getSubscription(stripeSubscriptionId);
      
      // Check if subscription already exists
      const existingSubscription = await this.findByStripeSubscriptionId(stripeSubscriptionId);
      if (existingSubscription) {
        return existingSubscription;
      }
      
      // Get user ID from metadata
      const userId = stripeSubscription.metadata.userId;
      if (!userId) {
        throw new BadRequestException('User ID not found in subscription metadata');
      }
      
      // Get plan from metadata
      const plan = stripeSubscription.metadata.plan as SubscriptionPlan;
      if (!plan) {
        throw new BadRequestException('Plan not found in subscription metadata');
      }
      
      // Get interval from metadata
      const interval = stripeSubscription.metadata.interval as SubscriptionInterval || SubscriptionInterval.MONTH;
      
      // Map Stripe status to our status
      const status = this.mapStripeStatusToStatus(stripeSubscription.status);
      
      // Create subscription
      const subscription = await this.create({
        userId,
        status,
        plan,
        interval,
        amount: stripeSubscription.items.data[0].price.unit_amount / 100, // Convert from cents
        currency: stripeSubscription.currency.toUpperCase(),
        stripePriceId: stripeSubscription.items.data[0].price.id,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer as string,
        startDate: new Date(stripeSubscription.start_date * 1000),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        metadata: stripeSubscription.metadata,
      });
      
      // If subscription has trial, update trial dates
      if (stripeSubscription.trial_start && stripeSubscription.trial_end) {
        subscription.trialStartDate = new Date(stripeSubscription.trial_start * 1000);
        subscription.trialEndDate = new Date(stripeSubscription.trial_end * 1000);
        
        // Log trial started
        await this.paymentAuditLogService.create({
          userId,
          subscriptionId: subscription.id,
          action: AuditLogAction.SUBSCRIPTION_TRIAL_STARTED,
          data: {
            trialStartDate: subscription.trialStartDate,
            trialEndDate: subscription.trialEndDate,
          },
        });
      }
      
      return subscription;
    } catch (error) {
      this.logger.error(`Error creating subscription from Stripe subscription ${stripeSubscriptionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update subscription from Stripe subscription
   */
  async updateFromStripeSubscription(stripeSubscriptionId: string): Promise<Subscription> {
    try {
      // Get subscription from Stripe
      const stripeSubscription = await this.stripeService.getSubscription(stripeSubscriptionId);
      
      // Find existing subscription
      const subscription = await this.findByStripeSubscriptionId(stripeSubscriptionId);
      if (!subscription) {
        return this.createFromStripeSubscription(stripeSubscriptionId);
      }
      
      // Map Stripe status to our status
      const status = this.mapStripeStatusToStatus(stripeSubscription.status);
      
      // Update subscription
      subscription.status = status;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.metadata = { ...subscription.metadata, ...stripeSubscription.metadata };
      
      // If plan changed, update plan
      if (stripeSubscription.metadata.plan && stripeSubscription.metadata.plan !== subscription.plan) {
        subscription.plan = stripeSubscription.metadata.plan as SubscriptionPlan;
        subscription.stripePriceId = stripeSubscription.items.data[0].price.id;
        subscription.amount = stripeSubscription.items.data[0].price.unit_amount / 100;
      }
      
      // If subscription was canceled, update canceled date
      if (status === SubscriptionStatus.CANCELED && !subscription.canceledAt) {
        subscription.canceledAt = new Date();
      }
      
      // If subscription has trial, update trial dates
      if (stripeSubscription.trial_start && stripeSubscription.trial_end) {
        const oldTrialEndDate = subscription.trialEndDate;
        subscription.trialStartDate = new Date(stripeSubscription.trial_start * 1000);
        subscription.trialEndDate = new Date(stripeSubscription.trial_end * 1000);
        
        // If trial end date changed, log trial ended/started
        if (oldTrialEndDate && oldTrialEndDate < new Date() && subscription.trialEndDate > new Date()) {
          await this.paymentAuditLogService.create({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            action: AuditLogAction.SUBSCRIPTION_TRIAL_STARTED,
            data: {
              trialStartDate: subscription.trialStartDate,
              trialEndDate: subscription.trialEndDate,
            },
          });
        }
      }
      
      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId: subscription.userId,
        subscriptionId: subscription.id,
        action: AuditLogAction.SUBSCRIPTION_UPDATED,
        data: { 
          stripeSubscription,
        },
      });
      
      // Update user subscription tier
      await this.updateUserSubscriptionTier(subscription.userId, subscription.plan);
      
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Error updating subscription from Stripe subscription ${stripeSubscriptionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ): Promise<Subscription> {
    try {
      // Find subscription
      const subscription = await this.findById(subscriptionId);
      
      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        throw new BadRequestException('Subscription does not belong to user');
      }
      
      // Check if subscription is already canceled
      if (subscription.status === SubscriptionStatus.CANCELED) {
        throw new BadRequestException('Subscription is already canceled');
      }
      
      // Cancel subscription in Stripe
      await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);
      
      // Update subscription
      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      
      if (!cancelAtPeriodEnd) {
        subscription.status = SubscriptionStatus.CANCELED;
        subscription.canceledAt = new Date();
      }
      
      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId,
        subscriptionId,
        action: AuditLogAction.SUBSCRIPTION_CANCELED,
        data: { 
          cancelAtPeriodEnd,
        },
      });
      
      // If immediate cancellation, update user subscription tier
      if (!cancelAtPeriodEnd) {
        await this.updateUserSubscriptionTier(userId, SubscriptionPlan.BASIC);
      }
      
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Error canceling subscription ${subscriptionId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Change subscription plan
   */
  async changePlan(
    userId: string,
    subscriptionId: string,
    newPlan: SubscriptionPlan,
  ): Promise<Subscription> {
    try {
      // Find subscription
      const subscription = await this.findById(subscriptionId);
      
      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        throw new BadRequestException('Subscription does not belong to user');
      }
      
      // Check if subscription is active
      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        throw new BadRequestException('Subscription is not active');
      }
      
      // Check if plan is the same
      if (subscription.plan === newPlan) {
        throw new BadRequestException('Subscription is already on this plan');
      }
      
      // Change plan in Stripe
      await this.stripeService.changeSubscriptionPlan(subscription.stripeSubscriptionId, newPlan);
      
      // Update subscription
      subscription.plan = newPlan;
      
      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId,
        subscriptionId,
        action: AuditLogAction.SUBSCRIPTION_UPDATED,
        data: { 
          oldPlan: subscription.plan,
          newPlan,
        },
      });
      
      // Update user subscription tier
      await this.updateUserSubscriptionTier(userId, newPlan);
      
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Error changing subscription ${subscriptionId} plan to ${newPlan} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update subscription after successful payment
   */
  async updateAfterSuccessfulPayment(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.findById(subscriptionId);
      
      // Reset failed payment count
      subscription.failedPaymentCount = 0;
      
      // If subscription was in PAST_DUE or UNPAID status, set it back to ACTIVE
      if (
        subscription.status === SubscriptionStatus.PAST_DUE ||
        subscription.status === SubscriptionStatus.UNPAID
      ) {
        subscription.status = SubscriptionStatus.ACTIVE;
        
        // Clear grace period end date
        subscription.gracePeriodEnd = null;
      }
      
      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      
      // Update user subscription tier
      await this.updateUserSubscriptionTier(subscription.userId, subscription.plan);
      
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Error updating subscription ${subscriptionId} after successful payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update subscription after failed payment
   */
  async updateAfterFailedPayment(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.findById(subscriptionId);
      
      // Increment failed payment count
      subscription.failedPaymentCount += 1;
      
      // If this is the first failed payment, set status to PAST_DUE and start grace period
      if (subscription.failedPaymentCount === 1 && subscription.status === SubscriptionStatus.ACTIVE) {
        subscription.status = SubscriptionStatus.PAST_DUE;
        
        // Set grace period end date
        const gracePeriodEnd = new Date();
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + this.gracePeriodDays);
        subscription.gracePeriodEnd = gracePeriodEnd;
        
        // Log grace period started
        await this.paymentAuditLogService.create({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: AuditLogAction.SUBSCRIPTION_GRACE_PERIOD_STARTED,
          data: {
            gracePeriodEnd,
            failedPaymentCount: subscription.failedPaymentCount,
          },
        });
      }
      
      // If failed payment count exceeds threshold, set status to UNPAID
      if (subscription.failedPaymentCount >= 3) {
        subscription.status = SubscriptionStatus.UNPAID;
        
        // Log grace period ended
        await this.paymentAuditLogService.create({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: AuditLogAction.SUBSCRIPTION_GRACE_PERIOD_ENDED,
          data: {
            failedPaymentCount: subscription.failedPaymentCount,
          },
        });
        
        // Update user subscription tier to BASIC
        await this.updateUserSubscriptionTier(subscription.userId, SubscriptionPlan.BASIC);
      }
      
      return this.subscriptionRepository.save(subscription);
    } catch (error) {
      this.logger.error(`Error updating subscription ${subscriptionId} after failed payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check and process subscriptions with expired grace periods
   */
  async processExpiredGracePeriods(): Promise<void> {
    try {
      // Find subscriptions with expired grace periods
      const now = new Date();
      const subscriptions = await this.subscriptionRepository.find({
        where: {
          status: SubscriptionStatus.PAST_DUE,
          gracePeriodEnd: { lessThan: now },
        },
      });
      
      for (const subscription of subscriptions) {
        // Set status to UNPAID
        subscription.status = SubscriptionStatus.UNPAID;
        
        // Save subscription
        await this.subscriptionRepository.save(subscription);
        
        // Log grace period ended
        await this.paymentAuditLogService.create({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: AuditLogAction.SUBSCRIPTION_GRACE_PERIOD_ENDED,
          data: {
            gracePeriodEnd: subscription.gracePeriodEnd,
          },
        });
        
        // Update user subscription tier to BASIC
        await this.updateUserSubscriptionTier(subscription.userId, SubscriptionPlan.BASIC);
      }
      
      this.logger.log(`Processed ${subscriptions.length} subscriptions with expired grace periods`);
    } catch (error) {
      this.logger.error(`Error processing expired grace periods: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user subscription tier
   */
  private async updateUserSubscriptionTier(userId: string, plan: SubscriptionPlan): Promise<void> {
    try {
      // Map subscription plan to user subscription tier
      const tier = this.mapPlanToTier(plan);
      
      // Update user subscription tier
      await this.usersService.updateSubscription(userId, {
        tier,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error updating user ${userId} subscription tier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map Stripe subscription status to our SubscriptionStatus enum
   */
  private mapStripeStatusToStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }

  /**
   * Map subscription status to audit log action
   */
  private mapStatusToAction(status: SubscriptionStatus): AuditLogAction {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return AuditLogAction.SUBSCRIPTION_RENEWED;
      case SubscriptionStatus.CANCELED:
        return AuditLogAction.SUBSCRIPTION_CANCELED;
      case SubscriptionStatus.PAST_DUE:
        return AuditLogAction.SUBSCRIPTION_PAST_DUE;
      case SubscriptionStatus.UNPAID:
        return AuditLogAction.SUBSCRIPTION_UNPAID;
      case SubscriptionStatus.TRIALING:
        return AuditLogAction.SUBSCRIPTION_TRIAL_STARTED;
      default:
        return AuditLogAction.SUBSCRIPTION_UPDATED;
    }
  }

  /**
   * Map subscription plan to user subscription tier
   */
  private mapPlanToTier(plan: SubscriptionPlan): UserSubscriptionTier {
    switch (plan) {
      case SubscriptionPlan.BASIC:
        return UserSubscriptionTier.BASIC;
      case SubscriptionPlan.PLUS:
        return UserSubscriptionTier.PLUS;
      case SubscriptionPlan.PREMIUM:
        return UserSubscriptionTier.PREMIUM;
      default:
        return UserSubscriptionTier.BASIC;
    }
  }
}
