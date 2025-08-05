// SEO Configuration for different environments and pages

interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultImage: string;
  twitterHandle: string;
  facebookAppId?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  yandexVerification?: string;
}

const baseConfig: SEOConfig = {
  siteName: 'AutoVagas',
  siteUrl: process.env.REACT_APP_SITE_URL || 'https://autovagas.com.br',
  defaultTitle: 'AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente',
  titleTemplate: '%s | AutoVagas',
  defaultDescription: 'Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil. Mais de 1000 aplicações por mês. Comece grátis!',
  defaultKeywords: 'emprego, vagas, IA, inteligência artificial, aplicação automática, currículo, LinkedIn, recrutamento, carreira, trabalho, busca de emprego, RH, recursos humanos',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@autovagas',
  facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID,
  googleSiteVerification: process.env.REACT_APP_GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.REACT_APP_BING_SITE_VERIFICATION,
  yandexVerification: process.env.REACT_APP_YANDEX_VERIFICATION,
};

// Environment-specific configurations
const environmentConfigs = {
  development: {
    ...baseConfig,
    siteUrl: 'http://localhost:3000',
    defaultTitle: '[DEV] AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente',
  },
  
  staging: {
    ...baseConfig,
    siteUrl: 'https://staging.autovagas.com.br',
    defaultTitle: '[STAGING] AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente',
  },
  
  production: baseConfig,
};

// Get current environment config
const environment = process.env.NODE_ENV as keyof typeof environmentConfigs;
export const seoConfig = environmentConfigs[environment] || environmentConfigs.production;

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: 'AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente | Encontre Seu Emprego dos Sonhos',
    description: 'Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil. Mais de 1000 aplicações por mês. Comece grátis!',
    keywords: 'emprego, vagas, IA, inteligência artificial, aplicação automática, currículo, LinkedIn, recrutamento, carreira, trabalho, busca de emprego',
    path: '/',
    image: '/og-home.jpg',
    priority: 1.0,
    changefreq: 'weekly' as const,
  },
  
  pricing: {
    title: 'Preços e Planos - AutoVagas | Escolha o Melhor Plano para Sua Carreira',
    description: 'Conheça nossos planos: Básico (R$ 54), Plus (R$ 97) e Premium (R$ 147). Aplicação automática em vagas com IA. 7 dias de garantia. Cancele quando quiser.',
    keywords: 'preços autovagas, planos autovagas, assinatura emprego, custo aplicação vagas, plano básico plus premium',
    path: '/precos',
    image: '/og-pricing.jpg',
    priority: 0.9,
    changefreq: 'weekly' as const,
  },
  
  about: {
    title: 'Sobre a AutoVagas - Como Nossa IA Revoluciona a Busca por Emprego',
    description: 'Conheça a história da AutoVagas e como nossa inteligência artificial está transformando a forma como as pessoas encontram emprego. Tecnologia inovadora para sua carreira.',
    keywords: 'sobre autovagas, história empresa, equipe autovagas, missão visão valores, tecnologia IA emprego',
    path: '/sobre',
    image: '/og-about.jpg',
    priority: 0.8,
    changefreq: 'monthly' as const,
  },
  
  howItWorks: {
    title: 'Como Funciona a AutoVagas - Passo a Passo da Aplicação Automática em Vagas',
    description: 'Descubra como nossa IA encontra vagas compatíveis com seu perfil e aplica automaticamente. Processo simples em 3 passos: cadastro, configuração e aplicação automática.',
    keywords: 'como funciona autovagas, processo aplicação automática, passo a passo, tutorial autovagas, funcionamento IA vagas',
    path: '/como-funciona',
    image: '/og-how-it-works.jpg',
    priority: 0.8,
    changefreq: 'monthly' as const,
  },
  
  companies: {
    title: 'AutoVagas para Empresas - Encontre os Melhores Talentos com IA',
    description: 'Plataforma para empresas encontrarem candidatos ideais. Dashboard completo, análise de perfis com IA, gestão de vagas e processo seletivo otimizado.',
    keywords: 'autovagas empresas, recrutamento IA, dashboard empresas, gestão vagas, seleção candidatos, RH tecnologia',
    path: '/empresas',
    image: '/og-companies.jpg',
    priority: 0.8,
    changefreq: 'monthly' as const,
  },
  
  blog: {
    title: 'Blog AutoVagas - Dicas de Carreira, Mercado de Trabalho e Tecnologia',
    description: 'Artigos sobre carreira, dicas para entrevistas, tendências do mercado de trabalho, uso de IA no recrutamento e muito mais. Conteúdo atualizado semanalmente.',
    keywords: 'blog autovagas, dicas carreira, mercado trabalho, entrevistas emprego, tendências RH, artigos emprego',
    path: '/blog',
    image: '/og-blog.jpg',
    priority: 0.7,
    changefreq: 'weekly' as const,
  },
  
  faq: {
    title: 'Perguntas Frequentes - AutoVagas | Tire Suas Dúvidas',
    description: 'Respostas para as principais dúvidas sobre a AutoVagas: como funciona, preços, cancelamento, garantia e muito mais. Suporte completo para usuários.',
    keywords: 'FAQ autovagas, perguntas frequentes, dúvidas autovagas, suporte autovagas, ajuda usuários',
    path: '/faq',
    image: '/og-faq.jpg',
    priority: 0.7,
    changefreq: 'monthly' as const,
  },
  
  contact: {
    title: 'Contato - AutoVagas | Fale Conosco',
    description: 'Entre em contato com a equipe AutoVagas. Suporte técnico, parcerias, imprensa e dúvidas gerais. Respondemos em até 24 horas.',
    keywords: 'contato autovagas, suporte autovagas, fale conosco, atendimento cliente, email autovagas',
    path: '/contato',
    image: '/og-contact.jpg',
    priority: 0.6,
    changefreq: 'monthly' as const,
  },
  
  login: {
    title: 'Login - AutoVagas | Acesse Sua Conta',
    description: 'Faça login na sua conta AutoVagas e acompanhe suas aplicações automáticas, estatísticas e configurações do perfil.',
    keywords: 'login autovagas, entrar conta, acesso usuário, área restrita',
    path: '/login',
    image: '/og-login.jpg',
    priority: 0.5,
    changefreq: 'monthly' as const,
    noindex: true,
  },
  
  register: {
    title: 'Cadastro - AutoVagas | Crie Sua Conta Grátis',
    description: 'Cadastre-se grátis na AutoVagas e comece a receber aplicações automáticas em vagas compatíveis com seu perfil. Processo rápido e seguro.',
    keywords: 'cadastro autovagas, criar conta, registro grátis, inscrever autovagas',
    path: '/cadastro',
    image: '/og-register.jpg',
    priority: 0.8,
    changefreq: 'monthly' as const,
  },
  
  privacy: {
    title: 'Política de Privacidade - AutoVagas | Proteção de Dados',
    description: 'Conheça nossa política de privacidade e como protegemos seus dados pessoais. Transparência total sobre coleta, uso e armazenamento de informações.',
    keywords: 'política privacidade autovagas, proteção dados, LGPD, privacidade usuário',
    path: '/privacidade',
    image: '/og-privacy.jpg',
    priority: 0.3,
    changefreq: 'yearly' as const,
  },
  
  terms: {
    title: 'Termos de Uso - AutoVagas | Condições de Serviço',
    description: 'Leia nossos termos de uso e condições de serviço. Entenda seus direitos e responsabilidades ao usar a plataforma AutoVagas.',
    keywords: 'termos uso autovagas, condições serviço, contrato usuário, direitos deveres',
    path: '/termos',
    image: '/og-terms.jpg',
    priority: 0.3,
    changefreq: 'yearly' as const,
  },
};

