import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building, Shield } from 'lucide-react';

interface UserFormModalProps {
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  user?: {
    id?: string;
    name: string;
    email: string;
    role: 'candidate' | 'company' | 'admin';
    subscriptionPlan: 'basic' | 'plus' | 'premium' | null;
    status: 'active' | 'inactive' | 'suspended';
  };
  title?: string;
}

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: 'candidate' | 'company' | 'admin';
  subscriptionPlan: 'basic' | 'plus' | 'premium' | null;
  status: 'active' | 'inactive' | 'suspended';
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ 
  onClose, 
  onSave, 
  user,
  title = 'Adicionar Novo Usuário'
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'candidate',
    subscriptionPlan: null,
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche o formulário se estiver editando um usuário existente
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        status: user.status
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl border border-white/10 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">
                Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-black/20 backdrop-blur-xl rounded-xl border pl-10 pr-4 py-2 text-white
                    ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-purple-500'}`}
                  placeholder="Nome completo"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-black/20 backdrop-blur-xl rounded-xl border pl-10 pr-4 py-2 text-white
                    ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-purple-500'}`}
                  placeholder="email@exemplo.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Tipo de Usuário */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-purple-200 mb-1">
                Tipo de Usuário
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white appearance-none"
                >
                  <option value="candidate">Candidato</option>
                  <option value="company">Empresa</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* Plano de Assinatura */}
            <div>
              <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-purple-200 mb-1">
                Plano de Assinatura
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  id="subscriptionPlan"
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan || ''}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white appearance-none"
                >
                  <option value="">Sem plano</option>
                  <option value="basic">Básico</option>
                  <option value="plus">Plus</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-purple-200 mb-1">
                Status
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white appearance-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
