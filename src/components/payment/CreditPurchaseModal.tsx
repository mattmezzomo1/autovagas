import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Loader2, Star } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { purchaseCredits } from '../../services/StripeService';

interface CreditPackage {
  id: string;
  amount: number;
  price: number;
  description: string;
}

interface CreditPurchaseModalProps {
  onClose: () => void;
  onSuccess: (credits: number) => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({ onClose, onSuccess }) => {
  const { profile } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditPackages: CreditPackage[] = [
    {
      id: 'small',
      amount: 10,
      price: 9.90,
      description: 'Pacote básico para poucas aplicações'
    },
    {
      id: 'medium',
      amount: 50,
      price: 39.90,
      description: 'Pacote ideal para uso moderado'
    },
    {
      id: 'large',
      amount: 100,
      price: 69.90,
      description: 'Melhor custo-benefício para uso frequente'
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Aqui seria a integração real com o Stripe
      // Simulando um processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulando uma compra bem-sucedida
      onSuccess(selectedPackage.amount);
      onClose();
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Conteúdo do modal
  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4 py-6 overflow-y-auto">
      <div className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full mx-auto my-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Comprar Créditos Adicionais</h2>
            <p className="text-purple-200 mt-1">Adicione mais créditos para continuar aplicando</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-white">
              Você tem <span className="font-semibold">{profile.subscription?.credits}</span> créditos disponíveis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {creditPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`p-4 rounded-xl border transition-all ${
                selectedPackage?.id === pkg.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{pkg.amount}</div>
                <div className="text-sm text-purple-200 mb-2">créditos</div>
                <div className="text-lg font-semibold text-white">R$ {pkg.price.toFixed(2)}</div>
                <div className="text-xs text-purple-300 mt-2 line-clamp-2">{pkg.description}</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/10 text-purple-200 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              !selectedPackage || isProcessing
                ? 'bg-purple-500/30 text-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {selectedPackage
                  ? `Comprar ${selectedPackage.amount} créditos`
                  : 'Selecione um pacote'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderiza o modal usando um portal para garantir que ele apareça acima de todos os outros elementos
  return createPortal(modalContent, document.body);
};
