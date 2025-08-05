import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { checkPaymentStatus } from '../services/StripeService';
import { PageContainer } from '../components/layout/PageContainer';

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateProfile } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verificando status do pagamento...');

  // Obtém o ID da sessão e o plano dos parâmetros da URL
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan') as 'basic' | 'plus' | 'premium';

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !planId) {
        setStatus('error');
        setMessage('Informações de pagamento inválidas.');
        return;
      }

      try {
        // Verifica o status do pagamento
        const paymentStatus = await checkPaymentStatus(sessionId);

        if (paymentStatus === 'succeeded') {
          // Atualiza o perfil do usuário com o novo plano
          updateProfile({
            subscription: {
              plan: planId,
              credits: planId === 'basic' ? 10 : planId === 'plus' ? 100 : 1000,
              autoApply: false
            }
          });

          setStatus('success');
          setMessage('Pagamento confirmado! Seu plano foi atualizado com sucesso.');
        } else if (paymentStatus === 'processing') {
          setStatus('loading');
          setMessage('Seu pagamento está sendo processado. Você receberá uma confirmação em breve.');
        } else {
          setStatus('error');
          setMessage('Houve um problema com o pagamento. Por favor, tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setStatus('error');
        setMessage('Erro ao verificar o status do pagamento. Por favor, entre em contato com o suporte.');
      }
    };

    verifyPayment();
  }, [sessionId, planId, updateProfile]);

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-4" />
            )}

            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            )}

            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4">
                <span className="text-red-500 text-2xl font-bold">!</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              {status === 'loading' && 'Processando Pagamento'}
              {status === 'success' && 'Pagamento Confirmado!'}
              {status === 'error' && 'Problema no Pagamento'}
            </h1>

            <p className="text-purple-200 mb-8">
              {message}
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
            >
              {status === 'success' ? 'Ir para o Dashboard' : 'Voltar para o Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
