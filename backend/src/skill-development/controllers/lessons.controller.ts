import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService, CreateLessonDto } from '../services/lessons.service';
import { UserProgressService, UpdateProgressDto } from '../services/user-progress.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { LessonStatus } from '../entities/lesson.entity';

@ApiTags('lessons')
@Controller('modules/:moduleId/lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly userProgressService: UserProgressService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson in a module' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  create(
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons for a module' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  findAll(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findAllByModule(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lesson' })
  @ApiResponse({ status: 200, description: 'Lesson retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get user progress for a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress retrieved successfully' })
  getProgress(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.lessonsService.getLessonProgress(id, userId);
  }

  @Get(':id/next')
  @ApiOperation({ summary: 'Get the next lesson' })
  @ApiResponse({ status: 200, description: 'Next lesson retrieved successfully' })
  getNext(@Param('id') id: string) {
    return this.lessonsService.getNextLesson(id);
  }

  @Get(':id/previous')
  @ApiOperation({ summary: 'Get the previous lesson' })
  @ApiResponse({ status: 200, description: 'Previous lesson retrieved successfully' })
  getPrevious(@Param('id') id: string) {
    return this.lessonsService.getPreviousLesson(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: Partial<CreateLessonDto>,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lesson status' })
  @ApiResponse({ status: 200, description: 'Lesson status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: LessonStatus,
  ) {
    return this.lessonsService.updateStatus(id, status);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update user progress for a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress updated successfully' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.createOrUpdateLessonProgress(id, userId, updateProgressDto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark lesson as completed' })
  @ApiResponse({ status: 200, description: 'Lesson marked as completed' })
  markCompleted(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.lessonsService.markAsCompleted(id, userId);
  }

  @Patch(':id/video-progress')
  @ApiOperation({ summary: 'Update video progress' })
  @ApiResponse({ status: 200, description: 'Video progress updated successfully' })
  updateVideoProgress(
    @Param('id') id: string,
    @Body('position') position: number,
    @GetUser('id') userId: string,
  ) {
    return this.lessonsService.updateVideoProgress(id, userId, position);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder lessons in a module' })
  @ApiResponse({ status: 200, description: 'Lessons reordered successfully' })
  reorder(
    @Param('moduleId') moduleId: string,
    @Body() lessonOrders: { id: string; order: number }[],
  ) {
    return this.lessonsService.reorderLessons(moduleId, lessonOrders);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}
