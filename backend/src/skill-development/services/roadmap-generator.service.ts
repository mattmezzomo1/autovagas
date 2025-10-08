import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roadmap, RoadmapType, RoadmapStatus } from '../entities/roadmap.entity';
import { RoadmapStage, StageStatus } from '../entities/roadmap-stage.entity';
import { Action, ActionType, ActionStatus, ActionPriority } from '../entities/action.entity';
import { CareerGoal } from '../entities/career-goal.entity';
import { GenerateRoadmapDto } from '../dto/generate-roadmap.dto';
import { User } from '../../users/entities/user.entity';

interface RoadmapTemplate {
  title: string;
  description: string;
  estimatedDurationMonths: number;
  stages: StageTemplate[];
}

interface StageTemplate {
  title: string;
  description: string;
  durationRange: string;
  estimatedDurationMonths: number;
  objectives: string[];
  skillsToLearn: string[];
  possiblePositions: string[];
  milestones: string[];
  actions: ActionTemplate[];
}

interface ActionTemplate {
  title: string;
  description: string;
  type: ActionType;
  priority: ActionPriority;
  estimatedHours: number;
  skillsToLearn: string[];
  expectedOutcomes: string[];
}

@Injectable()
export class RoadmapGeneratorService {
  constructor(
    @InjectRepository(Roadmap)
    private roadmapRepository: Repository<Roadmap>,
    @InjectRepository(RoadmapStage)
    private stageRepository: Repository<RoadmapStage>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(CareerGoal)
    private careerGoalRepository: Repository<CareerGoal>,
  ) {}

  async generateRoadmap(dto: GenerateRoadmapDto, userId: string): Promise<Roadmap> {
    const careerGoal = await this.careerGoalRepository.findOne({
      where: { id: dto.careerGoalId, userId },
    });

    if (!careerGoal) {
      throw new Error('Career goal not found');
    }

    // Get roadmap template based on career goal
    const template = this.getRoadmapTemplate(careerGoal, dto);
    
    // Create roadmap
    const roadmap = this.roadmapRepository.create({
      title: template.title,
      description: template.description,
      type: RoadmapType.AI_GENERATED,
      status: RoadmapStatus.ACTIVE,
      estimatedDurationMonths: template.estimatedDurationMonths,
      keySkills: this.extractKeySkills(template),
      expectedOutcomes: this.extractExpectedOutcomes(template),
      difficultyLevel: this.calculateDifficultyLevel(careerGoal, dto),
      aiInsights: this.generateAIInsights(careerGoal, dto),
      userId,
      careerGoalId: careerGoal.id,
    });

    const savedRoadmap = await this.roadmapRepository.save(roadmap);

    // Create stages and actions
    for (let i = 0; i < template.stages.length; i++) {
      const stageTemplate = template.stages[i];
      
      const stage = this.stageRepository.create({
        title: stageTemplate.title,
        description: stageTemplate.description,
        order: i + 1,
        durationRange: stageTemplate.durationRange,
        estimatedDurationMonths: stageTemplate.estimatedDurationMonths,
        status: i === 0 ? StageStatus.NOT_STARTED : StageStatus.NOT_STARTED,
        objectives: stageTemplate.objectives,
        skillsToLearn: stageTemplate.skillsToLearn,
        possiblePositions: stageTemplate.possiblePositions,
        milestones: stageTemplate.milestones,
        roadmapId: savedRoadmap.id,
      });

      const savedStage = await this.stageRepository.save(stage);

      // Create actions for this stage
      for (let j = 0; j < stageTemplate.actions.length; j++) {
        const actionTemplate = stageTemplate.actions[j];
        
        const action = this.actionRepository.create({
          title: actionTemplate.title,
          description: actionTemplate.description,
          type: actionTemplate.type,
          status: ActionStatus.NOT_STARTED,
          priority: actionTemplate.priority,
          estimatedHours: actionTemplate.estimatedHours,
          skillsToLearn: actionTemplate.skillsToLearn,
          expectedOutcomes: actionTemplate.expectedOutcomes,
          order: j + 1,
          stageId: savedStage.id,
        });

        await this.actionRepository.save(action);
      }
    }

    return this.roadmapRepository.findOne({
      where: { id: savedRoadmap.id },
      relations: ['stages', 'stages.actions'],
    });
  }

