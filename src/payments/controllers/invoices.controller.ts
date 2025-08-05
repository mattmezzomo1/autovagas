import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InvoicesService } from '../services/invoices.service';
import { Request } from 'express';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user invoices' })
  @ApiResponse({ status: 200, description: 'Returns user invoices' })
  async getUserInvoices(
    @Req() req: Request,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const [invoices, total] = await this.invoicesService.findByUserId(req.user.sub, limit, offset);
    
    return {
      invoices,
      total,
      limit,
      offset,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiResponse({ status: 200, description: 'Returns invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoiceDetails(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const invoice = await this.invoicesService.findById(id);
    
    // Check if invoice belongs to user
    if (invoice.userId !== req.user.sub) {
      throw new NotFoundException('Invoice not found');
    }
    
    return invoice;
  }
}
