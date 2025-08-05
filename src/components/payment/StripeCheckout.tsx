import React, { useState } from 'react';
import { redirectToCheckout } from '../../services/StripeService';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  planId: 'basic' | 'plus' | 'premium';
  isAnnual?: boolean;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planId,
  isAnnual = false,
  buttonText = 'Assinar',
  className = '',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await redirectToCheckout(planId, isAnnual);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processando...</span>
          </>
        ) : (
          buttonText
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
