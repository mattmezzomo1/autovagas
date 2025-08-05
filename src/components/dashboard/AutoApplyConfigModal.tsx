import React, { useState } from 'react';
import { X, MapPin, Briefcase, Clock, Banknote, Globe, Bot } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

interface AutoApplyConfigModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const AutoApplyConfigModal: React.FC<AutoApplyConfigModalProps> = ({ onClose, onSave }) => {
  const { profile, updateProfile } = useAuthStore();

  // Estado local para as configurações
  const [config, setConfig] = useState({
    locations: profile.locations || [],
    jobTypes: profile.jobTypes || [],
    workModels: profile.workModels || [],
    salaryMin: profile.salaryExpectation?.min || 0,
    workHours: 40, // Padrão: 40 horas semanais
    internationalJobs: false
  });

  // Estado para novo local
  const [newLocation, setNewLocation] = useState('');

  // Função para adicionar um novo local
  const addLocation = () => {
    if (newLocation.trim() && !config.locations.includes(newLocation.trim())) {
      setConfig({
        ...config,
        locations: [...config.locations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  // Função para remover um local
  const removeLocation = (location: string) => {
    setConfig({
      ...config,
      locations: config.locations.filter(loc => loc !== location)
    });
  };

  // Função para alternar tipo de contratação
  const toggleJobType = (type: string) => {
    const currentTypes = config.jobTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    setConfig({
      ...config,
      jobTypes: newTypes
    });
  };

  // Função para alternar modelo de trabalho
  const toggleWorkModel = (model: string) => {
    const currentModels = config.workModels;
    const newModels = currentModels.includes(model)
      ? currentModels.filter(m => m !== model)
      : [...currentModels, model];

    setConfig({
      ...config,
      workModels: newModels
    });
  };

  // Função para salvar as configurações
  const handleSave = () => {
    // Atualiza o perfil com as novas configurações
    updateProfile({
      locations: config.locations,
      jobTypes: config.jobTypes,
      workModels: config.workModels,
      salaryExpectation: {
        ...profile.salaryExpectation,
        min: config.salaryMin
      },
      // Podemos adicionar campos adicionais ao perfil para armazenar as novas configurações
      subscription: {
        ...profile.subscription!,
        autoApplyConfig: {
          workHours: config.workHours,
          internationalJobs: config.internationalJobs
        }
      }
    });

    // Configura os parâmetros de busca para o robô de auto-aplicação
    const searchParams = {
      locations: config.locations,
      jobTypes: config.jobTypes,
      workModels: config.workModels,
      salaryMin: config.salaryMin,
      workHours: config.workHours,
      internationalJobs: config.internationalJobs,
      remote: config.workModels.includes('Remoto')
    };

    // Armazena os parâmetros de busca no localStorage para uso futuro
    localStorage.setItem('autoApplyConfig', JSON.stringify({
      searchParams,
      lastUpdated: new Date().toISOString()
    }));

    // Chama a função onSave para ativar o robô
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full mx-auto my-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Configurar Auto-Aplicação</h2>
                <p className="text-purple-200 mt-1 text-sm sm:text-base">Configure as preferências para o robô de auto-aplicação</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Localização */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Localização
            </h3>
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-purple-100 placeholder:text-purple-400/50"
                  placeholder="Adicione uma cidade ou 'Remoto'"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <button
                  onClick={addLocation}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.locations.map((location) => (
                  <div
                    key={location}
                    className="flex items-center gap-1 bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-full"
                  >
                    <span>{location}</span>
                    <button
                      onClick={() => removeLocation(location)}
                      className="text-indigo-300 hover:text-indigo-100 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {config.locations.length === 0 && (
                  <p className="text-purple-400 text-sm">Adicione pelo menos uma localização ou "Remoto"</p>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de Contratação */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Tipo de Contratação
            </h3>
            <div className="flex flex-wrap gap-2">
              {['CLT', 'PJ', 'Estágio', 'Freelancer'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleJobType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${config.jobTypes.includes(type)
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-black/20 text-purple-200 hover:bg-black/30'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Modelo de Trabalho */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Modelo de Trabalho
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Presencial', 'Híbrido', 'Remoto'].map(model => (
                <button
                  key={model}
                  type="button"
                  onClick={() => toggleWorkModel(model)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${config.workModels.includes(model)
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-black/20 text-purple-200 hover:bg-black/30'
                    }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Salário Mínimo */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-purple-400" />
              Salário Mínimo
            </h3>
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-purple-200">R$</span>
                <input
                  type="number"
                  min="0"
                  value={config.salaryMin}
                  onChange={(e) => setConfig({...config, salaryMin: Number(e.target.value)})}
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-purple-100"
                />
                <span className="text-purple-200">mil</span>
              </div>
            </div>
          </div>

          {/* Carga Horária */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Carga Horária
            </h3>
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={config.workHours}
                  onChange={(e) => setConfig({...config, workHours: Number(e.target.value)})}
                  className="w-20 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-purple-100"
                />
                <span className="text-purple-200">horas semanais</span>
              </div>
            </div>
          </div>

          {/* Vagas Internacionais */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Vagas Internacionais
            </h3>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div>
                <p className="text-purple-200">Incluir vagas de empresas internacionais</p>
              </div>
              <button
                onClick={() => setConfig({...config, internationalJobs: !config.internationalJobs})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                  ${config.internationalJobs
                    ? 'bg-purple-500'
                    : 'bg-gray-700'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                    ${config.internationalJobs ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-black/30 text-purple-200 rounded-xl hover:bg-black/40 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-colors"
            >
              Salvar e Ativar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
