import React, { useState, useEffect } from 'react';
import { 
  X, Zap, Target, Clock, Users, CheckCircle, 
  ArrowRight, Settings, AlertTriangle, Save, Plus, Trash2
} from 'lucide-react';

interface AutoAdvanceRule {
  id: string;
  name: string;
  fromStepId: string;
  toStepId: string;
  enabled: boolean;
  conditions: {
    minScore?: number;
    maxScore?: number;
    skillsRequired?: string[];
    experienceMin?: number;
    culturalFitMin?: number;
    timeLimit?: number;
    customCriteria?: {
      field: string;
      operator: 'equals' | 'greater' | 'less' | 'contains';
      value: string | number;
    }[];
  };
  actions: {
    autoApprove: boolean;
    sendNotification: boolean;
    scheduleInterview?: boolean;
    assignRecruiter?: string;
    addTags?: string[];
  };
  priority: number;
}

interface SelectionStep {
  id: string;
  name: string;
  type: string;
  order: number;
}

interface AutoAdvanceRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: AutoAdvanceRule) => void;
  rule?: AutoAdvanceRule | null;
  steps: SelectionStep[];
}

export const AutoAdvanceRuleModal: React.FC<AutoAdvanceRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rule,
  steps
}) => {
  const [formData, setFormData] = useState<AutoAdvanceRule>({
    id: '',
    name: '',
    fromStepId: '',
    toStepId: '',
    enabled: true,
    conditions: {},
    actions: {
      autoApprove: true,
      sendNotification: true
    },
    priority: 1
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'actions'>('basic');

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        id: Date.now().toString(),
        name: '',
        fromStepId: '',
        toStepId: '',
        enabled: true,
        conditions: {},
        actions: {
          autoApprove: true,
          sendNotification: true
        },
        priority: 1
      });
    }
  }, [rule, isOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.fromStepId || !formData.toStepId) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    onSave(formData);
    onClose();
  };

  const updateFormData = (updates: Partial<AutoAdvanceRule>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateConditions = (updates: Partial<AutoAdvanceRule['conditions']>) => {
    setFormData(prev => ({
      ...prev,
      conditions: { ...prev.conditions, ...updates }
    }));
  };

  const updateActions = (updates: Partial<AutoAdvanceRule['actions']>) => {
    setFormData(prev => ({
      ...prev,
      actions: { ...prev.actions, ...updates }
    }));
  };

  const addCustomCriteria = () => {
    const newCriteria = {
      field: '',
      operator: 'equals' as const,
      value: ''
    };
    
    updateConditions({
      customCriteria: [...(formData.conditions.customCriteria || []), newCriteria]
    });
  };

  const removeCustomCriteria = (index: number) => {
    const newCriteria = formData.conditions.customCriteria?.filter((_, i) => i !== index) || [];
    updateConditions({ customCriteria: newCriteria });
  };

  const updateCustomCriteria = (index: number, updates: any) => {
    const newCriteria = [...(formData.conditions.customCriteria || [])];
    newCriteria[index] = { ...newCriteria[index], ...updates };
    updateConditions({ customCriteria: newCriteria });
  };

  const getAvailableToSteps = () => {
    const fromStep = steps.find(s => s.id === formData.fromStepId);
    if (!fromStep) return [];
    
    return [
      ...steps.filter(s => s.order > fromStep.order),
      { id: 'approved', name: 'Aprovado Final', type: 'final', order: 999 },
      { id: 'rejected', name: 'Rejeitado', type: 'final', order: 1000 }
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {rule ? 'Editar Regra' : 'Nova Regra de Movimento Automático'}
                </h3>
                <p className="text-white/60 text-sm">Configure condições e ações para progressão automática</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('basic')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configuração Básica</span>
              </button>
              
              <button
                onClick={() => setActiveTab('conditions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'conditions'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Target className="w-4 h-4" />
                <span className="text-sm">Condições</span>
              </button>
              
              <button
                onClick={() => setActiveTab('actions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'actions'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ações</span>
              </button>
            </div>

            {/* Preview */}
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-white/70 mb-2">Preview</div>
              <div className="text-xs text-white/60">
                {formData.fromStepId && formData.toStepId ? (
                  <div className="flex items-center gap-1">
                    <span>{steps.find(s => s.id === formData.fromStepId)?.name || 'Origem'}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>
                      {formData.toStepId === 'approved' ? 'Aprovado' :
                       formData.toStepId === 'rejected' ? 'Rejeitado' :
                       steps.find(s => s.id === formData.toStepId)?.name || 'Destino'}
                    </span>
                  </div>
                ) : (
                  'Configure origem e destino'
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome da Regra *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Auto-aprovação para candidatos excelentes"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Etapa de Origem *</label>
                    <select
                      value={formData.fromStepId}
                      onChange={(e) => updateFormData({ fromStepId: e.target.value, toStepId: '' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecione a etapa de origem</option>
                      {steps.map(step => (
                        <option key={step.id} value={step.id}>{step.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Etapa de Destino *</label>
                    <select
                      value={formData.toStepId}
                      onChange={(e) => updateFormData({ toStepId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={!formData.fromStepId}
                    >
                      <option value="">Selecione a etapa de destino</option>
                      {getAvailableToSteps().map(step => (
                        <option key={step.id} value={step.id}>{step.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => updateFormData({ priority: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={1}>Alta (1)</option>
                      <option value={2}>Média (2)</option>
                      <option value={3}>Baixa (3)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => updateFormData({ enabled: e.target.checked })}
                        className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                      />
                      Regra ativa
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'conditions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Score Mínimo</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.minScore || ''}
                      onChange={(e) => updateConditions({ minScore: parseInt(e.target.value) || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      placeholder="Ex: 80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Score Máximo</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.maxScore || ''}
                      onChange={(e) => updateConditions({ maxScore: parseInt(e.target.value) || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      placeholder="Ex: 40 (para rejeição)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Fit Cultural Mínimo (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.culturalFitMin || ''}
                      onChange={(e) => updateConditions({ culturalFitMin: parseInt(e.target.value) || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      placeholder="Ex: 75"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Limite de Tempo (horas)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.conditions.timeLimit || ''}
                      onChange={(e) => updateConditions({ timeLimit: parseInt(e.target.value) || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                      placeholder="Ex: 24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Experiência Mínima (anos)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.conditions.experienceMin || ''}
                    onChange={(e) => updateConditions({ experienceMin: parseInt(e.target.value) || undefined })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                    placeholder="Ex: 3"
                  />
                </div>

                {/* Custom Criteria */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-white">Critérios Personalizados</label>
                    <button
                      onClick={addCustomCriteria}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.conditions.customCriteria?.map((criteria, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={criteria.field}
                            onChange={(e) => updateCustomCriteria(index, { field: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Campo"
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={criteria.operator}
                            onChange={(e) => updateCustomCriteria(index, { operator: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="equals">Igual a</option>
                            <option value="greater">Maior que</option>
                            <option value="less">Menor que</option>
                            <option value="contains">Contém</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={criteria.value}
                            onChange={(e) => updateCustomCriteria(index, { value: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Valor"
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeCustomCriteria(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={formData.actions.autoApprove}
                      onChange={(e) => updateActions({ autoApprove: e.target.checked })}
                      className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium">Auto-aprovação</span>
                      <p className="text-sm text-white/60">Aprovar automaticamente candidatos que atendem aos critérios</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={formData.actions.sendNotification}
                      onChange={(e) => updateActions({ sendNotification: e.target.checked })}
                      className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium">Enviar notificação</span>
                      <p className="text-sm text-white/60">Notificar recrutadores sobre o movimento automático</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={formData.actions.scheduleInterview || false}
                      onChange={(e) => updateActions({ scheduleInterview: e.target.checked })}
                      className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-medium">Agendar entrevista automaticamente</span>
                      <p className="text-sm text-white/60">Criar agendamento automático para próxima etapa</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Tags para adicionar</label>
                  <input
                    type="text"
                    value={formData.actions.addTags?.join(', ') || ''}
                    onChange={(e) => updateActions({ 
                      addTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: high-potential, fast-track (separadas por vírgula)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Atribuir a recrutador</label>
                  <select
                    value={formData.actions.assignRecruiter || ''}
                    onChange={(e) => updateActions({ assignRecruiter: e.target.value || undefined })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Não atribuir</option>
                    <option value="recruiter1">Ana Silva (Recrutadora Senior)</option>
                    <option value="recruiter2">Carlos Santos (Recrutador Técnico)</option>
                    <option value="recruiter3">Maria Oliveira (Gerente de RH)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Regra
          </button>
        </div>
      </div>
    </div>
  );
};
