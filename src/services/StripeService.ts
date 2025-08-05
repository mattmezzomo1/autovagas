// Este é um serviço simulado para integração com a Stripe
// Em uma implementação real, você precisaria de um backend para criar sessões de checkout

// Chave pública da Stripe (em uma implementação real, isso viria de variáveis de ambiente)
export const STRIPE_PUBLIC_KEY = 'pk_test_51NxSampleStripeKeyForSimulation';

// Tipos para os planos
export interface StripePlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
}

// Tipos para os pacotes de créditos
export interface CreditPackage {
  id: string;
  amount: number;
  price: number; // em centavos
  currency: string;
}

// Mapeamento dos planos da aplicação para os planos da Stripe
export const STRIPE_PLANS: Record<string, StripePlan> = {
  'basic': {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 1990, // em centavos
    interval: 'month',
    currency: 'BRL'
  },
  'basic_annual': {
    id: 'price_basic_annual',
    name: 'Basic Anual',
    price: 995, // em centavos (50% de desconto)
    interval: 'year',
    currency: 'BRL'
  },
  'plus': {
    id: 'price_plus_monthly',
    name: 'Plus',
    price: 4990, // em centavos
    interval: 'month',
    currency: 'BRL'
  },
  'plus_annual': {
    id: 'price_plus_annual',
    name: 'Plus Anual',
    price: 2495, // em centavos (50% de desconto)
    interval: 'year',
    currency: 'BRL'
  },
  'premium': {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 9990, // em centavos
    interval: 'month',
    currency: 'BRL'
  },
  'premium_annual': {
    id: 'price_premium_annual',
    name: 'Premium Anual',
    price: 4995, // em centavos (50% de desconto)
    interval: 'year',
    currency: 'BRL'
  }
};

// Mapeamento dos pacotes de créditos
export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  'small': {
    id: 'price_credits_small',
    amount: 10,
    price: 990, // em centavos
    currency: 'BRL'
  },
  'medium': {
    id: 'price_credits_medium',
    amount: 50,
    price: 3990, // em centavos
    currency: 'BRL'
  },
  'large': {
    id: 'price_credits_large',
    amount: 100,
    price: 6990, // em centavos
    currency: 'BRL'
  }
};

// Interface para a resposta da API de checkout
export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Cria uma sessão de checkout da Stripe
 *
 * Em uma implementação real, isso faria uma chamada para o backend,
 * que por sua vez criaria uma sessão de checkout na Stripe.
 */
export const createCheckoutSession = async (planId: 'basic' | 'plus' | 'premium', isAnnual: boolean = false): Promise<CheckoutSession> => {
  // Simula uma chamada de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const stripePlanKey = isAnnual ? `${planId}_annual` : planId;
  const stripePlan = STRIPE_PLANS[stripePlanKey];

  if (!stripePlan) {
    throw new Error(`Plano não encontrado: ${stripePlanKey}`);
  }

  // Gera um ID de sessão aleatório
  const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;

  // URL de sucesso com parâmetros para a página de sucesso
  const successUrl = `${window.location.origin}/checkout/success?session_id=${sessionId}&plan=${planId}&billing=${isAnnual ? 'annual' : 'monthly'}`;

  // Em uma implementação real, isso seria retornado pelo backend
  return {
    id: sessionId,
    // Em uma implementação real, esta URL seria gerada pela Stripe
    // e incluiria parâmetros para redirecionar de volta para nossa aplicação
    url: `https://checkout.stripe.com/pay/${Math.random().toString(36).substring(2, 15)}?success_url=${encodeURIComponent(successUrl)}`
  };
};

/**
 * Redireciona o usuário para a página de checkout da Stripe
 */
export const redirectToCheckout = async (planId: 'basic' | 'plus' | 'premium', isAnnual: boolean = false): Promise<void> => {
  try {
    const session = await createCheckoutSession(planId, isAnnual);

    // Para fins de demonstração, vamos simular o processo de checkout
    // Em uma implementação real, redirecionaríamos para a URL da Stripe
    console.log('Redirecionando para:', session.url);

    const billingType = isAnnual ? 'anual' : 'mensal';
    const stripePlanKey = isAnnual ? `${planId}_annual` : planId;
    const stripePlan = STRIPE_PLANS[stripePlanKey];

    // Simula um atraso para representar o tempo que o usuário passaria na página de checkout
    alert(`Simulando redirecionamento para checkout ${billingType} do plano ${planId.toUpperCase()} (R$${(stripePlan.price / 100).toFixed(2)}). Em uma implementação real, você seria redirecionado para a página de pagamento da Stripe.`);

    // Após o "pagamento", redirecionamos diretamente para a página de sucesso
    // Em uma implementação real, a Stripe redirecionaria o usuário de volta para nossa aplicação
    const successUrl = `${window.location.origin}/checkout/success?session_id=${session.id}&plan=${planId}&billing=${isAnnual ? 'annual' : 'monthly'}`;
    window.location.href = successUrl;
  } catch (error) {
    console.error('Erro ao redirecionar para o checkout:', error);
    throw error;
  }
};

/**
 * Verifica o status de um pagamento
 *
 * Em uma implementação real, isso faria uma chamada para o backend,
 * que por sua vez verificaria o status do pagamento na Stripe.
 */
export const checkPaymentStatus = async (sessionId: string): Promise<'succeeded' | 'processing' | 'failed'> => {
  // Simula uma chamada de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Para fins de demonstração, sempre retorna sucesso
  return 'succeeded';
};

/**
 * Cria uma sessão de checkout para compra de créditos adicionais
 *
 * Em uma implementação real, isso faria uma chamada para o backend,
 * que por sua vez criaria uma sessão de checkout na Stripe.
 */
export const createCreditCheckoutSession = async (packageId: string): Promise<CheckoutSession> => {
  // Simula uma chamada de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const creditPackage = CREDIT_PACKAGES[packageId];

  if (!creditPackage) {
    throw new Error(`Pacote de créditos não encontrado: ${packageId}`);
  }

  // Gera um ID de sessão aleatório
  const sessionId = `cs_credit_${Math.random().toString(36).substring(2, 15)}`;

  // URL de sucesso com parâmetros para a página de sucesso
  const successUrl = `${window.location.origin}/checkout/credits/success?session_id=${sessionId}&amount=${creditPackage.amount}`;

  // Em uma implementação real, isso seria retornado pelo backend
  return {
    id: sessionId,
    // Em uma implementação real, esta URL seria gerada pela Stripe
    url: `https://checkout.stripe.com/pay/${Math.random().toString(36).substring(2, 15)}?success_url=${encodeURIComponent(successUrl)}`
  };
};

/**
 * Redireciona o usuário para a página de checkout da Stripe para compra de créditos
 */
export const purchaseCredits = async (packageId: string): Promise<void> => {
  try {
    const session = await createCreditCheckoutSession(packageId);

    // Para fins de demonstração, vamos simular o processo de checkout
    console.log('Redirecionando para checkout de créditos:', session.url);

    // Simula um atraso para representar o tempo que o usuário passaria na página de checkout
    alert('Simulando redirecionamento para a página de checkout da Stripe para compra de créditos. Em uma implementação real, você seria redirecionado para a página de pagamento da Stripe.');

    // Após o "pagamento", redirecionamos diretamente para a página de sucesso
    const creditPackage = CREDIT_PACKAGES[packageId];
    const successUrl = `${window.location.origin}/checkout/credits/success?session_id=${session.id}&amount=${creditPackage.amount}`;
    window.location.href = successUrl;
  } catch (error) {
    console.error('Erro ao redirecionar para o checkout de créditos:', error);
    throw error;
  }
};
