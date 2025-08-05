import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { StripeService } from './stripe.service';
import { PaymentAuditLogService } from './payment-audit-log.service';
import { AuditLogAction } from '../entities/payment-audit-log.entity';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly stripeService: StripeService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
  ) {}

  /**
   * Create an invoice record
   */
  async create(data: Partial<Invoice>): Promise<Invoice> {
    try {
      const invoice = this.invoiceRepository.create(data);
      const savedInvoice = await this.invoiceRepository.save(invoice);
      
      // Log the action
      await this.paymentAuditLogService.create({
        userId: invoice.userId,
        invoiceId: savedInvoice.id,
        subscriptionId: invoice.subscriptionId,
        action: AuditLogAction.INVOICE_CREATED,
        data: invoice,
      });
      
      return savedInvoice;
    } catch (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find invoice by ID
   */
  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['user', 'subscription'],
    });
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    
    return invoice;
  }

  /**
   * Find invoices by user ID
   */
  async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<[Invoice[], number]> {
    return this.invoiceRepository.findAndCount({
      where: { userId },
      relations: ['subscription'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Find invoices by subscription ID
   */
  async findBySubscriptionId(subscriptionId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { subscriptionId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find invoice by Stripe invoice ID
   */
  async findByStripeInvoiceId(stripeInvoiceId: string): Promise<Invoice> {
    return this.invoiceRepository.findOne({
      where: { stripeInvoiceId },
    });
  }

  /**
   * Update invoice status
   */
  async updateStatus(
    id: string,
    status: InvoiceStatus,
    metadata: any = {},
  ): Promise<Invoice> {
    const invoice = await this.findById(id);
    
    // Update status and metadata
    invoice.status = status;
    invoice.metadata = { ...invoice.metadata, ...metadata };
    
    // Update timestamps based on status
    if (status === InvoiceStatus.PAID) {
      invoice.paidAt = new Date();
    } else if (status === InvoiceStatus.VOID) {
      invoice.voidedAt = new Date();
    }
    
    const updatedInvoice = await this.invoiceRepository.save(invoice);
    
    // Log the action
    await this.paymentAuditLogService.create({
      userId: invoice.userId,
      invoiceId: invoice.id,
      subscriptionId: invoice.subscriptionId,
      action: this.mapStatusToAction(status),
      data: { 
        oldStatus: invoice.status, 
        newStatus: status,
        metadata,
      },
    });
    
    return updatedInvoice;
  }

  /**
   * Create or update invoice from Stripe invoice
   */
  async createOrUpdateFromStripeInvoice(stripeInvoiceId: string): Promise<Invoice> {
    try {
      // Get invoice from Stripe
      const stripeInvoice = await this.stripeService.getInvoice(stripeInvoiceId);
      
      // Check if invoice already exists
      let invoice = await this.findByStripeInvoiceId(stripeInvoiceId);
      
      if (invoice) {
        // Update existing invoice
        invoice.status = this.mapStripeStatusToStatus(stripeInvoice.status);
        invoice.amount = stripeInvoice.total / 100; // Convert from cents
        invoice.amountPaid = stripeInvoice.amount_paid / 100;
        invoice.amountRemaining = stripeInvoice.amount_remaining / 100;
        invoice.description = stripeInvoice.description;
        invoice.number = stripeInvoice.number;
        invoice.receiptUrl = stripeInvoice.receipt_url;
        invoice.hostedInvoiceUrl = stripeInvoice.hosted_invoice_url;
        invoice.pdfUrl = stripeInvoice.invoice_pdf;
        invoice.lines = stripeInvoice.lines.data;
        invoice.metadata = { ...invoice.metadata, ...stripeInvoice.metadata };
        
        // Update timestamps
        if (stripeInvoice.due_date) {
          invoice.dueDate = new Date(stripeInvoice.due_date * 1000);
        }
        
        if (stripeInvoice.period_start) {
          invoice.periodStart = new Date(stripeInvoice.period_start * 1000);
        }
        
        if (stripeInvoice.period_end) {
          invoice.periodEnd = new Date(stripeInvoice.period_end * 1000);
        }
        
        if (stripeInvoice.status === 'paid' && !invoice.paidAt) {
          invoice.paidAt = new Date();
        }
        
        const updatedInvoice = await this.invoiceRepository.save(invoice);
        
        // Log the action
        await this.paymentAuditLogService.create({
          userId: invoice.userId,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId,
          action: AuditLogAction.INVOICE_UPDATED,
          data: { stripeInvoice },
        });
        
        return updatedInvoice;
      } else {
        // Create new invoice
        const userId = stripeInvoice.metadata.userId || stripeInvoice.customer_email;
        const subscriptionId = stripeInvoice.metadata.subscriptionId || stripeInvoice.subscription;
        
        // Create invoice
        return this.create({
          userId,
          subscriptionId,
          stripeInvoiceId: stripeInvoice.id,
          stripeCustomerId: stripeInvoice.customer as string,
          status: this.mapStripeStatusToStatus(stripeInvoice.status),
          amount: stripeInvoice.total / 100, // Convert from cents
          amountPaid: stripeInvoice.amount_paid / 100,
          amountRemaining: stripeInvoice.amount_remaining / 100,
          currency: stripeInvoice.currency.toUpperCase(),
          description: stripeInvoice.description,
          number: stripeInvoice.number,
          receiptUrl: stripeInvoice.receipt_url,
          hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
          pdfUrl: stripeInvoice.invoice_pdf,
          lines: stripeInvoice.lines.data,
          metadata: stripeInvoice.metadata,
          dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : null,
          periodStart: stripeInvoice.period_start ? new Date(stripeInvoice.period_start * 1000) : null,
          periodEnd: stripeInvoice.period_end ? new Date(stripeInvoice.period_end * 1000) : null,
          paidAt: stripeInvoice.status === 'paid' ? new Date() : null,
        });
      }
    } catch (error) {
      this.logger.error(`Error creating or updating invoice from Stripe invoice ${stripeInvoiceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map Stripe invoice status to our InvoiceStatus enum
   */
  private mapStripeStatusToStatus(stripeStatus: string): InvoiceStatus {
    switch (stripeStatus) {
      case 'draft':
        return InvoiceStatus.DRAFT;
      case 'open':
        return InvoiceStatus.OPEN;
      case 'paid':
        return InvoiceStatus.PAID;
      case 'uncollectible':
        return InvoiceStatus.UNCOLLECTIBLE;
      case 'void':
        return InvoiceStatus.VOID;
      default:
        return InvoiceStatus.DRAFT;
    }
  }

  /**
   * Map invoice status to audit log action
   */
  private mapStatusToAction(status: InvoiceStatus): AuditLogAction {
    switch (status) {
      case InvoiceStatus.PAID:
        return AuditLogAction.INVOICE_PAID;
      case InvoiceStatus.UNCOLLECTIBLE:
        return AuditLogAction.INVOICE_PAYMENT_FAILED;
      case InvoiceStatus.VOID:
        return AuditLogAction.INVOICE_VOIDED;
      default:
        return AuditLogAction.INVOICE_UPDATED;
    }
  }
}
