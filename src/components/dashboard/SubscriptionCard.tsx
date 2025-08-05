import React, { useState } from 'react';
import { Sparkles, Check, Zap, Loader2 } from 'lucide-react';
import { Plan } from '../../types/auth';
import { StripeCheckout } from '../payment/StripeCheckout';

interface SubscriptionCardProps {
  plan: Plan;
  currentPlan?: string;
  isAnnual?: boolean;
  highlighted?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  currentPlan,
  isAnnual = false,
  highlighted = false
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  const displayPrice = isAnnual ? plan.annualPrice : plan.price;
  const originalPrice = plan.price;
  const savings = isAnnual ? ((originalPrice - plan.annualPrice) / originalPrice * 100).toFixed(0) : 0;

  return (
    <div className={`relative bg-black/20 backdrop-blur-xl rounded-xl border p-3 transition-all duration-300 h-full flex flex-col
      ${isCurrentPlan
        ? 'border-purple-500 shadow-xl shadow-purple-500/20'
        : highlighted
        ? 'border-yellow-500/50 shadow-xl shadow-yellow-500/20'
        : 'border-white/10 hover:border-purple-500/50'}`}
    >
      {highlighted && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          Mais Popular
        </div>
      )}

      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>

        {/* Preço */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xl font-bold text-white">
              {displayPrice === 0 ? 'Grátis' : `R$${displayPrice.toFixed(2)}`}
            </span>
            {displayPrice > 0 && (
              <span className="text-purple-300 text-sm">/mês</span>
            )}
          </div>

          {/* Preço original e economia para plano anual */}
          {isAnnual && displayPrice > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-400 line-through">
                  R${originalPrice.toFixed(2)}/mês
                </span>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {savings}% OFF
                </div>
              </div>
              <p className="text-xs text-green-400 font-medium">
                Economize R${((originalPrice - displayPrice) * 12).toFixed(2)} por ano
              </p>
            </div>
          )}

          {/* Billing period */}
          {displayPrice > 0 && (
            <p className="text-xs text-purple-300 mt-1">
              {isAnnual ? 'Cobrado anualmente' : 'Cobrado mensalmente'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3 flex-1">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <span className="text-purple-200 text-xs leading-tight">{feature}</span>
          </div>
        ))}
      </div>

      {isCurrentPlan ? (
        <button
          className="w-full py-2 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm bg-purple-500/20 text-purple-300 cursor-default mt-auto"
          disabled
        >
          <Zap className="w-4 h-4" />
          Plano Atual
        </button>
      ) : (
        <StripeCheckout
          planId={plan.id as 'basic' | 'plus' | 'premium'}
          isAnnual={isAnnual}
          buttonText={isAnnual ? 'Assinar Anual' : 'Assinar Mensal'}
          className="w-full py-2 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 mt-auto"
          onError={(error) => console.error('Erro no checkout:', error)}
        />
      )}
    </div>
  );
};