import React, { useState } from 'react';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import {
  Building2,
  Edit3,
  Save,
  X,
  Upload,
  Globe,
  Linkedin,
  MapPin,
  Calendar,
  Users,
  FileText,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image,
  Plus,
  Trash2
} from 'lucide-react';

interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  foundingYear: number;
  website: string;
  linkedinUrl: string;
  logo: string;
  culture: string;
  benefits: string[];
  aiProfile: {
    summary: string;
    strengths: string[];
    idealCandidateProfile: string;
    communicationStyle: string;
    lastUpdated: string;
  };
}

export const CompanyProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');
  
  // Mock data - in real app, this would come from API
  const [profile, setProfile] = useState<CompanyProfile>({
    id: '1',
    name: 'TechCorp Inovações',
    description: 'Empresa líder em soluções tecnológicas inovadoras, focada em transformação digital e desenvolvimento de software de alta qualidade.',
    industry: 'Tecnologia',
    size: 'medium',
    location: 'São Paulo, SP',
    foundingYear: 2015,
    website: 'https://techcorp.com.br',
    linkedinUrl: 'https://linkedin.com/company/techcorp',
    logo: '/api/placeholder/120/120',
    culture: 'Cultura colaborativa, inovação constante, trabalho em equipe, crescimento profissional e equilíbrio vida-trabalho.',
    benefits: [
      'Vale refeição R$ 35/dia',
      'Plano de saúde completo',
      'Home office flexível',
      'Auxílio educação',
      'Gympass',
      'Day off no aniversário'
    ],
    aiProfile: {
      summary: 'TechCorp é uma empresa inovadora que valoriza profissionais proativos, com mentalidade de crescimento e paixão por tecnologia. Busca talentos que se alinhem com valores de colaboração e excelência técnica.',
      strengths: [
        'Ambiente inovador e desafiador',
        'Forte cultura de aprendizado',
        'Flexibilidade e autonomia',
        'Projetos de impacto'
      ],
      idealCandidateProfile: 'Profissionais com experiência em tecnologia, proativos, colaborativos, com sede de aprender e crescer. Valoriza soft skills como comunicação, trabalho em equipe e adaptabilidade.',
      communicationStyle: 'Comunicação direta, transparente e acolhedora. Tom profissional mas descontraído, focado em destacar oportunidades de crescimento.',
      lastUpdated: '2024-01-15'
    }
  });

  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Here you would make an API call to save the profile
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      handleInputChange('benefits', [...editedProfile.benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const newBenefits = editedProfile.benefits.filter((_, i) => i !== index);
    handleInputChange('benefits', newBenefits);
  };

  const updateAIProfile = async () => {
    setIsUpdatingAI(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsUpdatingAI(false);
      // Update AI profile with new analysis
    }, 3000);
  };

  const companySizeLabels = {
    micro: '1-9 funcionários',
    small: '10-49 funcionários',
    medium: '50-249 funcionários',
    large: '250-999 funcionários',
    enterprise: '1000+ funcionários'
  };

  return (
    <CompanyLayout
      title="Perfil da Empresa"
      description="Gerencie as informações e o perfil inteligente da sua empresa"
      actions={
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Editar Perfil
            </button>
          )}
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Basic Information */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-white/40" />
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 w-full"
                    placeholder="Nome da empresa"
                  />
                  <textarea
                    value={editedProfile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Descrição da empresa"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
                  <p className="text-white/70 leading-relaxed">{profile.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Setor</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-white">{profile.industry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Tamanho</label>
                {isEditing ? (
                  <select
                    value={editedProfile.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(companySizeLabels).map(([value, label]) => (
                      <option key={value} value={value} className="bg-slate-800">
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white">{companySizeLabels[profile.size as keyof typeof companySizeLabels]}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Localização</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4 text-white/60" />
                    {profile.location}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Fundação</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProfile.foundingYear}
                    onChange={(e) => handleInputChange('foundingYear', parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-white/60" />
                    {profile.foundingYear}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editedProfile.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {profile.website}
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">LinkedIn</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editedProfile.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Culture and Benefits */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Cultura e Benefícios</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Cultura da Empresa</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.culture}
                  onChange={(e) => handleInputChange('culture', e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descreva a cultura da empresa..."
                />
              ) : (
                <p className="text-white/80 leading-relaxed">{profile.culture}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Benefícios</label>
              <div className="space-y-3">
                {(isEditing ? editedProfile.benefits : profile.benefits).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white flex-1">{benefit}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeBenefit(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Adicionar novo benefício..."
                    />
                    <button
                      onClick={addBenefit}
                      className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Profile */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Perfil Inteligente da IA</h2>
                <p className="text-white/60 text-sm">
                  Última atualização: {new Date(profile.aiProfile.lastUpdated).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <button
              onClick={updateAIProfile}
              disabled={isUpdatingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white rounded-lg transition-all"
            >
              {isUpdatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Atualizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Atualizar IA
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Resumo da Empresa</h3>
                <p className="text-white/80 leading-relaxed">{profile.aiProfile.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Pontos Fortes</h3>
                <div className="space-y-2">
                  {profile.aiProfile.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-white/80">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Perfil do Candidato Ideal</h3>
                <p className="text-white/80 leading-relaxed">{profile.aiProfile.idealCandidateProfile}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Estilo de Comunicação</h3>
                <p className="text-white/80 leading-relaxed">{profile.aiProfile.communicationStyle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
