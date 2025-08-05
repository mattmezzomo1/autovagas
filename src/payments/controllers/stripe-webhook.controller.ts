import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeWebhookService } from '../services/stripe-webhook.service';
import { Request } from 'express';

@ApiTags('stripe-webhook')
@Controller('stripe-webhook')
export class StripeWebhookController {
  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.stripeWebhookService.processWebhook(
      req.rawBody,
      signature,
      req,
    );
  }
}
