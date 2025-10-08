import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoadmapStagesService } from '../services/roadmap-stages.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { StageStatus } from '../entities/roadmap-stage.entity';

@ApiTags('roadmap-stages')
@Controller('roadmap-stages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoadmapStagesController {
  constructor(private readonly roadmapStagesService: RoadmapStagesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific roadmap stage' })
  @ApiResponse({ status: 200, description: 'Roadmap stage retrieved successfully' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapStagesService.findOne(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update roadmap stage status' })
  @ApiResponse({ status: 200, description: 'Roadmap stage status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: StageStatus,
    @GetUser('id') userId: string,
  ) {
    return this.roadmapStagesService.updateStatus(id, status, userId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Recalculate stage progress based on actions' })
  @ApiResponse({ status: 200, description: 'Stage progress updated successfully' })
  updateProgress(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapStagesService.updateProgress(id, userId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark stage as completed' })
  @ApiResponse({ status: 200, description: 'Stage marked as completed' })
  markCompleted(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapStagesService.markAsCompleted(id, userId);
  }
}
