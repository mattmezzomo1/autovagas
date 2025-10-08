import React from 'react';
import { 
  Lightbulb, 
  BookOpen, 
  Award, 
  Users, 
  Target,
  Clock,
  Star,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'certification' | 'networking' | 'project' | 'skill_practice';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  difficulty: number;
  relevanceScore: number;
  reasons: string[];
  tags: string[];
}

export const RecommendedActions: React.FC = () => {
  // Mock data - would come from AI recommendations API
  const recommendedActions: RecommendedAction[] = [
    {
      id: '1',
      title: 'Curso de Liderança Estratégica',
      description: 'Desenvolva habilidades de liderança essenciais para cargos executivos',
      type: 'course',
      priority: 'high',
      estimatedHours: 40,
      difficulty: 4,
      relevanceScore: 95,
      reasons: [
        'Alinhado com seu objetivo de CEO',
        'Skill gap identificada em liderança',
        'Recomendado para sua experiência atual'
      ],
      tags: ['Liderança', 'Estratégia', 'Gestão']
    },
    {
      id: '2',
      title: 'Certificação PMP',
      description: 'Obtenha certificação internacional em gestão de projetos',
      type: 'certification',
      priority: 'high',
      estimatedHours: 120,
      difficulty: 5,
      relevanceScore: 88,
      reasons: [
        'Valorizada no mercado executivo',
        'Complementa seu perfil técnico',
        'Próximo passo no seu roadmap'
      ],
      tags: ['Gestão de Projetos', 'Certificação', 'PMI']
    },
    {
      id: '3',
      title: 'Networking com Executivos',
      description: 'Participe de eventos e grupos de liderança empresarial',
      type: 'networking',
      priority: 'medium',
      estimatedHours: 20,
      difficulty: 3,
      relevanceScore: 82,
      reasons: [
        'Essencial para cargos de liderança',
        'Oportunidades de mentoria',
        'Visibilidade no mercado'
      ],
      tags: ['Networking', 'Liderança', 'Relacionamentos']
    },
    {
      id: '4',
      title: 'Projeto de Transformação Digital',
      description: 'Lidere um projeto de inovação tecnológica na sua empresa',
      type: 'project',
      priority: 'medium',
      estimatedHours: 80,
      difficulty: 4,
      relevanceScore: 78,
      reasons: [
        'Experiência prática em liderança',
        'Tendência do mercado',
        'Diferencial competitivo'
      ],
      tags: ['Transformação Digital', 'Inovação', 'Liderança']
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'certification':
        return <Award className="w-4 h-4" />;
      case 'networking':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <Target className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-blue-600 bg-blue-100';
      case 'certification':
        return 'text-yellow-600 bg-yellow-100';
      case 'networking':
        return 'text-green-600 bg-green-100';
      case 'project':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Média';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recomendações da IA</h3>
      </div>

      <div className="space-y-4">
        {recommendedActions.map((action) => (
          <div key={action.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${getTypeColor(action.type)}`}>
                  {getTypeIcon(action.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                  {getPriorityLabel(action.priority)}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.estimatedHours}h
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {action.relevanceScore}% relevante
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {action.difficulty}/5 dificuldade
              </div>
            </div>

            {/* Reasons */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Por que recomendamos:</p>
              <ul className="space-y-1">
                {action.reasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-blue-600 mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {action.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                Ver Detalhes
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Adicionar ao Plano
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All */}
      <div className="mt-6 pt-4 border-t">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-1">
          Ver Todas as Recomendações
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Insight da IA</p>
            <p className="text-xs text-blue-800 mt-1">
              Baseado no seu objetivo de CEO, recomendamos focar em liderança estratégica 
              e certificações reconhecidas internacionalmente nos próximos 6 meses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
