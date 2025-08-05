import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from '../services/subscriptions.service';
import { PaymentAuditLogService } from '../services/payment-audit-log.service';
import { SubscriptionPlan } from '../entities/subscription.entity';
import { Request } from 'express';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentAuditLogService: PaymentAuditLogService,
  ) {}

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user active subscription' })
  @ApiResponse({ status: 200, description: 'Returns user active subscription' })
  async getActiveSubscription(@Req() req: Request) {
    const subscription = await this.subscriptionsService.findActiveByUserId(req.user.sub);
    
    if (!subscription) {
      return { active: false };
    }
    
    return {
      active: true,
      subscription,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({ status: 200, description: 'Returns subscription details' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscriptionDetails(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const subscription = await this.subscriptionsService.findById(id);
    
    // Check if subscription belongs to user
    if (subscription.userId !== req.user.sub) {
      throw new NotFoundException('Subscription not found');
    }
    
    return subscription;
  }

  @Put(':id/plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiResponse({ status: 200, description: 'Returns updated subscription' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @HttpCode(HttpStatus.OK)
  async changePlan(
    @Param('id') id: string,
    @Body('plan') plan: SubscriptionPlan,
    @Req() req: Request,
  ) {
    // Change subscription plan
    const subscription = await this.subscriptionsService.changePlan(
      req.user.sub,
      id,
      plan,
    );
    
    // Log the action
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        subscriptionId: id,
        action: 'SUBSCRIPTION_PLAN_CHANGED',
        data: { newPlan: plan },
      },
      req,
    );
    
    return subscription;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Returns canceled subscription' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Param('id') id: string,
    @Body('cancelAtPeriodEnd') cancelAtPeriodEnd: boolean = true,
    @Req() req: Request,
  ) {
    // Cancel subscription
    const subscription = await this.subscriptionsService.cancelSubscription(
      req.user.sub,
      id,
      cancelAtPeriodEnd,
    );
    
    // Log the action
    await this.paymentAuditLogService.createWithRequest(
      {
        userId: req.user.sub,
        subscriptionId: id,
        action: 'SUBSCRIPTION_CANCELED',
        data: { cancelAtPeriodEnd },
      },
      req,
    );
    
    return subscription;
  }
}
