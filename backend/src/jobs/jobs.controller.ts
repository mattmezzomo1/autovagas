import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Create a new job listing' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only companies can create jobs' })
  @ApiBearerAuth()
  @Post()
  @Roles(UserRole.COMPANY)
  create(@GetUser('id') userId: string, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(userId, createJobDto);
  }

  @ApiOperation({ summary: 'Get all job listings with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Returns paginated job listings' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @Public()
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() searchParams: SearchJobsDto,
  ) {
    return this.jobsService.findAll(
      {
        page,
        limit,
        route: 'api/jobs',
      },
      searchParams,
    );
  }

  @ApiOperation({ summary: 'Get job listings for the current company' })
  @ApiResponse({ status: 200, description: 'Returns company job listings' })
  @ApiBearerAuth()
  @Get('company')
  @Roles(UserRole.COMPANY)
  findCompanyJobs(@GetUser('id') userId: string) {
    return this.jobsService.findAllByCompany(userId);
  }

  @ApiOperation({ summary: 'Get a specific job listing' })
  @ApiResponse({ status: 200, description: 'Returns the job listing' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a job listing' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only the owner can update the job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiBearerAuth()
  @Put(':id')
  @Roles(UserRole.COMPANY)
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, userId, updateJobDto);
  }

  @ApiOperation({ summary: 'Delete a job listing' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only the owner can delete the job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiBearerAuth()
  @Delete(':id')
  @Roles(UserRole.COMPANY)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.jobsService.remove(id, userId);
  }

  @ApiOperation({ summary: 'Toggle job active status' })
  @ApiResponse({ status: 200, description: 'Job status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only the owner can update the job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiBearerAuth()
  @Put(':id/toggle-active')
  @Roles(UserRole.COMPANY)
  toggleActive(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.jobsService.toggleActive(id, userId, isActive);
  }

  @ApiOperation({ summary: 'Get similar jobs' })
  @ApiResponse({ status: 200, description: 'Returns similar job listings' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Public()
  @Get(':id/similar')
  getSimilarJobs(@Param('id') id: string) {
    return this.jobsService.getSimilarJobs(id);
  }
}
