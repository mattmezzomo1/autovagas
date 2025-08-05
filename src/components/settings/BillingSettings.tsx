import React, { useState } from 'react';
import { CreditCard, CheckCircle, Calendar, Clock, Download, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { SubscriptionCard } from '../dashboard/SubscriptionCard';

export const BillingSettings: React.FC = () => {
  const { profile, plans } = useAuthStore();
  const [showChangePlan, setShowChangePlan] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Assinatura e Faturamento</h2>

      {/* Current Plan */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Plano Atual</h3>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white text-xl font-semibold">
                  {profile.subscription?.plan === 'basic' && 'Plano Basic'}
                  {profile.subscription?.plan === 'plus' && 'Plano Plus'}
                  {profile.subscription?.plan === 'premium' && 'Plano Premium'}
                </h4>
                {profile.subscription?.plan !== 'basic' && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Ativo
                  </span>
                )}
              </div>

              {profile.subscription?.plan !== 'basic' && (
                <div className="mt-2 text-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Próxima cobrança: {formatDate(nextBillingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Renovação automática ativada</span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span>
                    {profile.subscription?.credits} créditos disponíveis
                  </span>
                </div>

                {(profile.subscription?.plan === 'plus' || profile.subscription?.plan === 'premium') && (
                  <>
                    <div className="flex items-center gap-2 text-white mt-1">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span>Candidaturas ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-white mt-1">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                      <span>Automação de candidaturas</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowChangePlan(true)}
              className="btn-secondary px-4 py-2"
            >
              {profile.subscription?.plan === 'basic' ? 'Fazer Upgrade' : 'Mudar Plano'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {profile.subscription?.plan !== 'basic' && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Métodos de Pagamento</h3>
          </div>

          <div className="p-4 bg-black/20 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center text-white font-bold text-xs">
                  VISA
                </div>
                <div>
                  <h4 className="text-white font-medium">•••• •••• •••• 4242</h4>
                  <p className="text-purple-300 text-sm">Expira em 12/25</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                  Padrão
                </span>
                <button className="text-purple-300 hover:text-purple-200 text-sm">
                  Editar
                </button>
              </div>
            </div>
          </div>

          <button className="text-purple-300 hover:text-purple-200 font-medium flex items-center gap-2">
            <span>+ Adicionar novo método de pagamento</span>
          </button>
        </div>
      )}

      {/* Billing History */}
      {profile.subscription?.plan !== 'basic' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Histórico de Faturamento</h3>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black/20 divide-y divide-white/10">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                    15/03/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Assinatura Plus - Mensal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    R$ 49,90
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                      Pago
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-purple-300 hover:text-purple-200">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                    15/02/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Assinatura Plus - Mensal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    R$ 49,90
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                      Pago
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-purple-300 hover:text-purple-200">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                    15/01/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Assinatura Plus - Mensal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    R$ 49,90
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                      Pago
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-purple-300 hover:text-purple-200">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-5xl w-full mx-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Escolha seu plano</h2>
                <p className="text-purple-200 mt-1">Desbloqueie todo o potencial da IA</p>
              </div>
              <button
                onClick={() => setShowChangePlan(false)}
                className="text-purple-300 hover:text-purple-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={profile.subscription?.plan}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
