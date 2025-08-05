import React from 'react';
import { 
  CheckCircle, Video, FileQuestion, FileText, Users, Settings, 
  ArrowRight, Clock, Target, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface SelectionStep {
  id: string;
  name: string;
  type: 'screening' | 'test' | 'interview' | 'video' | 'custom_questions' | 'document_review';
  description: string;
  isRequired: boolean;
  order: number;
  config: {
    duration?: number;
    questions?: string[];
    passingScore?: number;
    allowRetries?: boolean;
    maxRetries?: number;
    documents?: string[];
    interviewType?: 'phone' | 'video' | 'in_person' | 'ai';
    interviewers?: string[];
    autoAdvance?: boolean;
    advanceScore?: number;
  };
}

interface CustomStepsPreviewProps {
  steps: SelectionStep[];
  className?: string;
}

export const CustomStepsPreview: React.FC<CustomStepsPreviewProps> = ({ 
  steps, 
  className = '' 
}) => {
  const getStepIcon = (type: SelectionStep['type']) => {
    switch (type) {
      case 'screening': return <CheckCircle className="w-5 h-5" />;
      case 'test': return <FileText className="w-5 h-5" />;
      case 'interview': return <Users className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'custom_questions': return <FileQuestion className="w-5 h-5" />;
      case 'document_review': return <FileText className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getStepTypeLabel = (type: SelectionStep['type']) => {
    switch (type) {
      case 'screening': return 'Triagem Automática';
      case 'test': return 'Teste Técnico';
      case 'interview': return 'Entrevista';
      case 'video': return 'Vídeo Apresentação';
      case 'custom_questions': return 'Perguntas Extras';
      case 'document_review': return 'Análise de Documentos';
      default: return 'Personalizada';
    }
  };

  const getStepColor = (type: SelectionStep['type']) => {
    switch (type) {
      case 'screening': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'test': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'interview': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'video': return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      case 'custom_questions': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'document_review': return 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (steps.length === 0) {
    return (
      <div className={`bg-white/5 rounded-xl p-6 border border-white/10 ${className}`}>
        <div className="text-center text-white/60">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma etapa configurada</p>
          <p className="text-sm mt-1">Configure as etapas do processo seletivo</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 rounded-xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Processo Seletivo</h3>
        <span className="text-sm text-white/60">{steps.length} etapas</span>
      </div>

      {/* Desktop Flow View */}
      <div className="hidden md:block">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 flex-shrink-0">
              <div className={`relative flex flex-col items-center min-w-[200px] p-4 rounded-lg border ${getStepColor(step.type)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStepIcon(step.type)}
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                
                <div className="text-xs opacity-80 text-center mb-2">
                  {getStepTypeLabel(step.type)}
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {step.isRequired && (
                    <span className="text-xs bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded">
                      Obrigatória
                    </span>
                  )}
                  {step.config.autoAdvance && (
                    <span className="text-xs bg-green-500/20 text-green-200 px-1.5 py-0.5 rounded">
                      Auto-avanço
                    </span>
                  )}
                  {step.config.duration && (
                    <span className="text-xs bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.config.duration}min
                    </span>
                  )}
                  {step.config.passingScore && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {step.config.passingScore}%
                    </span>
                  )}
                </div>

                {/* Step number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                  {step.order}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className={`p-3 rounded-lg border ${getStepColor(step.type)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
                  {step.order}
                </span>
                {getStepIcon(step.type)}
                <span className="font-medium text-sm">{step.name}</span>
              </div>
              
              <div className="flex gap-1">
                {step.isRequired && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                {step.config.autoAdvance && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
            
            <div className="text-xs opacity-80 mb-2">
              {getStepTypeLabel(step.type)}
            </div>

            {step.description && (
              <div className="text-xs opacity-70 mb-2">
                {step.description}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {step.config.duration && (
                <span className="text-xs bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {step.config.duration}min
                </span>
              )}
              {step.config.passingScore && (
                <span className="text-xs bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {step.config.passingScore}%
                </span>
              )}
              {step.config.advanceScore && (
                <span className="text-xs bg-green-500/20 text-green-200 px-1.5 py-0.5 rounded">
                  Auto: {step.config.advanceScore}%
                </span>
              )}
              {step.config.questions && step.config.questions.length > 0 && (
                <span className="text-xs bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded">
                  {step.config.questions.length} perguntas
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{steps.length}</div>
            <div className="text-xs text-white/60">Etapas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {steps.filter(s => s.isRequired).length}
            </div>
            <div className="text-xs text-white/60">Obrigatórias</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {steps.filter(s => s.config.autoAdvance).length}
            </div>
            <div className="text-xs text-white/60">Auto-avanço</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {steps.reduce((total, step) => total + (step.config.duration || 0), 0)}min
            </div>
            <div className="text-xs text-white/60">Duração Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};
