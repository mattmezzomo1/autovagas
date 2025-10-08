import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserProgressService, UpdateProgressDto } from '../services/user-progress.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('user-progress')
@Controller('user-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get user learning statistics' })
  @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
  getUserStats(@GetUser('id') userId: string) {
    return this.userProgressService.getUserStats(userId);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get user progress for a specific course' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved successfully' })
  getCourseProgress(
    @Param('courseId') courseId: string,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.getUserCourseProgress(userId, courseId);
  }

  @Get('courses/:courseId/all')
  @ApiOperation({ summary: 'Get all user progress items for a course' })
  @ApiResponse({ status: 200, description: 'All course progress retrieved successfully' })
  getAllCourseProgress(
    @Param('courseId') courseId: string,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.getUserProgressByCourse(userId, courseId);
  }

  @Get('courses/:courseId/calculate')
  @ApiOperation({ summary: 'Calculate overall course progress percentage' })
  @ApiResponse({ status: 200, description: 'Course progress calculated successfully' })
  calculateCourseProgress(
    @Param('courseId') courseId: string,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.calculateCourseProgress(userId, courseId);
  }

  @Get('lessons/:lessonId')
  @ApiOperation({ summary: 'Get user progress for a specific lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress retrieved successfully' })
  getLessonProgress(
    @Param('lessonId') lessonId: string,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.getUserLessonProgress(userId, lessonId);
  }

  @Patch('courses/:courseId')
  @ApiOperation({ summary: 'Update user progress for a course' })
  @ApiResponse({ status: 200, description: 'Course progress updated successfully' })
  updateCourseProgress(
    @Param('courseId') courseId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.createOrUpdateCourseProgress(
      userId,
      courseId,
      updateProgressDto,
    );
  }

  @Patch('lessons/:lessonId')
  @ApiOperation({ summary: 'Update user progress for a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress updated successfully' })
  updateLessonProgress(
    @Param('lessonId') lessonId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.createOrUpdateLessonProgress(
      userId,
      lessonId,
      updateProgressDto,
    );
  }

  @Patch('assessments/:assessmentId')
  @ApiOperation({ summary: 'Update user progress for an assessment' })
  @ApiResponse({ status: 200, description: 'Assessment progress updated successfully' })
  updateAssessmentProgress(
    @Param('assessmentId') assessmentId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.createOrUpdateAssessmentProgress(
      userId,
      assessmentId,
      updateProgressDto,
    );
  }

  @Patch('actions/:actionId')
  @ApiOperation({ summary: 'Update user progress for an action' })
  @ApiResponse({ status: 200, description: 'Action progress updated successfully' })
  updateActionProgress(
    @Param('actionId') actionId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @GetUser('id') userId: string,
  ) {
    return this.userProgressService.createOrUpdateActionProgress(
      userId,
      actionId,
      updateProgressDto,
    );
  }
}