  private getRoadmapTemplate(careerGoal: CareerGoal, dto: GenerateRoadmapDto): RoadmapTemplate {
    const targetPosition = careerGoal.targetPosition.toLowerCase();
    const targetCompany = careerGoal.targetCompany?.toLowerCase() || '';
    const targetIndustry = careerGoal.targetIndustry?.toLowerCase() || '';

    // Determine template based on target position and context
    if (targetPosition.includes('ceo') || targetPosition.includes('diretor') ||
        targetPosition.includes('c-level') || targetPosition.includes('presidente')) {
      return this.getExecutiveRoadmapTemplate(careerGoal, dto);
    } else if (targetPosition.includes('senior') || targetPosition.includes('lead') ||
               targetPosition.includes('principal') || targetPosition.includes('staff')) {
      return this.getSeniorRoadmapTemplate(careerGoal, dto);
    } else if (targetPosition.includes('manager') || targetPosition.includes('gerente') ||
               targetPosition.includes('coordenador')) {
      return this.getManagerRoadmapTemplate(careerGoal, dto);
    } else if (this.isTechPosition(targetPosition)) {
      return this.getTechRoadmapTemplate(careerGoal, dto);
    } else {
      return this.getGeneralRoadmapTemplate(careerGoal, dto);
    }
  }

  private isTechPosition(position: string): boolean {
    const techKeywords = [
      'desenvolvedor', 'developer', 'programador', 'engenheiro de software',
      'arquiteto de software', 'devops', 'qa', 'tester', 'analista de sistemas',
      'cientista de dados', 'data scientist', 'machine learning', 'ia'
    ];
    return techKeywords.some(keyword => position.includes(keyword));
  }

  private getExecutiveRoadmapTemplate(careerGoal: CareerGoal, dto: GenerateRoadmapDto): RoadmapTemplate {
    return this.getCEORoadmapTemplate();
  }

  private getManagerRoadmapTemplate(careerGoal: CareerGoal, dto: GenerateRoadmapDto): RoadmapTemplate {
    // Customize based on industry and company type
    const template = this.getSeniorRoadmapTemplate();
    template.title = `Roadmap para ${careerGoal.targetPosition}`;
    template.description = `Plano personalizado para alcançar a posição de ${careerGoal.targetPosition}`;

    // Add management-specific actions
    template.stages.forEach(stage => {
      stage.actions.push({
        title: 'Curso de Gestão de Pessoas',
        description: 'Desenvolver habilidades de gestão e liderança de equipes',
        type: ActionType.COURSE,
        priority: ActionPriority.HIGH,
        estimatedHours: 60,
        skillsToLearn: ['Gestão de Pessoas', 'Liderança', 'Feedback'],
        expectedOutcomes: ['Habilidades de gestão', 'Equipe mais engajada']
      });
    });

    return template;
  }

  private getTechRoadmapTemplate(careerGoal: CareerGoal, dto: GenerateRoadmapDto): RoadmapTemplate {
    const template = this.getSeniorRoadmapTemplate();
    template.title = `Roadmap para ${careerGoal.targetPosition}`;
    template.description = `Plano técnico personalizado para alcançar a posição de ${careerGoal.targetPosition}`;

    // Customize based on specific tech role
    const position = careerGoal.targetPosition.toLowerCase();
    if (position.includes('data') || position.includes('cientista')) {
      this.addDataScienceActions(template);
    } else if (position.includes('devops') || position.includes('sre')) {
      this.addDevOpsActions(template);
    } else if (position.includes('mobile')) {
      this.addMobileActions(template);
    }

    return template;
  }

  private addDataScienceActions(template: RoadmapTemplate): void {
    template.stages[0].actions.push({
      title: 'Especialização em Data Science',
      description: 'Curso completo de ciência de dados e machine learning',
      type: ActionType.COURSE,
      priority: ActionPriority.CRITICAL,
      estimatedHours: 200,
      skillsToLearn: ['Python', 'Machine Learning', 'Estatística', 'SQL'],
      expectedOutcomes: ['Expertise em Data Science', 'Portfolio de projetos ML']
    });
  }

