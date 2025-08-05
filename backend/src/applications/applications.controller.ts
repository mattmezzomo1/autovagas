import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or already applied' })
  @Post()
  @Roles(UserRole.CANDIDATE)
  create(@GetUser('id') userId: string, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(userId, createApplicationDto);
  }

  @ApiOperation({ summary: 'Get all applications for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all user applications' })
  @Get()
  @Roles(UserRole.CANDIDATE)
  findAll(@GetUser('id') userId: string) {
    return this.applicationsService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get all applications for a specific job' })
  @ApiResponse({ status: 200, description: 'Returns all applications for the job' })
  @ApiResponse({ status: 403, description: 'Forbidden - only the job owner can view applications' })
  @Get('job/:jobId')
  @Roles(UserRole.COMPANY)
  findAllForJob(@Param('jobId') jobId: string, @GetUser('id') companyUserId: string) {
    return this.applicationsService.findAllForJob(jobId, companyUserId);
  }

  @ApiOperation({ summary: 'Get a specific application' })
  @ApiResponse({ status: 200, description: 'Returns the application' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    const isCompany = role === UserRole.COMPANY;
    return this.applicationsService.findOne(id, userId, isCompany);
  }

  @ApiOperation({ summary: 'Update application status (company only)' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - only the job owner can update status' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Put(':id/status')
  @Roles(UserRole.COMPANY)
  updateStatus(
    @Param('id') id: string,
    @GetUser('id') companyUserId: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, companyUserId, updateStatusDto);
  }

  @ApiOperation({ summary: 'Withdraw an application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @Put(':id/withdraw')
  @Roles(UserRole.CANDIDATE)
  withdraw(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.applicationsService.withdraw(id, userId);
  }
}
