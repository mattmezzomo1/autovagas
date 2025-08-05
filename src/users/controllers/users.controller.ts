import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { FilesService } from '../../files/services/files.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private filesService: FilesService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário' })
  async getProfile(@Req() req: Request) {
    const user = await this.usersService.findById(req.user.sub);
    return this.usersService.sanitizeUser(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(req.user.sub, updateProfileDto);
    return this.usersService.sanitizeUser(user);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar senha' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  @HttpCode(200)
  async changePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.sub, updatePasswordDto);
    return { message: 'Senha alterada com sucesso' };
  }

  @Patch('email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar email' })
  @ApiResponse({ status: 200, description: 'Email alterado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Senha incorreta' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @HttpCode(200)
  async changeEmail(
    @Req() req: Request,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    await this.usersService.changeEmail(req.user.sub, updateEmailDto);
    return { message: 'Email alterado com sucesso' };
  }

  @Post('profile-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fazer upload de foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Upload file to storage
    const imageUrl = await this.filesService.uploadProfileImage(req.user.sub, file);

    // Update user profile with new image URL
    const user = await this.usersService.updateProfileImage(req.user.sub, imageUrl);

    return {
      message: 'Foto de perfil atualizada com sucesso',
      profileImage: user.profileImage,
    };
  }

  @Delete('profile-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover foto de perfil' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @HttpCode(200)
  async deleteProfileImage(@Req() req: Request) {
    const user = await this.usersService.findById(req.user.sub);

    if (user.profileImage) {
      // Delete file from storage
      await this.filesService.deleteProfileImage(user.profileImage);

      // Update user profile
      await this.usersService.updateProfileImage(req.user.sub, null);
    }

    return { message: 'Foto de perfil removida com sucesso' };
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar preferências do usuário' })
  @ApiResponse({ status: 200, description: 'Preferências atualizadas com sucesso' })
  async updatePreferences(
    @Req() req: Request,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    const user = await this.usersService.updatePreferences(req.user.sub, updatePreferencesDto);
    return {
      message: 'Preferências atualizadas com sucesso',
      preferences: {
        autoApplyEnabled: user.autoApplyEnabled,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        pushNotificationsEnabled: user.pushNotificationsEnabled,
        profileVisible: user.profileVisible
      },
    };
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir conta' })
  @ApiResponse({ status: 200, description: 'Conta excluída com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha incorreta' })
  @HttpCode(200)
  async deleteAccount(
    @Req() req: Request,
    @Body('password') password: string,
  ) {
    await this.usersService.deleteAccount(req.user.sub, password);
    return { message: 'Conta excluída com sucesso' };
  }
}
