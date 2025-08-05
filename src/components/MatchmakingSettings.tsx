import React, { useState } from 'react';
import { Settings, X, Plus, Save } from 'lucide-react';

interface MatchmakingSettingsProps {
  onSave: (settings: MatchmakingSettings) => void;
  initialSettings?: MatchmakingSettings;
}

export interface MatchmakingSettings {
  enabled: boolean;
  minExperienceYears: number;
  maxExperienceYears: number;
  desiredSkills: string[];
  excludedSkills: string[];
  industries: string[];
  locations: string[];
  remoteOnly: boolean;
  maxMatchesPerWeek: number;
  notificationsEnabled: boolean;
}

const defaultSettings: MatchmakingSettings = {
  enabled: true,
  minExperienceYears: 0,
  maxExperienceYears: 10,
  desiredSkills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
  excludedSkills: [],
  industries: ['Technology', 'E-commerce', 'Finance'],
  locations: ['São Paulo', 'Rio de Janeiro', 'Remote'],
  remoteOnly: false,
  maxMatchesPerWeek: 5,
  notificationsEnabled: true,
};

const MatchmakingSettings: React.FC<MatchmakingSettingsProps> = ({ 
  onSave,
  initialSettings = defaultSettings
}) => {
  const [settings, setSettings] = useState<MatchmakingSettings>(initialSettings);
  const [newSkill, setNewSkill] = useState('');
  const [newExcludedSkill, setNewExcludedSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleSettingsChange = (field: keyof MatchmakingSettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSettings({
      ...settings,
      desiredSkills: [...settings.desiredSkills, newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...settings.desiredSkills];
    newSkills.splice(index, 1);
    setSettings({
      ...settings,
      desiredSkills: newSkills,
    });
  };

  const handleAddExcludedSkill = () => {
    if (!newExcludedSkill.trim()) return;
    setSettings({
      ...settings,
      excludedSkills: [...settings.excludedSkills, newExcludedSkill.trim()],
    });
    setNewExcludedSkill('');
  };

  const handleRemoveExcludedSkill = (index: number) => {
    const newSkills = [...settings.excludedSkills];
    newSkills.splice(index, 1);
    setSettings({
      ...settings,
      excludedSkills: newSkills,
    });
  };

  const handleAddIndustry = () => {
    if (!newIndustry.trim()) return;
    setSettings({
      ...settings,
      industries: [...settings.industries, newIndustry.trim()],
    });
    setNewIndustry('');
  };

  const handleRemoveIndustry = (index: number) => {
    const newIndustries = [...settings.industries];
    newIndustries.splice(index, 1);
    setSettings({
      ...settings,
      industries: newIndustries,
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    setSettings({
      ...settings,
      locations: [...settings.locations, newLocation.trim()],
    });
    setNewLocation('');
  };

  const handleRemoveLocation = (index: number) => {
    const newLocations = [...settings.locations];
    newLocations.splice(index, 1);
    setSettings({
      ...settings,
      locations: newLocations,
    });
  };

  const handleSaveSettings = () => {
    onSave(settings);
  };

  return (
    <div className="bg-gradient-to-br from-green-500/5 to-teal-500/5 backdrop-blur-xl rounded-3xl border border-green-500/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Configurações de Matchmaking</h2>
      </div>
      
      {/* Enable/Disable */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Ativar Matchmaking</label>
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={settings.enabled}
              onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
            />
            <span
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                settings.enabled ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-all duration-300 ${
                  settings.enabled ? 'transform translate-x-6' : ''
                }`}
              ></span>
            </span>
          </div>
        </div>
        <p className="text-sm text-purple-300 mt-1">
          Quando ativado, você poderá receber e enviar solicitações de conexão
        </p>
      </div>
      
      {/* Experience Range */}
      <div className="mb-6">
        <label className="text-white font-medium block mb-2">Experiência (anos)</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-purple-300 block mb-1">Mínimo</label>
            <input
              type="number"
              min="0"
              max="50"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              value={settings.minExperienceYears}
              onChange={(e) => handleSettingsChange('minExperienceYears', parseInt(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-purple-300 block mb-1">Máximo</label>
            <input
              type="number"
              min="0"
              max="50"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              value={settings.maxExperienceYears}
              onChange={(e) => handleSettingsChange('maxExperienceYears', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      {/* Desired Skills */}
      <div className="mb-6">
        <label className="text-white font-medium block mb-2">Habilidades Desejadas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Adicionar habilidade..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSkill();
              }
            }}
          />
          <button
            className="btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            onClick={handleAddSkill}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {settings.desiredSkills.map((skill, index) => (
            <div key={index} className="bg-white/10 text-white px-3 py-1 rounded-full flex items-center">
              <span>{skill}</span>
              <button
                className="ml-2 text-purple-300 hover:text-white"
                onClick={() => handleRemoveSkill(index)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Excluded Skills */}
      <div className="mb-6">
        <label className="text-white font-medium block mb-2">Habilidades Excluídas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Adicionar habilidade a excluir..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            value={newExcludedSkill}
            onChange={(e) => setNewExcludedSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddExcludedSkill();
              }
            }}
          />
          <button
            className="btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            onClick={handleAddExcludedSkill}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {settings.excludedSkills.map((skill, index) => (
            <div key={index} className="bg-red-500/10 text-red-200 px-3 py-1 rounded-full flex items-center">
              <span>{skill}</span>
              <button
                className="ml-2 text-red-300 hover:text-red-100"
                onClick={() => handleRemoveExcludedSkill(index)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8">
        <button
          className="w-full btn-primary bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          onClick={handleSaveSettings}
        >
          <Save className="w-5 h-5 mr-2" />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default MatchmakingSettings;
