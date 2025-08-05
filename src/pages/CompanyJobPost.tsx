import React, { useState } from 'react';
import { X, Plus, Building2, MapPin, Banknote, Users, Clock, FileText, Settings, CheckCircle, Video, FileQuestion, MessageSquare, ArrowRight, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
  };
  skills: string[];
  requirements: string[];
  benefits: string[];
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
    duration?: number; // em minutos
    questions?: string[];
    passingScore?: number;
    allowRetries?: boolean;
    maxRetries?: number;
    documents?: string[];
    interviewType?: 'phone' | 'video' | 'in_person' | 'ai';
    interviewers?: string[];
  };
}

export const CompanyJobPost: React.FC = () => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    salary: {
      min: 0,
      max: 0
    },
    skills: [],
    requirements: [],
    benefits: [],
    customSteps: [
      {
        id: '1',
        name: 'Triagem Inicial',
        type: 'screening',
        description: 'Análise automática do currículo',
        isRequired: true,
        order: 1,
        config: {
          passingScore: 70
        }
      }
    ]
  });

  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [showStepsConfig, setShowStepsConfig] = useState(false);
  const [editingStep, setEditingStep] = useState<SelectionStep | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job posting submission
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Nova Vaga</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Informações Básicas</h2>
              
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Título da Vaga
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                  placeholder="Ex: Desenvolvedor Full Stack Senior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100 h-32"
                  placeholder="Descreva as responsabilidades e o dia a dia do cargo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="Cidade, Estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Tipo de Contratação
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contrato</option>
                    <option value="internship">Estágio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Salário Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.salary.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salary: { ...prev.salary, min: Number(e.target.value) }
                    }))}
                    className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Salário Máximo
                  </label>
                  <input
                    type="number"
                    value={formData.salary.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salary: { ...prev.salary, max: Number(e.target.value) }
                    }))}
                    className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Habilidades Necessárias</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="Adicione uma habilidade"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', newSkill))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('skills', newSkill)}
                    className="btn-primary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-500/10 text-purple-200 px-3 py-1.5 rounded-full"
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
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Requisitos</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    className="flex-1 bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="Adicione um requisito"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', newRequirement))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('requirements', newRequirement)}
                    className="btn-primary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-3"
                    >
                      <span className="text-purple-200">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('requirements', index)}
                        className="text-purple-300 hover:text-purple-100"
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
              <h2 className="text-lg font-semibold text-white mb-4">Benefícios</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1 bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-purple-100"
                    placeholder="Adicione um benefício"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('benefits', newBenefit))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('benefits', newBenefit)}
                    className="btn-primary px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-xl p-3"
                    >
                      <span className="text-purple-200">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('benefits', index)}
                        className="text-purple-300 hover:text-purple-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Selection Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Processo Seletivo Customizado</h2>
                <button
                  type="button"
                  onClick={() => setShowStepsConfig(!showStepsConfig)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {showStepsConfig ? 'Ocultar' : 'Configurar'} Etapas
                </button>
              </div>

              {showStepsConfig && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-white">Etapas do Processo</h3>
                      <button
                        type="button"
                        onClick={addCustomStep}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
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
                                className="p-1 text-red-400 hover:text-red-300"
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                className="btn-secondary px-6"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Publicar Vaga
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Step Configuration Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Configurar Etapa</h3>
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

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingStep.isRequired}
                    onChange={(e) => updateCustomStep(editingStep.id, { isRequired: e.target.checked })}
                    className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                  />
                  Etapa obrigatória
                </label>
              </div>

              {/* Type-specific configurations */}
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

              {editingStep.type === 'interview' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white">Configurações da Entrevista</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Tipo de Entrevista</label>
                      <select
                        value={editingStep.config.interviewType || 'video'}
                        onChange={(e) => updateCustomStep(editingStep.id, {
                          config: { ...editingStep.config, interviewType: e.target.value as any }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="phone">Telefone</option>
                        <option value="video">Vídeo</option>
                        <option value="in_person">Presencial</option>
                        <option value="ai">IA (Automática)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Duração (minutos)</label>
                      <input
                        type="number"
                        value={editingStep.config.duration || ''}
                        onChange={(e) => updateCustomStep(editingStep.id, {
                          config: { ...editingStep.config, duration: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingStep.type === 'custom_questions' && (
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white">Perguntas Personalizadas</h4>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Perguntas</label>
                    <textarea
                      value={(editingStep.config.questions || []).join('\n')}
                      onChange={(e) => updateCustomStep(editingStep.id, {
                        config: { ...editingStep.config, questions: e.target.value.split('\n').filter(q => q.trim()) }
                      })}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Digite uma pergunta por linha..."
                    />
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
    </div>
  );
};