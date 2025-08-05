import {
  Controller,
  Get,
  Res,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from '../services/subscriptions.service';
import { PaymentAuditLogService } from '../services/payment-audit-log.service';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('payment-pages')
@Controller('payment')
export class PaymentPagesController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
  ) {}

  @Get('success')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Payment success page' })
  @ApiResponse({ status: 200, description: 'Returns payment success page' })
  async getSuccessPage(
    @Res() res: Response,
    @Query('session_id') sessionId: string,
    @Req() req: Request,
  ) {
    // Log the successful payment
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        action: 'PAYMENT_SUCCESS_PAGE_VIEWED',
        data: { sessionId },
      },
      req,
    );
    
    // Get active subscription
    const subscription = await this.subscriptionsService.findActiveByUserId(req.user.sub);
    
    // Read the HTML file
    const filePath = path.join(__dirname, '..', 'views', 'payment-success.html');
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Replace placeholders with actual data if subscription exists
    if (subscription) {
      const planName = subscription.plan;
      const planPrice = `R$ ${subscription.amount.toFixed(2)}/${subscription.interval.toLowerCase()}`;
      const status = subscription.status;
      
      // Format next billing date
      const nextBillingDate = subscription.currentPeriodEnd 
        ? subscription.currentPeriodEnd.toLocaleDateString('pt-BR')
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
      
      // Replace placeholders
      html = html
        .replace('id="plan-name">Premium</span>', `id="plan-name">${planName}</span>`)
        .replace('id="plan-price">R$ 49,90/mês</span>', `id="plan-price">${planPrice}</span>`)
        .replace('id="subscription-status">Ativo</span>', `id="subscription-status">${status}</span>`)
        .replace('id="next-billing-date">15/06/2023</span>', `id="next-billing-date">${nextBillingDate}</span>`);
    }
    
    // Send the HTML response
    res.type('text/html').send(html);
  }

  @Get('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Payment cancel page' })
  @ApiResponse({ status: 200, description: 'Returns payment cancel page' })
  async getCancelPage(
    @Res() res: Response,
    @Query('session_id') sessionId: string,
    @Req() req: Request,
  ) {
    // Log the canceled payment
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        action: 'PAYMENT_CANCEL_PAGE_VIEWED',
        data: { sessionId },
      },
      req,
    );
    
    // Read the HTML file
    const filePath = path.join(__dirname, '..', 'views', 'payment-cancel.html');
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Send the HTML response
    res.type('text/html').send(html);
  }
}
