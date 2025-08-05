import React, { useState } from 'react';
import { X, Zap, Bot, CheckCircle, Crown, Sparkles, ArrowRight, Download, Chrome } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { SubscriptionCard } from './SubscriptionCard';
import { BillingToggle } from './BillingToggle';

interface RobotPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: 'auto-apply' | 'scraper' | 'general';
}

export const RobotPaywallModal: React.FC<RobotPaywallModalProps> = ({
  isOpen,
  onClose,
  actionType = 'general'
}) => {
  const { plans, profile } = useAuthStore();
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  // Todos os planos agora oferecem auto-aplicação (Básico, Plus e Premium)
  const eligiblePlans = plans;

  // Configurações baseadas no tipo de ação
  const actionConfig = {
    'auto-apply': {
      title: 'Ative o Auto-Aplicador Inteligente',
      subtitle: 'Escolha o plano ideal para suas necessidades de auto-aplicação',
      icon: Bot,
      color: 'indigo',
      features: [
        'Aplicação automática em vagas compatíveis',
        'Análise inteligente de compatibilidade',
        'Relatórios detalhados de aplicações',
        'Configuração personalizada de critérios'
      ]
    },
    'scraper': {
      title: 'Ative o Robô de Busca Avançada',
      subtitle: 'Escolha o plano ideal para automação de busca de vagas',
      icon: Zap,
      color: 'purple',
      features: [
        'Busca automatizada em múltiplas plataformas',
        'Coleta de vagas em tempo real',
        'Filtros avançados de busca',
        'Monitoramento contínuo de oportunidades'
      ]
    },
    'general': {
      title: 'Desbloqueie o Poder da Automação',
      subtitle: 'Escolha o plano ideal para suas necessidades de automação',
      icon: Crown,
      color: 'gradient',
      features: [
        'Auto-aplicação inteligente',
        'Busca automatizada de vagas',
        'Análise de compatibilidade com IA',
        'Relatórios e estatísticas avançadas'
      ]
    }
  };

  const config = actionConfig[actionType];
  const IconComponent = config.icon;

  // Verifica se o usuário tem plano básico
  const hasBasicPlan = profile.subscription?.plan === 'basic';

  // Função para instalar a extensão
  const handleInstallExtension = () => {
    // URL da extensão na Chrome Web Store (será atualizada quando publicada)
    const extensionUrl = 'https://chrome.google.com/webstore/detail/autovagas-extension/[ID_DA_EXTENSAO]';
    window.open(extensionUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-black/40 backdrop-blur-xl p-4 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-6xl w-full mx-auto my-6 min-h-fit">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                config.color === 'gradient'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  : config.color === 'indigo'
                  ? 'bg-indigo-500/20 border border-indigo-500/30'
                  : 'bg-purple-500/20 border border-purple-500/30'
              }`}>
                <IconComponent className={`w-7 h-7 ${
                  config.color === 'gradient' ? 'text-white' :
                  config.color === 'indigo' ? 'text-indigo-400' : 'text-purple-400'
                }`} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{config.title}</h2>
            </div>
            <p className="text-purple-200 text-sm sm:text-base max-w-2xl">
              {config.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-3">
                Automatize sua busca por empregos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-purple-200 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-200 font-medium">Economia de Tempo</span>
                </div>
                <p className="text-yellow-200/80 text-sm">
                  Nossos usuários economizam em média <strong>15 horas por semana</strong> na busca por empregos,
                  aumentando suas chances de conseguir entrevistas em <strong>300%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Types Comparison */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold text-lg mb-4 text-center">
            🤖 Tipos de Automação Disponíveis
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Extension Type */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-orange-200 font-medium">Extensão Chrome</h4>
                  <p className="text-orange-200/70 text-xs">Plano Básico</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-orange-200/80">
                <li>• Roda na sua máquina</li>
                <li>• Você controla quando usar</li>
                <li>• 50 aplicações/mês</li>
                <li>• Ideal para começar</li>
              </ul>
            </div>

            {/* Cloud Type */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-purple-200 font-medium">Bot na Nuvem 24/7</h4>
                  <p className="text-purple-200/70 text-xs">Plus & Premium</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-purple-200/80">
                <li>• Roda em nossos servidores</li>
                <li>• Funciona 24 horas por dia</li>
                <li>• 100-1000 aplicações/mês</li>
                <li>• Máxima eficiência</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Extension Installation for Basic Plan Users */}
        {hasBasicPlan && (
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-4">
                <Chrome className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">
                🎉 Você tem acesso à automação!
              </h3>
              <p className="text-orange-200 mb-4 max-w-2xl mx-auto">
                Como usuário do plano Básico, você pode usar nossa extensão Chrome para automatizar suas aplicações.
                A extensão roda na sua máquina e você controla quando usar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleInstallExtension}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Instalar Extensão Chrome
                </button>

                <div className="text-center sm:text-left">
                  <p className="text-orange-200/80 text-sm">
                    ✅ Gratuito para usuários do plano Básico<br/>
                    ✅ 50 aplicações automáticas por mês
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-200 font-medium mb-2">📋 Como funciona:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-blue-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">1</span>
                    Instale a extensão
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">2</span>
                    Faça login com sua conta
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">3</span>
                    Configure e ative o robô
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Info */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="text-green-200 font-medium">Todos os planos incluem automação!</h4>
              <p className="text-green-200/80 text-sm">
                Escolha o plano que melhor se adapta às suas necessidades e volume de aplicações
              </p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold text-lg mb-2">💰 Escolha seu período de cobrança</h3>
            <p className="text-purple-200 text-sm">Economize 50% com o plano anual!</p>
          </div>
          <BillingToggle
            isAnnual={isAnnualBilling}
            onToggle={setIsAnnualBilling}
          />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pb-2 pt-6">
          {eligiblePlans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              currentPlan={profile.subscription?.plan}
              isAnnual={isAnnualBilling}
              highlighted={plan.isPopular}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-purple-300 text-sm">
            💡 <strong>Dica:</strong> Comece com o plano Plus e faça upgrade para Premium quando precisar de mais funcionalidades
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-purple-400">
            <span>✅ Sem compromisso</span>
            <span>✅ Cancele a qualquer momento</span>
            <span>✅ Suporte 24/7</span>
            <span>✅ Garantia de 7 dias</span>
          </div>
        </div>
      </div>
    </div>
  );
};
