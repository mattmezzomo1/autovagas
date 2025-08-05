import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileImageDto } from './dto/update-profile-image.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private storageService: StorageService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'autoApplyConfig'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company', 'autoApplyConfig'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Update user properties
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async updateProfileImage(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);

    // Delete old profile image if exists
    if (user.profileImage) {
      await this.storageService.deleteFile(user.profileImage);
    }

    // Upload new profile image
    const uploadResult = await this.storageService.uploadFile(file, 'profile-images');

    // Update user profile image
    user.profileImage = uploadResult.path;

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);

    // Delete profile image if exists
    if (user.profileImage) {
      await this.storageService.deleteFile(user.profileImage);
    }

    await this.usersRepository.softDelete(id);
  }

  async updateCredits(id: string, credits: number): Promise<User> {
    const user = await this.findById(id);

    user.credits = credits;

    return this.usersRepository.save(user);
  }

  async updateSubscription(id: string, plan: string, stripeSubscriptionId: string): Promise<User> {
    const user = await this.findById(id);

    user.subscriptionPlan = plan as any;
    user.stripeSubscriptionId = stripeSubscriptionId;

    // Update credits based on plan
    switch (plan) {
      case 'basic':
        user.credits = 10;
        break;
      case 'plus':
        user.credits = 100;
        user.autoApplyEnabled = true;
        break;
      case 'premium':
        user.credits = 1000;
        user.autoApplyEnabled = true;
        break;
    }

    return this.usersRepository.save(user);
  }

  async findBySubscriptionId(subscriptionId: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { stripeSubscriptionId: subscriptionId },
    });
  }
}
