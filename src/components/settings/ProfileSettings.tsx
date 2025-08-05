import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, MessageSquare, Plus, X, Upload, ExternalLink, Github, Link, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const ProfileSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [newSkill, setNewSkill] = useState('');
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'links'>('personal');

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill)) {
      updateProfile({
        skills: [...(profile.skills || []), newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateProfile({
      skills: profile.skills?.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Configurações de Perfil</h2>
      
      {/* Section Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveSection('personal')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${activeSection === 'personal'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-purple-200 hover:bg-black/30'
            }`}
        >
          Informações Pessoais
        </button>
        <button
          onClick={() => setActiveSection('professional')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${activeSection === 'professional'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-purple-200 hover:bg-black/30'
            }`}
        >
          Perfil Profissional
        </button>
        <button
          onClick={() => setActiveSection('links')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${activeSection === 'links'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-purple-200 hover:bg-black/30'
            }`}
        >
          Links e Documentos
        </button>
      </div>

      {/* Personal Information */}
      {activeSection === 'personal' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className="input-field pl-10"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => updateProfile({ email: e.target.value })}
                className="input-field pl-10"
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                className="input-field pl-10"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Localização
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => updateProfile({ location: e.target.value })}
                className="input-field pl-10"
                placeholder="Cidade, Estado"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="btn-primary">
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Professional Profile */}
      {activeSection === 'professional' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Título Profissional
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => updateProfile({ title: e.target.value })}
                className="input-field pl-10"
                placeholder="Ex: Desenvolvedor Full Stack Senior"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Anos de Experiência
            </label>
            <input
              type="number"
              value={profile.experience || 0}
              onChange={(e) => updateProfile({ experience: parseInt(e.target.value) })}
              className="input-field"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Bio
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={profile.bio || ''}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                className="input-field pl-10 min-h-[120px]"
                placeholder="Descreva sua experiência, habilidades e objetivos profissionais"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Habilidades
            </label>
            <div className="glass-card p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Adicione uma habilidade"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-primary px-4"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-1 bg-purple-500/20 text-purple-200 px-3 py-1.5 rounded-full"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-purple-300 hover:text-purple-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Expectativa Salarial (em milhares de R$)
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-purple-300 mb-1">Mínimo</label>
                <input
                  type="number"
                  value={profile.salaryExpectation?.min || 0}
                  onChange={(e) => updateProfile({ 
                    salaryExpectation: { 
                      ...profile.salaryExpectation,
                      min: parseInt(e.target.value) 
                    } 
                  })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-purple-300 mb-1">Máximo</label>
                <input
                  type="number"
                  value={profile.salaryExpectation?.max || 0}
                  onChange={(e) => updateProfile({ 
                    salaryExpectation: { 
                      ...profile.salaryExpectation,
                      max: parseInt(e.target.value) 
                    } 
                  })}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button className="btn-primary">
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Links and Documents */}
      {activeSection === 'links' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={profile.linkedinUrl || ''}
                onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
                className="input-field pl-10"
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              GitHub
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={profile.githubUrl || ''}
                onChange={(e) => updateProfile({ githubUrl: e.target.value })}
                className="input-field pl-10"
                placeholder="https://github.com/seuperfil"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Portfólio / Site Pessoal
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={profile.portfolioUrl || ''}
                onChange={(e) => updateProfile({ portfolioUrl: e.target.value })}
                className="input-field pl-10"
                placeholder="https://seusite.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Currículo
            </label>
            <div className="glass-card p-6">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-purple-400 mb-4" />
                <h4 className="text-white font-medium mb-2">Arraste seu currículo ou clique para fazer upload</h4>
                <p className="text-purple-300 text-sm mb-4">Formatos aceitos: PDF, DOCX (máx. 5MB)</p>
                <button className="btn-secondary">
                  Selecionar Arquivo
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button className="btn-primary">
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
