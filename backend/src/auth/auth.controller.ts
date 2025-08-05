import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const result = await this.authService.signup(signupDto);
    
    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(res, result.refreshToken);
    
    return res.status(HttpStatus.CREATED).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @GetUser() user: User, @Res() res: Response) {
    const result = await this.authService.login(user);
    
    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(res, result.refreshToken);
    
    return res.status(HttpStatus.OK).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@GetUser() user: User, @Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const result = await this.authService.refreshTokens(user.id, refreshToken);
    
    // Set new refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(res, result.refreshToken);
    
    return res.status(HttpStatus.OK).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@GetUser() user: User, @Res() res: Response) {
    await this.authService.logout(user.id);
    
    // Clear refresh token cookie
    res.clearCookie('refresh_token');
    
    return res.status(HttpStatus.OK).json({
      message: 'Logout successful',
    });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh',
    });
  }
}
