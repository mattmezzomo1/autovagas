import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/index';

// Configuração da URL da API
const API_URL = API_CONFIG.BASE_URL;

// Configuração do axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Interceptor para adicionar o token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interfaces
export interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetPosition: string;
  targetCompany?: string;
  targetSalary?: string;
  timeframe: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: number;
  progressPercentage: number;
  requiredSkills: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  roadmaps?: Roadmap[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  type: 'ai_generated' | 'custom' | 'template';
  status: 'active' | 'completed' | 'paused';
  estimatedDurationMonths: number;
  keySkills: string[];
  expectedOutcomes: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  aiInsights?: string;
  stages: RoadmapStage[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  estimatedDurationWeeks: number;
  actions: Action[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'certification' | 'project' | 'experience' | 'networking' | 'reading' | 'practice';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  estimatedHours: number;
  resources?: string[];
  notes?: string;
  dueDate?: string;
}

export interface CreateCareerGoalRequest {
  title: string;
  description: string;
  targetPosition: string;
  targetCompany?: string;
  targetIndustry: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  priority?: number;
  requiredSkills?: string[];
  notes?: string;
}

export interface GenerateRoadmapRequest {
  currentSkills?: string[];
  currentExperience?: string;
  preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  timeAvailabilityHours?: number;
  budget?: number;
  focusAreas?: string[];
}

class CareerGoalsService {
  // Career Goals CRUD
  async createCareerGoal(data: CreateCareerGoalRequest): Promise<CareerGoal> {
    // Temporary mock implementation while backend is being fixed
    const mockCareerGoal: CareerGoal = {
      id: 'mock-career-goal-' + Date.now(),
      title: data.title,
      description: data.description,
      targetPosition: data.targetPosition,
      targetCompany: data.targetCompany,
      targetSalary: data.targetSalaryMin?.toString(),
      timeframe: data.timeframe,
      status: 'active',
      priority: data.priority || 3,
      progressPercentage: 0,
      requiredSkills: data.requiredSkills || [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roadmaps: []
    };

    // Store in localStorage for demo purposes
    const existingGoals = JSON.parse(localStorage.getItem('mockCareerGoals') || '[]');
    existingGoals.push(mockCareerGoal);
    localStorage.setItem('mockCareerGoals', JSON.stringify(existingGoals));

    return mockCareerGoal;
  }

  async getCareerGoals(): Promise<CareerGoal[]> {
    const response = await axiosInstance.get('/career-goals');
    return response.data;
  }

  async getActiveCareerGoals(): Promise<CareerGoal[]> {
    // Temporary mock implementation
    const mockGoals = JSON.parse(localStorage.getItem('mockCareerGoals') || '[]');
    return mockGoals.filter((goal: CareerGoal) => goal.status === 'active');
  }

  async getCareerGoalsByTimeframe(timeframe: string): Promise<CareerGoal[]> {
    const response = await axiosInstance.get(`/career-goals/by-timeframe?timeframe=${timeframe}`);
    return response.data;
  }

  async getCareerGoal(id: string): Promise<CareerGoal> {
    const response = await axiosInstance.get(`/career-goals/${id}`);
    return response.data;
  }

  async updateCareerGoal(id: string, data: Partial<CreateCareerGoalRequest>): Promise<CareerGoal> {
    const response = await axiosInstance.patch(`/career-goals/${id}`, data);
    return response.data;
  }

  async updateCareerGoalStatus(id: string, status: CareerGoal['status']): Promise<CareerGoal> {
    const response = await axiosInstance.patch(`/career-goals/${id}/status`, { status });
    return response.data;
  }

  async updateCareerGoalProgress(id: string, progressPercentage: number): Promise<CareerGoal> {
    const response = await axiosInstance.patch(`/career-goals/${id}/progress`, { progressPercentage });
    return response.data;
  }

  async deleteCareerGoal(id: string): Promise<void> {
    await axiosInstance.delete(`/career-goals/${id}`);
  }

  // Roadmap Generation
  async generateRoadmap(careerGoalId: string, data: GenerateRoadmapRequest): Promise<Roadmap> {
    // Temporary mock implementation
    const mockRoadmap: Roadmap = {
      id: 'mock-roadmap-' + Date.now(),
      title: 'Roadmap de Carreira Personalizado',
      description: 'Plano gerado pela IA para alcançar seu objetivo profissional',
      type: 'ai_generated',
      status: 'active',
      estimatedDurationMonths: 24,
      keySkills: ['Liderança', 'Comunicação', 'Gestão de Projetos'],
      expectedOutcomes: ['Promoção', 'Aumento salarial', 'Novas responsabilidades'],
      difficultyLevel: 'intermediate',
      aiInsights: 'Baseado no seu perfil, recomendamos focar em desenvolvimento de liderança e certificações técnicas.',
      stages: [
        {
          id: 'stage-1',
          title: 'Primeiro Ano - Fundação',
          description: 'Estabelecer base sólida de conhecimentos e habilidades',
          order: 1,
          status: 'not_started',
          estimatedDurationWeeks: 52,
          actions: [
            {
              id: 'action-1',
              title: 'Curso de Liderança',
              description: 'Desenvolver habilidades de liderança e gestão de equipes',
              type: 'course',
              priority: 'high',
              status: 'not_started',
              estimatedHours: 40,
              resources: ['https://example.com/leadership-course'],
              notes: ''
            },
            {
              id: 'action-2',
              title: 'Certificação PMP',
              description: 'Obter certificação em gestão de projetos',
              type: 'certification',
              priority: 'high',
              status: 'not_started',
              estimatedHours: 120,
              resources: ['https://example.com/pmp-certification'],
              notes: ''
            }
          ]
        },
        {
          id: 'stage-2',
          title: 'Segundo Ano - Especialização',
          description: 'Aprofundar conhecimentos e assumir responsabilidades maiores',
          order: 2,
          status: 'not_started',
          estimatedDurationWeeks: 52,
          actions: [
            {
              id: 'action-3',
              title: 'MBA Executivo',
              description: 'Cursar MBA em instituição renomada',
              type: 'course',
              priority: 'critical',
              status: 'not_started',
              estimatedHours: 600,
              resources: ['https://example.com/mba-program'],
              notes: ''
            }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update the career goal with the roadmap
    const existingGoals = JSON.parse(localStorage.getItem('mockCareerGoals') || '[]');
    const goalIndex = existingGoals.findIndex((goal: CareerGoal) => goal.id === careerGoalId);
    if (goalIndex !== -1) {
      existingGoals[goalIndex].roadmaps = [mockRoadmap];
      localStorage.setItem('mockCareerGoals', JSON.stringify(existingGoals));
    }

    return mockRoadmap;
  }

  // Roadmaps CRUD
  async getRoadmaps(): Promise<Roadmap[]> {
    const response = await axiosInstance.get('/roadmaps');
    return response.data;
  }

  async getRoadmap(id: string): Promise<Roadmap> {
    const response = await axiosInstance.get(`/roadmaps/${id}`);
    return response.data;
  }

  async updateRoadmap(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    const response = await axiosInstance.patch(`/roadmaps/${id}`, data);
    return response.data;
  }

  async deleteRoadmap(id: string): Promise<void> {
    await axiosInstance.delete(`/roadmaps/${id}`);
  }

  // Stage Management
  async updateStageStatus(stageId: string, status: RoadmapStage['status']): Promise<RoadmapStage> {
    const response = await axiosInstance.patch(`/roadmap-stages/${stageId}/status`, { status });
    return response.data;
  }

  async updateStageProgress(stageId: string): Promise<RoadmapStage> {
    const response = await axiosInstance.patch(`/roadmap-stages/${stageId}/progress`);
    return response.data;
  }

  async markStageAsCompleted(stageId: string): Promise<RoadmapStage> {
    const response = await axiosInstance.patch(`/roadmap-stages/${stageId}/complete`);
    return response.data;
  }

  // Action Management
  async updateActionStatus(actionId: string, status: Action['status']): Promise<Action> {
    // Mock implementation - in a real app this would update the backend
    console.log(`Mock: Updating action ${actionId} status to ${status}`);

    // Create a mock action response
    const mockAction: Action = {
      id: actionId,
      title: 'Mock Action',
      description: 'Mock action description',
      type: 'course',
      priority: 'medium',
      status: status,
      estimatedHours: 40,
      resources: [],
      notes: ''
    };

    return mockAction;
  }

  async updateActionProgress(actionId: string, notes?: string, timeSpentHours?: number): Promise<Action> {
    const response = await axiosInstance.patch(`/actions/${actionId}/progress`, {
      notes,
      timeSpentHours
    });
    return response.data;
  }

  async markActionAsCompleted(actionId: string): Promise<Action> {
    return this.updateActionStatus(actionId, 'completed');
  }

  // Utility methods
  async getCareerInsights(careerGoalId: string): Promise<any> {
    const response = await axiosInstance.get(`/career-goals/${careerGoalId}/insights`);
    return response.data;
  }

  async getRecommendedCourses(careerGoalId: string): Promise<any[]> {
    const response = await axiosInstance.get(`/career-goals/${careerGoalId}/recommended-courses`);
    return response.data;
  }

  async getProgressSummary(careerGoalId: string): Promise<any> {
    const response = await axiosInstance.get(`/career-goals/${careerGoalId}/progress-summary`);
    return response.data;
  }

  // Helper methods for frontend
  calculateOverallProgress(roadmap: Roadmap): number {
    if (!roadmap.stages || roadmap.stages.length === 0) return 0;
    
    const completedStages = roadmap.stages.filter(stage => stage.status === 'completed').length;
    return Math.round((completedStages / roadmap.stages.length) * 100);
  }

  getNextAction(roadmap: Roadmap): Action | null {
    for (const stage of roadmap.stages) {
      if (stage.status === 'in_progress' || stage.status === 'not_started') {
        const nextAction = stage.actions.find(action => 
          action.status === 'not_started' || action.status === 'in_progress'
        );
        if (nextAction) return nextAction;
      }
    }
    return null;
  }

  getEstimatedTimeToCompletion(roadmap: Roadmap): number {
    let totalWeeks = 0;
    for (const stage of roadmap.stages) {
      if (stage.status !== 'completed') {
        totalWeeks += stage.estimatedDurationWeeks;
      }
    }
    return totalWeeks;
  }

  formatTimeframe(months: number): string {
    if (months < 12) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'ano' : 'anos'}`;
      } else {
        return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
      }
    }
  }

  getDifficultyColor(level: Roadmap['difficultyLevel']): string {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  getStatusColor(status: CareerGoal['status'] | RoadmapStage['status'] | Action['status']): string {
    switch (status) {
      case 'active':
      case 'in_progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'cancelled':
      case 'skipped': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'not_started': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }
}

export const careerGoalsService = new CareerGoalsService();
export default careerGoalsService;
