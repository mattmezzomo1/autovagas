import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Target, 
  Eye, Users, Clock, Star, BarChart3, Lightbulb,
  Zap, RefreshCw, Award, MessageSquare, ArrowUp
} from 'lucide-react';

interface JobAnalysis {
  overallScore: number;
  attractivenessScore: number;
  clarityScore: number;
  competitivenessScore: number;
  seoScore: number;
  insights: {
    type: 'success' | 'warning' | 'error' | 'info';
    category: 'title' | 'description' | 'requirements' | 'benefits' | 'seo';
    message: string;
    suggestion?: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  benchmarks: {
    averageViews: number;
    averageApplications: number;
    industryAverage: number;
    topPerformers: number;
  };
  keywords: {
    missing: string[];
    overused: string[];
    trending: string[];
  };
}

interface JobOptimizerProps {
  jobData: {
    title: string;
    summary: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
    department: string;
    location: string;
  };
  onOptimize?: (optimizedData: any) => void;
  className?: string;
}

export const JobOptimizer: React.FC<JobOptimizerProps> = ({ 
  jobData, 
  onOptimize,
  className = '' 
}) => {
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'keywords' | 'benchmarks'>('overview');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análise com IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: JobAnalysis = {
        overallScore: 78,
        attractivenessScore: 82,
        clarityScore: 75,
        competitivenessScore: 80,
        seoScore: 65,
        insights: [
          {
            type: 'warning',
            category: 'title',
            message: 'Título pode ser mais específico',
            suggestion: 'Adicione tecnologias específicas como "React" ou "Node.js" para melhor SEO',
            impact: 'high'
          },
          {
            type: 'success',
            category: 'benefits',
            message: 'Benefícios bem estruturados',
            impact: 'medium'
          },
          {
            type: 'error',
            category: 'requirements',
            message: 'Muitos requisitos obrigatórios',
            suggestion: 'Considere mover alguns requisitos para "desejáveis" para não desencorajar candidatos',
            impact: 'high'
          },
          {
            type: 'info',
            category: 'seo',
            message: 'Faltam palavras-chave importantes',
            suggestion: 'Adicione termos como "remoto", "flexível" e "startup" que são muito buscados',
            impact: 'medium'
          }
        ],
        benchmarks: {
          averageViews: 1250,
          averageApplications: 45,
          industryAverage: 72,
          topPerformers: 85
        },
        keywords: {
          missing: ['remoto', 'flexível', 'startup', 'inovação', 'crescimento'],
          overused: ['experiência', 'conhecimento', 'habilidade'],
          trending: ['IA', 'machine learning', 'cloud', 'DevOps', 'agile']
        }
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'info': return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-200 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Otimizador de Vagas</h2>
            <p className="text-white/60 text-sm">Analise e otimize sua vaga com IA</p>
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobData.title}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analisar Vaga
            </>
          )}
        </button>
      </div>

      {!analysis && !isAnalyzing && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Análise Inteligente</h3>
          <p className="text-white/60 mb-4">
            Preencha os dados da vaga e clique em "Analisar" para receber insights detalhados
          </p>
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Analisando sua vaga...</h3>
          <p className="text-white/60">Nossa IA está avaliando atratividade, clareza e competitividade</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-xl border text-center ${getScoreBackground(analysis.overallScore)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-white/70 text-sm">Geral</div>
            </div>
            
            <div className={`p-4 rounded-xl border text-center ${getScoreBackground(analysis.attractivenessScore)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.attractivenessScore)}`}>
                {analysis.attractivenessScore}
              </div>
              <div className="text-white/70 text-sm">Atratividade</div>
            </div>
            
            <div className={`p-4 rounded-xl border text-center ${getScoreBackground(analysis.clarityScore)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.clarityScore)}`}>
                {analysis.clarityScore}
              </div>
              <div className="text-white/70 text-sm">Clareza</div>
            </div>
            
            <div className={`p-4 rounded-xl border text-center ${getScoreBackground(analysis.competitivenessScore)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.competitivenessScore)}`}>
                {analysis.competitivenessScore}
              </div>
              <div className="text-white/70 text-sm">Competitividade</div>
            </div>
            
            <div className={`p-4 rounded-xl border text-center ${getScoreBackground(analysis.seoScore)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                {analysis.seoScore}
              </div>
              <div className="text-white/70 text-sm">SEO</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-white/5 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Visão Geral', icon: Eye },
              { key: 'insights', label: 'Insights', icon: Lightbulb },
              { key: 'keywords', label: 'Palavras-chave', icon: Target },
              { key: 'benchmarks', label: 'Benchmarks', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  activeTab === tab.key
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-medium text-white capitalize">{insight.category}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getImpactBadge(insight.impact)}`}>
                      {insight.impact === 'high' ? 'Alto Impacto' : 
                       insight.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                    </span>
                  </div>
                  <p className="text-white/80 mb-2">{insight.message}</p>
                  {insight.suggestion && (
                    <div className="flex items-start gap-2 p-3 bg-white/5 rounded border border-white/10">
                      <ArrowUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/70 text-sm">{insight.suggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Palavras-chave Ausentes
                </h4>
                <div className="space-y-2">
                  {analysis.keywords.missing.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
                      <span className="text-white/80 text-sm">{keyword}</span>
                      <button className="text-xs text-red-300 hover:text-red-200">
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Tendências
                </h4>
                <div className="space-y-2">
                  {analysis.keywords.trending.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/20">
                      <span className="text-white/80 text-sm">{keyword}</span>
                      <button className="text-xs text-green-300 hover:text-green-200">
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Muito Usadas
                </h4>
                <div className="space-y-2">
                  {analysis.keywords.overused.map((keyword, index) => (
                    <div key={index} className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <span className="text-white/80 text-sm">{keyword}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{analysis.benchmarks.averageViews}</div>
                <div className="text-white/60 text-sm">Visualizações Esperadas</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{analysis.benchmarks.averageApplications}</div>
                <div className="text-white/60 text-sm">Candidaturas Esperadas</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{analysis.benchmarks.industryAverage}</div>
                <div className="text-white/60 text-sm">Média do Setor</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{analysis.benchmarks.topPerformers}</div>
                <div className="text-white/60 text-sm">Top Performers</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
