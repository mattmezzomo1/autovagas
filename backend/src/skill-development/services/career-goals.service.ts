import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerGoal, CareerGoalStatus } from '../entities/career-goal.entity';
import { CreateCareerGoalDto } from '../dto/create-career-goal.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CareerGoalsService {
  constructor(
    @InjectRepository(CareerGoal)
    private careerGoalsRepository: Repository<CareerGoal>,
  ) {}

  async create(createCareerGoalDto: CreateCareerGoalDto, userId: string): Promise<CareerGoal> {
    const careerGoal = this.careerGoalsRepository.create({
      ...createCareerGoalDto,
      userId,
    });

    return this.careerGoalsRepository.save(careerGoal);
  }

  async findAllByUser(userId: string): Promise<CareerGoal[]> {
    return this.careerGoalsRepository.find({
      where: { userId },
      relations: ['roadmaps'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<CareerGoal> {
    const careerGoal = await this.careerGoalsRepository.findOne({
      where: { id },
      relations: ['roadmaps', 'roadmaps.stages', 'roadmaps.stages.actions'],
    });

    if (!careerGoal) {
      throw new NotFoundException(`Career goal with ID ${id} not found`);
    }

    if (careerGoal.userId !== userId) {
      throw new ForbiddenException('You can only access your own career goals');
    }

    return careerGoal;
  }

  async update(id: string, updateData: Partial<CreateCareerGoalDto>, userId: string): Promise<CareerGoal> {
    const careerGoal = await this.findOne(id, userId);
    
    Object.assign(careerGoal, updateData);
    
    return this.careerGoalsRepository.save(careerGoal);
  }

  async updateStatus(id: string, status: CareerGoalStatus, userId: string): Promise<CareerGoal> {
    const careerGoal = await this.findOne(id, userId);
    
    careerGoal.status = status;
    
    if (status === CareerGoalStatus.COMPLETED) {
      careerGoal.progressPercentage = 100;
    }
    
    return this.careerGoalsRepository.save(careerGoal);
  }

  async updateProgress(id: string, progressPercentage: number, userId: string): Promise<CareerGoal> {
    const careerGoal = await this.findOne(id, userId);
    
    careerGoal.progressPercentage = Math.max(0, Math.min(100, progressPercentage));
    
    if (careerGoal.progressPercentage === 100 && careerGoal.status === CareerGoalStatus.ACTIVE) {
      careerGoal.status = CareerGoalStatus.COMPLETED;
    }
    
    return this.careerGoalsRepository.save(careerGoal);
  }

  async remove(id: string, userId: string): Promise<void> {
    const careerGoal = await this.findOne(id, userId);
    await this.careerGoalsRepository.softDelete(id);
  }

  async getActiveGoals(userId: string): Promise<CareerGoal[]> {
    return this.careerGoalsRepository.find({
      where: { 
        userId,
        status: CareerGoalStatus.ACTIVE,
      },
      relations: ['roadmaps'],
      order: { priority: 'DESC' },
    });
  }

  async getGoalsByTimeframe(userId: string, timeframe: string): Promise<CareerGoal[]> {
    return this.careerGoalsRepository.find({
      where: { 
        userId,
        timeframe: timeframe as any,
      },
      relations: ['roadmaps'],
      order: { priority: 'DESC' },
    });
  }
}
