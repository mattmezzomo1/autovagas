import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { InvoicesService } from '../services/invoices.service';
import { StripeService } from '../services/stripe.service';
import { PaymentAuditLogService } from '../services/payment-audit-log.service';
import { SubscriptionPlan, SubscriptionInterval } from '../entities/subscription.entity';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly frontendUrl: string;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly invoicesService: InvoicesService,
    private readonly stripeService: StripeService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'Returns user payments' })
  async getUserPayments(
    @Req() req: Request,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const [payments, total] = await this.paymentsService.findByUserId(req.user.sub, limit, offset);
    
    return {
      payments,
      total,
      limit,
      offset,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentDetails(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const payment = await this.paymentsService.findById(id);
    
    // Check if payment belongs to user
    if (payment.userId !== req.user.sub) {
      throw new NotFoundException('Payment not found');
    }
    
    return payment;
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session for subscription' })
  @ApiResponse({ status: 200, description: 'Returns checkout session URL' })
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Body('plan') plan: SubscriptionPlan,
    @Body('interval') interval: SubscriptionInterval = SubscriptionInterval.MONTH,
    @Body('successUrl') successUrl?: string,
    @Body('cancelUrl') cancelUrl?: string,
    @Req() req: Request,
  ) {
    // Use provided URLs or default to frontend URLs
    const success = successUrl || `${this.frontendUrl}/payment/success`;
    const cancel = cancelUrl || `${this.frontendUrl}/payment/cancel`;
    
    // Create checkout session
    const session = await this.subscriptionsService.createCheckoutSession(
      req.user.sub,
      plan,
      interval,
      success,
      cancel,
    );
    
    // Log the action
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        action: 'PAYMENT_CREATED',
        data: { plan, interval, successUrl, cancelUrl },
      },
      req,
    );
    
    return session;
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create customer portal session' })
  @ApiResponse({ status: 200, description: 'Returns portal session URL' })
  async createPortalSession(
    @Query('returnUrl') returnUrl?: string,
    @Req() req: Request,
  ) {
    // Get user's active subscription
    const subscription = await this.subscriptionsService.findActiveByUserId(req.user.sub);
    
    if (!subscription || !subscription.stripeCustomerId) {
      throw new BadRequestException('No active subscription found');
    }
    
    // Use provided URL or default to frontend URL
    const returnTo = returnUrl || `${this.frontendUrl}/account/subscription`;
    
    // Create portal session
    const session = await this.stripeService.createPortalSession(
      subscription.stripeCustomerId,
      returnTo,
    );
    
    // Log the action
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        subscriptionId: subscription.id,
        action: 'CUSTOMER_PORTAL_ACCESSED',
        data: { returnUrl },
      },
      req,
    );
    
    return { url: session.url };
  }
}
