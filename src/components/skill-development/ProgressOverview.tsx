import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  BookOpen,
  Award,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ProgressData {
  period: string;
  completedActions: number;
  hoursStudied: number;
  certificatesEarned: number;
  skillsLearned: number;
}

export const ProgressOverview: React.FC = () => {
  // Mock data - would come from API
  const weeklyProgress: ProgressData[] = [
    { period: 'Esta semana', completedActions: 5, hoursStudied: 12, certificatesEarned: 1, skillsLearned: 3 },
    { period: 'Semana passada', completedActions: 3, hoursStudied: 8, certificatesEarned: 0, skillsLearned: 2 },
  ];

  const monthlyProgress: ProgressData[] = [
    { period: 'Este mês', completedActions: 18, hoursStudied: 45, certificatesEarned: 2, skillsLearned: 8 },
    { period: 'Mês passado', completedActions: 12, hoursStudied: 32, certificatesEarned: 1, skillsLearned: 5 },
  ];

  const upcomingMilestones = [
    {
      id: '1',
      title: 'Certificação JavaScript Avançado',
      dueDate: '2024-02-15',
      progress: 75,
      type: 'certification',
    },
    {
      id: '2',
      title: 'Projeto de Liderança',
      dueDate: '2024-02-28',
      progress: 40,
      type: 'project',
    },
    {
      id: '3',
      title: 'MBA Executivo - Módulo 2',
      dueDate: '2024-03-10',
      progress: 20,
      type: 'course',
    },
  ];

  const getChangeIndicator = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = previous > 0 ? Math.round((change / previous) * 100) : 0;
    
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <ArrowUp className="w-3 h-3" />
          +{percentage}%
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <ArrowDown className="w-3 h-3" />
          {percentage}%
        </div>
      );
    }
    
    return <div className="text-gray-500 text-sm">--</div>;
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return <Award className="w-4 h-4 text-yellow-600" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'project':
        return <Target className="w-4 h-4 text-purple-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Progress Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Progresso Recente</h3>
        </div>

        {/* Weekly Progress */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Progresso Semanal</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-gray-900">{weeklyProgress[0].completedActions}</p>
                {getChangeIndicator(weeklyProgress[0].completedActions, weeklyProgress[1].completedActions)}
              </div>
              <p className="text-sm text-gray-600">Ações Concluídas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-gray-900">{weeklyProgress[0].hoursStudied}h</p>
                {getChangeIndicator(weeklyProgress[0].hoursStudied, weeklyProgress[1].hoursStudied)}
              </div>
              <p className="text-sm text-gray-600">Horas de Estudo</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-gray-900">{weeklyProgress[0].certificatesEarned}</p>
                {getChangeIndicator(weeklyProgress[0].certificatesEarned, weeklyProgress[1].certificatesEarned)}
              </div>
              <p className="text-sm text-gray-600">Certificados</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-gray-900">{weeklyProgress[0].skillsLearned}</p>
                {getChangeIndicator(weeklyProgress[0].skillsLearned, weeklyProgress[1].skillsLearned)}
              </div>
              <p className="text-sm text-gray-600">Skills Aprendidas</p>
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Progresso Mensal</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-blue-600">{monthlyProgress[0].completedActions}</p>
                {getChangeIndicator(monthlyProgress[0].completedActions, monthlyProgress[1].completedActions)}
              </div>
              <p className="text-sm text-gray-600">Ações Concluídas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-blue-600">{monthlyProgress[0].hoursStudied}h</p>
                {getChangeIndicator(monthlyProgress[0].hoursStudied, monthlyProgress[1].hoursStudied)}
              </div>
              <p className="text-sm text-gray-600">Horas de Estudo</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-blue-600">{monthlyProgress[0].certificatesEarned}</p>
                {getChangeIndicator(monthlyProgress[0].certificatesEarned, monthlyProgress[1].certificatesEarned)}
              </div>
              <p className="text-sm text-gray-600">Certificados</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-blue-600">{monthlyProgress[0].skillsLearned}</p>
                {getChangeIndicator(monthlyProgress[0].skillsLearned, monthlyProgress[1].skillsLearned)}
              </div>
              <p className="text-sm text-gray-600">Skills Aprendidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Próximos Marcos</h3>
        </div>

        <div className="space-y-4">
          {upcomingMilestones.map((milestone) => {
            const daysUntil = getDaysUntil(milestone.dueDate);
            const isUrgent = daysUntil <= 7;
            
            return (
              <div key={milestone.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getMilestoneIcon(milestone.type)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progresso</span>
                        <span className="text-xs text-gray-600">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(milestone.dueDate)}
                      </p>
                      <p className={`text-xs ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                        {daysUntil > 0 ? `${daysUntil} dias` : 'Vencido'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            Ver Todos os Marcos
            <ArrowUp className="w-4 h-4 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
};
