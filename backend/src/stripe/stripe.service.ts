import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return customer.id;
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto): Promise<{ url: string }> {
    // Get user
    const user = await this.usersService.findById(userId);

    // Get plan details
    const planConfig = this.configService.get(`stripe.plans.${dto.planId}`);
    if (!planConfig) {
      throw new Error(`Invalid plan: ${dto.planId}`);
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      stripeCustomerId = await this.createCustomer(user.email, user.fullName);
      await this.usersService.update(userId, { stripeCustomerId });
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('frontendUrl')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('frontendUrl')}/settings`,
      metadata: {
        userId,
        planId: dto.planId,
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get('stripe.webhookSecret');

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Webhook error:', error.message);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { userId, planId } = session.metadata;
    const subscriptionId = session.subscription as string;

    // Update user subscription
    await this.usersService.updateSubscription(userId, planId, subscriptionId);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Find user by subscription ID
    const user = await this.usersService.findBySubscriptionId(subscription.id);
    if (!user) {
      console.error(`User not found for subscription: ${subscription.id}`);
      return;
    }

    // Get plan ID from subscription
    const planId = subscription.items.data[0].price.lookup_key || 'basic';

    // Update user subscription
    await this.usersService.updateSubscription(user.id, planId, subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Find user by subscription ID
    const user = await this.usersService.findBySubscriptionId(subscription.id);
    if (!user) {
      console.error(`User not found for subscription: ${subscription.id}`);
      return;
    }

    // Downgrade user to basic plan
    await this.usersService.updateSubscription(user.id, 'basic', null);
  }
}
