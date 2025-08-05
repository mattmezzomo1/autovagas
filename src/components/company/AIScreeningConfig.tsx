import React, { useState } from 'react';
import { 
  X, Brain, Target, Sliders, Save, RotateCcw, Info, 
  CheckCircle, AlertTriangle, Settings, Zap 
} from 'lucide-react';

interface AIScreeningCriteria {
  education: {
    enabled: boolean;
    weight: number;
    requirements: string[];
  };
  experience: {
    enabled: boolean;
    weight: number;
    minYears: number;
    relevantFields: string[];
  };
  skills: {
    enabled: boolean;
    weight: number;
    required: string[];
    preferred: string[];
    matchThreshold: number;
  };
  location: {
    enabled: boolean;
    weight: number;
    preferred: string[];
    remoteAcceptable: boolean;
  };
  salary: {
    enabled: boolean;
    weight: number;
    minRange: number;
    maxRange: number;
    negotiable: boolean;
  };
  cultural: {
    enabled: boolean;
    weight: number;
    values: string[];
    personalityTraits: string[];
  };
  language: {
    enabled: boolean;
    weight: number;
    required: { language: string; level: string }[];
  };
}

interface AIScreeningConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (criteria: AIScreeningCriteria) => void;
  initialCriteria?: Partial<AIScreeningCriteria>;
}

export const AIScreeningConfig: React.FC<AIScreeningConfigProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCriteria = {}
}) => {
  const [criteria, setCriteria] = useState<AIScreeningCriteria>({
    education: {
      enabled: true,
      weight: 15,
      requirements: ['Ensino Superior Completo']
    },
    experience: {
      enabled: true,
      weight: 30,
      minYears: 3,
      relevantFields: ['Desenvolvimento de Software', 'Tecnologia']
    },
    skills: {
      enabled: true,
      weight: 35,
      required: ['React', 'JavaScript'],
      preferred: ['TypeScript', 'Node.js', 'AWS'],
      matchThreshold: 70
    },
    location: {
      enabled: true,
      weight: 10,
      preferred: ['São Paulo', 'Rio de Janeiro'],
      remoteAcceptable: true
    },
    salary: {
      enabled: true,
      weight: 5,
      minRange: 5000,
      maxRange: 15000,
      negotiable: true
    },
    cultural: {
      enabled: false,
      weight: 5,
      values: ['Inovação', 'Colaboração', 'Excelência'],
      personalityTraits: ['Proativo', 'Comunicativo', 'Analítico']
    },
    language: {
      enabled: false,
      weight: 0,
      required: [{ language: 'Inglês', level: 'Intermediário' }]
    },
    ...initialCriteria
  });

  const [activeTab, setActiveTab] = useState<keyof AIScreeningCriteria>('skills');

  const handleSave = () => {
    // Validar se os pesos somam 100%
    const totalWeight = Object.values(criteria)
      .filter(c => c.enabled)
      .reduce((sum, c) => sum + c.weight, 0);

    if (Math.abs(totalWeight - 100) > 1) {
      alert('Os pesos devem somar 100%. Atualmente: ' + totalWeight + '%');
      return;
    }

    onSave(criteria);
    onClose();
  };

  const handleReset = () => {
    setCriteria({
      education: { enabled: true, weight: 15, requirements: ['Ensino Superior Completo'] },
      experience: { enabled: true, weight: 30, minYears: 3, relevantFields: ['Desenvolvimento de Software'] },
      skills: { enabled: true, weight: 35, required: ['React'], preferred: ['TypeScript'], matchThreshold: 70 },
      location: { enabled: true, weight: 10, preferred: ['São Paulo'], remoteAcceptable: true },
      salary: { enabled: true, weight: 5, minRange: 5000, maxRange: 15000, negotiable: true },
      cultural: { enabled: false, weight: 5, values: ['Inovação'], personalityTraits: ['Proativo'] },
      language: { enabled: false, weight: 0, required: [{ language: 'Inglês', level: 'Intermediário' }] }
    });
  };

  const updateCriteria = (key: keyof AIScreeningCriteria, updates: any) => {
    setCriteria(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const getTotalWeight = () => {
    return Object.values(criteria)
      .filter(c => c.enabled)
      .reduce((sum, c) => sum + c.weight, 0);
  };

  const tabs = [
    { key: 'skills', label: 'Habilidades', icon: Target },
    { key: 'experience', label: 'Experiência', icon: CheckCircle },
    { key: 'education', label: 'Educação', icon: Settings },
    { key: 'location', label: 'Localização', icon: Settings },
    { key: 'salary', label: 'Salário', icon: Settings },
    { key: 'cultural', label: 'Cultural', icon: Settings },
    { key: 'language', label: 'Idiomas', icon: Settings }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Configuração da IA de Triagem</h3>
                <p className="text-white/60 text-sm">Configure os critérios e pesos para análise automática</p>
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
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as keyof AIScreeningCriteria)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  {criteria[tab.key as keyof AIScreeningCriteria].enabled && (
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Weight Summary */}
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Peso Total</span>
                <span className={`text-sm font-medium ${
                  Math.abs(getTotalWeight() - 100) <= 1 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getTotalWeight()}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    Math.abs(getTotalWeight() - 100) <= 1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(getTotalWeight(), 100)}%` }}
                />
              </div>
              {Math.abs(getTotalWeight() - 100) > 1 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Ajuste os pesos para somar 100%</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white">Análise de Habilidades</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={criteria.skills.enabled}
                      onChange={(e) => updateCriteria('skills', { enabled: e.target.checked })}
                      className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <span className="text-white text-sm">Ativar</span>
                  </label>
                </div>

                {criteria.skills.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Peso na Avaliação ({criteria.skills.weight}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={criteria.skills.weight}
                        onChange={(e) => updateCriteria('skills', { weight: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Habilidades Obrigatórias
                      </label>
                      <div className="space-y-2">
                        {criteria.skills.required.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => {
                                const newRequired = [...criteria.skills.required];
                                newRequired[index] = e.target.value;
                                updateCriteria('skills', { required: newRequired });
                              }}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                            <button
                              onClick={() => {
                                const newRequired = criteria.skills.required.filter((_, i) => i !== index);
                                updateCriteria('skills', { required: newRequired });
                              }}
                              className="p-2 text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateCriteria('skills', { 
                            required: [...criteria.skills.required, ''] 
                          })}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          + Adicionar habilidade obrigatória
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Habilidades Preferenciais
                      </label>
                      <div className="space-y-2">
                        {criteria.skills.preferred.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => {
                                const newPreferred = [...criteria.skills.preferred];
                                newPreferred[index] = e.target.value;
                                updateCriteria('skills', { preferred: newPreferred });
                              }}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                            <button
                              onClick={() => {
                                const newPreferred = criteria.skills.preferred.filter((_, i) => i !== index);
                                updateCriteria('skills', { preferred: newPreferred });
                              }}
                              className="p-2 text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateCriteria('skills', { 
                            preferred: [...criteria.skills.preferred, ''] 
                          })}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          + Adicionar habilidade preferencial
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Limite Mínimo de Match ({criteria.skills.matchThreshold}%)
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={criteria.skills.matchThreshold}
                        onChange={(e) => updateCriteria('skills', { matchThreshold: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-white/60 mt-1">
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Adicionar outras abas conforme necessário */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrão
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={Math.abs(getTotalWeight() - 100) > 1}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
