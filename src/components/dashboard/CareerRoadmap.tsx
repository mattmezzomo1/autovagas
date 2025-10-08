import React, { useState, useEffect } from 'react';
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Briefcase,
  Award,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  MoreHorizontal,
  Star,
  ExternalLink,
  Bot
} from 'lucide-react';
import { careerGoalsService, CareerGoal, Roadmap, RoadmapStage, Action } from '../../services/careerGoals.service';

interface CareerRoadmapProps {
  onCreateGoal: () => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ onCreateGoal }) => {
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCareerGoals();
  }, []);

  const loadCareerGoals = async () => {
    try {
      setIsLoading(true);
      const goals = await careerGoalsService.getActiveCareerGoals();
      setCareerGoals(goals);
      if (goals.length > 0 && !selectedGoal) {
        setSelectedGoal(goals[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos de carreira:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const handleActionStatusUpdate = async (actionId: string, status: Action['status']) => {
    try {
      if (status === 'completed') {
        await careerGoalsService.markActionAsCompleted(actionId);
      } else {
        await careerGoalsService.updateActionStatus(actionId, status);
      }
      // Recarregar dados
      await loadCareerGoals();
    } catch (error) {
      console.error('Erro ao atualizar status da ação:', error);
    }
  };

  const handleStageStatusUpdate = async (stageId: string, status: RoadmapStage['status']) => {
    try {
      if (status === 'completed') {
        await careerGoalsService.markStageAsCompleted(stageId);
      } else {
        await careerGoalsService.updateStageStatus(stageId, status);
      }
      // Recarregar dados
      await loadCareerGoals();
    } catch (error) {
      console.error('Erro ao atualizar status da etapa:', error);
    }
  };

  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'certification': return Award;
      case 'project': return Briefcase;
      case 'experience': return Users;
      case 'networking': return Users;
      case 'reading': return BookOpen;
      case 'practice': return Target;
      default: return Clock;
    }
  };

  const getActionTypeLabel = (type: Action['type']) => {
    const labels = {
      course: 'Curso',
      certification: 'Certificação',
      project: 'Projeto',
      experience: 'Experiência',
      networking: 'Networking',
      reading: 'Leitura',
      practice: 'Prática'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: Action['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (careerGoals.length === 0) {
    return (
      <div className="space-y-6">
        {/* Info sobre robô inativo */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-yellow-400 font-medium">Robô de Auto-aplicação Inativo</h4>
              <p className="text-yellow-200 text-sm">O sistema de aplicações automáticas está temporariamente desabilitado. Foque no desenvolvimento da sua carreira!</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <Target className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum objetivo de carreira definido</h3>
          <p className="text-purple-200 mb-6">Configure sua meta de carreira e receba um roadmap personalizado com IA.</p>
          <button
            onClick={onCreateGoal}
            className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
          >
            <Target className="w-5 h-5" />
            Definir Objetivo
          </button>
        </div>
      </div>
    );
  }

  const currentRoadmap = selectedGoal?.roadmaps?.[0];

  return (
    <div className="space-y-6">
      {/* Info sobre robô inativo */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h4 className="text-yellow-400 font-medium">Robô de Auto-aplicação Inativo</h4>
            <p className="text-yellow-200 text-sm">O sistema de aplicações automáticas está temporariamente desabilitado. Aproveite para focar no desenvolvimento da sua carreira!</p>
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      {careerGoals.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {careerGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedGoal?.id === goal.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-black/20 text-purple-200 hover:bg-black/30'
              }`}
            >
              {goal.title}
            </button>
          ))}
        </div>
      )}

      {/* Current Goal Overview */}
      {selectedGoal && (
        <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{selectedGoal.title}</h3>
              <p className="text-purple-200 mb-3">{selectedGoal.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-purple-300">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {careerGoalsService.formatTimeframe(parseInt(selectedGoal.timeframe))}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${careerGoalsService.getStatusColor(selectedGoal.status)}`}>
                  {selectedGoal.status === 'active' ? 'Ativo' : selectedGoal.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">{selectedGoal.progressPercentage}%</div>
              <div className="text-purple-300 text-sm">Progresso</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/30 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${selectedGoal.progressPercentage}%` }}
            />
          </div>

          {/* Quick Stats */}
          {currentRoadmap && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-white">
                  {currentRoadmap.stages?.filter(s => s.status === 'completed').length || 0}
                </div>
                <div className="text-purple-300 text-sm">Etapas Concluídas</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {careerGoalsService.getEstimatedTimeToCompletion(currentRoadmap)}
                </div>
                <div className="text-purple-300 text-sm">Semanas Restantes</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {currentRoadmap.stages?.length || 0}
                </div>
                <div className="text-purple-300 text-sm">Total de Etapas</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Roadmap Stages */}
      {currentRoadmap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Roadmap de Carreira</h4>
            <span className={`px-3 py-1 rounded-full text-sm ${careerGoalsService.getDifficultyColor(currentRoadmap.difficultyLevel)}`}>
              {currentRoadmap.difficultyLevel}
            </span>
          </div>

          {currentRoadmap.stages?.map((stage, index) => (
            <div key={stage.id} className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
              <div className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div
                  onClick={() => toggleStageExpansion(stage.id)}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stage.status === 'completed'
                      ? 'bg-green-500'
                      : stage.status === 'in_progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <h5 className="font-semibold text-white">{stage.title}</h5>
                    <p className="text-purple-200 text-sm">{stage.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-400 text-xs">
                        {stage.estimatedDurationWeeks} semanas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stage.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStageStatusUpdate(stage.id, 'completed');
                      }}
                      className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                      title="Marcar etapa como concluída"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleStageExpansion(stage.id)}
                    className="text-purple-400 hover:text-purple-300 p-1 rounded transition-colors"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      expandedStages.has(stage.id) ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </div>

              {/* Stage Actions */}
              {expandedStages.has(stage.id) && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {stage.actions?.map((action) => {
                    const ActionIcon = getActionIcon(action.type);
                    return (
                      <div key={action.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                        <button
                          onClick={() => handleActionStatusUpdate(
                            action.id, 
                            action.status === 'completed' ? 'not_started' : 'completed'
                          )}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            action.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-purple-400 hover:border-purple-300'
                          }`}
                        >
                          {action.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                        
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityColor(action.priority)}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className={`font-medium ${action.status === 'completed' ? 'text-green-400 line-through' : 'text-white'}`}>
                              {action.title}
                            </h6>
                            <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(action.priority)}`}>
                              {getActionTypeLabel(action.type)}
                            </span>
                          </div>
                          <p className="text-purple-200 text-sm">{action.description}</p>
                          {action.estimatedHours && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-400 text-xs">{action.estimatedHours}h estimadas</span>
                            </div>
                          )}
                        </div>
                        
                        {action.resources && action.resources.length > 0 && (
                          <button className="text-purple-400 hover:text-purple-300">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Goal Button */}
      <div className="text-center pt-4">
        <button
          onClick={onCreateGoal}
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2 mx-auto transition-colors"
        >
          <Target className="w-4 h-4" />
          Adicionar Novo Objetivo
        </button>
      </div>
    </div>
  );
};
