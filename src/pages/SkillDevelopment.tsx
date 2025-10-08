import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Plus, 
  ArrowRight,
  Clock,
  Star,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { CreateCareerGoalModal } from '../components/skill-development/CreateCareerGoalModal';
import { RoadmapCard } from '../components/skill-development/RoadmapCard';
import { ProgressOverview } from '../components/skill-development/ProgressOverview';
import { RecommendedActions } from '../components/skill-development/RecommendedActions';

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetPosition: string;
  targetIndustry: string;
  timeframe: string;
  status: string;
  progressPercentage: number;
  priority: number;
  roadmaps: Roadmap[];
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  status: string;
  progressPercentage: number;
  estimatedDurationMonths: number;
  keySkills: string[];
  stages: RoadmapStage[];
}

interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  status: string;
  progressPercentage: number;
  durationRange: string;
  actions: Action[];
}

interface Action {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: number;
  estimatedHours: number;
}

export const SkillDevelopment: React.FC = () => {
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [activeRoadmaps, setActiveRoadmaps] = useState<Roadmap[]>([]);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeRoadmaps: 0,
    completedActions: 0,
    totalCertificates: 0,
    hoursLearned: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data for now - would be replaced with actual API calls
      const mockCareerGoals: CareerGoal[] = [
        {
          id: '1',
          title: 'Tornar-se CEO de Multinacional',
          description: 'Objetivo de chegar ao cargo de CEO de uma empresa multinacional como a Renault',
          targetPosition: 'CEO',
          targetIndustry: 'Automotivo',
          timeframe: 'long_term',
          status: 'active',
          progressPercentage: 15,
          priority: 5,
          roadmaps: []
        }
      ];

      const mockStats = {
        totalGoals: 1,
        activeRoadmaps: 1,
        completedActions: 12,
        totalCertificates: 3,
        hoursLearned: 45,
      };

      setCareerGoals(mockCareerGoals);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading skill development data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      // API call to create career goal
      console.log('Creating career goal:', goalData);
      setShowCreateGoalModal(false);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error creating career goal:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Desenvolvimento de Carreira</h1>
            <p className="text-gray-600 mt-2">
              Defina seus objetivos profissionais e siga um roadmap personalizado para alcançá-los
            </p>
          </div>
          <button
            onClick={() => setShowCreateGoalModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Objetivo
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                <p className="text-sm text-gray-600">Objetivos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRoadmaps}</p>
                <p className="text-sm text-gray-600">Roadmaps Ativos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedActions}</p>
                <p className="text-sm text-gray-600">Ações Concluídas</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
                <p className="text-sm text-gray-600">Certificados</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursLearned}h</p>
                <p className="text-sm text-gray-600">Horas de Estudo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {careerGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Defina seu primeiro objetivo de carreira
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando um objetivo profissional e receba um roadmap personalizado 
                com IA para alcançá-lo.
              </p>
              <button
                onClick={() => setShowCreateGoalModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Objetivo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Career Goals */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Seus Objetivos de Carreira</h2>
                <div className="space-y-4">
                  {careerGoals.map((goal) => (
                    <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                          <p className="text-gray-600 mt-1">{goal.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm text-gray-500">
                              <strong>Cargo:</strong> {goal.targetPosition}
                            </span>
                            <span className="text-sm text-gray-500">
                              <strong>Setor:</strong> {goal.targetIndustry}
                            </span>
                            <span className="text-sm text-gray-500">
                              <strong>Prazo:</strong> {goal.timeframe === 'long_term' ? 'Longo prazo' : 'Médio prazo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {[...Array(goal.priority)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progresso</span>
                          <span className="text-sm text-gray-600">{goal.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          {goal.roadmaps.length} roadmap(s) ativo(s)
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                          Ver Roadmap
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Overview */}
              <ProgressOverview />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <RecommendedActions />
              
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Continuar Curso</p>
                      <p className="text-sm text-gray-600">JavaScript Avançado - Módulo 3</p>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Ver Certificados</p>
                      <p className="text-sm text-gray-600">3 certificados conquistados</p>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Avaliar Skills</p>
                      <p className="text-sm text-gray-600">Teste suas habilidades atuais</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Career Goal Modal */}
      {showCreateGoalModal && (
        <CreateCareerGoalModal
          onClose={() => setShowCreateGoalModal(false)}
          onSubmit={handleCreateGoal}
        />
      )}
    </PageContainer>
  );
};
