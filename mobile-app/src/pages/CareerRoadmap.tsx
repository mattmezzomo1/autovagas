import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MobileLayout } from '../components/layout/MobileLayout';
import {
  Target, Plus, Edit, CheckCircle, Clock, Calendar,
  TrendingUp, Award, BookOpen, Users, Briefcase,
  ChevronRight, Flag, Zap, ArrowUp, AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Milestone {
  id: number;
  title: string;
  description: string;
  category: 'skill' | 'certification' | 'experience' | 'education' | 'network';
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  progress: number;
  estimatedTime: string;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  category: 'short_term' | 'medium_term' | 'long_term';
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  milestones: Milestone[];
}

export const CareerRoadmap: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'milestones'>('overview');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  // Mock data
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: 'Tornar-se Senior Developer',
      description: 'Evoluir para uma posição de desenvolvedor sênior com foco em arquitetura e liderança técnica',
      category: 'medium_term',
      targetDate: '2024-12-31',
      status: 'active',
      progress: 65,
      milestones: [
        {
          id: 1,
          title: 'Certificação AWS Solutions Architect',
          description: 'Obter certificação AWS para arquitetura de soluções',
          category: 'certification',
          status: 'in_progress',
          priority: 'high',
          deadline: '2024-06-30',
          progress: 40,
          estimatedTime: '3 meses'
        },
        {
          id: 2,
          title: 'Liderar projeto de microserviços',
          description: 'Assumir liderança técnica em projeto de migração para microserviços',
          category: 'experience',
          status: 'not_started',
          priority: 'medium',
          deadline: '2024-09-30',
          progress: 0,
          estimatedTime: '6 meses'
        }
      ]
    },
    {
      id: 2,
      title: 'Especialização em React/Next.js',
      description: 'Dominar tecnologias frontend modernas e frameworks avançados',
      category: 'short_term',
      targetDate: '2024-08-31',
      status: 'active',
      progress: 80,
      milestones: [
        {
          id: 3,
          title: 'Curso avançado de Next.js',
          description: 'Completar curso especializado em Next.js 14',
          category: 'education',
          status: 'completed',
          priority: 'high',
          deadline: '2024-03-31',
          progress: 100,
          estimatedTime: '2 meses'
        }
      ]
    },
    {
      id: 3,
      title: 'Transição para Tech Lead',
      description: 'Evoluir para posição de liderança técnica em empresa de grande porte',
      category: 'long_term',
      targetDate: '2025-12-31',
      status: 'active',
      progress: 25,
      milestones: [
        {
          id: 4,
          title: 'Desenvolver soft skills',
          description: 'Curso de liderança e comunicação técnica',
          category: 'skill',
          status: 'in_progress',
          priority: 'medium',
          deadline: '2024-07-31',
          progress: 30,
          estimatedTime: '4 meses'
        }
      ]
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <Zap className="w-4 h-4" />;
      case 'certification': return <Award className="w-4 h-4" />;
      case 'experience': return <Briefcase className="w-4 h-4" />;
      case 'education': return <BookOpen className="w-4 h-4" />;
      case 'network': return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'skill': return 'text-yellow-400 bg-yellow-500/10';
      case 'certification': return 'text-purple-400 bg-purple-500/10';
      case 'experience': return 'text-blue-400 bg-blue-500/10';
      case 'education': return 'text-green-400 bg-green-500/10';
      case 'network': return 'text-pink-400 bg-pink-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'not_started': return <Flag className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGoalCategoryName = (category: string) => {
    switch (category) {
      case 'short_term': return 'Curto Prazo';
      case 'medium_term': return 'Médio Prazo';
      case 'long_term': return 'Longo Prazo';
      default: return category;
    }
  };

  const getMilestoneCategoryName = (category: string) => {
    switch (category) {
      case 'skill': return 'Habilidade';
      case 'certification': return 'Certificação';
      case 'experience': return 'Experiência';
      case 'education': return 'Educação';
      case 'network': return 'Network';
      default: return category;
    }
  };

  const handleAddGoal = () => {
    setShowAddGoal(true);
  };

  const handleAddMilestone = (goalId: number) => {
    setSelectedGoal(goalId);
    setShowAddMilestone(true);
  };

  const handleQuickAddMilestone = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');

    if (activeGoals.length === 0) {
      addNotification({
        type: 'info',
        message: 'Crie uma meta primeiro para adicionar milestones'
      });
    } else if (activeGoals.length === 1) {
      handleAddMilestone(activeGoals[0].id);
    } else {
      setShowGoalSelector(true);
    }
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'progress' | 'milestones'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now(),
      progress: 0,
      milestones: []
    };

    setGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);

    addNotification({
      type: 'success',
      message: 'Meta adicionada com sucesso!'
    });
  };

  const handleSaveMilestone = (milestoneData: Omit<Milestone, 'id' | 'progress'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: Date.now(),
      progress: 0
    };

    setGoals(prev => prev.map(goal =>
      goal.id === selectedGoal
        ? { ...goal, milestones: [...goal.milestones, newMilestone] }
        : goal
    ));

    setShowAddMilestone(false);
    setSelectedGoal(null);

    addNotification({
      type: 'success',
      message: 'Milestone adicionado com sucesso!'
    });
  };

  const handleCompleteGoal = (goalId: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: 'completed' as const, progress: 100 }
        : goal
    ));
    addNotification({
      type: 'success',
      message: 'Meta concluída com sucesso!'
    });
  };

  const handleCompleteMilestone = (goalId: number, milestoneId: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? {
            ...goal,
            milestones: goal.milestones.map(milestone =>
              milestone.id === milestoneId
                ? { ...milestone, status: 'completed' as const, progress: 100 }
                : milestone
            )
          }
        : goal
    ));
    addNotification({
      type: 'success',
      message: 'Milestone concluído!'
    });
  };

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const totalMilestones = goals.reduce((sum, goal) => sum + goal.milestones.length, 0);
  const completedMilestones = goals.reduce((sum, goal) => 
    sum + goal.milestones.filter(m => m.status === 'completed').length, 0
  );

  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Check for upcoming deadlines
  const upcomingMilestones = goals
    .flatMap(goal => goal.milestones.map(m => ({ ...m, goalTitle: goal.title })))
    .filter(m => {
      if (m.status === 'completed') return false;
      const deadline = new Date(m.deadline);
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0; // Next 7 days
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Roadmap de Carreira</h2>
                <p className="text-gray-300 text-sm">Planeje e acompanhe sua evolução profissional</p>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Progresso Geral</span>
                <span className="text-purple-400 font-bold">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white font-semibold">{activeGoals}</div>
                  <div className="text-gray-400 text-xs">Ativas</div>
                </div>
                <div>
                  <div className="text-green-400 font-semibold">{completedGoals}</div>
                  <div className="text-gray-400 text-xs">Concluídas</div>
                </div>
                <div>
                  <div className="text-blue-400 font-semibold">{completedMilestones}/{totalMilestones}</div>
                  <div className="text-gray-400 text-xs">Milestones</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Visão Geral', icon: TrendingUp },
            { id: 'goals', name: 'Metas', icon: Target },
            { id: 'milestones', name: 'Milestones', icon: Flag }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-white font-semibold text-lg">{totalGoals}</div>
                  <div className="text-gray-400 text-xs">Metas Totais</div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-white font-semibold text-lg">{completedMilestones}</div>
                  <div className="text-gray-400 text-xs">Milestones Concluídos</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddGoal}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col gap-2"
                  >
                    <Target className="w-6 h-6" />
                    <span className="text-sm">Nova Meta</span>
                  </Button>

                  <Button
                    onClick={handleQuickAddMilestone}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col gap-2"
                  >
                    <Flag className="w-6 h-6" />
                    <span className="text-sm">Novo Milestone</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Insights */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Insights de Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-blue-400 font-semibold text-lg">
                      {Math.round((completedMilestones / Math.max(totalMilestones, 1)) * 100)}%
                    </div>
                    <div className="text-gray-400 text-xs">Taxa de Conclusão</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-green-400 font-semibold text-lg">
                      {goals.filter(g => g.status === 'active').length}
                    </div>
                    <div className="text-gray-400 text-xs">Metas Ativas</div>
                  </div>
                </div>

                {/* Next Milestone */}
                {(() => {
                  const nextMilestone = goals
                    .flatMap(goal => goal.milestones.map(m => ({ ...m, goalTitle: goal.title })))
                    .filter(m => m.status !== 'completed')
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

                  return nextMilestone ? (
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium text-sm">Próximo Milestone</span>
                      </div>
                      <p className="text-gray-300 text-sm">{nextMilestone.title}</p>
                      <p className="text-gray-400 text-xs">
                        {nextMilestone.goalTitle} • {new Date(nextMilestone.deadline).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-500/10 rounded-lg border border-gray-500/20 text-center">
                      <p className="text-gray-400 text-sm">Nenhum milestone pendente</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines Alert */}
            {upcomingMilestones.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Prazos Próximos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingMilestones.slice(0, 3).map((milestone) => {
                    const deadline = new Date(milestone.deadline);
                    const today = new Date();
                    const diffTime = deadline.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                        <div className={`w-2 h-2 rounded-full ${
                          diffDays === 0 ? 'bg-red-500' :
                          diffDays <= 2 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{milestone.title}</p>
                          <p className="text-gray-400 text-xs">{milestone.goalTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${
                            diffDays === 0 ? 'text-red-400' :
                            diffDays <= 2 ? 'text-orange-400' : 'text-yellow-400'
                          }`}>
                            {diffDays === 0 ? 'Hoje' :
                             diffDays === 1 ? 'Amanhã' :
                             `${diffDays} dias`}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {deadline.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {upcomingMilestones.length > 3 && (
                    <p className="text-center text-gray-400 text-xs">
                      +{upcomingMilestones.length - 3} outros milestones próximos
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Curso avançado de Next.js concluído</p>
                    <p className="text-gray-400 text-xs">2 dias atrás</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <ArrowUp className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Progresso em Certificação AWS: 40%</p>
                    <p className="text-gray-400 text-xs">1 semana atrás</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Plus className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Nova meta: Transição para Tech Lead</p>
                    <p className="text-gray-400 text-xs">2 semanas atrás</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Actions */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Próximas Ações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Certificação AWS</p>
                      <p className="text-gray-400 text-xs">Prazo: 30 Jun 2024</p>
                    </div>
                  </div>
                  <span className="text-red-400 text-xs font-medium">Alta</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Curso de Liderança</p>
                      <p className="text-gray-400 text-xs">Prazo: 31 Jul 2024</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-xs font-medium">Média</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Minhas Metas</h3>
              <Button
                onClick={handleAddGoal}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </div>

            {goals.map((goal) => (
              <Card key={goal.id} className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">{goal.title}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                          {getGoalCategoryName(goal.category)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {goal.milestones.length} milestones
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-white">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddMilestone(goal.id)}
                      className="border-gray-600 text-gray-300 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Milestone
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          message: 'Funcionalidade de edição em desenvolvimento'
                        });
                      }}
                      className="border-gray-600 text-gray-300 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    {goal.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Todos os Milestones</h3>
            
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <h4 className="text-white font-medium text-sm">{goal.title}</h4>
                </div>
                
                {goal.milestones.map((milestone) => (
                  <Card key={milestone.id} className="bg-black/20 border-white/10 ml-6">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(milestone.status)}
                            <h5 className="text-white font-medium text-sm">{milestone.title}</h5>
                            <div className={`p-1 rounded-full ${getCategoryColor(milestone.category)}`}>
                              {getCategoryIcon(milestone.category)}
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">{milestone.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(milestone.deadline).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {milestone.estimatedTime}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(milestone.priority)}`}>
                              {milestone.priority === 'high' ? 'Alta' : 
                               milestone.priority === 'medium' ? 'Média' : 'Baixa'}
                            </span>
                          </div>
                          
                          {milestone.status !== 'completed' && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progresso</span>
                                <span className="text-white">{milestone.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${milestone.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {milestone.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteMilestone(goal.id, milestone.id)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Add Goal Button (floating) */}
        {activeTab !== 'goals' && (
          <Button
            onClick={handleAddGoal}
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalModal
          isVisible={showAddGoal}
          onClose={() => setShowAddGoal(false)}
          onSave={handleSaveGoal}
        />
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && selectedGoal && (
        <AddMilestoneModal
          isVisible={showAddMilestone}
          goalId={selectedGoal}
          goalTitle={goals.find(g => g.id === selectedGoal)?.title || ''}
          onClose={() => {
            setShowAddMilestone(false);
            setSelectedGoal(null);
          }}
          onSave={handleSaveMilestone}
        />
      )}

      {/* Goal Selector Modal */}
      {showGoalSelector && (
        <GoalSelectorModal
          isVisible={showGoalSelector}
          goals={goals.filter(goal => goal.status === 'active')}
          onClose={() => setShowGoalSelector(false)}
          onSelectGoal={(goalId) => {
            setShowGoalSelector(false);
            handleAddMilestone(goalId);
          }}
        />
      )}
    </MobileLayout>
  );
};

// Modal para Adicionar Meta
interface AddGoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'progress' | 'milestones'>) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isVisible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medium_term' as Goal['category'],
    targetDate: '',
    status: 'active' as Goal['status']
  });

  const [goalType, setGoalType] = useState<'job' | 'course' | 'specialization' | 'salary' | 'position' | 'custom'>('custom');

  const goalTypeOptions = [
    { value: 'job', label: 'Novo Emprego', icon: Briefcase, description: 'Conseguir uma nova posição' },
    { value: 'course', label: 'Curso/Certificação', icon: BookOpen, description: 'Completar um curso ou certificação' },
    { value: 'specialization', label: 'Especialização', icon: Award, description: 'Desenvolver expertise em uma área' },
    { value: 'salary', label: 'Meta Salarial', icon: TrendingUp, description: 'Alcançar um salário específico' },
    { value: 'position', label: 'Cargo/Promoção', icon: ArrowUp, description: 'Ser promovido ou mudar de cargo' },
    { value: 'custom', label: 'Personalizada', icon: Target, description: 'Meta personalizada' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.targetDate) {
      onSave(formData);
      setFormData({
        title: '',
        description: '',
        category: 'medium_term',
        targetDate: '',
        status: 'active'
      });
      setGoalType('custom');
    }
  };

  const handleGoalTypeSelect = (type: typeof goalType) => {
    setGoalType(type);
    const templates = {
      job: { title: 'Conseguir emprego como ', description: 'Buscar e conseguir uma nova posição profissional' },
      course: { title: 'Completar curso de ', description: 'Finalizar curso e obter certificação' },
      specialization: { title: 'Especializar-me em ', description: 'Desenvolver expertise avançada na área' },
      salary: { title: 'Alcançar salário de R$ ', description: 'Atingir meta salarial específica' },
      position: { title: 'Ser promovido a ', description: 'Conseguir promoção ou mudança de cargo' },
      custom: { title: '', description: '' }
    };

    setFormData(prev => ({
      ...prev,
      title: templates[type].title,
      description: templates[type].description
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Nova Meta de Carreira</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {/* Seleção do Tipo de Meta */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Tipo de Meta</h3>
            <div className="grid grid-cols-2 gap-2">
              {goalTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleGoalTypeSelect(option.value as typeof goalType)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      goalType === option.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-white font-medium mb-2">Título da Meta</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Ex: Tornar-me Senior Developer"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-white font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                placeholder="Descreva sua meta em detalhes..."
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-white font-medium mb-2">Prazo</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="short_term">Curto Prazo (até 6 meses)</option>
                <option value="medium_term">Médio Prazo (6 meses - 2 anos)</option>
                <option value="long_term">Longo Prazo (2+ anos)</option>
              </select>
            </div>

            {/* Data Alvo */}
            <div>
              <label className="block text-white font-medium mb-2">Data Alvo</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Criar Meta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal para Seleção de Meta
interface GoalSelectorModalProps {
  isVisible: boolean;
  goals: Goal[];
  onClose: () => void;
  onSelectGoal: (goalId: number) => void;
}

const GoalSelectorModal: React.FC<GoalSelectorModalProps> = ({ isVisible, goals, onClose, onSelectGoal }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Selecionar Meta</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          <p className="text-gray-400 text-sm mb-4">
            Escolha a meta para a qual deseja adicionar um milestone:
          </p>

          <div className="space-y-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{goal.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        goal.category === 'short_term' ? 'bg-green-500/20 text-green-400' :
                        goal.category === 'medium_term' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {goal.category === 'short_term' ? 'Curto Prazo' :
                         goal.category === 'medium_term' ? 'Médio Prazo' : 'Longo Prazo'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {goal.milestones.length} milestone{goal.milestones.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Nenhuma meta ativa encontrada</p>
              <Button
                onClick={() => {
                  onClose();
                  // Trigger add goal modal
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Criar Nova Meta
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal para Adicionar Milestone
interface AddMilestoneModalProps {
  isVisible: boolean;
  goalId: number;
  goalTitle: string;
  onClose: () => void;
  onSave: (milestoneData: Omit<Milestone, 'id' | 'progress'>) => void;
}

const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({ isVisible, goalId, goalTitle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'skill' as Milestone['category'],
    status: 'not_started' as Milestone['status'],
    priority: 'medium' as Milestone['priority'],
    deadline: '',
    estimatedTime: ''
  });

  const [milestoneType, setMilestoneType] = useState<'skill' | 'certification' | 'experience' | 'education' | 'network'>('skill');

  const milestoneTypeOptions = [
    { value: 'skill', label: 'Habilidade', icon: Zap, description: 'Desenvolver uma nova habilidade técnica' },
    { value: 'certification', label: 'Certificação', icon: Award, description: 'Obter certificação ou diploma' },
    { value: 'experience', label: 'Experiência', icon: Briefcase, description: 'Ganhar experiência prática' },
    { value: 'education', label: 'Educação', icon: BookOpen, description: 'Completar curso ou treinamento' },
    { value: 'network', label: 'Network', icon: Users, description: 'Expandir rede profissional' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.deadline) {
      onSave(formData);
      setFormData({
        title: '',
        description: '',
        category: 'skill',
        status: 'not_started',
        priority: 'medium',
        deadline: '',
        estimatedTime: ''
      });
      setMilestoneType('skill');
    }
  };

  const handleMilestoneTypeSelect = (type: typeof milestoneType) => {
    setMilestoneType(type);
    setFormData(prev => ({ ...prev, category: type }));

    const templates = {
      skill: { title: 'Aprender ', description: 'Desenvolver habilidade técnica específica' },
      certification: { title: 'Obter certificação em ', description: 'Conseguir certificação oficial' },
      experience: { title: 'Ganhar experiência em ', description: 'Adquirir experiência prática' },
      education: { title: 'Completar curso de ', description: 'Finalizar programa educacional' },
      network: { title: 'Conectar com ', description: 'Expandir rede de contatos profissionais' }
    };

    setFormData(prev => ({
      ...prev,
      title: templates[type].title,
      description: templates[type].description
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Novo Milestone</h2>
              <p className="text-gray-400 text-sm">Para a meta: {goalTitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {/* Seleção do Tipo de Milestone */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Tipo de Milestone</h3>
            <div className="grid grid-cols-1 gap-2">
              {milestoneTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleMilestoneTypeSelect(option.value as typeof milestoneType)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      milestoneType === option.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-white font-medium mb-2">Título do Milestone</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Ex: Aprender React Native"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-white font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-16 resize-none"
                placeholder="Descreva o que precisa ser feito..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prioridade */}
              <div>
                <label className="block text-white font-medium mb-2">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Milestone['priority'] }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Tempo Estimado */}
              <div>
                <label className="block text-white font-medium mb-2">Tempo Estimado</label>
                <select
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecionar</option>
                  <option value="1 semana">1 semana</option>
                  <option value="2 semanas">2 semanas</option>
                  <option value="1 mês">1 mês</option>
                  <option value="2 meses">2 meses</option>
                  <option value="3 meses">3 meses</option>
                  <option value="6 meses">6 meses</option>
                </select>
              </div>
            </div>

            {/* Prazo */}
            <div>
              <label className="block text-white font-medium mb-2">Prazo</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Criar Milestone
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
