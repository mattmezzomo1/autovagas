import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshToken });
  }

  async savePasswordResetToken(id: string, token: string): Promise<void> {
    await this.usersRepository.update(id, { passwordResetToken: token });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.usersRepository.update(id, {
      password,
      passwordResetToken: null,
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    // Update user profile
    Object.assign(user, updateProfileDto);

    return this.usersRepository.save(user);
  }

  async changePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('A nova senha e a confirmação não coincidem');
    }

    // Get user with password
    const user = await this.findById(id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.updatePassword(id, hashedPassword);
  }

  async changeEmail(id: string, updateEmailDto: UpdateEmailDto): Promise<void> {
    const { newEmail, password } = updateEmailDto;

    // Check if email is already in use
    const existingUser = await this.findByEmail(newEmail);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Este email já está em uso');
    }

    // Get user with password
    const user = await this.findById(id);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // Update email
    await this.usersRepository.update(id, { email: newEmail });
  }

  async updateProfileImage(id: string, imageUrl: string): Promise<User> {
    const user = await this.findById(id);

    // Update profile image
    user.profileImage = imageUrl;

    return this.usersRepository.save(user);
  }

  async updatePreferences(id: string, preferencesDto: UpdatePreferencesDto): Promise<User> {
    const user = await this.findById(id);

    // Update preferences
    if (preferencesDto.autoApplyEnabled !== undefined) {
      user.autoApplyEnabled = preferencesDto.autoApplyEnabled;
    }

    if (preferencesDto.emailNotificationsEnabled !== undefined) {
      user.emailNotificationsEnabled = preferencesDto.emailNotificationsEnabled;
    }

    if (preferencesDto.pushNotificationsEnabled !== undefined) {
      user.pushNotificationsEnabled = preferencesDto.pushNotificationsEnabled;
    }

    if (preferencesDto.profileVisible !== undefined) {
      user.profileVisible = preferencesDto.profileVisible;
    }

    return this.usersRepository.save(user);
  }

  async deleteAccount(id: string, password: string): Promise<void> {
    const user = await this.findById(id);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // Soft delete user
    await this.usersRepository.softDelete(id);
  }

  sanitizeUser(user: User): Partial<User> {
    const { password, refreshToken, passwordResetToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
