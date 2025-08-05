import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public } from '../common/decorators/public.decorator';
import { getImageMulterConfig } from '../common/config/multer.config';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Create a company profile' })
  @ApiResponse({ status: 201, description: 'Company profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or company profile already exists' })
  @ApiBearerAuth()
  @Post()
  @Roles(UserRole.COMPANY)
  create(@GetUser('id') userId: string, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(userId, createCompanyDto);
  }

  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Returns all companies' })
  @Public()
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @ApiOperation({ summary: 'Get a specific company' })
  @ApiResponse({ status: 200, description: 'Returns the company' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Get company profile for current user' })
  @ApiResponse({ status: 200, description: 'Returns the company profile' })
  @ApiResponse({ status: 404, description: 'Company profile not found' })
  @ApiBearerAuth()
  @Get('profile')
  @Roles(UserRole.COMPANY)
  findProfile(@GetUser('id') userId: string) {
    return this.companiesService.findByUserId(userId);
  }

  @ApiOperation({ summary: 'Update company profile' })
  @ApiResponse({ status: 200, description: 'Company profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Company profile not found' })
  @ApiBearerAuth()
  @Put('profile')
  @Roles(UserRole.COMPANY)
  update(@GetUser('id') userId: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(userId, updateCompanyDto);
  }

  @ApiOperation({ summary: 'Upload company logo' })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 404, description: 'Company profile not found' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Post('logo')
  @Roles(UserRole.COMPANY)
  @UseInterceptors(FileInterceptor('logo', getImageMulterConfig(new ConfigService(), 'company-logos')))
  uploadLogo(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Logo file is required');
    }

    return this.companiesService.uploadLogo(userId, file);
  }

  @ApiOperation({ summary: 'Delete company profile' })
  @ApiResponse({ status: 200, description: 'Company profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company profile not found' })
  @ApiBearerAuth()
  @Delete('profile')
  @Roles(UserRole.COMPANY)
  remove(@GetUser('id') userId: string) {
    return this.companiesService.remove(userId);
  }
}
