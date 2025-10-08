import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerGoal } from './entities/career-goal.entity';
import { Roadmap } from './entities/roadmap.entity';
import { RoadmapStage } from './entities/roadmap-stage.entity';
import { Action } from './entities/action.entity';
import { Module as CourseModule } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { Assessment } from './entities/assessment.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Certificate } from './entities/certificate.entity';
import { Skill } from './entities/skill.entity';
import { CareerGoalsController } from './controllers/career-goals.controller';
import { RoadmapsController } from './controllers/roadmaps.controller';
import { RoadmapStagesController } from './controllers/roadmap-stages.controller';
import { ActionsController } from './controllers/actions.controller';
import { ModulesController } from './controllers/modules.controller';
import { LessonsController } from './controllers/lessons.controller';
import { UserProgressController } from './controllers/user-progress.controller';
import { CertificatesController } from './controllers/certificates.controller';
import { CareerGoalsService } from './services/career-goals.service';
import { RoadmapsService } from './services/roadmaps.service';
import { RoadmapStagesService } from './services/roadmap-stages.service';
import { ActionsService } from './services/actions.service';
import { RoadmapGeneratorService } from './services/roadmap-generator.service';
import { ModulesService } from './services/modules.service';
import { LessonsService } from './services/lessons.service';
import { UserProgressService } from './services/user-progress.service';
import { CertificatesService } from './services/certificates.service';
import { CertificateGeneratorService } from './services/certificate-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CareerGoal,
      Roadmap,
      RoadmapStage,
      Action,
      CourseModule,
      Lesson,
      Assessment,
      UserProgress,
      Certificate,
      Skill,
    ]),
  ],
  controllers: [
    CareerGoalsController,
    RoadmapsController,
    RoadmapStagesController,
    ActionsController,
    ModulesController,
    LessonsController,
    UserProgressController,
    CertificatesController,
  ],
  providers: [
    CareerGoalsService,
    RoadmapsService,
    RoadmapStagesService,
    ActionsService,
    RoadmapGeneratorService,
    ModulesService,
    LessonsService,
    UserProgressService,
    CertificatesService,
    CertificateGeneratorService,
  ],
  exports: [
    TypeOrmModule,
    CareerGoalsService,
    RoadmapsService,
    RoadmapStagesService,
    ActionsService,
    RoadmapGeneratorService,
    ModulesService,
    LessonsService,
    UserProgressService,
    CertificatesService,
    CertificateGeneratorService,
  ],
})
export class SkillDevelopmentModule {}
