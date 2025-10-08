import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActionsService } from '../services/actions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ActionStatus } from '../entities/action.entity';

@ApiTags('actions')
@Controller('actions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific action' })
  @ApiResponse({ status: 200, description: 'Action retrieved successfully' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.actionsService.findOne(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update action status' })
  @ApiResponse({ status: 200, description: 'Action status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ActionStatus,
    @GetUser('id') userId: string,
  ) {
    return this.actionsService.updateStatus(id, status, userId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update action progress' })
  @ApiResponse({ status: 200, description: 'Action progress updated successfully' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateData: { notes?: string; timeSpentHours?: number },
    @GetUser('id') userId: string,
  ) {
    return this.actionsService.updateProgress(id, updateData, userId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark action as completed' })
  @ApiResponse({ status: 200, description: 'Action marked as completed' })
  markCompleted(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.actionsService.markAsCompleted(id, userId);
  }
}
