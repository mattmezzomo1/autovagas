import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Lightbulb, Star, TrendingUp, Target, Zap, Award, Brain, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface Suggestion {
  id: number;
  category: 'content' | 'format' | 'skills' | 'experience' | 'keywords';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  example?: string;
  applied: boolean;
}

interface ImprovementSuggestionsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ImprovementSuggestionsModal: React.FC<ImprovementSuggestionsModalProps> = ({
  isVisible,
  onClose
}) => {
  const { addNotification } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 1,
      category: 'content',
      priority: 'high',
      title: 'Adicionar resumo profissional',
      description: 'Inclua um resumo de 2-3 linhas destacando suas principais qualificações e objetivos de carreira.',
      impact: 'Aumenta em 40% as chances de ser notado pelos recrutadores',
      example: 'Desenvolvedor Full Stack com 5+ anos de experiência em React e Node.js, especializado em arquiteturas escaláveis...',
      applied: false
    },
    {
      id: 2,
      category: 'skills',
      priority: 'high',
      title: 'Incluir tecnologias em alta demanda',
      description: 'Adicione skills como TypeScript, Docker, AWS e metodologias ágeis que estão em alta no mercado.',
      impact: 'Melhora o match com 65% das vagas disponíveis',
      applied: false
    },
    {
      id: 3,
      category: 'experience',
      priority: 'medium',
      title: 'Quantificar resultados',
      description: 'Adicione números e métricas aos seus resultados (ex: "Reduziu tempo de carregamento em 30%").',
      impact: 'Demonstra impacto real e aumenta credibilidade',
      example: 'Otimizou performance da aplicação, reduzindo tempo de carregamento de 3s para 1.2s (60% de melhoria)',
      applied: true
    },
    {
      id: 4,
      category: 'keywords',
      priority: 'high',
      title: 'Otimizar palavras-chave',
      description: 'Inclua termos específicos da área como "React", "API REST", "Microserviços" para melhorar SEO.',
      impact: 'Aumenta visibilidade em sistemas de busca de RH',
      applied: false
    },
    {
      id: 5,
      category: 'format',
      priority: 'medium',
      title: 'Melhorar formatação',
      description: 'Use bullet points, espaçamento consistente e hierarquia visual clara.',
      impact: 'Facilita leitura e transmite profissionalismo',
      applied: false
    },
    {
      id: 6,
      category: 'content',
      priority: 'low',
      title: 'Adicionar projetos pessoais',
      description: 'Inclua 2-3 projetos pessoais relevantes com links para GitHub/demo.',
      impact: 'Demonstra paixão pela área e habilidades práticas',
      applied: false
    },
    {
      id: 7,
      category: 'skills',
      priority: 'medium',
      title: 'Organizar skills por categoria',
      description: 'Separe skills em Frontend, Backend, DevOps, etc. para melhor organização.',
      impact: 'Facilita identificação rápida de competências',
      applied: false
    },
    {
      id: 8,
      category: 'experience',
      priority: 'low',
      title: 'Incluir soft skills',
      description: 'Mencione habilidades como liderança, comunicação e trabalho em equipe com exemplos.',
      impact: 'Diferencia de outros candidatos técnicos',
      applied: false
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas', icon: Star, count: suggestions.length },
    { id: 'content', name: 'Conteúdo', icon: MessageSquare, count: suggestions.filter(s => s.category === 'content').length },
    { id: 'skills', name: 'Habilidades', icon: Zap, count: suggestions.filter(s => s.category === 'skills').length },
    { id: 'experience', name: 'Experiência', icon: Award, count: suggestions.filter(s => s.category === 'experience').length },
    { id: 'keywords', name: 'Palavras-chave', icon: Target, count: suggestions.filter(s => s.category === 'keywords').length },
    { id: 'format', name: 'Formatação', icon: TrendingUp, count: suggestions.filter(s => s.category === 'format').length }
  ];

  const filteredSuggestions = activeCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === activeCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Lightbulb className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const handleApplySuggestion = (suggestionId: number) => {
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestionId 
          ? { ...s, applied: !s.applied }
          : s
      )
    );

    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      addNotification({
        type: 'success',
        message: suggestion.applied 
          ? 'Sugestão removida da aplicação' 
          : 'Sugestão aplicada com sucesso!'
      });
    }
  };

  const appliedCount = suggestions.filter(s => s.applied).length;
  const highPriorityCount = suggestions.filter(s => s.priority === 'high' && !s.applied).length;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white text-lg font-semibold">Melhorias Sugeridas pela IA</h2>
              <p className="text-gray-400 text-sm">
                {appliedCount} de {suggestions.length} aplicadas
                {highPriorityCount > 0 && (
                  <span className="text-red-400 ml-2">• {highPriorityCount} alta prioridade</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className="bg-black/20 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                      {getPriorityIcon(suggestion.priority)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{suggestion.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                          </span>
                          <span className="text-gray-500 text-xs capitalize">
                            {suggestion.category === 'content' ? 'Conteúdo' :
                             suggestion.category === 'skills' ? 'Habilidades' :
                             suggestion.category === 'experience' ? 'Experiência' :
                             suggestion.category === 'keywords' ? 'Palavras-chave' :
                             'Formatação'}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={suggestion.applied ? "default" : "outline"}
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        className={suggestion.applied 
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        }
                      >
                        {suggestion.applied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aplicada
                          </>
                        ) : (
                          'Aplicar'
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {suggestion.description}
                    </p>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-medium">Impacto esperado</span>
                      </div>
                      <p className="text-blue-200 text-sm">{suggestion.impact}</p>
                    </div>
                    
                    {suggestion.example && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 text-sm font-medium">Exemplo</span>
                        </div>
                        <p className="text-purple-200 text-sm italic">"{suggestion.example}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Nenhuma sugestão encontrada</p>
            <p className="text-gray-500 text-sm">Tente selecionar uma categoria diferente</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="text-green-400 font-medium">{appliedCount}</span> sugestões aplicadas de{' '}
            <span className="text-white font-medium">{suggestions.length}</span> total
          </div>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
};
