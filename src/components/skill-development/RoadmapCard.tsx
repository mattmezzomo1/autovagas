import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  ArrowRight,
  BookOpen,
  Award,
  Target
} from 'lucide-react';

interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progressPercentage: number;
  durationRange: string;
  actions: Action[];
}

interface Action {
  id: string;
  title: string;
  type: 'course' | 'certification' | 'project' | 'networking' | 'skill_practice';
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  priority: number;
  estimatedHours: number;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progressPercentage: number;
  estimatedDurationMonths: number;
  keySkills: string[];
  stages: RoadmapStage[];
}

interface RoadmapCardProps {
  roadmap: Roadmap;
  onViewDetails: (roadmapId: string) => void;
  onStartStage: (stageId: string) => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  roadmap,
  onViewDetails,
  onStartStage,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'not_started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'certification':
        return <Award className="w-4 h-4" />;
      case 'project':
        return <Target className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const currentStage = roadmap.stages.find(stage => stage.status === 'in_progress') || 
                      roadmap.stages.find(stage => stage.status === 'not_started');

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{roadmap.title}</h3>
            <p className="text-gray-600 text-sm">{roadmap.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(roadmap.status)}`}>
            {getStatusIcon(roadmap.status)}
            {roadmap.status === 'active' ? 'Ativo' : 
             roadmap.status === 'completed' ? 'Concluído' : 'Rascunho'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
            <span className="text-sm text-gray-600">{roadmap.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${roadmap.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {roadmap.estimatedDurationMonths} meses
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {roadmap.stages.length} etapas
          </div>
        </div>

        {/* Key Skills */}
        {roadmap.keySkills.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Principais Habilidades:</p>
            <div className="flex flex-wrap gap-2">
              {roadmap.keySkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {roadmap.keySkills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{roadmap.keySkills.length - 4} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Current Stage */}
      {currentStage && (
        <div className="p-6 bg-gray-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Etapa Atual</h4>
              <p className="text-sm text-gray-600">{currentStage.title}</p>
            </div>
            <span className="text-xs text-gray-500">{currentStage.durationRange}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4">{currentStage.description}</p>

          {/* Stage Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Progresso da Etapa</span>
              <span className="text-xs text-gray-600">{currentStage.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${currentStage.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Next Actions */}
          {currentStage.actions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Próximas Ações:</p>
              <div className="space-y-2">
                {currentStage.actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="flex items-center gap-2 text-sm">
                    <div className={`p-1 rounded ${getStatusColor(action.status)}`}>
                      {getActionTypeIcon(action.type)}
                    </div>
                    <span className="flex-1 text-gray-700">{action.title}</span>
                    <span className="text-xs text-gray-500">{action.estimatedHours}h</span>
                  </div>
                ))}
                {currentStage.actions.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{currentStage.actions.length - 3} ações adicionais
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {currentStage.status === 'not_started' && (
              <button
                onClick={() => onStartStage(currentStage.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
              >
                <PlayCircle className="w-4 h-4" />
                Iniciar Etapa
              </button>
            )}
            <button
              onClick={() => onViewDetails(roadmap.id)}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center gap-1"
            >
              Ver Detalhes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Completed Roadmap */}
      {roadmap.status === 'completed' && (
        <div className="p-6 bg-green-50">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Roadmap Concluído!</span>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Parabéns! Você completou todas as etapas deste roadmap de desenvolvimento.
          </p>
          <button
            onClick={() => onViewDetails(roadmap.id)}
            className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center gap-1"
          >
            Ver Certificado
            <Award className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