  private addDevOpsActions(template: RoadmapTemplate): void {
    template.stages[0].actions.push({
      title: 'Certificação DevOps (AWS/Azure)',
      description: 'Obter certificação em DevOps e cloud computing',
      type: ActionType.CERTIFICATION,
      priority: ActionPriority.CRITICAL,
      estimatedHours: 150,
      skillsToLearn: ['Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code'],
      expectedOutcomes: ['Certificação DevOps', 'Expertise em automação']
    });
  }

  private addMobileActions(template: RoadmapTemplate): void {
    template.stages[0].actions.push({
      title: 'Desenvolvimento Mobile Avançado',
      description: 'Especialização em desenvolvimento mobile nativo e cross-platform',
      type: ActionType.COURSE,
      priority: ActionPriority.HIGH,
      estimatedHours: 120,
      skillsToLearn: ['React Native', 'Flutter', 'iOS', 'Android'],
      expectedOutcomes: ['Apps publicadas', 'Expertise mobile']
    });
  }

  private getCEORoadmapTemplate(): RoadmapTemplate {
    return {
      title: 'Roadmap para CEO de Multinacional',
      description: 'Plano completo para chegar ao cargo de CEO de uma empresa multinacional',
      estimatedDurationMonths: 240, // 20 anos
      stages: [
        {
          title: 'Primeiro Ano - Fundação e Networking',
          description: 'Estabelecer base sólida e construir rede de contatos estratégica',
          durationRange: 'Ano 1',
          estimatedDurationMonths: 12,
          objectives: [
            'Dominar inglês fluente',
            'Obter primeira certificação relevante',
            'Construir networking interno'
          ],
          skillsToLearn: ['Inglês Avançado', 'Oratória', 'Networking'],
          possiblePositions: ['Trainee', 'Analista Júnior'],
          milestones: ['Certificação de inglês', 'Primeira apresentação para diretoria'],
          actions: [
            {
              title: 'Curso de Inglês Executivo',
              description: 'Atingir fluência C2 em inglês com foco em negócios',
              type: ActionType.COURSE,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 200,
              skillsToLearn: ['Inglês Executivo', 'Business English'],
              expectedOutcomes: ['Certificação C2', 'Fluência em apresentações']
            },
            {
              title: 'Curso de Oratória e Apresentação',
              description: 'Desenvolver habilidades de comunicação executiva',
              type: ActionType.COURSE,
              priority: ActionPriority.HIGH,
              estimatedHours: 40,
              skillsToLearn: ['Oratória', 'Comunicação Executiva'],
              expectedOutcomes: ['Confiança em apresentações', 'Técnicas avançadas de comunicação']
            }
          ]
        },
        {
          title: 'Segundo Ano - Especialização Técnica',
          description: 'Aprofundar conhecimentos técnicos e obter certificações relevantes',
          durationRange: 'Ano 2',
          estimatedDurationMonths: 12,
          objectives: [
            'Obter certificação Lean Six Sigma',
            'Liderar primeiro projeto importante',
            'Estabelecer mentoria com executivo'
          ],
          skillsToLearn: ['Lean Manufacturing', 'Six Sigma', 'Gestão de Projetos'],
          possiblePositions: ['Analista Pleno', 'Coordenador de Projetos'],
          milestones: ['Green Belt Six Sigma', 'Projeto de R$ 1M+ liderado'],
          actions: [
            {
              title: 'Certificação Lean Six Sigma Green Belt',
              description: 'Obter certificação em melhoria de processos',
              type: ActionType.CERTIFICATION,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 120,
              skillsToLearn: ['Lean Manufacturing', 'Six Sigma', 'Análise de Dados'],
              expectedOutcomes: ['Certificação Green Belt', 'Projeto de melhoria implementado']
            },
            {
              title: 'Curso de Gestão de Projetos (PMP)',
              description: 'Preparação para certificação PMP',
              type: ActionType.COURSE,
              priority: ActionPriority.HIGH,
              estimatedHours: 80,
              skillsToLearn: ['Gestão de Projetos', 'PMI Framework'],
              expectedOutcomes: ['Preparação para PMP', 'Metodologias ágeis']
            }
          ]
        },
        {
          title: 'Terceiro Ano - Liderança e MBA',
          description: 'Desenvolver habilidades de liderança e iniciar MBA executivo',
          durationRange: 'Ano 3',
          estimatedDurationMonths: 12,
          objectives: [
            'Iniciar MBA em instituição top',
            'Liderar equipe de 5+ pessoas',
            'Participar de projeto internacional'
          ],
          skillsToLearn: ['Liderança', 'Gestão Estratégica', 'Finanças Corporativas'],
          possiblePositions: ['Supervisor', 'Coordenador Senior'],
          milestones: ['Admissão em MBA top', 'Primeira equipe liderada'],
          actions: [
            {
              title: 'MBA Executivo (Início)',
              description: 'Iniciar MBA em FGV, Insper ou similar',
              type: ActionType.COURSE,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 300,
              skillsToLearn: ['Estratégia', 'Finanças', 'Marketing', 'Liderança'],
              expectedOutcomes: ['Rede de contatos executiva', 'Visão estratégica']
            },
            {
              title: 'Programa de Desenvolvimento de Liderança',
              description: 'Participar de programa interno de liderança',
              type: ActionType.EXPERIENCE,
              priority: ActionPriority.HIGH,
              estimatedHours: 60,
              skillsToLearn: ['Liderança Situacional', 'Coaching', 'Feedback'],
              expectedOutcomes: ['Habilidades de liderança', 'Mentoria recebida']
            }
          ]
        }
      ]
    };
  }

