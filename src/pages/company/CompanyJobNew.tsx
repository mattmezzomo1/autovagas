import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { CustomStepsPreview } from '../../components/company/CustomStepsPreview';
import { StepTemplates } from '../../components/company/StepTemplates';
import { AIInterviewConfig } from '../../components/company/AIInterviewConfig';
import {
  X, Plus, Building2, MapPin, Banknote, Users, Clock, FileText,
  Settings, CheckCircle, Video, FileQuestion, MessageSquare,
  ArrowRight, ArrowDown, ArrowUp, Trash2, Save, Sparkles, Layout, Brain
} from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  department: string;
  location: string;
  workModel: 'onsite' | 'remote' | 'hybrid';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryMin: number;
  salaryMax: number;
  displaySalary: boolean;
  skills: string[];
  requirements: string[];
  benefits: string[];
  industry: string;
  experienceYears: number;
  vacancies: number;
  customSteps: SelectionStep[];
}

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

export const CompanyJobNew: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showStepsConfig, setShowStepsConfig] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingStep, setEditingStep] = useState<SelectionStep | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    department: '',
    location: '',
    workModel: 'hybrid',
    jobType: 'full-time',
    salaryMin: 0,
    salaryMax: 0,
    displaySalary: true,
    skills: [],
    requirements: [],
    benefits: [],
    industry: '',
    experienceYears: 0,
    vacancies: 1,
    customSteps: [
      {
        id: '1',
        name: 'Triagem Inicial',
        type: 'screening',
        description: 'Análise automática do currículo com IA',
        isRequired: true,
        order: 1,
        config: {
          passingScore: 70,
          autoAdvance: true,
          advanceScore: 85
        }
      }
    ]
  });

  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  // Estados para controle de processo seletivo e entrevista IA
  const [enableCustomProcess, setEnableCustomProcess] = useState(true);
  const [enableAIInterview, setEnableAIInterview] = useState(false);
  const [showAIInterviewConfig, setShowAIInterviewConfig] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aqui seria feita a chamada para a API
      console.log('Criando vaga com etapas customizadas:', formData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirecionar para a lista de vagas
      navigate('/company/jobs');
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (field: 'skills' | 'requirements' | 'benefits', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      switch (field) {
        case 'skills':
          setNewSkill('');
          break;
        case 'requirements':
          setNewRequirement('');
          break;
        case 'benefits':
          setNewBenefit('');
          break;
      }
    }
  };

  const removeItem = (field: 'skills' | 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar etapas customizadas
  const addCustomStep = () => {
    const newStep: SelectionStep = {
      id: Date.now().toString(),
      name: 'Nova Etapa',
      type: 'screening',
      description: '',
      isRequired: false,
      order: formData.customSteps.length + 1,
      config: {}
    };
    setFormData(prev => ({
      ...prev,
      customSteps: [...prev.customSteps, newStep]
    }));
    setEditingStep(newStep);
  };

  const updateCustomStep = (stepId: string, updates: Partial<SelectionStep>) => {
    setFormData(prev => ({
      ...prev,
      customSteps: prev.customSteps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
    if (editingStep && editingStep.id === stepId) {
      setEditingStep({ ...editingStep, ...updates });
    }
  };

  const removeCustomStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      customSteps: prev.customSteps.filter(step => step.id !== stepId)
    }));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const steps = [...formData.customSteps];
    const index = steps.findIndex(step => step.id === stepId);
    
    if (direction === 'up' && index > 0) {
      [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
    } else if (direction === 'down' && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    }
    
    // Atualizar ordem
    steps.forEach((step, idx) => {
      step.order = idx + 1;
    });
    
    setFormData(prev => ({ ...prev, customSteps: steps }));
  };

  const handleTemplateSelect = (steps: SelectionStep[]) => {
    setFormData(prev => ({ ...prev, customSteps: steps }));
    setShowTemplates(false);
  };

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

  return (
    <CompanyLayout
      title="Nova Vaga"
      description="Crie uma nova vaga com processo seletivo customizado"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/jobs')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={() => {/* Implementar sugestão com IA */}}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Sugerir com IA
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Título da Vaga *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Desenvolvedor Full Stack Senior"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Departamento</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Tecnologia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Localização *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: São Paulo, SP"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Modelo de Trabalho</label>
                <select
                  value={formData.workModel}
                  onChange={(e) => setFormData({...formData, workModel: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="onsite">Presencial</option>
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Tipo de Contrato</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({...formData, jobType: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="internship">Estágio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Número de Vagas</label>
                <input
                  type="number"
                  min="1"
                  value={formData.vacancies}
                  onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value) || 1})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Salário Mínimo (R$)</label>
                <input
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={(e) => setFormData({...formData, salaryMin: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Salário Máximo (R$)</label>
                <input
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={(e) => setFormData({...formData, salaryMax: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="8000"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.displaySalary}
                    onChange={(e) => setFormData({...formData, displaySalary: e.target.checked})}
                    className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                  />
                  Exibir salário
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-white mb-2">Descrição da Vaga *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descreva a vaga, responsabilidades e o que a empresa oferece..."
                required
              />
            </div>
          </div>

          {/* Skills, Requirements, Benefits */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Detalhes da Vaga</h2>

            {/* Skills */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Habilidades Necessárias</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Adicione uma habilidade"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', newSkill))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('skills', newSkill)}
                    className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-500/20 text-purple-200 px-3 py-2 rounded-lg border border-purple-500/30"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('skills', index)}
                        className="text-purple-300 hover:text-purple-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Requisitos</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Adicione um requisito"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', newRequirement))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('requirements', newRequirement)}
                    className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <span className="text-white">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('requirements', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Benefícios</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Adicione um benefício"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('benefits', newBenefit))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('benefits', newBenefit)}
                    className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <span className="text-white">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('benefits', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Selection Steps */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Processo Seletivo Customizado</h2>
                  <p className="text-white/60 text-sm mt-1">Configure as etapas do processo seletivo para esta vaga</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enableCustomProcess}
                      onChange={(e) => setEnableCustomProcess(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      enableCustomProcess ? 'bg-purple-500' : 'bg-white/20'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        enableCustomProcess ? 'translate-x-5' : 'translate-x-0.5'
                      } translate-y-0.5`}></div>
                    </div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">Ativar processo customizado</span>
                </label>
              </div>
              {enableCustomProcess && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors"
                  >
                    <Layout className="w-4 h-4" />
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStepsConfig(!showStepsConfig)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {showStepsConfig ? 'Ocultar' : 'Configurar'} Etapas
                  </button>
                </div>
              )}
            </div>

            {enableCustomProcess && (
              <>
                {/* Steps Preview */}
                <CustomStepsPreview steps={formData.customSteps} className="mb-6" />

                {/* Templates Section */}
                {showTemplates && (
              <div className="mb-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Templates de Processo Seletivo</h3>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-white/60 text-sm mb-6">
                    Escolha um template pré-configurado para acelerar a criação do seu processo seletivo
                  </p>
                  <StepTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              </div>
            )}

            {showStepsConfig && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Configurar Etapas</h3>
                    <button
                      type="button"
                      onClick={addCustomStep}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Etapa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.customSteps.map((step, index) => (
                      <div key={step.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-purple-200">
                              {getStepIcon(step.type)}
                              <span className="font-medium">{step.name}</span>
                            </div>
                            <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                              Etapa {step.order}
                            </span>
                            {step.isRequired && (
                              <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded">
                                Obrigatória
                              </span>
                            )}
                            {step.config.autoAdvance && (
                              <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">
                                Auto-Avanço
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === formData.customSteps.length - 1}
                              className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStep(step)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomStep(step.id)}
                              disabled={formData.customSteps.length === 1}
                              className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm text-white/70 mb-2">
                          {getStepTypeLabel(step.type)}
                        </div>

                        {step.description && (
                          <div className="text-sm text-white/60">
                            {step.description}
                          </div>
                        )}

                        {/* Step Configuration Summary */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.config.duration && (
                            <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                              {step.config.duration} min
                            </span>
                          )}
                          {step.config.passingScore && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
                              Nota mín: {step.config.passingScore}%
                            </span>
                          )}
                          {step.config.advanceScore && (
                            <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">
                              Auto-avanço: {step.config.advanceScore}%
                            </span>
                          )}
                          {step.config.questions && step.config.questions.length > 0 && (
                            <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                              {step.config.questions.length} perguntas
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {!enableCustomProcess && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-white/60 text-lg font-medium mb-2">Processo Seletivo Padrão</h3>
                <p className="text-white/40 text-sm">
                  Ative o processo seletivo customizado para configurar etapas específicas para esta vaga
                </p>
              </div>
            )}
          </div>

          {/* AI Interview Configuration */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Entrevista com IA</h2>
                  <p className="text-white/60 text-sm mt-1">Configure entrevistas automatizadas com inteligência artificial</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enableAIInterview}
                      onChange={(e) => {
                        setEnableAIInterview(e.target.checked);
                        if (e.target.checked) {
                          setShowAIInterviewConfig(true);
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      enableAIInterview ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        enableAIInterview ? 'translate-x-5' : 'translate-x-0.5'
                      } translate-y-0.5`}></div>
                    </div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">Ativar entrevista com IA</span>
                </label>
              </div>
              {enableAIInterview && (
                <button
                  type="button"
                  onClick={() => setShowAIInterviewConfig(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Configurar Entrevista IA
                </button>
              )}
            </div>

            {enableAIInterview && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Perguntas Personalizadas</h3>
                    <p className="text-white/60 text-sm">Configure perguntas específicas para a vaga com respostas ideais</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileQuestion className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Testes Técnicos</h3>
                    <p className="text-white/60 text-sm">Avalie conhecimentos técnicos específicos da área</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Análise Comportamental</h3>
                    <p className="text-white/60 text-sm">Testes psicológicos e de perfil comportamental</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/company/jobs')}
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Vaga
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Step Configuration Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Configurar Etapa: {editingStep.name}</h3>
                <button
                  onClick={() => setEditingStep(null)}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome da Etapa</label>
                  <input
                    type="text"
                    value={editingStep.name}
                    onChange={(e) => updateCustomStep(editingStep.id, { name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Entrevista Técnica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tipo de Etapa</label>
                  <select
                    value={editingStep.type}
                    onChange={(e) => updateCustomStep(editingStep.id, { type: e.target.value as SelectionStep['type'] })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="screening">Triagem Automática</option>
                    <option value="test">Teste Técnico</option>
                    <option value="interview">Entrevista</option>
                    <option value="video">Vídeo Apresentação</option>
                    <option value="custom_questions">Perguntas Extras</option>
                    <option value="document_review">Análise de Documentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Descrição</label>
                <textarea
                  value={editingStep.description}
                  onChange={(e) => updateCustomStep(editingStep.id, { description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descreva o que será avaliado nesta etapa..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingStep.isRequired}
                    onChange={(e) => updateCustomStep(editingStep.id, { isRequired: e.target.checked })}
                    className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                  />
                  Etapa obrigatória
                </label>

                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingStep.config.autoAdvance || false}
                    onChange={(e) => updateCustomStep(editingStep.id, {
                      config: { ...editingStep.config, autoAdvance: e.target.checked }
                    })}
                    className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                  />
                  Avanço automático
                </label>
              </div>

              {/* Auto-advance score */}
              {editingStep.config.autoAdvance && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nota para Avanço Automático (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingStep.config.advanceScore || ''}
                    onChange={(e) => updateCustomStep(editingStep.id, {
                      config: { ...editingStep.config, advanceScore: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                    placeholder="85"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Candidatos com nota igual ou superior serão automaticamente aprovados para a próxima etapa
                  </p>
                </div>
              )}

              {/* Type-specific configurations */}
              {editingStep.type === 'screening' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white">Configurações da Triagem</h4>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nota Mínima para Aprovação (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingStep.config.passingScore || ''}
                      onChange={(e) => updateCustomStep(editingStep.id, {
                        config: { ...editingStep.config, passingScore: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      placeholder="70"
                    />
                  </div>
                </div>
              )}

              {editingStep.type === 'test' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white">Configurações do Teste</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Duração (minutos)</label>
                      <input
                        type="number"
                        value={editingStep.config.duration || ''}
                        onChange={(e) => updateCustomStep(editingStep.id, {
                          config: { ...editingStep.config, duration: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Nota Mínima (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingStep.config.passingScore || ''}
                        onChange={(e) => updateCustomStep(editingStep.id, {
                          config: { ...editingStep.config, passingScore: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                        placeholder="70"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={editingStep.config.allowRetries || false}
                        onChange={(e) => updateCustomStep(editingStep.id, {
                          config: { ...editingStep.config, allowRetries: e.target.checked }
                        })}
                        className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                      />
                      Permitir tentativas extras
                    </label>
                    {editingStep.config.allowRetries && (
                      <div>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editingStep.config.maxRetries || 1}
                          onChange={(e) => updateCustomStep(editingStep.id, {
                            config: { ...editingStep.config, maxRetries: parseInt(e.target.value) || 1 }
                          })}
                          className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingStep(null)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setEditingStep(null)}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Interview Configuration Modal */}
      <AIInterviewConfig
        isOpen={showAIInterviewConfig}
        onClose={() => setShowAIInterviewConfig(false)}
        onSave={(config) => {
          console.log('Configuração da entrevista IA salva:', config);
          // Aqui você pode salvar a configuração no formData ou em outro estado
        }}
      />
    </CompanyLayout>
  );
};
