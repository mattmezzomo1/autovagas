import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { SubscriptionCard } from './SubscriptionCard';
import { BillingToggle } from './BillingToggle';

interface UpgradePlanModalProps {
  onClose: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ onClose }) => {
  const { plans, profile } = useAuthStore();
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  // Todos os planos agora oferecem auto-aplicação
  const eligiblePlans = plans;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-5xl w-full mx-auto my-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Escolha seu Plano</h2>
            <p className="text-purple-200 mt-1 text-sm sm:text-base">
              Todos os planos incluem automação - escolha o ideal para suas necessidades
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium">Automatize suas candidaturas</h3>
              <p className="text-purple-200 text-sm mt-1">
                Com o robô de auto-aplicação, você pode se candidatar automaticamente a vagas compatíveis com seu perfil,
                economizando tempo e aumentando suas chances de conseguir entrevistas.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <BillingToggle
          isAnnual={isAnnualBilling}
          onToggle={setIsAnnualBilling}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto max-h-[70vh] sm:max-h-none pb-2">
          {eligiblePlans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              currentPlan={profile.subscription?.plan}
              isAnnual={isAnnualBilling}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
