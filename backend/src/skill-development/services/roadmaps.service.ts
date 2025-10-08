import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roadmap, RoadmapStatus } from '../entities/roadmap.entity';
import { RoadmapStage } from '../entities/roadmap-stage.entity';
import { Action } from '../entities/action.entity';

@Injectable()
export class RoadmapsService {
  constructor(
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
    @InjectRepository(RoadmapStage)
    private stageRepository: Repository<RoadmapStage>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
  ) {}

  async findAllByUser(userId: string): Promise<Roadmap[]> {
    return this.roadmapRepository.find({
      where: { userId },
      relations: ['careerGoal', 'stages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Roadmap> {
    const roadmap = await this.roadmapRepository.findOne({
      where: { id },
      relations: [
        'careerGoal',
        'stages',
        'stages.actions',
        'stages.actions.course',
      ],
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap with ID ${id} not found`);
    }

    if (roadmap.userId !== userId) {
      throw new ForbiddenException('You can only access your own roadmaps');
    }

    return roadmap;
  }

  async updateStatus(id: string, status: RoadmapStatus, userId: string): Promise<Roadmap> {
    const roadmap = await this.findOne(id, userId);
    
    roadmap.status = status;
    
    if (status === RoadmapStatus.ACTIVE && !roadmap.startedAt) {
      roadmap.startedAt = new Date();
    }
    
    if (status === RoadmapStatus.COMPLETED) {
      roadmap.completedAt = new Date();
      roadmap.progressPercentage = 100;
    }
    
    return this.roadmapRepository.save(roadmap);
  }

  async updateProgress(id: string, userId: string): Promise<Roadmap> {
    const roadmap = await this.findOne(id, userId);
    
    // Calculate progress based on completed stages
    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(stage => 
      stage.status === 'completed'
    ).length;
    
    const progressPercentage = totalStages > 0 
      ? Math.round((completedStages / totalStages) * 100)
      : 0;
    
    roadmap.progressPercentage = progressPercentage;
    
    if (progressPercentage === 100 && roadmap.status === RoadmapStatus.ACTIVE) {
      roadmap.status = RoadmapStatus.COMPLETED;
      roadmap.completedAt = new Date();
    }
    
    return this.roadmapRepository.save(roadmap);
  }

  async getActiveRoadmaps(userId: string): Promise<Roadmap[]> {
    return this.roadmapRepository.find({
      where: { 
        userId,
        status: RoadmapStatus.ACTIVE,
      },
      relations: ['careerGoal', 'stages'],
      order: { startedAt: 'DESC' },
    });
  }

  async getRoadmapStats(id: string, userId: string) {
    const roadmap = await this.findOne(id, userId);
    
    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(stage => 
      stage.status === 'completed'
    ).length;
    const inProgressStages = roadmap.stages.filter(stage => 
      stage.status === 'in_progress'
    ).length;
    
    const totalActions = roadmap.stages.reduce((sum, stage) => 
      sum + stage.actions.length, 0
    );
    const completedActions = roadmap.stages.reduce((sum, stage) => 
      sum + stage.actions.filter(action => action.status === 'completed').length, 0
    );
    
    const totalEstimatedHours = roadmap.stages.reduce((sum, stage) => 
      sum + stage.actions.reduce((actionSum, action) => 
        actionSum + (action.estimatedHours || 0), 0
      ), 0
    );
    
    return {
      totalStages,
      completedStages,
      inProgressStages,
      totalActions,
      completedActions,
      totalEstimatedHours,
      progressPercentage: roadmap.progressPercentage,
      status: roadmap.status,
      startedAt: roadmap.startedAt,
      completedAt: roadmap.completedAt,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const roadmap = await this.findOne(id, userId);
    await this.roadmapRepository.softDelete(id);
  }
}
