import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { JobOptimizer } from '../../components/company/JobOptimizer';
import {
  Sparkles, Wand2, FileText, Copy, Download,
  RefreshCw, Save, Eye, ArrowRight, Lightbulb,
  Target, Users, MapPin, Banknote, Clock,
  TrendingUp, Award, Zap, Brain, Magic, Plus, X
} from 'lucide-react';

interface JobTemplate {
  id: string;
  name: string;
  category: 'tech' | 'sales' | 'marketing' | 'finance' | 'hr' | 'operations';
  description: string;
  template: {
    title: string;
    summary: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
    companyDescription: string;
  };
  tags: string[];
  popularity: number;
}

interface AIJobSuggestion {
  field: 'title' | 'summary' | 'responsibilities' | 'requirements' | 'benefits';
  suggestions: string[];
  reasoning: string;
}

export const JobAIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'ai-writer' | 'optimizer'>('templates');
  
  // Job form data
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    workModel: 'hybrid',
    jobType: 'full-time',
    salaryMin: '',
    salaryMax: '',
    summary: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    companyDescription: ''
  });

  const [aiSuggestions, setAiSuggestions] = useState<AIJobSuggestion[]>([]);
  const [generationPrompt, setGenerationPrompt] = useState('');

  // Mock templates data
  const templates: JobTemplate[] = [
    {
      id: '1',
      name: 'Desenvolvedor Full Stack Senior',
      category: 'tech',
      description: 'Template otimizado para vagas de desenvolvimento full stack com foco em tecnologias modernas',
      template: {
        title: 'Desenvolvedor Full Stack Senior',
        summary: 'Buscamos um desenvolvedor experiente para liderar projetos de desenvolvimento web, trabalhando com tecnologias modernas e metodologias ágeis em um ambiente colaborativo e inovador.',
        responsibilities: [
          'Desenvolver e manter aplicações web full stack usando React, Node.js e TypeScript',
          'Colaborar com equipes de design e produto para implementar novas funcionalidades',
          'Participar de code reviews e mentoria de desenvolvedores júnior',
          'Otimizar performance de aplicações e implementar melhores práticas de segurança',
          'Contribuir para a arquitetura técnica e tomada de decisões estratégicas'
        ],
        requirements: [
          '5+ anos de experiência em desenvolvimento web',
          'Domínio de React, Node.js, TypeScript e bancos de dados relacionais',
          'Experiência com metodologias ágeis e versionamento Git',
          'Conhecimento em AWS ou outras plataformas cloud',
          'Inglês intermediário para comunicação técnica'
        ],
        benefits: [
          'Salário competitivo + participação nos lucros',
          'Plano de saúde e odontológico premium',
          'Vale refeição e vale transporte',
          'Home office flexível',
          'Orçamento para cursos e conferências',
          'Ambiente de trabalho colaborativo e inovador'
        ],
        companyDescription: 'Somos uma empresa de tecnologia em crescimento, focada em soluções inovadoras que impactam positivamente a vida das pessoas. Nossa cultura valoriza a criatividade, colaboração e desenvolvimento contínuo.'
      },
      tags: ['React', 'Node.js', 'TypeScript', 'Full Stack', 'Senior'],
      popularity: 95
    },
    {
      id: '2',
      name: 'Gerente de Vendas',
      category: 'sales',
      description: 'Template para posições de liderança em vendas com foco em resultados e gestão de equipe',
      template: {
        title: 'Gerente de Vendas',
        summary: 'Procuramos um líder de vendas experiente para conduzir nossa equipe comercial, desenvolver estratégias de crescimento e alcançar metas ambiciosas em um mercado competitivo.',
        responsibilities: [
          'Liderar e desenvolver equipe de vendas de 8-12 pessoas',
          'Desenvolver e implementar estratégias de vendas para atingir metas',
          'Acompanhar métricas de performance e KPIs da equipe',
          'Construir relacionamentos estratégicos com clientes-chave',
          'Colaborar com marketing para otimizar geração de leads'
        ],
        requirements: [
          '7+ anos de experiência em vendas, sendo 3+ em liderança',
          'Histórico comprovado de superação de metas',
          'Experiência com CRM e ferramentas de vendas',
          'Excelentes habilidades de comunicação e negociação',
          'Formação superior em Administração, Marketing ou áreas afins'
        ],
        benefits: [
          'Salário fixo + comissões atrativas',
          'Carro da empresa + combustível',
          'Plano de saúde familiar',
          'Participação nos lucros',
          'Programa de desenvolvimento de liderança'
        ],
        companyDescription: 'Empresa líder no setor com 20 anos de mercado, reconhecida pela excelência em atendimento e inovação constante. Oferecemos um ambiente dinâmico e oportunidades reais de crescimento.'
      },
      tags: ['Vendas', 'Liderança', 'Gestão', 'Comercial'],
      popularity: 88
    },
    {
      id: '3',
      name: 'Analista de Marketing Digital',
      category: 'marketing',
      description: 'Template focado em marketing digital com ênfase em performance e analytics',
      template: {
        title: 'Analista de Marketing Digital',
        summary: 'Buscamos um profissional criativo e analítico para impulsionar nossa presença digital, otimizar campanhas e gerar resultados mensuráveis através de estratégias inovadoras de marketing.',
        responsibilities: [
          'Planejar e executar campanhas de marketing digital multicanal',
          'Gerenciar orçamentos de mídia paga (Google Ads, Facebook Ads, LinkedIn)',
          'Analisar métricas e KPIs para otimização contínua de campanhas',
          'Criar conteúdo para redes sociais e blog corporativo',
          'Colaborar com design e desenvolvimento para landing pages'
        ],
        requirements: [
          '3+ anos de experiência em marketing digital',
          'Certificações em Google Ads e Facebook Business',
          'Domínio de Google Analytics, GTM e ferramentas de automação',
          'Conhecimento em SEO/SEM e growth hacking',
          'Graduação em Marketing, Publicidade ou áreas relacionadas'
        ],
        benefits: [
          'Salário competitivo + bônus por performance',
          'Plano de saúde e odontológico',
          'Auxílio educação para cursos e certificações',
          'Trabalho híbrido com flexibilidade de horários',
          'Ambiente criativo e colaborativo'
        ],
        companyDescription: 'Startup em rápido crescimento no setor de tecnologia, com cultura jovem e inovadora. Valorizamos a criatividade, experimentação e impacto mensurável em tudo que fazemos.'
      },
      tags: ['Marketing Digital', 'Performance', 'Analytics', 'Growth'],
      popularity: 92
    }
  ];

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      // Simular chamada para API de IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockSuggestions: AIJobSuggestion[] = [
        {
          field: 'title',
          suggestions: [
            'Desenvolvedor Full Stack Sênior - React & Node.js',
            'Engenheiro de Software Full Stack (Sênior)',
            'Tech Lead Full Stack - Produtos Digitais'
          ],
          reasoning: 'Títulos otimizados para SEO e atratividade, incluindo tecnologias específicas e nível de senioridade'
        },
        {
          field: 'summary',
          suggestions: [
            'Junte-se ao nosso time de tecnologia e ajude a construir produtos que impactam milhares de usuários. Buscamos um desenvolvedor experiente que seja apaixonado por código limpo, arquiteturas escaláveis e trabalho em equipe.',
            'Oportunidade única para desenvolvedor sênior que quer fazer a diferença! Trabalhe com as tecnologias mais modernas do mercado em projetos desafiadores e de alto impacto.',
            'Procuramos um desenvolvedor full stack que combine expertise técnica com visão de produto. Venha crescer conosco em um ambiente que valoriza inovação e desenvolvimento contínuo.'
          ],
          reasoning: 'Resumos que destacam impacto, tecnologias modernas e oportunidades de crescimento - elementos que mais atraem talentos tech'
        }
      ];
      
      setAiSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTemplate = (template: JobTemplate) => {
    setJobData({
      title: template.template.title,
      department: '',
      location: '',
      workModel: 'hybrid',
      jobType: 'full-time',
      salaryMin: '',
      salaryMax: '',
      summary: template.template.summary,
      responsibilities: template.template.responsibilities,
      requirements: template.template.requirements,
      benefits: template.template.benefits,
      companyDescription: template.template.companyDescription
    });
    setActiveTab('ai-writer');
  };

  const handleApplySuggestion = (field: string, suggestion: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: suggestion
    }));
  };

  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setJobData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number, value: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech': return '💻';
      case 'sales': return '📈';
      case 'marketing': return '🎯';
      case 'finance': return '💰';
      case 'hr': return '👥';
      case 'operations': return '⚙️';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tech': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'sales': return 'bg-green-500/20 text-green-200 border-green-500/30';
      case 'marketing': return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
      case 'finance': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'hr': return 'bg-pink-500/20 text-pink-200 border-pink-500/30';
      case 'operations': return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <CompanyLayout
      title="Assistente IA para Vagas"
      description="Crie descrições de vagas atrativas e eficazes com inteligência artificial"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/jobs')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Voltar
          </button>
          <button
            onClick={() => {/* Implementar salvamento */}}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Vaga
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Templates Inteligentes
            </button>
            <button
              onClick={() => setActiveTab('ai-writer')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'ai-writer'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Escritor IA
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'optimizer'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Otimizador
            </button>
          </div>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Templates Inteligentes</h2>
                  <p className="text-white/60 text-sm mt-1">Escolha um template otimizado para sua área e personalize</p>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{templates.length} templates disponíveis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                            {template.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">{template.popularity}%</span>
                      </div>
                    </div>

                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-white/60 px-2 py-1">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all text-sm"
                      >
                        <Wand2 className="w-4 h-4" />
                        Usar Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Writer Tab */}
        {activeTab === 'ai-writer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Criar Vaga com IA</h2>
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gerar Sugestões IA
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Título da Vaga</label>
                      <input
                        type="text"
                        value={jobData.title}
                        onChange={(e) => setJobData({...jobData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: Desenvolvedor Full Stack Senior"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Departamento</label>
                      <input
                        type="text"
                        value={jobData.department}
                        onChange={(e) => setJobData({...jobData, department: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ex: Tecnologia"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Resumo da Vaga</label>
                    <textarea
                      value={jobData.summary}
                      onChange={(e) => setJobData({...jobData, summary: e.target.value})}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Descreva a vaga de forma atrativa..."
                    />
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-white">Responsabilidades</label>
                      <button
                        onClick={() => addListItem('responsibilities')}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded text-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {jobData.responsibilities.map((responsibility, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={responsibility}
                            onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Descreva uma responsabilidade..."
                          />
                          {jobData.responsibilities.length > 1 && (
                            <button
                              onClick={() => removeListItem('responsibilities', index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-white">Requisitos</label>
                      <button
                        onClick={() => addListItem('requirements')}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded text-xs transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {jobData.requirements.map((requirement, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) => updateListItem('requirements', index, e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Descreva um requisito..."
                          />
                          {jobData.requirements.length > 1 && (
                            <button
                              onClick={() => removeListItem('requirements', index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Sugestões da IA</h2>
                </div>

                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Gere sugestões inteligentes</h3>
                    <p className="text-white/60 mb-4">Clique em "Gerar Sugestões IA" para receber recomendações personalizadas</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-green-400" />
                          <h4 className="font-medium text-white capitalize">{suggestion.field}</h4>
                        </div>

                        <p className="text-white/70 text-sm mb-4">{suggestion.reasoning}</p>

                        <div className="space-y-2">
                          {suggestion.suggestions.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-white/80 text-sm flex-1">{item}</p>
                              <button
                                onClick={() => handleApplySuggestion(suggestion.field, item)}
                                className="ml-3 flex items-center gap-1 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded text-xs transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                                Usar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Optimizer Tab */}
        {activeTab === 'optimizer' && (
          <JobOptimizer
            jobData={jobData}
            onOptimize={(optimizedData) => {
              setJobData(optimizedData);
              setActiveTab('ai-writer');
            }}
          />
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(selectedTemplate.category)}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedTemplate.name}</h3>
                      <p className="text-white/60">{selectedTemplate.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Título</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white">{selectedTemplate.template.title}</p>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Resumo</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white/80">{selectedTemplate.template.summary}</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Responsabilidades</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ul className="space-y-2">
                      {selectedTemplate.template.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Requisitos</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ul className="space-y-2">
                      {selectedTemplate.template.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Benefícios</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <ul className="space-y-2">
                      {selectedTemplate.template.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Company Description */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Sobre a Empresa</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white/80">{selectedTemplate.template.companyDescription}</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-lg text-sm border border-purple-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                >
                  <Wand2 className="w-4 h-4" />
                  Usar Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};
