import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService, CreateCertificateDto } from '../services/certificates.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new certificate' })
  @ApiResponse({ status: 201, description: 'Certificate created successfully' })
  create(
    @Body() createCertificateDto: CreateCertificateDto,
    @GetUser('id') userId: string,
  ) {
    return this.certificatesService.create(createCertificateDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all certificates for the current user' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  findAll(@GetUser('id') userId: string) {
    return this.certificatesService.findAllByUser(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate statistics for the current user' })
  @ApiResponse({ status: 200, description: 'Certificate statistics retrieved successfully' })
  getStats(@GetUser('id') userId: string) {
    return this.certificatesService.getUserCertificateStats(userId);
  }

  @Post('check-and-issue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check for and issue new certificates based on user progress' })
  @ApiResponse({ status: 200, description: 'Certificates checked and issued successfully' })
  checkAndIssue(@GetUser('id') userId: string) {
    return this.certificatesService.checkAndIssueCertificates(userId);
  }

  @Get('verify')
  @Public()
  @ApiOperation({ summary: 'Verify a certificate by certificate number' })
  @ApiResponse({ status: 200, description: 'Certificate verification result' })
  verify(@Query('number') certificateNumber: string) {
    return this.certificatesService.verifyCertificate(certificateNumber);
  }

  @Get('by-number/:number')
  @Public()
  @ApiOperation({ summary: 'Get certificate details by certificate number' })
  @ApiResponse({ status: 200, description: 'Certificate details retrieved successfully' })
  findByCertificateNumber(@Param('number') certificateNumber: string) {
    return this.certificatesService.findByCertificateNumber(certificateNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific certificate' })
  @ApiResponse({ status: 200, description: 'Certificate retrieved successfully' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.certificatesService.findOne(id, userId);
  }

  @Patch(':id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a certificate' })
  @ApiResponse({ status: 200, description: 'Certificate revoked successfully' })
  revoke(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.certificatesService.revokeCertificate(id, userId);
  }
}
