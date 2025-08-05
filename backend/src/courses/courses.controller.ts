import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { RecommendCoursesDto } from './dto/recommend-courses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @ApiOperation({ summary: 'Get all courses with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns all courses' })
  @Get()
  findAll(@Query() filters: CourseFilterDto) {
    return this.coursesService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Returns the course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @ApiOperation({ summary: 'Get all course categories' })
  @ApiResponse({ status: 200, description: 'Returns all course categories' })
  @Get('metadata/categories')
  getCategories() {
    return this.coursesService.getCategories();
  }

  @ApiOperation({ summary: 'Get all course providers' })
  @ApiResponse({ status: 200, description: 'Returns all course providers' })
  @Get('metadata/providers')
  getProviders() {
    return this.coursesService.getProviders();
  }

  @ApiOperation({ summary: 'Get all course tags' })
  @ApiResponse({ status: 200, description: 'Returns all course tags' })
  @Get('metadata/tags')
  getTags() {
    return this.coursesService.getTags();
  }

  @ApiOperation({ summary: 'Get recommended courses for user' })
  @ApiResponse({ status: 200, description: 'Returns recommended courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  recommendCourses(
    @GetUser('id') userId: string,
    @Body() recommendDto: RecommendCoursesDto,
  ) {
    return this.coursesService.recommendCourses(userId, recommendDto);
  }

  @ApiOperation({ summary: 'Enroll user in a course' })
  @ApiResponse({ status: 200, description: 'User enrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  enrollInCourse(@GetUser('id') userId: string, @Param('id') courseId: string) {
    return this.coursesService.enrollUserInCourse(userId, courseId);
  }

  @ApiOperation({ summary: 'Get courses enrolled by user' })
  @ApiResponse({ status: 200, description: 'Returns user courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('user/enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUserCourses(@GetUser('id') userId: string) {
    return this.coursesService.getUserCourses(userId);
  }
}
