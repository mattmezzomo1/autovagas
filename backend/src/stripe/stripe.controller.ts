import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Req,
  RawBodyRequest,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @ApiOperation({ summary: 'Create a checkout session' })
  @ApiResponse({ status: 200, description: 'Returns checkout session URL' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  createCheckoutSession(
    @GetUser('id') userId: string,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    return this.stripeService.createCheckoutSession(userId, createCheckoutSessionDto);
  }

  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook handled successfully' })
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    try {
      await this.stripeService.handleWebhook(signature, req.rawBody);
      res.status(HttpStatus.OK).send();
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${error.message}`);
    }
  }
}
