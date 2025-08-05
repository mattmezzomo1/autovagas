import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { User, Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { CityAutocomplete } from '../common/CityAutocomplete';

interface BasicInfoProps {
  demoMode?: boolean;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ demoMode = true }) => {
  const { profile, updateProfile, completeStep } = useAuthStore();
  const [focused, setFocused] = useState<string | null>(null);
  const [validated, setValidated] = useState<Record<string, boolean>>({});

  // Automatically validate fields if they have values (for demo mode)
  useEffect(() => {
    if (profile.fullName) setValidated(prev => ({ ...prev, name: true }));
    if (profile.email) setValidated(prev => ({ ...prev, email: true }));
    if (profile.phone) setValidated(prev => ({ ...prev, phone: true }));
    if (profile.location) setValidated(prev => ({ ...prev, location: true }));
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeStep(1);
  };

  const handleBlur = (field: string, value: string) => {
    setFocused(null);
    if (value) {
      setValidated(prev => ({ ...prev, [field]: true }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="form-card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <User className="w-5 h-5 text-purple-300" />
          </span>
          Informações Pessoais
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Nome Completo
            </label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-10
                ${focused === 'name' ? 'text-purple-400' : validated.name ? 'text-green-400' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={profile.fullName || ''}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                onFocus={() => setFocused('name')}
                onBlur={(e) => handleBlur('name', e.target.value)}
                className="input-field-with-icon group-hover:border-purple-400/30"
                placeholder="Seu nome completo"
              />
              {validated.name && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              E-mail
            </label>
            <div className="relative group">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-10
                ${focused === 'email' ? 'text-purple-400' : validated.email ? 'text-green-400' : 'text-gray-400'}`} />
              <input
                type="email"
                required
                value={profile.email || ''}
                onChange={(e) => updateProfile({ email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={(e) => handleBlur('email', e.target.value)}
                className="input-field-with-icon group-hover:border-purple-400/30"
                placeholder="seu.email@exemplo.com"
              />
              {validated.email && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="bg-purple-500/20 p-2 rounded-lg mr-3">
            <Phone className="w-5 h-5 text-purple-300" />
          </span>
          Contato e Localização
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Telefone
            </label>
            <div className="relative group">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 z-10
                ${focused === 'phone' ? 'text-purple-400' : validated.phone ? 'text-green-400' : 'text-gray-400'}`} />
              <input
                type="tel"
                required
                value={profile.phone || ''}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                onFocus={() => setFocused('phone')}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                className="input-field-with-icon group-hover:border-purple-400/30"
                placeholder="(00) 00000-0000"
              />
              {validated.phone && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Localização
            </label>
            <div className="relative group">
              <CityAutocomplete
                value={profile.location || ''}
                onChange={(value) => updateProfile({ location: value })}
                placeholder="Digite sua cidade..."
                className="group-hover:border-purple-400/30"
              />
              {validated.location && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 z-20" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full btn-primary mt-4 group"
        >
          <span>Próximo</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-purple-300/60 text-sm mt-4">
          Passo 1 de 4 - Informações Básicas
        </p>
      </div>
    </form>
  );
};