import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from '../entities/payment.entity';
import { StripeService } from './stripe.service';
import { UsersService } from '../../users/services/users.service';
import { SubscriptionsService } from './subscriptions.service';
import { PaymentAuditLogService } from './payment-audit-log.service';
import { AuditLogAction } from '../entities/payment-audit-log.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a payment record
   */
  async create(data: Partial<Payment>): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create(data);
      const savedPayment = await this.paymentRepository.save(payment);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId: payment.userId,
        paymentId: savedPayment.id,
        subscriptionId: payment.subscriptionId,
        action: AuditLogAction.PAYMENT_CREATED,
        data: payment,
      });
      
      return savedPayment;
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'subscription'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    return payment;
  }

  /**
   * Find payments by user ID
   */
  async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<[Payment[], number]> {
    return this.paymentRepository.findAndCount({
      where: { userId },
      relations: ['subscription'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find payments by subscription ID
   */
  async findBySubscriptionId(subscriptionId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { subscriptionId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find payment by Stripe payment intent ID
   */
  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment> {
    return this.paymentRepository.findOne({
      where: { stripePaymentIntentId },
    });
  }

  /**
   * Update payment status
   */
  async updateStatus(
    id: string,
    status: PaymentStatus,
    metadata: any = {},
  ): Promise<Payment> {
    const payment = await this.findById(id);
    
    // Update status and metadata
    payment.status = status;
    payment.metadata = { ...payment.metadata, ...metadata };
    
    // Update timestamps based on status
    if (status === PaymentStatus.SUCCEEDED) {
      payment.paidAt = new Date();
    } else if (status === PaymentStatus.REFUNDED) {
      payment.refundedAt = new Date();
    } else if (status === PaymentStatus.CANCELED) {
      payment.canceledAt = new Date();
    }
    
    const updatedPayment = await this.paymentRepository.save(payment);
    
    // Log the action
    await this.paymentAuditLogService.create({
      userId: payment.userId,
      paymentId: payment.id,
      subscriptionId: payment.subscriptionId,
      action: this.mapStatusToAction(status),
      data: { 
        oldStatus: payment.status, 
        newStatus: status,
        metadata,
      },
    });
    
    return updatedPayment;
  }

  /**
   * Process a successful payment
   */
  async processSuccessfulPayment(
    paymentIntentId: string,
    metadata: any = {},
  ): Promise<Payment> {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
      
      // Find existing payment or create a new one
      let payment = await this.findByStripePaymentIntentId(paymentIntentId);
      
      if (!payment) {
        // Create new payment record
        const userId = paymentIntent.metadata.userId;
        const subscriptionId = paymentIntent.metadata.subscriptionId;
        
        payment = await this.create({
          userId,
          subscriptionId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          status: PaymentStatus.PENDING,
          paymentMethod: this.mapStripePaymentMethodToPaymentMethod(paymentIntent.payment_method_types[0]),
          paymentType: PaymentType.SUBSCRIPTION,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer as string,
          metadata: paymentIntent.metadata,
        });
      }
      
      // Update payment status
      payment = await this.updateStatus(
        payment.id,
        PaymentStatus.SUCCEEDED,
        {
          ...metadata,
          stripePaymentIntent: paymentIntent,
        },
      );
      
      // If this is a subscription payment, update subscription status
      if (payment.subscriptionId) {
        await this.subscriptionsService.updateAfterSuccessfulPayment(payment.subscriptionId);
      }
      
      return payment;
    } catch (error) {
      this.logger.error(`Error processing successful payment ${paymentIntentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a failed payment
   */
  async processFailedPayment(
    paymentIntentId: string,
    failureCode: string,
    failureMessage: string,
    metadata: any = {},
  ): Promise<Payment> {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
      
      // Find existing payment or create a new one
      let payment = await this.findByStripePaymentIntentId(paymentIntentId);
      
      if (!payment) {
        // Create new payment record
        const userId = paymentIntent.metadata.userId;
        const subscriptionId = paymentIntent.metadata.subscriptionId;
        
        payment = await this.create({
          userId,
          subscriptionId,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency.toUpperCase(),
          status: PaymentStatus.PENDING,
          paymentMethod: this.mapStripePaymentMethodToPaymentMethod(paymentIntent.payment_method_types[0]),
          paymentType: PaymentType.SUBSCRIPTION,
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer as string,
          metadata: paymentIntent.metadata,
        });
      }
      
      // Update payment with failure details
      payment.failureCode = failureCode;
      payment.failureMessage = failureMessage;
      payment.metadata = { ...payment.metadata, ...metadata };
      
      // Update payment status
      payment = await this.updateStatus(
        payment.id,
        PaymentStatus.FAILED,
        {
          ...metadata,
          stripePaymentIntent: paymentIntent,
          failureCode,
          failureMessage,
        },
      );
      
      // If this is a subscription payment, update subscription status
      if (payment.subscriptionId) {
        await this.subscriptionsService.updateAfterFailedPayment(payment.subscriptionId);
      }
      
      return payment;
    } catch (error) {
      this.logger.error(`Error processing failed payment ${paymentIntentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a refunded payment
   */
  async processRefundedPayment(
    paymentIntentId: string,
    refundId: string,
    metadata: any = {},
  ): Promise<Payment> {
    try {
      // Find existing payment
      const payment = await this.findByStripePaymentIntentId(paymentIntentId);
      
      if (!payment) {
        throw new NotFoundException(`Payment with Stripe payment intent ID ${paymentIntentId} not found`);
      }
      
      // Update payment with refund details
      payment.stripeRefundId = refundId;
      
      // Update payment status
      return this.updateStatus(
        payment.id,
        PaymentStatus.REFUNDED,
        {
          ...metadata,
          refundId,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing refunded payment ${paymentIntentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map Stripe payment method to our PaymentMethod enum
   */
  private mapStripePaymentMethodToPaymentMethod(stripePaymentMethod: string): PaymentMethod {
    switch (stripePaymentMethod) {
      case 'card':
        return PaymentMethod.CREDIT_CARD;
      case 'boleto':
        return PaymentMethod.BOLETO;
      case 'pix':
        return PaymentMethod.PIX;
      default:
        return PaymentMethod.CREDIT_CARD;
    }
  }

  /**
   * Map payment status to audit log action
   */
  private mapStatusToAction(status: PaymentStatus): AuditLogAction {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return AuditLogAction.PAYMENT_SUCCEEDED;
      case PaymentStatus.FAILED:
        return AuditLogAction.PAYMENT_FAILED;
      case PaymentStatus.REFUNDED:
        return AuditLogAction.PAYMENT_REFUNDED;
      case PaymentStatus.CANCELED:
        return AuditLogAction.PAYMENT_CANCELED;
      default:
        return AuditLogAction.PAYMENT_UPDATED;
    }
  }
}
