import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CareerGoalsService } from '../services/career-goals.service';
import { RoadmapGeneratorService } from '../services/roadmap-generator.service';
import { CreateCareerGoalDto } from '../dto/create-career-goal.dto';
import { GenerateRoadmapDto } from '../dto/generate-roadmap.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CareerGoalStatus } from '../entities/career-goal.entity';

@ApiTags('career-goals')
@Controller('career-goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerGoalsController {
  constructor(
    private readonly careerGoalsService: CareerGoalsService,
    private readonly roadmapGeneratorService: RoadmapGeneratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new career goal' })
  @ApiResponse({ status: 201, description: 'Career goal created successfully' })
  create(@Body() createCareerGoalDto: CreateCareerGoalDto, @GetUser('id') userId: string) {
    return this.careerGoalsService.create(createCareerGoalDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all career goals for the current user' })
  @ApiResponse({ status: 200, description: 'Career goals retrieved successfully' })
  findAll(@GetUser('id') userId: string) {
    return this.careerGoalsService.findAllByUser(userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active career goals for the current user' })
  @ApiResponse({ status: 200, description: 'Active career goals retrieved successfully' })
  findActive(@GetUser('id') userId: string) {
    return this.careerGoalsService.getActiveGoals(userId);
  }

  @Get('by-timeframe')
  @ApiOperation({ summary: 'Get career goals by timeframe' })
  @ApiResponse({ status: 200, description: 'Career goals by timeframe retrieved successfully' })
  findByTimeframe(
    @Query('timeframe') timeframe: string,
    @GetUser('id') userId: string,
  ) {
    return this.careerGoalsService.getGoalsByTimeframe(userId, timeframe);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific career goal' })
  @ApiResponse({ status: 200, description: 'Career goal retrieved successfully' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.careerGoalsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a career goal' })
  @ApiResponse({ status: 200, description: 'Career goal updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateCareerGoalDto: Partial<CreateCareerGoalDto>,
    @GetUser('id') userId: string,
  ) {
    return this.careerGoalsService.update(id, updateCareerGoalDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update career goal status' })
  @ApiResponse({ status: 200, description: 'Career goal status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: CareerGoalStatus,
    @GetUser('id') userId: string,
  ) {
    return this.careerGoalsService.updateStatus(id, status, userId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update career goal progress' })
  @ApiResponse({ status: 200, description: 'Career goal progress updated successfully' })
  updateProgress(
    @Param('id') id: string,
    @Body('progressPercentage') progressPercentage: number,
    @GetUser('id') userId: string,
  ) {
    return this.careerGoalsService.updateProgress(id, progressPercentage, userId);
  }

  @Post(':id/generate-roadmap')
  @ApiOperation({ summary: 'Generate AI roadmap for a career goal' })
  @ApiResponse({ status: 201, description: 'Roadmap generated successfully' })
  generateRoadmap(
    @Param('id') careerGoalId: string,
    @Body() generateRoadmapDto: Omit<GenerateRoadmapDto, 'careerGoalId'>,
    @GetUser('id') userId: string,
  ) {
    return this.roadmapGeneratorService.generateRoadmap(
      { ...generateRoadmapDto, careerGoalId },
      userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a career goal' })
  @ApiResponse({ status: 200, description: 'Career goal deleted successfully' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.careerGoalsService.remove(id, userId);
  }
}
