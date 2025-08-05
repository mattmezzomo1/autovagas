import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { AutoAdvanceRuleModal } from '../../components/company/AutoAdvanceRuleModal';
import { AutoAdvanceHistory } from '../../components/company/AutoAdvanceHistory';
import {
  ArrowLeft, Settings, Zap, CheckCircle, ArrowRight,
  Target, Clock, AlertTriangle, Save, RotateCcw,
  Play, Pause, BarChart3, Users, TrendingUp, Info
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
    timeLimit?: number; // em horas
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
  statistics: {
    totalProcessed: number;
    autoAdvanced: number;
    successRate: number;
  };
}

interface SelectionStep {
  id: string;
  name: string;
  type: 'screening' | 'test' | 'interview' | 'video' | 'custom_questions' | 'document_review';
  order: number;
}

export const AutoAdvanceConfig: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rules, setRules] = useState<AutoAdvanceRule[]>([]);
  const [steps, setSteps] = useState<SelectionStep[]>([]);
  const [editingRule, setEditingRule] = useState<AutoAdvanceRule | null>(null);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSteps: SelectionStep[] = [
      { id: '1', name: 'Triagem Inicial', type: 'screening', order: 1 },
      { id: '2', name: 'Teste Técnico', type: 'test', order: 2 },
      { id: '3', name: 'Entrevista Técnica', type: 'interview', order: 3 },
      { id: '4', name: 'Entrevista RH', type: 'interview', order: 4 },
      { id: '5', name: 'Aprovação Final', type: 'interview', order: 5 }
    ];

    const mockRules: AutoAdvanceRule[] = [
      {
        id: '1',
        name: 'Auto-aprovação Triagem Excelente',
        fromStepId: '1',
        toStepId: '2',
        enabled: true,
        conditions: {
          minScore: 90,
          culturalFitMin: 85
        },
        actions: {
          autoApprove: true,
          sendNotification: true,
          addTags: ['high-potential']
        },
        priority: 1,
        statistics: {
          totalProcessed: 150,
          autoAdvanced: 45,
          successRate: 87
        }
      },
      {
        id: '2',
        name: 'Avanço Rápido para Entrevista',
        fromStepId: '2',
        toStepId: '3',
        enabled: true,
        conditions: {
          minScore: 80,
          timeLimit: 24
        },
        actions: {
          autoApprove: true,
          sendNotification: true,
          scheduleInterview: true
        },
        priority: 2,
        statistics: {
          totalProcessed: 89,
          autoAdvanced: 34,
          successRate: 92
        }
      },
      {
        id: '3',
        name: 'Rejeição Automática',
        fromStepId: '1',
        toStepId: 'rejected',
        enabled: false,
        conditions: {
          maxScore: 40
        },
        actions: {
          autoApprove: false,
          sendNotification: true
        },
        priority: 3,
        statistics: {
          totalProcessed: 200,
          autoAdvanced: 23,
          successRate: 95
        }
      }
    ];

    setSteps(mockSteps);
    setRules(mockRules);
    setIsLoading(false);
  }, [jobId]);

  // Mock history data
  const mockHistory = [
    {
      id: '1',
      candidateId: '1',
      candidateName: 'Ana Silva',
      ruleId: '1',
      ruleName: 'Auto-aprovação Triagem Excelente',
      fromStep: 'Triagem Inicial',
      toStep: 'Teste Técnico',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
      score: 92,
      conditions: [
        { field: 'Score IA', expected: 90, actual: 92, met: true },
        { field: 'Fit Cultural', expected: 85, actual: 87, met: true }
      ],
      actions: ['Candidato aprovado automaticamente', 'Notificação enviada', 'Tag "high-potential" adicionada'],
      duration: 3
    },
    {
      id: '2',
      candidateId: '2',
      candidateName: 'Carlos Santos',
      ruleId: '2',
      ruleName: 'Avanço Rápido para Entrevista',
      fromStep: 'Teste Técnico',
      toStep: 'Entrevista Técnica',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
      score: 84,
      conditions: [
        { field: 'Score IA', expected: 80, actual: 84, met: true },
        { field: 'Tempo Limite', expected: 24, actual: 18, met: true }
      ],
      actions: ['Candidato aprovado automaticamente', 'Entrevista agendada', 'Notificação enviada'],
      duration: 5
    }
  ];

  const handleSaveRules = async () => {
    setIsSaving(true);
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Regras salvas:', rules);
    } catch (error) {
      console.error('Erro ao salvar regras:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleSaveRule = (rule: AutoAdvanceRule) => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules(prev => [...prev, rule]);
    }
    setEditingRule(null);
    setShowNewRuleModal(false);
  };

  const getStepName = (stepId: string) => {
    if (stepId === 'rejected') return 'Rejeitado';
    if (stepId === 'approved') return 'Aprovado';
    return steps.find(step => step.id === stepId)?.name || 'Desconhecido';
  };

  const getRuleStatusColor = (rule: AutoAdvanceRule) => {
    if (!rule.enabled) return 'text-gray-400 bg-gray-500/20';
    if (rule.statistics.successRate >= 90) return 'text-green-400 bg-green-500/20';
    if (rule.statistics.successRate >= 70) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
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
      title="Movimento Automático"
      description="Configure regras para progressão automática de candidatos entre etapas"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/company/job/${jobId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleSaveRules}
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
                Salvar Regras
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Process Flow Overview */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Fluxo do Processo</h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 flex-shrink-0">
                <div className="flex flex-col items-center min-w-[120px] p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-200 text-sm font-bold mb-2">
                    {step.order}
                  </div>
                  <span className="text-white text-sm text-center">{step.name}</span>
                  <div className="text-xs text-white/60 mt-1">
                    {rules.filter(r => r.fromStepId === step.id && r.enabled).length} regras ativas
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{rules.length}</div>
                <div className="text-xs text-white/60">Total de Regras</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {rules.filter(r => r.enabled).length}
                </div>
                <div className="text-xs text-white/60">Regras Ativas</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {rules.reduce((acc, r) => acc + r.statistics.autoAdvanced, 0)}
                </div>
                <div className="text-xs text-white/60">Auto-Avanços</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {Math.round(rules.reduce((acc, r) => acc + r.statistics.successRate, 0) / rules.length)}%
                </div>
                <div className="text-xs text-white/60">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Regras de Movimento Automático</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4" />
                {showHistory ? 'Ocultar' : 'Ver'} Histórico
              </button>
              <button
                onClick={() => setShowNewRuleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Nova Regra
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className={`text-sm ${rule.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                        {rule.enabled ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{rule.name}</h3>
                      <p className="text-white/60 text-sm">
                        {getStepName(rule.fromStepId)} → {getStepName(rule.toStepId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRuleStatusColor(rule)}`}>
                      {rule.statistics.successRate}% sucesso
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rule Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-white/70 text-sm font-medium mb-2">Condições</h4>
                    <div className="space-y-1">
                      {rule.conditions.minScore && (
                        <div className="text-xs text-white/60">Score mín: {rule.conditions.minScore}</div>
                      )}
                      {rule.conditions.maxScore && (
                        <div className="text-xs text-white/60">Score máx: {rule.conditions.maxScore}</div>
                      )}
                      {rule.conditions.culturalFitMin && (
                        <div className="text-xs text-white/60">Fit cultural: {rule.conditions.culturalFitMin}%</div>
                      )}
                      {rule.conditions.timeLimit && (
                        <div className="text-xs text-white/60">Tempo limite: {rule.conditions.timeLimit}h</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/70 text-sm font-medium mb-2">Ações</h4>
                    <div className="space-y-1">
                      {rule.actions.autoApprove && (
                        <div className="text-xs text-green-400">✓ Auto-aprovação</div>
                      )}
                      {rule.actions.sendNotification && (
                        <div className="text-xs text-blue-400">✓ Notificação</div>
                      )}
                      {rule.actions.scheduleInterview && (
                        <div className="text-xs text-purple-400">✓ Agendar entrevista</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/70 text-sm font-medium mb-2">Estatísticas</h4>
                    <div className="space-y-1">
                      <div className="text-xs text-white/60">
                        Processados: {rule.statistics.totalProcessed}
                      </div>
                      <div className="text-xs text-white/60">
                        Auto-avançados: {rule.statistics.autoAdvanced}
                      </div>
                      <div className="text-xs text-white/60">
                        Taxa: {rule.statistics.successRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      rule.statistics.successRate >= 90 ? 'bg-green-500' :
                      rule.statistics.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${rule.statistics.successRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {rules.length === 0 && (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma regra configurada</h3>
              <p className="text-white/60 mb-4">Crie regras para automatizar o movimento de candidatos</p>
              <button
                onClick={() => setShowNewRuleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors mx-auto"
              >
                <Zap className="w-4 h-4" />
                Criar Primeira Regra
              </button>
            </div>
          )}
        </div>

        {/* History Section */}
        {showHistory && (
          <AutoAdvanceHistory events={mockHistory} />
        )}

        {/* Rule Modal */}
        <AutoAdvanceRuleModal
          isOpen={showNewRuleModal || !!editingRule}
          onClose={() => {
            setShowNewRuleModal(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
          rule={editingRule}
          steps={steps}
        />
      </div>
    </CompanyLayout>
  );
};
