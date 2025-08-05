import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { getImageMulterConfig } from '../common/config/multer.config';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @Put('profile')
  updateProfile(@GetUser('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @ApiOperation({ summary: 'Upload profile image' })
  @ApiResponse({ status: 200, description: 'Profile image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @Put('profile/image')
  @UseInterceptors(FileInterceptor('image', getImageMulterConfig(new ConfigService(), 'profile-images')))
  uploadProfileImage(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.usersService.updateProfileImage(userId, file);
  }

  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Returns the user settings' })
  @Get('settings')
  getSettings(@GetUser() user: User) {
    // Extract settings from user object
    const {
      autoApplyEnabled,
      subscriptionPlan,
      credits,
      autoApplyConfig
    } = user;

    return {
      autoApplyEnabled,
      subscriptionPlan,
      credits,
      autoApplyConfig,
    };
  }

  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @Put('settings')
  updateSettings(@GetUser('id') userId: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.usersService.update(userId, updateSettingsDto);
  }
}
