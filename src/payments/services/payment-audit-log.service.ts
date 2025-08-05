import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAuditLog, AuditLogAction } from '../entities/payment-audit-log.entity';
import { Request } from 'express';

@Injectable()
export class PaymentAuditLogService {
  private readonly logger = new Logger(PaymentAuditLogService.name);

  constructor(
    @InjectRepository(PaymentAuditLog)
    private readonly paymentAuditLogRepository: Repository<PaymentAuditLog>,
  ) {}

  /**
   * Create a payment audit log
   */
  async create(data: Partial<PaymentAuditLog>): Promise<PaymentAuditLog> {
    try {
      const auditLog = this.paymentAuditLogRepository.create(data);
      return this.paymentAuditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Error creating payment audit log: ${error.message}`);
      // Don't throw error, just log it
      return null;
    }
  }

  /**
   * Create a payment audit log with request information
   */
  async createWithRequest(
    data: Partial<PaymentAuditLog>,
    req: Request,
  ): Promise<PaymentAuditLog> {
    try {
      // Add IP address and user agent
      data.ipAddress = req.ip;
      data.userAgent = req.headers['user-agent'] as string;
      
      return this.create(data);
    } catch (error) {
      this.logger.error(`Error creating payment audit log with request: ${error.message}`);
      // Don't throw error, just log it
      return null;
    }
  }

  /**
   * Find audit logs by user ID
   */
  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[PaymentAuditLog[], number]> {
    return this.paymentAuditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find audit logs by payment ID
   */
  async findByPaymentId(
    paymentId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[PaymentAuditLog[], number]> {
    return this.paymentAuditLogRepository.findAndCount({
      where: { paymentId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find audit logs by subscription ID
   */
  async findBySubscriptionId(
    subscriptionId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[PaymentAuditLog[], number]> {
    return this.paymentAuditLogRepository.findAndCount({
      where: { subscriptionId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find audit logs by invoice ID
   */
  async findByInvoiceId(
    invoiceId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[PaymentAuditLog[], number]> {
    return this.paymentAuditLogRepository.findAndCount({
      where: { invoiceId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find audit logs by action
   */
  async findByAction(
    action: AuditLogAction,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[PaymentAuditLog[], number]> {
    return this.paymentAuditLogRepository.findAndCount({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find audit logs by Stripe event ID
   */
  async findByStripeEventId(stripeEventId: string): Promise<PaymentAuditLog[]> {
    return this.paymentAuditLogRepository.find({
      where: { stripeEventId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Log webhook received
   */
  async logWebhookReceived(
    stripeEventId: string,
    stripeEventType: string,
    data: any,
    req: Request,
  ): Promise<PaymentAuditLog> {
    return this.createWithRequest(
      {
        action: AuditLogAction.WEBHOOK_RECEIVED,
        stripeEventId,
        stripeEventType,
        data,
      },
      req,
    );
  }

  /**
   * Log webhook processed
   */
  async logWebhookProcessed(
    stripeEventId: string,
    stripeEventType: string,
    data: any,
    userId?: string,
    paymentId?: string,
    subscriptionId?: string,
    invoiceId?: string,
  ): Promise<PaymentAuditLog> {
    return this.create({
      userId,
      paymentId,
      subscriptionId,
      invoiceId,
      action: AuditLogAction.WEBHOOK_PROCESSED,
      stripeEventId,
      stripeEventType,
      data,
    });
  }

  /**
   * Log webhook failed
   */
  async logWebhookFailed(
    stripeEventId: string,
    stripeEventType: string,
    error: any,
    req: Request,
  ): Promise<PaymentAuditLog> {
    return this.createWithRequest(
      {
        action: AuditLogAction.WEBHOOK_FAILED,
        stripeEventId,
        stripeEventType,
        data: { error: error.message, stack: error.stack },
      },
      req,
    );
  }
}
