import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { X, Plus, DollarSign, ArrowRight, ArrowLeft, CheckCircle, Building, MapPin, Briefcase } from 'lucide-react';
import { CityAutocomplete } from '../common/CityAutocomplete';

const JOB_TYPES = ['CLT', 'PJ', 'Freelancer', 'Estágio', 'Temporário'];
const WORK_MODELS = ['Presencial', 'Remoto', 'Híbrido'];
const INDUSTRIES = [
  'Tecnologia',
  'Finanças',
  'Saúde',
  'Educação',
  'E-commerce',
  'Consultoria',
  'Marketing',
  'Telecomunicações',
  'Varejo',
];

interface PreferencesProps {
  demoMode?: boolean;
}

export const Preferences: React.FC<PreferencesProps> = ({ demoMode = true }) => {
  const { profile, updateProfile, completeStep } = useAuthStore();
  const [newLocation, setNewLocation] = useState('');
  const navigate = useNavigate();

  // Função para formatar valor como moeda
  const formatCurrency = (value: number): string => {
    if (!value || value === 0) return '';
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter string formatada em número
  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remove tudo exceto números, vírgulas e pontos
    const cleanValue = value.replace(/[^\d,]/g, '');
    // Substitui vírgula por ponto para conversão
    const numericValue = parseFloat(cleanValue.replace(',', '.'));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Função para lidar com mudanças no salário
  const handleSalaryChange = (value: string, type: 'min' | 'max') => {
    const numericValue = parseCurrency(value);
    updateProfile({
      salaryExpectation: {
        ...profile.salaryExpectation,
        [type]: numericValue
      }
    });
  };

  // Set default values for demo mode
  useEffect(() => {
    if (demoMode && (!profile.jobTypes?.length || !profile.workModels?.length || !profile.industries?.length)) {
      if (!profile.jobTypes?.length) {
        updateProfile({ jobTypes: ['CLT', 'PJ'] });
      }

      if (!profile.workModels?.length) {
        updateProfile({ workModels: ['Remoto', 'Híbrido'] });
      }

      if (!profile.industries?.length) {
        updateProfile({ industries: ['Tecnologia', 'Finanças', 'E-commerce'] });
      }

      if (!profile.locations?.length) {
        updateProfile({ locations: ['São Paulo', 'Campinas', 'Remoto'] });
      }

      if (!profile.salaryExpectation?.min || !profile.salaryExpectation?.max) {
        updateProfile({
          salaryExpectation: {
            min: profile.salaryExpectation?.min || 15,
            max: profile.salaryExpectation?.max || 20
          }
        });
      }
    }
  }, [demoMode, profile, updateProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStep(4);
    navigate('/dashboard');
  };

  const toggleJobType = (type: string) => {
    const currentTypes = profile.jobTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateProfile({ jobTypes: newTypes });
  };

  const toggleWorkModel = (model: string) => {
    const currentModels = profile.workModels || [];
    const newModels = currentModels.includes(model)
      ? currentModels.filter(m => m !== model)
      : [...currentModels, model];
    updateProfile({ workModels: newModels });
  };

  const toggleIndustry = (industry: string) => {
    const currentIndustries = profile.industries || [];
    const newIndustries = currentIndustries.includes(industry)
      ? currentIndustries.filter(i => i !== industry)
      : [...currentIndustries, industry];
    updateProfile({ industries: newIndustries });
  };

  const addLocation = () => {
    if (newLocation.trim() && !profile.locations?.includes(newLocation)) {
      updateProfile({
        locations: [...(profile.locations || []), newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    updateProfile({
      locations: profile.locations?.filter(l => l !== location)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Tipos de Contratação</h3>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleJobType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${profile.jobTypes?.includes(type)
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Modelo de Trabalho</h3>
        <div className="flex flex-wrap gap-2">
          {WORK_MODELS.map(model => (
            <button
              key={model}
              type="button"
              onClick={() => toggleWorkModel(model)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${profile.workModels?.includes(model)
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Expectativa Salarial Mensal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mínimo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium z-10">R$</span>
              <input
                type="text"
                value={formatCurrency(profile.salaryExpectation?.min || 0)}
                onChange={(e) => handleSalaryChange(e.target.value, 'min')}
                className="input-field-with-icon"
                placeholder="0,00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Máximo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium z-10">R$</span>
              <input
                type="text"
                value={formatCurrency(profile.salaryExpectation?.max || 0)}
                onChange={(e) => handleSalaryChange(e.target.value, 'max')}
                className="input-field-with-icon"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Indústrias de Interesse</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map(industry => (
            <button
              key={industry}
              type="button"
              onClick={() => toggleIndustry(industry)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left
                ${profile.industries?.includes(industry)
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Locais de Interesse</h3>
        <div className="glass-card p-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <CityAutocomplete
                value={newLocation}
                onChange={setNewLocation}
                placeholder="Adicione uma cidade..."
                className="w-full"
              />
            </div>
            <button
              type="button"
              onClick={addLocation}
              className="btn-primary px-4"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.locations?.map((location) => (
              <div
                key={location}
                className="flex items-center gap-1 bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-full"
              >
                <span>{location}</span>
                <button
                  type="button"
                  onClick={() => removeLocation(location)}
                  className="text-indigo-300 hover:text-indigo-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => updateProfile({ currentStep: 3 })}
          className="flex-1 btn-secondary group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar</span>
        </button>
        <button
          type="submit"
          className="flex-1 btn-primary group"
        >
          <span>Concluir</span>
          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <p className="text-center text-purple-300/60 text-sm mt-4">
        Passo 4 de 4 - Preferências de Vagas
      </p>
    </form>
  );
};