// Generate full URL for a path
export const generateUrl = (path: string): string => {
  return `${seoConfig.siteUrl}${path}`;
};

// Generate full image URL
export const generateImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) return imagePath;
  return `${seoConfig.siteUrl}${imagePath}`;
};

// Get page config by path
export const getPageConfig = (path: string) => {
  const normalizedPath = path === '/' ? 'home' : path.replace('/', '');
  return pageConfigs[normalizedPath as keyof typeof pageConfigs] || pageConfigs.home;
};

// Generate sitemap data
export const generateSitemapData = () => {
  return Object.entries(pageConfigs).map(([key, config]) => ({
    url: generateUrl(config.path),
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: config.changefreq,
    priority: config.priority,
    noindex: config.noindex || false,
  }));
};

// Robots.txt configuration
export const robotsConfig = {
  userAgent: '*',
  allow: [
    '/',
    '/sobre',
    '/precos',
    '/como-funciona',
    '/empresas',
    '/blog',
    '/contato',
    '/faq',
    '/cadastro',
  ],
  disallow: [
    '/admin/',
    '/api/',
    '/dashboard/',
    '/private/',
    '/_next/',
    '/node_modules/',
    '/login',
    '/reset-password',
    '/verify-email',
  ],
  sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  crawlDelay: 1,
};

// Meta verification tags
export const verificationTags = {
  google: seoConfig.googleSiteVerification,
  bing: seoConfig.bingSiteVerification,
  yandex: seoConfig.yandexVerification,
};

// Social media links
export const socialLinks = {
  twitter: 'https://twitter.com/autovagas',
  facebook: 'https://facebook.com/autovagas',
  linkedin: 'https://linkedin.com/company/autovagas',
  instagram: 'https://instagram.com/autovagas',
  youtube: 'https://youtube.com/@autovagas',
};

// Structured data templates
export const structuredDataTemplates = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": seoConfig.siteName,
    "url": seoConfig.siteUrl,
    "logo": generateImageUrl("/logo.png"),
    "sameAs": Object.values(socialLinks),
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoConfig.siteName,
    "url": seoConfig.siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${seoConfig.siteUrl}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
};

export default seoConfig;