  private getSeniorRoadmapTemplate(careerGoal?: CareerGoal, dto?: GenerateRoadmapDto): RoadmapTemplate {
    return {
      title: 'Roadmap para Posição Senior',
      description: 'Plano para alcançar posições de liderança senior',
      estimatedDurationMonths: 36,
      stages: [
        {
          title: 'Primeiro Ano - Especialização Técnica',
          description: 'Aprofundar conhecimentos técnicos e se tornar referência na área',
          durationRange: 'Ano 1',
          estimatedDurationMonths: 12,
          objectives: [
            'Obter certificações avançadas',
            'Liderar projetos técnicos complexos',
            'Mentorar desenvolvedores júnior'
          ],
          skillsToLearn: ['Arquitetura de Software', 'Cloud Computing', 'DevOps'],
          possiblePositions: ['Desenvolvedor Pleno', 'Analista Senior'],
          milestones: ['Certificação AWS/Azure', 'Arquitetura de sistema crítico'],
          actions: [
            {
              title: 'Certificação Cloud (AWS Solutions Architect)',
              description: 'Obter certificação em arquitetura de soluções cloud',
              type: ActionType.CERTIFICATION,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 120,
              skillsToLearn: ['AWS', 'Arquitetura Cloud', 'Microserviços'],
              expectedOutcomes: ['Certificação AWS', 'Expertise em cloud']
            },
            {
              title: 'Curso de Arquitetura de Software',
              description: 'Especialização em design patterns e arquitetura',
              type: ActionType.COURSE,
              priority: ActionPriority.HIGH,
              estimatedHours: 80,
              skillsToLearn: ['Design Patterns', 'Clean Architecture', 'DDD'],
              expectedOutcomes: ['Habilidades de arquitetura', 'Código mais limpo']
            }
          ]
        },
        {
          title: 'Segundo Ano - Liderança Técnica',
          description: 'Desenvolver habilidades de liderança e gestão de equipes',
          durationRange: 'Ano 2',
          estimatedDurationMonths: 12,
          objectives: [
            'Liderar equipe de desenvolvimento',
            'Definir padrões técnicos',
            'Participar de decisões arquiteturais'
          ],
          skillsToLearn: ['Liderança Técnica', 'Gestão de Pessoas', 'Comunicação'],
          possiblePositions: ['Tech Lead', 'Arquiteto de Software'],
          milestones: ['Primeira equipe liderada', 'Padrões técnicos definidos'],
          actions: [
            {
              title: 'Curso de Liderança para Desenvolvedores',
              description: 'Desenvolver habilidades de liderança técnica',
              type: ActionType.COURSE,
              priority: ActionPriority.HIGH,
              estimatedHours: 60,
              skillsToLearn: ['Liderança Técnica', 'Feedback', 'Coaching'],
              expectedOutcomes: ['Habilidades de liderança', 'Equipe mais produtiva']
            },
            {
              title: 'Projeto de Refatoração de Sistema Legacy',
              description: 'Liderar modernização de sistema crítico',
              type: ActionType.PROJECT,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 200,
              skillsToLearn: ['Refatoração', 'Migração de Sistemas', 'Gestão de Riscos'],
              expectedOutcomes: ['Sistema modernizado', 'Experiência em migração']
            }
          ]
        },
        {
          title: 'Terceiro Ano - Posição Senior',
          description: 'Consolidar posição senior e preparar para próximo nível',
          durationRange: 'Ano 3',
          estimatedDurationMonths: 12,
          objectives: [
            'Alcançar posição de Desenvolvedor Senior',
            'Mentorar outros tech leads',
            'Contribuir para estratégia técnica'
          ],
          skillsToLearn: ['Estratégia Técnica', 'Mentoria', 'Visão de Produto'],
          possiblePositions: ['Senior Developer', 'Principal Engineer'],
          milestones: ['Promoção para Senior', 'Mentoria de tech leads'],
          actions: [
            {
              title: 'Especialização em Product Management',
              description: 'Entender melhor o lado de produto e negócio',
              type: ActionType.COURSE,
              priority: ActionPriority.MEDIUM,
              estimatedHours: 40,
              skillsToLearn: ['Product Management', 'UX/UI', 'Métricas de Produto'],
              expectedOutcomes: ['Visão de produto', 'Melhor comunicação com PMs']
            },
            {
              title: 'Contribuição Open Source',
              description: 'Contribuir para projetos open source relevantes',
              type: ActionType.PROJECT,
              priority: ActionPriority.MEDIUM,
              estimatedHours: 100,
              skillsToLearn: ['Open Source', 'Colaboração Global', 'Code Review'],
              expectedOutcomes: ['Reconhecimento na comunidade', 'Networking técnico']
            }
          ]
        }
      ]
    };
  }

