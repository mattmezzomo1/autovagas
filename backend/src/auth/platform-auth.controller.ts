import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PlatformAuthService } from '../services/platform-auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@ApiTags('Platform Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlatformAuthController {
  constructor(private readonly platformAuthService: PlatformAuthService) {}

  // ===== LINKEDIN OAUTH =====

  @ApiOperation({ summary: 'Get LinkedIn OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Returns authorization URL and state' })
  @Get('linkedin/url')
  getLinkedInAuthUrl(@GetUser('id') userId: string) {
    return this.platformAuthService.getLinkedInAuthUrl(userId);
  }

  @ApiOperation({ summary: 'Handle LinkedIn OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed' })
  @Get('linkedin/callback')
  async handleLinkedInCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_parameters`);
    }

    try {
      const result = await this.platformAuthService.handleLinkedInCallback(
        code as string,
        state as string,
      );

      if (result.success) {
        // Salva o resultado na sessão para o frontend capturar
        const resultScript = `
          <script>
            sessionStorage.setItem('linkedin_auth_result', '${JSON.stringify(result)}');
            window.close();
          </script>
        `;
        res.send(resultScript);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=auth_failed`);
      }
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=server_error`);
    }
  }

  // ===== INFOJOBS =====

  @ApiOperation({ summary: 'Login to InfoJobs' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('infojobs/login')
  async loginInfoJobs(
    @GetUser('id') userId: string,
    @Body() credentials: LoginCredentialsDto,
  ) {
    return this.platformAuthService.loginInfoJobs(userId, credentials);
  }

  @ApiOperation({ summary: 'Test InfoJobs connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @Get('infojobs/test')
  async testInfoJobsConnection(@GetUser('id') userId: string) {
    return this.platformAuthService.testConnection(userId, 'infojobs');
  }

  @ApiOperation({ summary: 'Disconnect from InfoJobs' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  @Post('infojobs/disconnect')
  async disconnectInfoJobs(@GetUser('id') userId: string) {
    return this.platformAuthService.disconnectPlatform(userId, 'infojobs');
  }

  // ===== CATHO =====

  @ApiOperation({ summary: 'Login to Catho' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('catho/login')
  async loginCatho(
    @GetUser('id') userId: string,
    @Body() credentials: LoginCredentialsDto,
  ) {
    return this.platformAuthService.loginCatho(userId, credentials);
  }

  @ApiOperation({ summary: 'Test Catho connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @Get('catho/test')
  async testCathoConnection(@GetUser('id') userId: string) {
    return this.platformAuthService.testConnection(userId, 'catho');
  }

  @ApiOperation({ summary: 'Disconnect from Catho' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  @Post('catho/disconnect')
  async disconnectCatho(@GetUser('id') userId: string) {
    return this.platformAuthService.disconnectPlatform(userId, 'catho');
  }

  // ===== INDEED =====

  @ApiOperation({ summary: 'Login to Indeed' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('indeed/login')
  async loginIndeed(
    @GetUser('id') userId: string,
    @Body() credentials: LoginCredentialsDto,
  ) {
    return this.platformAuthService.loginIndeed(userId, credentials);
  }

  @ApiOperation({ summary: 'Test Indeed connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @Get('indeed/test')
  async testIndeedConnection(@GetUser('id') userId: string) {
    return this.platformAuthService.testConnection(userId, 'indeed');
  }

  @ApiOperation({ summary: 'Disconnect from Indeed' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  @Post('indeed/disconnect')
  async disconnectIndeed(@GetUser('id') userId: string) {
    return this.platformAuthService.disconnectPlatform(userId, 'indeed');
  }

  // ===== VAGAS.COM =====

  @ApiOperation({ summary: 'Login to Vagas.com' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('vagas/login')
  async loginVagas(
    @GetUser('id') userId: string,
    @Body() credentials: LoginCredentialsDto,
  ) {
    return this.platformAuthService.loginVagas(userId, credentials);
  }

  @ApiOperation({ summary: 'Test Vagas.com connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @Get('vagas/test')
  async testVagasConnection(@GetUser('id') userId: string) {
    return this.platformAuthService.testConnection(userId, 'vagas');
  }

  @ApiOperation({ summary: 'Disconnect from Vagas.com' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  @Post('vagas/disconnect')
  async disconnectVagas(@GetUser('id') userId: string) {
    return this.platformAuthService.disconnectPlatform(userId, 'vagas');
  }

  // ===== GENERIC ENDPOINTS =====

  @ApiOperation({ summary: 'Get all platform connections for user' })
  @ApiResponse({ status: 200, description: 'Returns all platform connections' })
  @Get('connections')
  async getUserConnections(@GetUser('id') userId: string) {
    return this.platformAuthService.getUserConnections(userId);
  }

  @ApiOperation({ summary: 'Refresh access token for a platform' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @Post(':platform/refresh')
  async refreshToken(
    @Param('platform') platform: string,
    @GetUser('id') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.platformAuthService.refreshToken(userId, platform, refreshToken);
  }

  @ApiOperation({ summary: 'Test connection to any platform' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @Get(':platform/test')
  async testPlatformConnection(
    @Param('platform') platform: string,
    @GetUser('id') userId: string,
  ) {
    const validPlatforms = ['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'];

    if (!validPlatforms.includes(platform)) {
      throw new BadRequestException('Invalid platform');
    }

    return this.platformAuthService.testConnection(userId, platform);
  }

  @ApiOperation({ summary: 'Disconnect from any platform' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  @Post(':platform/disconnect')
  async disconnectFromPlatform(
    @Param('platform') platform: string,
    @GetUser('id') userId: string,
  ) {
    const validPlatforms = ['linkedin', 'infojobs', 'catho', 'indeed', 'vagas'];

    if (!validPlatforms.includes(platform)) {
      throw new BadRequestException('Invalid platform');
    }

    return this.platformAuthService.disconnectPlatform(userId, platform);
  }
}
