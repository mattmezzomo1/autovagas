import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoadmapsService } from '../services/roadmaps.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoadmapStatus } from '../entities/roadmap.entity';

@ApiTags('roadmaps')
@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roadmaps for the current user' })
  @ApiResponse({ status: 200, description: 'Roadmaps retrieved successfully' })
  findAll(@GetUser('id') userId: string) {
    return this.roadmapsService.findAllByUser(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active roadmaps for the current user' })
  @ApiResponse({ status: 200, description: 'Active roadmaps retrieved successfully' })
  findActive(@GetUser('id') userId: string) {
    return this.roadmapsService.getActiveRoadmaps(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific roadmap' })
  @ApiResponse({ status: 200, description: 'Roadmap retrieved successfully' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapsService.findOne(id, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get roadmap statistics' })
  @ApiResponse({ status: 200, description: 'Roadmap statistics retrieved successfully' })
  getStats(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapsService.getRoadmapStats(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update roadmap status' })
  @ApiResponse({ status: 200, description: 'Roadmap status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RoadmapStatus,
    @GetUser('id') userId: string,
  ) {
    return this.roadmapsService.updateStatus(id, status, userId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Recalculate roadmap progress' })
  @ApiResponse({ status: 200, description: 'Roadmap progress updated successfully' })
  updateProgress(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapsService.updateProgress(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a roadmap' })
  @ApiResponse({ status: 200, description: 'Roadmap deleted successfully' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.roadmapsService.remove(id, userId);
  }
}
