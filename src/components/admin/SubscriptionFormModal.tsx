import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, RefreshCw, User, Mail } from 'lucide-react';

interface SubscriptionFormModalProps {
  onClose: () => void;
  onSave: (subscriptionData: SubscriptionFormData) => void;
  subscription?: {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    plan: 'basic' | 'plus' | 'premium';
    status: 'active' | 'canceled' | 'expired' | 'pending';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    price: number;
  };
  title?: string;
}

export interface SubscriptionFormData {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'basic' | 'plus' | 'premium';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  startDate: Date | string;
  endDate: Date | string;
  autoRenew: boolean;
  price: number;
}

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({ 
  onClose, 
  onSave, 
  subscription,
  title = 'Editar Assinatura'
}) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    userId: '',
    userName: '',
    userEmail: '',
    plan: 'basic',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    autoRenew: true,
    price: 29.90
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche o formulário se estiver editando uma assinatura existente
  useEffect(() => {
    if (subscription) {
      setFormData({
        id: subscription.id,
        userId: subscription.userId,
        userName: subscription.userName,
        userEmail: subscription.userEmail,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate instanceof Date 
          ? subscription.startDate.toISOString().split('T')[0] 
          : subscription.startDate,
        endDate: subscription.endDate instanceof Date 
          ? subscription.endDate.toISOString().split('T')[0] 
          : subscription.endDate,
        autoRenew: subscription.autoRenew,
        price: subscription.price
      });
    }
  }, [subscription]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

    if (!formData.userName.trim()) {
      newErrors.userName = 'Nome do usuário é obrigatório';
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'Email do usuário é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Email inválido';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de término é obrigatória';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
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

  // Atualiza o preço com base no plano selecionado
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plan = e.target.value as 'basic' | 'plus' | 'premium';
    let price = 29.90; // Preço padrão para o plano básico
    
    if (plan === 'plus') {
      price = 59.90;
    } else if (plan === 'premium') {
      price = 99.90;
    }
    
    setFormData(prev => ({
      ...prev,
      plan,
      price
    }));
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
            {/* Informações do Usuário - Somente leitura */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={formData.userName}
                  readOnly
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white/70 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={formData.userEmail}
                  readOnly
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white/70 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Plano de Assinatura */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-purple-200 mb-1">
                Plano de Assinatura
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handlePlanChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white appearance-none"
                >
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
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white appearance-none"
                >
                  <option value="active">Ativa</option>
                  <option value="canceled">Cancelada</option>
                  <option value="expired">Expirada</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>

            {/* Data de Início */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-purple-200 mb-1">
                Data de Início
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={typeof formData.startDate === 'string' ? formData.startDate : formData.startDate.toISOString().split('T')[0]}
                  onChange={handleChange}
                  className={`w-full bg-black/20 backdrop-blur-xl rounded-xl border pl-10 pr-4 py-2 text-white
                    ${errors.startDate ? 'border-red-500' : 'border-white/10 focus:border-purple-500'}`}
                />
              </div>
              {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Data de Término */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-purple-200 mb-1">
                Data de Término
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={typeof formData.endDate === 'string' ? formData.endDate : formData.endDate.toISOString().split('T')[0]}
                  onChange={handleChange}
                  className={`w-full bg-black/20 backdrop-blur-xl rounded-xl border pl-10 pr-4 py-2 text-white
                    ${errors.endDate ? 'border-red-500' : 'border-white/10 focus:border-purple-500'}`}
                />
              </div>
              {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
            </div>

            {/* Preço */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-purple-200 mb-1">
                Preço (R$)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full bg-black/20 backdrop-blur-xl rounded-xl border pl-10 pr-4 py-2 text-white
                    ${errors.price ? 'border-red-500' : 'border-white/10 focus:border-purple-500'}`}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* Renovação Automática */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRenew"
                name="autoRenew"
                checked={formData.autoRenew}
                onChange={(e) => setFormData(prev => ({ ...prev, autoRenew: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="autoRenew" className="ml-2 block text-sm text-purple-200">
                Renovação Automática
              </label>
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
