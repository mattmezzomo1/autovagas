import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from './payment.entity';
import { Subscription } from './subscription.entity';
import { Invoice } from './invoice.entity';

export enum AuditLogAction {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYMENT_CANCELED = 'PAYMENT_CANCELED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',
  SUBSCRIPTION_PAST_DUE = 'SUBSCRIPTION_PAST_DUE',
  SUBSCRIPTION_UNPAID = 'SUBSCRIPTION_UNPAID',
  SUBSCRIPTION_TRIAL_STARTED = 'SUBSCRIPTION_TRIAL_STARTED',
  SUBSCRIPTION_TRIAL_ENDED = 'SUBSCRIPTION_TRIAL_ENDED',
  SUBSCRIPTION_GRACE_PERIOD_STARTED = 'SUBSCRIPTION_GRACE_PERIOD_STARTED',
  SUBSCRIPTION_GRACE_PERIOD_ENDED = 'SUBSCRIPTION_GRACE_PERIOD_ENDED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_UPDATED = 'INVOICE_UPDATED',
  INVOICE_PAID = 'INVOICE_PAID',
  INVOICE_PAYMENT_FAILED = 'INVOICE_PAYMENT_FAILED',
  INVOICE_VOIDED = 'INVOICE_VOIDED',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  CUSTOMER_DELETED = 'CUSTOMER_DELETED',
  PAYMENT_METHOD_ADDED = 'PAYMENT_METHOD_ADDED',
  PAYMENT_METHOD_UPDATED = 'PAYMENT_METHOD_UPDATED',
  PAYMENT_METHOD_REMOVED = 'PAYMENT_METHOD_REMOVED',
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  WEBHOOK_PROCESSED = 'WEBHOOK_PROCESSED',
  WEBHOOK_FAILED = 'WEBHOOK_FAILED',
}

@Entity('payment_audit_logs')
export class PaymentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId: string;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({
    type: 'enum',
    enum: AuditLogAction,
  })
  action: AuditLogAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeEventId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeEventType: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
