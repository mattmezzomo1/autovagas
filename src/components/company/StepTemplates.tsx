import React from 'react';
import { 
  CheckCircle, Video, FileQuestion, FileText, Users, Settings, 
  Zap, Target, Clock, Brain, Code, MessageSquare 
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

interface StepTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  steps: Omit<SelectionStep, 'id' | 'order'>[];
  category: 'tech' | 'sales' | 'marketing' | 'general' | 'executive';
}

interface StepTemplatesProps {
  onSelectTemplate: (steps: SelectionStep[]) => void;
  className?: string;
}

export const StepTemplates: React.FC<StepTemplatesProps> = ({ 
  onSelectTemplate, 
  className = '' 
}) => {
  const templates: StepTemplate[] = [
    {
      id: 'basic',
      name: 'Processo Básico',
      description: 'Triagem + Entrevista simples',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      category: 'general',
      steps: [
        {
          name: 'Triagem Inicial',
          type: 'screening',
          description: 'Análise automática do currículo com IA',
          isRequired: true,
          config: {
            passingScore: 70,
            autoAdvance: true,
            advanceScore: 85
          }
        },
        {
          name: 'Entrevista RH',
          type: 'interview',
          description: 'Entrevista inicial com RH',
          isRequired: true,
          config: {
            duration: 30,
            interviewType: 'video'
          }
        }
      ]
    },
    {
      id: 'tech_complete',
      name: 'Desenvolvedor Completo',
      description: 'Processo técnico completo com teste e entrevistas',
      icon: Code,
      color: 'from-purple-500 to-purple-600',
      category: 'tech',
      steps: [
        {
          name: 'Triagem Técnica',
          type: 'screening',
          description: 'Análise de skills técnicas no currículo',
          isRequired: true,
          config: {
            passingScore: 75,
            autoAdvance: true,
            advanceScore: 90
          }
        },
        {
          name: 'Teste Técnico',
          type: 'test',
          description: 'Teste de programação e lógica',
          isRequired: true,
          config: {
            duration: 90,
            passingScore: 70,
            allowRetries: false
          }
        },
        {
          name: 'Entrevista Técnica',
          type: 'interview',
          description: 'Entrevista com time técnico',
          isRequired: true,
          config: {
            duration: 60,
            interviewType: 'video'
          }
        },
        {
          name: 'Entrevista Cultural',
          type: 'interview',
          description: 'Entrevista de fit cultural',
          isRequired: true,
          config: {
            duration: 30,
            interviewType: 'video'
          }
        }
      ]
    },
    {
      id: 'sales_focused',
      name: 'Vendas & Comercial',
      description: 'Processo focado em habilidades comerciais',
      icon: Target,
      color: 'from-green-500 to-green-600',
      category: 'sales',
      steps: [
        {
          name: 'Triagem Comercial',
          type: 'screening',
          description: 'Análise de experiência em vendas',
          isRequired: true,
          config: {
            passingScore: 70,
            autoAdvance: true,
            advanceScore: 85
          }
        },
        {
          name: 'Vídeo Pitch',
          type: 'video',
          description: 'Apresentação pessoal em vídeo',
          isRequired: true,
          config: {
            duration: 5
          }
        },
        {
          name: 'Simulação de Vendas',
          type: 'interview',
          description: 'Role-play de situação de vendas',
          isRequired: true,
          config: {
            duration: 45,
            interviewType: 'video'
          }
        },
        {
          name: 'Entrevista Final',
          type: 'interview',
          description: 'Entrevista com gerente de vendas',
          isRequired: true,
          config: {
            duration: 30,
            interviewType: 'video'
          }
        }
      ]
    },
    {
      id: 'marketing_creative',
      name: 'Marketing & Criativo',
      description: 'Processo para profissionais de marketing',
      icon: Brain,
      color: 'from-pink-500 to-pink-600',
      category: 'marketing',
      steps: [
        {
          name: 'Triagem Criativa',
          type: 'screening',
          description: 'Análise de portfólio e experiência',
          isRequired: true,
          config: {
            passingScore: 70
          }
        },
        {
          name: 'Análise de Portfólio',
          type: 'document_review',
          description: 'Revisão detalhada do portfólio',
          isRequired: true,
          config: {
            documents: ['Portfólio', 'Cases de sucesso']
          }
        },
        {
          name: 'Teste Criativo',
          type: 'test',
          description: 'Desafio criativo prático',
          isRequired: true,
          config: {
            duration: 120,
            passingScore: 75
          }
        },
        {
          name: 'Apresentação do Case',
          type: 'interview',
          description: 'Apresentação da solução criativa',
          isRequired: true,
          config: {
            duration: 45,
            interviewType: 'video'
          }
        }
      ]
    },
    {
      id: 'executive',
      name: 'Executivo/Liderança',
      description: 'Processo para cargos de liderança',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      category: 'executive',
      steps: [
        {
          name: 'Triagem Executiva',
          type: 'screening',
          description: 'Análise de experiência em liderança',
          isRequired: true,
          config: {
            passingScore: 80
          }
        },
        {
          name: 'Perguntas Estratégicas',
          type: 'custom_questions',
          description: 'Questões sobre visão estratégica',
          isRequired: true,
          config: {
            questions: [
              'Descreva sua visão estratégica para os próximos 3 anos',
              'Como você lidaria com uma crise de equipe?',
              'Qual foi seu maior desafio de liderança?'
            ]
          }
        },
        {
          name: 'Entrevista com CEO',
          type: 'interview',
          description: 'Entrevista com alta liderança',
          isRequired: true,
          config: {
            duration: 60,
            interviewType: 'video'
          }
        },
        {
          name: 'Assessment 360°',
          type: 'interview',
          description: 'Avaliação comportamental completa',
          isRequired: true,
          config: {
            duration: 90,
            interviewType: 'in_person'
          }
        }
      ]
    },
    {
      id: 'ai_powered',
      name: 'IA Completa',
      description: 'Processo totalmente automatizado com IA',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      category: 'general',
      steps: [
        {
          name: 'Triagem IA',
          type: 'screening',
          description: 'Análise completa com IA',
          isRequired: true,
          config: {
            passingScore: 75,
            autoAdvance: true,
            advanceScore: 90
          }
        },
        {
          name: 'Entrevista IA',
          type: 'interview',
          description: 'Entrevista automatizada com IA',
          isRequired: true,
          config: {
            duration: 20,
            interviewType: 'ai',
            autoAdvance: true,
            advanceScore: 80
          }
        },
        {
          name: 'Aprovação Final',
          type: 'interview',
          description: 'Confirmação com recrutador',
          isRequired: true,
          config: {
            duration: 15,
            interviewType: 'video'
          }
        }
      ]
    }
  ];

  const handleSelectTemplate = (template: StepTemplate) => {
    const steps: SelectionStep[] = template.steps.map((step, index) => ({
      ...step,
      id: `${Date.now()}_${index}`,
      order: index + 1
    }));
    
    onSelectTemplate(steps);
  };

  const getCategoryIcon = (category: StepTemplate['category']) => {
    switch (category) {
      case 'tech': return <Code className="w-4 h-4" />;
      case 'sales': return <Target className="w-4 h-4" />;
      case 'marketing': return <Brain className="w-4 h-4" />;
      case 'executive': return <Users className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: StepTemplate['category']) => {
    switch (category) {
      case 'tech': return 'Tecnologia';
      case 'sales': return 'Vendas';
      case 'marketing': return 'Marketing';
      case 'executive': return 'Executivo';
      default: return 'Geral';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${template.color}`}>
                <template.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs text-white/60">
                {getCategoryIcon(template.category)}
                <span>{getCategoryLabel(template.category)}</span>
              </div>
            </div>

            <h4 className="font-medium text-white mb-2 group-hover:text-purple-200 transition-colors">
              {template.name}
            </h4>
            
            <p className="text-sm text-white/60 mb-3">
              {template.description}
            </p>

            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{template.steps.length} etapas</span>
              <span className="text-purple-400 group-hover:text-purple-300">
                Usar template →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
