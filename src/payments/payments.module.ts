import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Payment } from './entities/payment.entity';
import { Subscription } from './entities/subscription.entity';
import { Invoice } from './entities/invoice.entity';
import { PaymentAuditLog } from './entities/payment-audit-log.entity';

// Services
import { StripeService } from './services/stripe.service';
import { PaymentsService } from './services/payments.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { InvoicesService } from './services/invoices.service';
import { PaymentAuditLogService } from './services/payment-audit-log.service';
import { StripeWebhookService } from './services/stripe-webhook.service';

// Controllers
import { PaymentsController } from './controllers/payments.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PaymentPagesController } from './controllers/payment-pages.controller';

// Other modules
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Subscription,
      Invoice,
      PaymentAuditLog,
    ]),
    ConfigModule,
    ScheduleModule.forRoot(),
    UsersModule,
  ],
  controllers: [
    PaymentsController,
    SubscriptionsController,
    InvoicesController,
    StripeWebhookController,
    PaymentPagesController,
  ],
  providers: [
    StripeService,
    PaymentsService,
    SubscriptionsService,
    InvoicesService,
    PaymentAuditLogService,
    StripeWebhookService,
  ],
  exports: [
    StripeService,
    PaymentsService,
    SubscriptionsService,
    InvoicesService,
    PaymentAuditLogService,
  ],
})
export class PaymentsModule {}