  private getGeneralRoadmapTemplate(careerGoal?: CareerGoal, dto?: GenerateRoadmapDto): RoadmapTemplate {
    return {
      title: 'Roadmap de Desenvolvimento Profissional',
      description: 'Plano geral de desenvolvimento de carreira',
      estimatedDurationMonths: 24,
      stages: [
        {
          title: 'Primeiro Ano - Fundamentos',
          description: 'Estabelecer base sólida de conhecimentos e habilidades',
          durationRange: 'Ano 1',
          estimatedDurationMonths: 12,
          objectives: [
            'Dominar fundamentos da área',
            'Construir portfólio inicial',
            'Desenvolver soft skills'
          ],
          skillsToLearn: ['Conhecimentos Técnicos', 'Comunicação', 'Trabalho em Equipe'],
          possiblePositions: ['Estagiário', 'Trainee', 'Júnior'],
          milestones: ['Primeiro projeto concluído', 'Portfólio online'],
          actions: [
            {
              title: 'Curso Fundamental da Área',
              description: 'Curso completo cobrindo os fundamentos essenciais',
              type: ActionType.COURSE,
              priority: ActionPriority.CRITICAL,
              estimatedHours: 120,
              skillsToLearn: ['Fundamentos Técnicos', 'Melhores Práticas'],
              expectedOutcomes: ['Base sólida de conhecimento', 'Certificado de conclusão']
            },
            {
              title: 'Desenvolvimento de Portfólio',
              description: 'Criar 3-5 projetos para demonstrar habilidades',
              type: ActionType.PROJECT,
              priority: ActionPriority.HIGH,
              estimatedHours: 100,
              skillsToLearn: ['Aplicação Prática', 'Documentação', 'Apresentação'],
              expectedOutcomes: ['Portfólio profissional', 'Projetos demonstráveis']
            },
            {
              title: 'Curso de Comunicação Profissional',
              description: 'Desenvolver habilidades de comunicação no ambiente corporativo',
              type: ActionType.COURSE,
              priority: ActionPriority.MEDIUM,
              estimatedHours: 40,
              skillsToLearn: ['Comunicação', 'Apresentação', 'Networking'],
              expectedOutcomes: ['Melhor comunicação', 'Confiança em apresentações']
            }
          ]
        },
        {
          title: 'Segundo Ano - Especialização',
          description: 'Aprofundar conhecimentos e buscar especialização',
          durationRange: 'Ano 2',
          estimatedDurationMonths: 12,
          objectives: [
            'Especializar-se em área específica',
            'Obter primeira certificação',
            'Assumir responsabilidades maiores'
          ],
          skillsToLearn: ['Especialização Técnica', 'Liderança', 'Gestão de Tempo'],
          possiblePositions: ['Júnior', 'Pleno'],
          milestones: ['Certificação obtida', 'Projeto complexo liderado'],
          actions: [
            {
              title: 'Especialização Avançada',
              description: 'Curso avançado na área de especialização escolhida',
              type: ActionType.COURSE,
              priority: ActionPriority.HIGH,
              estimatedHours: 80,
              skillsToLearn: ['Conhecimento Avançado', 'Técnicas Especializadas'],
              expectedOutcomes: ['Expertise reconhecida', 'Diferencial competitivo']
            },
            {
              title: 'Certificação Profissional',
              description: 'Obter certificação reconhecida no mercado',
              type: ActionType.CERTIFICATION,
              priority: ActionPriority.HIGH,
              estimatedHours: 60,
              skillsToLearn: ['Conhecimento Certificado', 'Padrões da Indústria'],
              expectedOutcomes: ['Certificação profissional', 'Credibilidade no mercado']
            },
            {
              title: 'Projeto de Liderança',
              description: 'Liderar projeto pequeno ou iniciativa de melhoria',
              type: ActionType.EXPERIENCE,
              priority: ActionPriority.MEDIUM,
              estimatedHours: 80,
              skillsToLearn: ['Liderança', 'Gestão de Projetos', 'Tomada de Decisão'],
              expectedOutcomes: ['Experiência de liderança', 'Projeto bem-sucedido']
            }
          ]
        }
      ]
    };
  }

