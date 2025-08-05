import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AutoApplyService } from './auto-apply.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateAutoApplyConfigDto } from './dto/create-auto-apply-config.dto';
import { UpdateAutoApplyConfigDto } from './dto/update-auto-apply-config.dto';

@ApiTags('Auto-Apply')
@Controller('auto-apply')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutoApplyController {
  constructor(private readonly autoApplyService: AutoApplyService) {}

  @ApiOperation({ summary: 'Configure auto-apply robot' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or not eligible for auto-apply' })
  @Post('configure')
  create(@GetUser('id') userId: string, @Body() createAutoApplyConfigDto: CreateAutoApplyConfigDto) {
    return this.autoApplyService.create(userId, createAutoApplyConfigDto);
  }

  @ApiOperation({ summary: 'Get auto-apply configuration' })
  @ApiResponse({ status: 200, description: 'Returns the auto-apply configuration' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @Get('configure')
  findOne(@GetUser('id') userId: string) {
    return this.autoApplyService.findOne(userId);
  }

  @ApiOperation({ summary: 'Update auto-apply configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @Put('configure')
  update(@GetUser('id') userId: string, @Body() updateAutoApplyConfigDto: UpdateAutoApplyConfigDto) {
    return this.autoApplyService.update(userId, updateAutoApplyConfigDto);
  }

  @ApiOperation({ summary: 'Delete auto-apply configuration' })
  @ApiResponse({ status: 200, description: 'Configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  @Delete('configure')
  remove(@GetUser('id') userId: string) {
    return this.autoApplyService.remove(userId);
  }

  @ApiOperation({ summary: 'Start auto-apply robot' })
  @ApiResponse({ status: 200, description: 'Auto-apply process started' })
  @ApiResponse({ status: 400, description: 'Bad request or not eligible for auto-apply' })
  @Post('start')
  start(@GetUser('id') userId: string) {
    return this.autoApplyService.startAutoApply(userId);
  }

  @ApiOperation({ summary: 'Stop auto-apply robot' })
  @ApiResponse({ status: 200, description: 'Auto-apply process stopped' })
  @Post('stop')
  stop(@GetUser('id') userId: string) {
    return this.autoApplyService.stopAutoApply(userId);
  }

  @ApiOperation({ summary: 'Get auto-apply status' })
  @ApiResponse({ status: 200, description: 'Returns the auto-apply status' })
  @Get('status')
  getStatus(@GetUser('id') userId: string) {
    return this.autoApplyService.getStatus(userId);
  }
}
