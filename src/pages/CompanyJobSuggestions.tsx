import React, { useState } from 'react';
import { ArrowLeft, Building2, Bot, Briefcase, Users, Brain, Sparkles, Plus, ChevronDown, ChevronUp, Search, Upload, Link as LinkIcon, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompanyJobSuggestions: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState({
    products: '',
    markets: '',
    operations: '',
    processes: '',
    departments: '',
    website: '',
  });

  const [presentation, setPresentation] = useState<File | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const suggestedJobs = [
    {
      id: 1,
      title: 'Tech Lead - Microservices',
      department: 'Engenharia',
      priority: 'Alta',
      reason: 'Baseado na sua descrição de processos de microsserviços e necessidade de escalabilidade',
      requirements: [
        'Experiência com arquitetura de microsserviços',
        'Conhecimento em Kubernetes e Docker',
        'Liderança técnica',
      ],
      expanded: false,
    },
    {
      id: 2,
      title: 'Product Manager - Fintech',
      department: 'Produto',
      priority: 'Média',
      reason: 'Alinhado com sua expansão para o mercado financeiro e necessidade de gestão de produto',
      requirements: [
        'Experiência em produtos financeiros',
        'Metodologias ágeis',
        'Análise de dados',
      ],
      expanded: false,
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      department: 'Infraestrutura',
      priority: 'Alta',
      reason: 'Necessário para otimizar os processos de CI/CD e automação descritos',
      requirements: [
        'AWS/GCP',
        'Terraform',
        'CI/CD',
      ],
      expanded: false,
    },
  ];

  const [jobs, setJobs] = useState(suggestedJobs);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPresentation(file);
    }
  };

  const removeFile = () => {
    setPresentation(null);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowSuggestions(false);
    // Simular análise da IA
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowSuggestions(true);
    }, 2000);
  };

  const toggleJobExpansion = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, expanded: !job.expanded } : job
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'média':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'baixa':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/company"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestão Inteligente de Vagas</h1>
                <p className="text-purple-200">Deixe nossa IA sugerir as vagas ideais para sua empresa</p>
              </div>
            </div>

            {/* Website Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Website da Empresa
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 pl-10 text-purple-100"
                  placeholder="https://www.suaempresa.com"
                />
              </div>
            </div>

            {/* Presentation Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Apresentação da Empresa
              </label>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                {presentation ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-purple-400" />
                      <div>
                        <div className="text-purple-100 font-medium">{presentation.name}</div>
                        <div className="text-purple-300 text-sm">
                          {(presentation.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-purple-200 mb-2">
                      Arraste sua apresentação ou
                    </div>
                    <label className="btn-secondary inline-flex cursor-pointer">
                      <span>Escolher arquivo</span>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <div className="text-purple-300/70 text-sm mt-2">
                      PDF ou PowerPoint até 10MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Produtos e Serviços
                </label>
                <textarea
                  value={companyInfo.products}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, products: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100 h-32"
                  placeholder="Descreva os principais produtos e serviços da sua empresa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Mercados de Atuação
                </label>
                <textarea
                  value={companyInfo.markets}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, markets: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100 h-32"
                  placeholder="Em quais mercados sua empresa atua..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Operações
                </label>
                <textarea
                  value={companyInfo.operations}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, operations: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100 h-32"
                  placeholder="Como funciona a operação da empresa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Processos
                </label>
                <textarea
                  value={companyInfo.processes}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, processes: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100 h-32"
                  placeholder="Principais processos internos..."
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Setores e Departamentos
              </label>
              <textarea
                value={companyInfo.departments}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, departments: e.target.value }))}
                className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                placeholder="Liste os principais setores e departamentos da empresa..."
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                className="btn-primary px-6"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Bot className="w-5 h-5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analisar com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Sugestões de Vagas</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    placeholder="Buscar sugestões..."
                    className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-purple-100"
                  />
                </div>
                <button className="btn-secondary px-4">
                  Filtrar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2 text-purple-200">
                            <Building2 className="w-4 h-4" />
                            {job.department}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(job.priority)}`}>
                            Prioridade {job.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/company/job/new"
                        className="btn-primary px-4 py-2"
                      >
                        <Plus className="w-4 h-4" />
                        Publicar Vaga
                      </Link>
                      <button
                        onClick={() => toggleJobExpansion(job.id)}
                        className="btn-secondary p-2"
                      >
                        {job.expanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {job.expanded && (
                    <div className="mt-6 pl-16">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-purple-200 mb-2">Por que esta vaga?</h4>
                          <p className="text-purple-300">{job.reason}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-200 mb-2">Requisitos Sugeridos</h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2 text-purple-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};