  private extractKeySkills(template: RoadmapTemplate): string[] {
    const skills = new Set<string>();
    template.stages.forEach(stage => {
      stage.skillsToLearn.forEach(skill => skills.add(skill));
      stage.actions.forEach(action => {
        action.skillsToLearn.forEach(skill => skills.add(skill));
      });
    });
    return Array.from(skills);
  }

  private extractExpectedOutcomes(template: RoadmapTemplate): string[] {
    const outcomes = new Set<string>();
    template.stages.forEach(stage => {
      stage.actions.forEach(action => {
        action.expectedOutcomes.forEach(outcome => outcomes.add(outcome));
      });
    });
    return Array.from(outcomes);
  }

  private calculateDifficultyLevel(careerGoal: CareerGoal, dto: GenerateRoadmapDto): number {
    // Calculate difficulty based on target position and current experience
    let difficulty = 3; // Default medium
    
    const targetPosition = careerGoal.targetPosition.toLowerCase();
    if (targetPosition.includes('ceo') || targetPosition.includes('diretor')) {
      difficulty = 5; // Very high
    } else if (targetPosition.includes('senior') || targetPosition.includes('lead')) {
      difficulty = 4; // High
    }
    
    // Adjust based on current experience
    if (dto.currentExperience && dto.currentExperience > 5) {
      difficulty = Math.max(1, difficulty - 1);
    }
    
    return difficulty;
  }

  private generateAIInsights(careerGoal: CareerGoal, dto: GenerateRoadmapDto): string {
    return `Baseado no seu objetivo de se tornar ${careerGoal.targetPosition}, este roadmap foi personalizado considerando sua experiência atual e preferências de aprendizado. O plano foca em desenvolvimento gradual de competências técnicas e de liderança, com ênfase em experiência internacional e networking estratégico.`;
  }
}
