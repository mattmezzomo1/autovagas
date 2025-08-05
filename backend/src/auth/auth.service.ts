import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserRole, SubscriptionPlan } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async signup(signupDto: SignupDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create user
    const newUser = await this.usersService.create({
      ...signupDto,
      password: hashedPassword,
      role: signupDto.isCompany ? UserRole.COMPANY : UserRole.CANDIDATE,
      subscriptionPlan: SubscriptionPlan.BASIC,
      credits: 10,
      autoApplyEnabled: false,
    });

    // Generate tokens
    const tokens = await this.getTokens(newUser.id, newUser.email, newUser.role);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return {
      user: this.excludeSensitiveInfo(newUser),
      ...tokens,
    };
  }

  async login(user: User): Promise<any> {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.excludeSensitiveInfo(user),
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.excludeSensitiveInfo(user),
      ...tokens,
    };
  }

  async logout(userId: string): Promise<boolean> {
    await this.usersService.update(userId, { refreshToken: null });
    return true;
  }

  private async getTokens(userId: string, email: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get('jwt.secret'),
          expiresIn: this.configService.get('jwt.accessTokenExpiration'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get('jwt.secret'),
          expiresIn: this.configService.get('jwt.refreshTokenExpiration'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private excludeSensitiveInfo(user: User): Partial<User> {
    const { password, refreshToken, ...userInfo } = user;
    return userInfo;
  }
}
