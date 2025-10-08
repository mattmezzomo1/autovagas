import React, { useState } from 'react';
import { X, Check, Crown, Zap, Rocket, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'basic' | 'plus' | 'premium') => void;
}

interface PlanData {
  name: string;
  icon: any;
  color: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'plus' | 'premium'>('plus');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (!isOpen) return null;

  const plans: Record<'basic' | 'plus' | 'premium', PlanData> = {
    basic: {
      name: 'Basic',
      icon: Crown,
      color: 'from-blue-500 to-blue-600',
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        '50 aplicações por mês',
        'Extensão Chrome',
        'Suporte básico',
        'Análise de match básica',
        '1 currículo ativo'
      ]
    },
    plus: {
      name: 'Plus',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      monthlyPrice: 59,
      annualPrice: 590,
      popular: true,
      features: [
        '200 aplicações por mês',
        'Robô 24/7 na nuvem',
        'Suporte prioritário',
        'Análise de match avançada',
        '3 currículos ativos',
        'Treinamento IA para entrevistas',
        'Relatórios detalhados'
      ]
    },
    premium: {
      name: 'Premium',
      icon: Rocket,
      color: 'from-orange-500 to-red-500',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        '1000 aplicações por mês',
        'Robô 24/7 na nuvem',
        'Suporte VIP',
        'IA personalizada',
        'Currículos ilimitados',
        'Treinamento IA avançado',
        'Roadmap de carreira',
        'Acesso a cursos premium',
        'Consultoria de carreira'
      ]
    }
  };

  const handleSelectPlan = () => {
    onSelectPlan(selectedPlan);
    onClose();
  };

  const getPrice = (plan: keyof typeof plans) => {
    const planData = plans[plan];
    return billingCycle === 'monthly' ? planData.monthlyPrice : planData.annualPrice;
  };

  const getMonthlyPrice = (plan: keyof typeof plans) => {
    const planData = plans[plan];
    return billingCycle === 'monthly' ? planData.monthlyPrice : Math.round(planData.annualPrice / 12);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Escolha seu Plano</h2>
            <p className="text-slate-400 mt-1">Desbloqueie todo o potencial da AutoVagas</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-center">
            <div className="bg-slate-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -50%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6 pt-2">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const planKey = key as keyof typeof plans;
              const Icon = plan.icon;
              const isSelected = selectedPlan === planKey;
              
              return (
                <Card
                  key={key}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-slate-800'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  } ${plan.popular ? 'scale-105' : ''}`}
                  onClick={() => setSelectedPlan(planKey)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Mais Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <div className="text-3xl font-bold text-white">
                        R$ {getMonthlyPrice(planKey)}
                        <span className="text-lg text-slate-400">/mês</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="text-sm text-slate-400">
                          Cobrado R$ {getPrice(planKey)} anualmente
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-center sm:text-left">
              <div className="text-white font-medium">
                Plano {plans[selectedPlan].name} - R$ {getMonthlyPrice(selectedPlan)}/mês
              </div>
              <div className="text-slate-400 text-sm">
                {billingCycle === 'annual' ? 'Cobrança anual com 50% de desconto' : 'Cobrança mensal'}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSelectPlan}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Escolher Plano
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
