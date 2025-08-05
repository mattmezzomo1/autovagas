import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, Settings, Plus, Edit, Trash2, Save, 
  FileText, Users, Calendar, Award, Shield, 
  ArrowUp, ArrowDown, Clock, CheckCircle, 
  AlertTriangle, Copy, Eye, Zap, RotateCcw
} from 'lucide-react';

interface AdmissionStep {
  id: string;
  name: string;
  type: 'document' | 'form' | 'meeting' | 'training' | 'validation';
  required: boolean;
  order: number;
  estimatedDuration: number; // em dias
  description: string;
  dependencies: string[];
  autoAdvance: boolean;
  assignedRole: string;
  documents?: {
    name: string;
    required: boolean;
    validationRules: string[];
  }[];
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    reminderDays: number[];
  };
}

interface AdmissionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'sales' | 'admin' | 'executive' | 'general';
  steps: AdmissionStep[];
  estimatedDuration: number;
  popularity: number;
}

export const AdmissionConfig: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<AdmissionStep[]>([]);
  const [templates, setTemplates] = useState<AdmissionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'templates' | 'settings'>('steps');
  const [editingStep, setEditingStep] = useState<AdmissionStep | null>(null);
  const [showNewStepModal, setShowNewStepModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockSteps: AdmissionStep[] = [
      {
        id: '1',
        name: 'Documentos Pessoais',
        type: 'document',
        required: true,
        order: 1,
        estimatedDuration: 1,
        description: 'Coleta de documentos pessoais básicos (RG, CPF, comprovante de residência)',
        dependencies: [],
        autoAdvance: true,
        assignedRole: 'RH',
        documents: [
          { name: 'RG', required: true, validationRules: ['formato_valido', 'legivel'] },
          { name: 'CPF', required: true, validationRules: ['formato_valido', 'ativo'] },
          { name: 'Comprovante de Residência', required: true, validationRules: ['data_recente'] }
        ],
        notifications: {
          onStart: true,
          onComplete: true,
          reminderDays: [3, 1]
        }
      },
      {
        id: '2',
        name: 'Documentos Acadêmicos',
        type: 'document',
        required: true,
        order: 2,
        estimatedDuration: 2,
        description: 'Validação de formação acadêmica e certificações',
        dependencies: ['1'],
        autoAdvance: false,
        assignedRole: 'RH',
        documents: [
          { name: 'Diploma', required: true, validationRules: ['autenticidade', 'instituicao_reconhecida'] },
          { name: 'Histórico Escolar', required: false, validationRules: ['completo'] }
        ],
        notifications: {
          onStart: true,
          onComplete: true,
          reminderDays: [5, 2]
        }
      },
      {
        id: '3',
        name: 'Exames Médicos',
        type: 'document',
        required: true,
        order: 3,
        estimatedDuration: 3,
        description: 'Exame médico admissional e outros exames específicos',
        dependencies: ['1'],
        autoAdvance: true,
        assignedRole: 'Médico do Trabalho',
        documents: [
          { name: 'Exame Admissional', required: true, validationRules: ['apto_trabalho', 'data_recente'] }
        ],
        notifications: {
          onStart: true,
          onComplete: true,
          reminderDays: [7, 3, 1]
        }
      },
      {
        id: '4',
        name: 'Assinatura de Contrato',
        type: 'form',
        required: true,
        order: 4,
        estimatedDuration: 1,
        description: 'Assinatura digital do contrato de trabalho',
        dependencies: ['1', '2', '3'],
        autoAdvance: true,
        assignedRole: 'Jurídico',
        notifications: {
          onStart: true,
          onComplete: true,
          reminderDays: [2]
        }
      },
      {
        id: '5',
        name: 'Treinamento de Integração',
        type: 'training',
        required: true,
        order: 5,
        estimatedDuration: 5,
        description: 'Treinamento sobre cultura, processos e ferramentas da empresa',
        dependencies: ['4'],
        autoAdvance: false,
        assignedRole: 'Treinamento',
        notifications: {
          onStart: true,
          onComplete: true,
          reminderDays: [10, 5, 2]
        }
      },
      {
        id: '6',
        name: 'Reunião de Boas-vindas',
        type: 'meeting',
        required: false,
        order: 6,
        estimatedDuration: 1,
        description: 'Reunião de apresentação com a equipe e gestor direto',
        dependencies: ['5'],
        autoAdvance: false,
        assignedRole: 'Gestor',
        notifications: {
          onStart: true,
          onComplete: false,
          reminderDays: [3, 1]
        }
      }
    ];

    const mockTemplates: AdmissionTemplate[] = [
      {
        id: '1',
        name: 'Processo Padrão Tech',
        description: 'Template otimizado para cargos de tecnologia com foco em validação técnica',
        category: 'tech',
        steps: mockSteps.filter(s => ['1', '2', '3', '4', '5'].includes(s.id)),
        estimatedDuration: 12,
        popularity: 85
      },
      {
        id: '2',
        name: 'Processo Executivo',
        description: 'Template para cargos de liderança com etapas adicionais de compliance',
        category: 'executive',
        steps: mockSteps,
        estimatedDuration: 15,
        popularity: 72
      },
      {
        id: '3',
        name: 'Processo Simplificado',
        description: 'Template básico para cargos operacionais e administrativos',
        category: 'general',
        steps: mockSteps.filter(s => ['1', '3', '4', '6'].includes(s.id)),
        estimatedDuration: 8,
        popularity: 90
      }
    ];

    setSteps(mockSteps);
    setTemplates(mockTemplates);
    setIsLoading(false);
  }, []);

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Configuração salva:', { steps, templates });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    // Swap steps
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Update order
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    setSteps(newSteps);
  };

  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const duplicateStep = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const newStep: AdmissionStep = {
      ...step,
      id: Date.now().toString(),
      name: `${step.name} (Cópia)`,
      order: steps.length + 1
    };

    setSteps(prev => [...prev, newStep]);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'form': return <Edit className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'training': return <Award className="w-4 h-4" />;
      case 'validation': return <Shield className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'form': return 'bg-green-500/20 text-green-200 border-green-500/30';
      case 'meeting': return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
      case 'training': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'validation': return 'bg-red-500/20 text-red-200 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech': return '💻';
      case 'sales': return '📈';
      case 'admin': return '📋';
      case 'executive': return '👔';
      case 'general': return '⚙️';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <CompanyLayout title="Carregando..." description="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title="Configuração de Admissão"
      description="Configure etapas, templates e regras do processo de admissão digital"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/admission')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleSaveConfiguration}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configuração
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('steps')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'steps'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Etapas
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Copy className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </div>
        </div>

        {/* Steps Tab */}
        {activeTab === 'steps' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Etapas do Processo</h2>
                <p className="text-white/60 text-sm mt-1">Configure as etapas do processo de admissão</p>
              </div>
              <button
                onClick={() => setShowNewStepModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Etapa
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === steps.length - 1}
                          className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-200 font-bold">
                        {step.order}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{step.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 ${getStepTypeColor(step.type)}`}>
                            {getStepIcon(step.type)}
                            {step.type}
                          </span>
                          {step.required && (
                            <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded border border-red-500/30">
                              Obrigatória
                            </span>
                          )}
                          {step.autoAdvance && (
                            <span className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded border border-green-500/30">
                              Auto-avanço
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm">{step.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.estimatedDuration} dia(s)
                          </span>
                          <span>Responsável: {step.assignedRole}</span>
                          {step.dependencies.length > 0 && (
                            <span>Depende de: {step.dependencies.length} etapa(s)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStep(step)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateStep(step.id)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Documents */}
                  {step.documents && step.documents.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-white/70 text-sm font-medium mb-2">Documentos Necessários:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-white text-sm">{doc.name}</span>
                              {doc.required && (
                                <span className="text-xs text-red-300">*</span>
                              )}
                            </div>
                            <span className="text-xs text-white/60">
                              {doc.validationRules.length} regra(s)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h4 className="text-white/70 text-sm font-medium mb-2">Notificações:</h4>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      {step.notifications.onStart && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          Início
                        </span>
                      )}
                      {step.notifications.onComplete && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          Conclusão
                        </span>
                      )}
                      {step.notifications.reminderDays.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-yellow-400" />
                          Lembretes: {step.notifications.reminderDays.join(', ')} dia(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhuma etapa configurada</h3>
                <p className="text-white/60 mb-4">Crie a primeira etapa do seu processo de admissão</p>
                <button
                  onClick={() => setShowNewStepModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeira Etapa
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Templates de Processo</h2>
                <p className="text-white/60 text-sm mt-1">Templates pré-configurados para diferentes tipos de cargo</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Novo Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                      <div>
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <span className="text-xs text-white/60 capitalize">{template.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">{template.popularity}%</span>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm mb-4">{template.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Etapas:</span>
                      <span className="text-white font-medium">{template.steps.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Duração estimada:</span>
                      <span className="text-white font-medium">{template.estimatedDuration} dias</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm">
                      <Copy className="w-4 h-4" />
                      Usar Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Configurações Gerais</h2>
            </div>

            <div className="text-center py-12">
              <RotateCcw className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Em desenvolvimento</h3>
              <p className="text-white/60">Configurações gerais do sistema em breve</p>
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};
