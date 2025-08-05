import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { X, Plus, Briefcase, Timer, MessageSquare, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

interface ProfessionalProfileProps {
  demoMode?: boolean;
}

export const ProfessionalProfile: React.FC<ProfessionalProfileProps> = ({ demoMode = true }) => {
  const { profile, updateProfile, completeStep } = useAuthStore();
  const [newSkill, setNewSkill] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [validated, setValidated] = useState<Record<string, boolean>>({});

  // Automatically validate fields if they have values (for demo mode)
  useEffect(() => {
    if (profile.title) setValidated(prev => ({ ...prev, title: true }));
    if (profile.experience) setValidated(prev => ({ ...prev, experience: true }));
    if (profile.bio) setValidated(prev => ({ ...prev, bio: true }));
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStep(2);
  };

  const handleBlur = (field: string, value: string | number) => {
    setFocused(null);
    if (value) {
      setValidated(prev => ({ ...prev, [field]: true }));
    }
  };

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="form-card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <Briefcase className="w-5 h-5 text-purple-300" />
          </span>
          Experiência Profissional
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Título Profissional
            </label>
            <div className="relative group">
              <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-10
                ${focused === 'title' ? 'text-purple-400' : validated.title ? 'text-green-400' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={profile.title || ''}
                onChange={(e) => updateProfile({ title: e.target.value })}
                onFocus={() => setFocused('title')}
                onBlur={(e) => handleBlur('title', e.target.value)}
                className="input-field-with-icon group-hover:border-purple-400/30"
                placeholder="Ex: Desenvolvedor Full Stack Senior"
              />
              {validated.title && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 z-10" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Anos de Experiência
            </label>
            <div className="relative group">
              <Timer className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-10
                ${focused === 'experience' ? 'text-purple-400' : validated.experience ? 'text-green-400' : 'text-gray-400'}`} />
              <input
                type="number"
                required
                min="0"
                max="50"
                value={profile.experience || ''}
                onChange={(e) => updateProfile({ experience: Number(e.target.value) })}
                onFocus={() => setFocused('experience')}
                onBlur={(e) => handleBlur('experience', e.target.value)}
                className="input-field-with-icon group-hover:border-purple-400/30"
                placeholder="Anos de experiência"
              />
              {validated.experience && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 z-10" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <MessageSquare className="w-5 h-5 text-purple-300" />
          </span>
          Sobre Você
        </h3>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Bio Profissional
          </label>
          <div className="relative group">
            <MessageSquare className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-200 z-10
              ${focused === 'bio' ? 'text-purple-400' : validated.bio ? 'text-green-400' : 'text-gray-400'}`} />
            <textarea
              required
              value={profile.bio || ''}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              onFocus={() => setFocused('bio')}
              onBlur={(e) => handleBlur('bio', e.target.value)}
              className="input-field-with-icon h-32 group-hover:border-purple-400/30 resize-none"
              placeholder="Descreva sua trajetória profissional e principais conquistas"
            />
            {validated.bio && (
              <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-400 z-10" />
            )}
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </span>
          Habilidades
        </h3>

        <div className="p-1">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input-field group-hover:border-purple-400/30"
                placeholder="Adicione uma habilidade"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                onFocus={() => setFocused('skill')}
                onBlur={() => setFocused(null)}
              />
              {focused === 'skill' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300">
                  Pressione Enter para adicionar
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="btn-primary px-4 min-w-16"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-16">
            {profile.skills?.length ? (
              profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1 bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-full
                           border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors duration-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-indigo-300 hover:text-indigo-100 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-4 text-purple-300/60 text-sm italic">
                Adicione suas habilidades para aumentar suas chances de match com vagas
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => updateProfile({ currentStep: 1 })}
          className="flex-1 btn-secondary group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar</span>
        </button>
        <button
          type="submit"
          className="flex-1 btn-primary group"
        >
          <span>Próximo</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <p className="text-center text-purple-300/60 text-sm">
        Passo 2 de 4 - Perfil Profissional
      </p>
    </form>
  );
};