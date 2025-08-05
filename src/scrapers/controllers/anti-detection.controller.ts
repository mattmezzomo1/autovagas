import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AdvancedProxyService } from '../services/advanced-proxy.service';
import { UserAgentService } from '../services/user-agent.service';
import { AntiDetectionService } from '../services/anti-detection.service';
import { SessionManagerService } from '../services/session-manager.service';
import { Request } from 'express';

@ApiTags('anti-detection')
@Controller('anti-detection')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AntiDetectionController {
  constructor(
    private readonly advancedProxyService: AdvancedProxyService,
    private readonly userAgentService: UserAgentService,
    private readonly antiDetectionService: AntiDetectionService,
    private readonly sessionManagerService: SessionManagerService,
  ) {}

  // Proxy endpoints
  @Get('proxies')
  @ApiOperation({ summary: 'Get proxy statistics' })
  @ApiResponse({ status: 200, description: 'Proxy statistics' })
  @Roles(UserRole.ADMIN)
  async getProxyStats() {
    return this.advancedProxyService.getProxyStats();
  }

  @Post('proxies/refresh')
  @ApiOperation({ summary: 'Refresh proxies' })
  @ApiResponse({ status: 200, description: 'Proxies refreshed' })
  @Roles(UserRole.ADMIN)
  async refreshProxies() {
    await this.advancedProxyService.refreshProxies();
    return { message: 'Proxies refreshed successfully' };
  }

  @Post('proxies/check-health')
  @ApiOperation({ summary: 'Check proxies health' })
  @ApiResponse({ status: 200, description: 'Proxies health check started' })
  @Roles(UserRole.ADMIN)
  async checkProxiesHealth() {
    await this.advancedProxyService.checkProxiesHealth();
    return { message: 'Proxies health check started' };
  }

  @Post('proxies/blacklist')
  @ApiOperation({ summary: 'Blacklist a proxy' })
  @ApiResponse({ status: 200, description: 'Proxy blacklisted' })
  @Roles(UserRole.ADMIN)
  async blacklistProxy(
    @Body('proxyId') proxyId: string,
    @Body('platform') platform: string,
    @Body('durationHours') durationHours: number = 24,
  ) {
    const proxy = Array.from(this.advancedProxyService['proxies'].values())
      .find(p => p.id === proxyId);
    
    if (!proxy) {
      return { error: 'Proxy not found' };
    }
    
    this.advancedProxyService.blacklistProxy(proxy, platform, durationHours);
    return { message: 'Proxy blacklisted successfully' };
  }

  // User agent endpoints
  @Get('user-agents')
  @ApiOperation({ summary: 'Get user agent statistics' })
  @ApiResponse({ status: 200, description: 'User agent statistics' })
  @Roles(UserRole.ADMIN)
  async getUserAgentStats() {
    return this.userAgentService.getUserAgentStats();
  }

  @Post('user-agents/blacklist')
  @ApiOperation({ summary: 'Blacklist a user agent' })
  @ApiResponse({ status: 200, description: 'User agent blacklisted' })
  @Roles(UserRole.ADMIN)
  async blacklistUserAgent(
    @Body('userAgent') userAgent: string,
    @Body('platform') platform: string,
    @Body('durationHours') durationHours: number = 24,
  ) {
    this.userAgentService.blacklistUserAgent(userAgent, platform, durationHours);
    return { message: 'User agent blacklisted successfully' };
  }

  // Session endpoints
  @Get('sessions')
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({ status: 200, description: 'User sessions' })
  async getUserSessions(
    @Req() req: Request,
    @Query('platform') platform?: string,
  ) {
    const sessions = await this.sessionManagerService.getUserSessions(req.user.sub, platform);
    return { sessions };
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Req() req: Request,
    @Body('platform') platform: string,
    @Body('options') options: any = {},
  ) {
    const sessionId = await this.sessionManagerService.createSession(req.user.sub, platform, options);
    return { sessionId };
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Deactivate a session' })
  @ApiResponse({ status: 200, description: 'Session deactivated' })
  async deactivateSession(
    @Param('id') sessionId: string,
    @Req() req: Request,
  ) {
    // Get session to verify ownership
    const session = await this.sessionManagerService.getSession(sessionId);
    
    if (!session) {
      return { error: 'Session not found' };
    }
    
    // Verify ownership or admin role
    if (session.userId !== req.user.sub && !req.user.roles.includes(UserRole.ADMIN)) {
      return { error: 'Unauthorized' };
    }
    
    await this.sessionManagerService.deactivateSession(sessionId);
    return { message: 'Session deactivated successfully' };
  }

  @Post('sessions/cleanup')
  @ApiOperation({ summary: 'Cleanup old sessions' })
  @ApiResponse({ status: 200, description: 'Sessions cleaned up' })
  @Roles(UserRole.ADMIN)
  async cleanupSessions() {
    await this.sessionManagerService.cleanupSessions();
    return { message: 'Sessions cleaned up successfully' };
  }

  // Test endpoints
  @Post('test/browser')
  @ApiOperation({ summary: 'Test browser creation' })
  @ApiResponse({ status: 200, description: 'Browser test results' })
  @Roles(UserRole.ADMIN)
  async testBrowser(
    @Body('platform') platform: string = 'linkedin',
    @Body('url') url: string = 'https://www.google.com',
    @Body('options') options: any = {},
  ) {
    try {
      const browser = await this.antiDetectionService.createBrowser({
        platform: platform as any,
        ...options,
      });
      
      const page = await this.antiDetectionService.setupPage(browser, url);
      
      // Get page title
      const title = await page.title();
      
      // Take screenshot
      const screenshot = await page.screenshot({ encoding: 'base64' });
      
      // Close browser
      await browser.close();
      
      return {
        success: true,
        title,
        screenshot: `data:image/png;base64,${screenshot}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test/captcha')
  @ApiOperation({ summary: 'Test captcha solving' })
  @ApiResponse({ status: 200, description: 'Captcha test results' })
  @Roles(UserRole.ADMIN)
  async testCaptcha(
    @Body('url') url: string = 'https://www.google.com/recaptcha/api2/demo',
    @Body('captchaType') captchaType: 'recaptcha' | 'hcaptcha' = 'recaptcha',
  ) {
    try {
      const browser = await this.antiDetectionService.createBrowser({
        useCaptchaSolver: true,
      });
      
      const page = await this.antiDetectionService.setupPage(browser, url);
      
      // Solve captcha
      const solved = await this.antiDetectionService.solveCaptcha(page, captchaType);
      
      // Take screenshot
      const screenshot = await page.screenshot({ encoding: 'base64' });
      
      // Close browser
      await browser.close();
      
      return {
        success: solved,
        screenshot: `data:image/png;base64,${screenshot}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
