import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan, SubscriptionInterval } from '../entities/subscription.entity';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly currency: string;
  private readonly planIds: Record<SubscriptionPlan, string>;
  private readonly trialPeriodDays: number;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new Error('Stripe secret key is not defined');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    this.currency = this.configService.get<string>('stripe.currency', 'brl');
    this.trialPeriodDays = this.configService.get<number>('stripe.trialPeriodDays', 7);

    this.planIds = {
      [SubscriptionPlan.BASIC]: this.configService.get<string>('stripe.basicPlanId'),
      [SubscriptionPlan.PLUS]: this.configService.get<string>('stripe.plusPlanId'),
      [SubscriptionPlan.PREMIUM]: this.configService.get<string>('stripe.premiumPlanId'),
    };
  }

  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(user: User): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      this.logger.log(`Created Stripe customer for user ${user.id}: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Error creating Stripe customer for user ${user.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a Stripe customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Error retrieving Stripe customer ${customerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a Stripe customer
   */
  async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.update(customerId, data);
    } catch (error) {
      this.logger.error(`Error updating Stripe customer ${customerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a Stripe customer
   */
  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      return await this.stripe.customers.del(customerId);
    } catch (error) {
      this.logger.error(`Error deleting Stripe customer ${customerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createSubscriptionCheckoutSession(
    user: User,
    customerId: string,
    plan: SubscriptionPlan,
    interval: SubscriptionInterval = SubscriptionInterval.MONTH,
    trialPeriodDays: number = this.trialPeriodDays,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const priceId = this.planIds[plan];
      if (!priceId) {
        throw new Error(`Price ID not found for plan ${plan}`);
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card', 'boleto', 'pix'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: trialPeriodDays,
          metadata: {
            userId: user.id,
            plan,
            interval,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user.id,
          plan,
          interval,
        },
      });

      this.logger.log(`Created subscription checkout session for user ${user.id}: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error(`Error creating subscription checkout session for user ${user.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a subscription directly (without checkout)
   */
  async createSubscription(
    customerId: string,
    plan: SubscriptionPlan,
    paymentMethodId: string,
    interval: SubscriptionInterval = SubscriptionInterval.MONTH,
    trialPeriodDays: number = this.trialPeriodDays,
    metadata: any = {},
  ): Promise<Stripe.Subscription> {
    try {
      const priceId = this.planIds[plan];
      if (!priceId) {
        throw new Error(`Price ID not found for plan ${plan}`);
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        trial_period_days: trialPeriodDays,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          ...metadata,
          plan,
          interval,
        },
      });

      this.logger.log(`Created subscription for customer ${customerId}: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error creating subscription for customer ${customerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.logger.error(`Error retrieving subscription ${subscriptionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    data: Stripe.SubscriptionUpdateParams,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, data);
    } catch (error) {
      this.logger.error(`Error updating subscription ${subscriptionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ): Promise<Stripe.Subscription> {
    try {
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      this.logger.error(`Error canceling subscription ${subscriptionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlan: SubscriptionPlan,
    prorate: boolean = true,
  ): Promise<Stripe.Subscription> {
    try {
      const priceId = this.planIds[newPlan];
      if (!priceId) {
        throw new Error(`Price ID not found for plan ${newPlan}`);
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionItemId = subscription.items.data[0].id;

      return await this.stripe.subscriptions.update(subscriptionId, {
        proration_behavior: prorate ? 'create_prorations' : 'none',
        items: [
          {
            id: subscriptionItemId,
            price: priceId,
          },
        ],
        metadata: {
          ...subscription.metadata,
          plan: newPlan,
        },
      });
    } catch (error) {
      this.logger.error(`Error changing subscription ${subscriptionId} to plan ${newPlan}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get an invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      this.logger.error(`Error retrieving invoice ${invoiceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Error retrieving payment intent ${paymentIntentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a portal session for managing subscriptions
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      return await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
    } catch (error) {
      this.logger.error(`Error creating portal session for customer ${customerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify a webhook signature
   */
  constructEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not defined');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error(`Error verifying webhook signature: ${error.message}`);
      throw error;
    }
  }
}
