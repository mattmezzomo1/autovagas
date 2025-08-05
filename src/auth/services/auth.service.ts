import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { EmailService } from '../../email/services/email.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { SocialLoginDto } from '../dto/social-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar se o email já existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar o usuário
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Gerar tokens
    const tokens = this.generateTokens(user);

    // Salvar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuário pelo email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = this.generateTokens(user);

    // Salvar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    // Limpar refresh token
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true };
  }

  async validateSocialLogin(provider: string, profile: any) {
    // Verificar se o usuário já existe
    let user = await this.usersService.findByEmail(profile.email);
    
    if (!user) {
      // Criar novo usuário
      user = await this.usersService.create({
        email: profile.email,
        fullName: profile.fullName,
        profileImage: profile.profileImage,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Senha aleatória
        linkedinUrl: profile.linkedinUrl,
      });
    }
    
    // Gerar tokens
    const tokens = this.generateTokens(user);
    
    // Salvar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    
    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  async handleSocialLogin(socialLoginDto: SocialLoginDto) {
    // Aqui você implementaria a lógica para verificar o token social
    // e obter as informações do usuário do provedor
    // Esta é uma implementação simplificada
    
    const userInfo = await this.verifyExternalToken(
      socialLoginDto.token,
      socialLoginDto.provider,
    );
    
    return this.validateSocialLogin(socialLoginDto.provider, userInfo);
  }

  private async verifyExternalToken(token: string, provider: string): Promise<any> {
    // Implementação simplificada
    // Em um cenário real, você verificaria o token com o provedor
    // e obteria as informações do usuário
    
    // Exemplo para Google:
    if (provider === 'google') {
      // Verificar token com a API do Google
      // const ticket = await client.verifyIdToken({...});
      // return ticket.getPayload();
      
      // Simulação:
      return {
        email: 'user@example.com',
        fullName: 'Usuário Teste',
        profileImage: 'https://example.com/profile.jpg',
      };
    }
    
    // Exemplo para LinkedIn:
    if (provider === 'linkedin') {
      // Verificar token com a API do LinkedIn
      // const response = await axios.get('https://api.linkedin.com/v2/me', {...});
      // return response.data;
      
      // Simulação:
      return {
        email: 'user@example.com',
        fullName: 'Usuário Teste',
        profileImage: 'https://example.com/profile.jpg',
        linkedinUrl: 'https://linkedin.com/in/usuario-teste',
      };
    }
    
    throw new UnauthorizedException('Provedor não suportado');
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Não revelamos se o email existe ou não por segurança
      return { message: 'Se o email existir, você receberá instruções para redefinir sua senha.' };
    }

    // Gerar token de redefinição de senha
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { 
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '1h' 
      },
    );

    // Salvar token no usuário
    await this.usersService.savePasswordResetToken(user.id, resetToken);

    // Enviar email com link para redefinição de senha
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Se o email existir, você receberá instruções para redefinir sua senha.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verificar token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      
      const user = await this.usersService.findById(payload.sub);

      if (!user || user.passwordResetToken !== token) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha e limpar token
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { message: 'Senha redefinida com sucesso' };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verificar refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Gerar novos tokens
      const tokens = this.generateTokens(user);

      // Atualizar refresh token
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiration'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
      }),
    };
  }
}
