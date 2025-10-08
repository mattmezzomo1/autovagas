import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Action, ActionStatus } from '../entities/action.entity';
import { RoadmapStage, StageStatus } from '../entities/roadmap-stage.entity';
import { Roadmap } from '../entities/roadmap.entity';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(RoadmapStage)
    private stageRepository: Repository<RoadmapStage>,
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
  ) {}

  async findOne(id: string, userId: string): Promise<Action> {
    const action = await this.actionRepository.findOne({
      where: { id },
      relations: ['stage', 'stage.roadmap'],
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${id} not found`);
    }

    // Check if user owns this action through the roadmap
    if (action.stage.roadmap.userId !== userId) {
      throw new ForbiddenException('You can only access your own actions');
    }

    return action;
  }

  async updateStatus(id: string, status: ActionStatus, userId: string): Promise<Action> {
    const action = await this.findOne(id, userId);
    
    const previousStatus = action.status;
    action.status = status;

    // Update timestamps based on status
    if (status === ActionStatus.IN_PROGRESS && !action.startedAt) {
      action.startedAt = new Date();
    }

    if (status === ActionStatus.COMPLETED && previousStatus !== ActionStatus.COMPLETED) {
      action.completedAt = new Date();
    }

    if (status === ActionStatus.NOT_STARTED) {
      action.startedAt = null;
      action.completedAt = null;
    }

    const savedAction = await this.actionRepository.save(action);

    // Update stage progress when action status changes
    await this.updateStageProgress(action.stageId);

    return savedAction;
  }

  async updateProgress(
    id: string, 
    updateData: { notes?: string; timeSpentHours?: number }, 
    userId: string
  ): Promise<Action> {
    const action = await this.findOne(id, userId);
    
    if (updateData.notes !== undefined) {
      action.notes = updateData.notes;
    }

    // Note: timeSpentHours field would need to be added to Action entity if needed
    // if (updateData.timeSpentHours !== undefined) {
    //   action.timeSpentHours = (action.timeSpentHours || 0) + updateData.timeSpentHours;
    // }

    action.updatedAt = new Date();

    return this.actionRepository.save(action);
  }

  async markAsCompleted(id: string, userId: string): Promise<Action> {
    return this.updateStatus(id, ActionStatus.COMPLETED, userId);
  }

  private async updateStageProgress(stageId: string): Promise<void> {
    const stage = await this.stageRepository.findOne({
      where: { id: stageId },
      relations: ['actions', 'roadmap'],
    });

    if (!stage) return;

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
    }

    await this.stageRepository.save(stage);

    // Update roadmap progress
    await this.updateRoadmapProgress(stage.roadmapId);
  }

  private async updateRoadmapProgress(roadmapId: string): Promise<void> {
    const roadmap = await this.roadmapRepository.findOne({
      where: { id: roadmapId },
      relations: ['stages'],
    });

    if (!roadmap) return;

    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(
      stage => stage.status === 'completed'
    ).length;

    const progressPercentage = totalStages > 0 
      ? Math.round((completedStages / totalStages) * 100)
      : 0;

    roadmap.progressPercentage = progressPercentage;

    if (progressPercentage === 100 && roadmap.status === 'active') {
      roadmap.status = 'completed' as any; // Type assertion for now
      roadmap.completedAt = new Date();
    }

    await this.roadmapRepository.save(roadmap);

    // Update career goal progress
    await this.updateCareerGoalProgress(roadmap.careerGoalId);
  }

  private async updateCareerGoalProgress(careerGoalId: string): Promise<void> {
    // This would update the career goal progress
    // Implementation depends on how career goals track progress
    // For now, we'll leave this as a placeholder
  }
}
