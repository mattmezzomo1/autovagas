import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';
import { SubscriptionsService } from './subscriptions.service';
import { InvoicesService } from './invoices.service';
import { PaymentAuditLogService } from './payment-audit-log.service';
import { UsersService } from '../../users/services/users.service';
import { Request } from 'express';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly invoicesService: InvoicesService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Process a Stripe webhook event
   */
  async processWebhook(
    payload: Buffer,
    signature: string,
    req: Request,
  ): Promise<{ received: boolean }> {
    try {
      // Verify webhook signature
      const event = this.stripeService.constructEvent(payload, signature);
      
      // Log webhook received
      await this.paymentAuditLogService.logWebhookReceived(
        event.id,
        event.type,
        event.data.object,
        req,
      );
      
      // Process event based on type
      await this.handleEvent(event);
      
      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      
      // Log webhook failed
      await this.paymentAuditLogService.logWebhookFailed(
        'unknown',
        'unknown',
        error,
        req,
      );
      
      throw error;
    }
  }

  /**
   * Handle a Stripe event
   */
  private async handleEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        // Payment events
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event);
          break;
          
        // Subscription events
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionTrialWillEnd(event);
          break;
          
        // Invoice events
        case 'invoice.created':
          await this.handleInvoiceCreated(event);
          break;
        case 'invoice.updated':
          await this.handleInvoiceUpdated(event);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event);
          break;
          
        // Customer events
        case 'customer.created':
          await this.handleCustomerCreated(event);
          break;
        case 'customer.updated':
          await this.handleCustomerUpdated(event);
          break;
        case 'customer.deleted':
          await this.handleCustomerDeleted(event);
          break;
          
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
      
      // Log webhook processed
      await this.paymentAuditLogService.logWebhookProcessed(
        event.id,
        event.type,
        event.data.object,
      );
    } catch (error) {
      this.logger.error(`Error handling event ${event.type}: ${error.message}`);
      
      // Log webhook failed
      await this.paymentAuditLogService.logWebhookFailed(
        event.id,
        event.type,
        error,
        null,
      );
      
      throw error;
    }
  }

  /**
   * Handle payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Process successful payment
    await this.paymentsService.processSuccessfulPayment(
      paymentIntent.id,
      { stripeEvent: event.id },
    );
  }

  /**
   * Handle payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Process failed payment
    await this.paymentsService.processFailedPayment(
      paymentIntent.id,
      paymentIntent.last_payment_error?.code,
      paymentIntent.last_payment_error?.message,
      { stripeEvent: event.id },
    );
  }

  /**
   * Handle charge.refunded event
   */
  private async handleChargeRefunded(event: Stripe.Event): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    
    // Process refunded payment
    if (charge.payment_intent) {
      await this.paymentsService.processRefundedPayment(
        charge.payment_intent as string,
        charge.refunds.data[0]?.id,
        { stripeEvent: event.id },
      );
    }
  }

  /**
   * Handle customer.subscription.created event
   */
  private async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Create subscription in our database
    await this.subscriptionsService.createFromStripeSubscription(subscription.id);
  }

  /**
   * Handle customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Update subscription in our database
    await this.subscriptionsService.updateFromStripeSubscription(subscription.id);
  }

  /**
   * Handle customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Find subscription in our database
    const existingSubscription = await this.subscriptionsService.findByStripeSubscriptionId(subscription.id);
    
    if (existingSubscription) {
      // Update subscription status to CANCELED
      await this.subscriptionsService.updateStatus(
        existingSubscription.id,
        'CANCELED',
        { stripeEvent: event.id },
      );
    }
  }

  /**
   * Handle customer.subscription.trial_will_end event
   */
  private async handleSubscriptionTrialWillEnd(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Find subscription in our database
    const existingSubscription = await this.subscriptionsService.findByStripeSubscriptionId(subscription.id);
    
    if (existingSubscription && existingSubscription.userId) {
      // Get user
      const user = await this.usersService.findById(existingSubscription.userId);
      
      // TODO: Send email notification about trial ending
      this.logger.log(`Trial will end for user ${user.email} subscription ${subscription.id}`);
    }
  }

  /**
   * Handle invoice.created event
   */
  private async handleInvoiceCreated(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Create invoice in our database
    await this.invoicesService.createOrUpdateFromStripeInvoice(invoice.id);
  }

  /**
   * Handle invoice.updated event
   */
  private async handleInvoiceUpdated(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Update invoice in our database
    await this.invoicesService.createOrUpdateFromStripeInvoice(invoice.id);
  }

  /**
   * Handle invoice.paid event
   */
  private async handleInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Update invoice in our database
    await this.invoicesService.createOrUpdateFromStripeInvoice(invoice.id);
    
    // If invoice has a payment intent, process the payment
    if (invoice.payment_intent) {
      await this.paymentsService.processSuccessfulPayment(
        invoice.payment_intent as string,
        { stripeEvent: event.id, stripeInvoice: invoice.id },
      );
    }
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    
    // Update invoice in our database
    await this.invoicesService.createOrUpdateFromStripeInvoice(invoice.id);
    
    // If invoice has a payment intent, process the failed payment
    if (invoice.payment_intent) {
      await this.paymentsService.processFailedPayment(
        invoice.payment_intent as string,
        'invoice_payment_failed',
        'Invoice payment failed',
        { stripeEvent: event.id, stripeInvoice: invoice.id },
      );
    }
  }

  /**
   * Handle customer.created event
   */
  private async handleCustomerCreated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    
    // If customer has metadata with userId, update user with Stripe customer ID
    if (customer.metadata?.userId) {
      await this.usersService.update(customer.metadata.userId, {
        stripeCustomerId: customer.id,
      });
    }
  }

  /**
   * Handle customer.updated event
   */
  private async handleCustomerUpdated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    
    // If customer has metadata with userId, update user with Stripe customer data
    if (customer.metadata?.userId) {
      // Update user with latest email from Stripe if different
      const user = await this.usersService.findById(customer.metadata.userId);
      
      if (user && customer.email && user.email !== customer.email) {
        await this.usersService.update(user.id, {
          email: customer.email,
        });
      }
    }
  }

  /**
   * Handle customer.deleted event
   */
  private async handleCustomerDeleted(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    
    // If customer has metadata with userId, update user to remove Stripe customer ID
    if (customer.metadata?.userId) {
      await this.usersService.update(customer.metadata.userId, {
        stripeCustomerId: null,
      });
    }
  }
}
