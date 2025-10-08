import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoadmapStage, StageStatus } from '../entities/roadmap-stage.entity';
import { Action, ActionStatus } from '../entities/action.entity';
import { Roadmap } from '../entities/roadmap.entity';

@Injectable()
export class RoadmapStagesService {
  constructor(
    @InjectRepository(RoadmapStage)
    private stageRepository: Repository<RoadmapStage>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
  ) {}

  async findOne(id: string, userId: string): Promise<RoadmapStage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['roadmap', 'actions'],
    });

    if (!stage) {
      throw new NotFoundException(`Roadmap stage with ID ${id} not found`);
    }

    // Check if user owns this stage through the roadmap
    if (stage.roadmap.userId !== userId) {
      throw new ForbiddenException('You can only access your own roadmap stages');
    }

    return stage;
  }

  async updateStatus(id: string, status: StageStatus, userId: string): Promise<RoadmapStage> {
    const stage = await this.findOne(id, userId);
    
    const previousStatus = stage.status;
    stage.status = status;

    // Update timestamps based on status
    if (status === StageStatus.IN_PROGRESS && !stage.startedAt) {
      stage.startedAt = new Date();
    }

    if (status === StageStatus.COMPLETED && previousStatus !== StageStatus.COMPLETED) {
      stage.completedAt = new Date();
      stage.progressPercentage = 100;
      
      // Mark all actions in this stage as completed
      await this.actionRepository.update(
        { stageId: id },
        {
          status: ActionStatus.COMPLETED,
          completedAt: new Date()
        }
      );
    }

    if (status === StageStatus.NOT_STARTED) {
      stage.startedAt = null;
      stage.completedAt = null;
      stage.progressPercentage = 0;
      
      // Reset all actions in this stage
      await this.actionRepository.update(
        { stageId: id },
        {
          status: ActionStatus.NOT_STARTED,
          startedAt: null,
          completedAt: null
        }
      );
    }

    const savedStage = await this.stageRepository.save(stage);

    // Update roadmap progress when stage status changes
    await this.updateRoadmapProgress(stage.roadmapId);

    return savedStage;
  }

  async updateProgress(id: string, userId: string): Promise<RoadmapStage> {
    const stage = await this.findOne(id, userId);
    
    const totalActions = stage.actions.length;
    const completedActions = stage.actions.filter(
      action => action.status === ActionStatus.COMPLETED
    ).length;

    const progressPercentage = totalActions > 0 
      ? Math.round((completedActions / totalActions) * 100)
      : 0;

    stage.progressPercentage = progressPercentage;

    // Update stage status based on progress
    if (progressPercentage === 100 && stage.status !== StageStatus.COMPLETED) {
      stage.status = StageStatus.COMPLETED;
      stage.completedAt = new Date();
    } else if (progressPercentage > 0 && stage.status === StageStatus.NOT_STARTED) {
      stage.status = StageStatus.IN_PROGRESS;
      stage.startedAt = new Date();
    } else if (progressPercentage === 0 && stage.status !== StageStatus.NOT_STARTED) {
      stage.status = StageStatus.NOT_STARTED;
      stage.startedAt = null;
      stage.completedAt = null;
    }

    const savedStage = await this.stageRepository.save(stage);

    // Update roadmap progress
    await this.updateRoadmapProgress(stage.roadmapId);

    return savedStage;
  }

  async markAsCompleted(id: string, userId: string): Promise<RoadmapStage> {
    return this.updateStatus(id, StageStatus.COMPLETED, userId);
  }

  private async updateRoadmapProgress(roadmapId: string): Promise<void> {
    const roadmap = await this.roadmapRepository.findOne({
      where: { id: roadmapId },
      relations: ['stages'],
    });

    if (!roadmap) return;

    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(
      stage => stage.status === StageStatus.COMPLETED
    ).length;

    const progressPercentage = totalStages > 0 
      ? Math.round((completedStages / totalStages) * 100)
      : 0;

    roadmap.progressPercentage = progressPercentage;

    if (progressPercentage === 100 && roadmap.status === 'active') {
      roadmap.status = 'completed' as any; // Type assertion for now
      roadmap.completedAt = new Date();
    } else if (progressPercentage > 0 && roadmap.status === 'draft') {
      roadmap.status = 'active' as any; // Type assertion for now
      roadmap.startedAt = new Date();
    }

    await this.roadmapRepository.save(roadmap);
  }
}
