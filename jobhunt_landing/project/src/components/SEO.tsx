import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = "AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente",
  description = "Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil. Mais de 1000 aplicações por mês. Comece grátis!",
  keywords = "emprego, vagas, IA, inteligência artificial, aplicação automática, currículo, LinkedIn, recrutamento, carreira, trabalho, busca de emprego",
  image = "https://autovagas.com.br/og-image.jpg",
  url = "https://autovagas.com.br/",
  type = "website",
  noindex = false,
  canonical,
  structuredData
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'AutoVagas', true);
    updateMetaTag('og:locale', 'pt_BR', true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:creator', '@autovagas', true);

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const canonicalUrl = canonical || url;
    
    if (canonicalElement) {
      canonicalElement.href = canonicalUrl;
    } else {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      canonicalElement.href = canonicalUrl;
      document.head.appendChild(canonicalElement);
    }

    // Structured Data
    if (structuredData) {
      let structuredDataElement = document.querySelector('#structured-data') as HTMLScriptElement;
      
      if (structuredDataElement) {
        structuredDataElement.textContent = JSON.stringify(structuredData);
      } else {
        structuredDataElement = document.createElement('script');
        structuredDataElement.id = 'structured-data';
        structuredDataElement.type = 'application/ld+json';
        structuredDataElement.textContent = JSON.stringify(structuredData);
        document.head.appendChild(structuredDataElement);
      }
    }

    // Cleanup function
    return () => {
      // Remove dynamic structured data when component unmounts
      const dynamicStructuredData = document.querySelector('#structured-data');
      if (dynamicStructuredData) {
        dynamicStructuredData.remove();
      }
    };
  }, [title, description, keywords, image, url, type, noindex, canonical, structuredData]);

  return null;
};

export default SEO;

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: "AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente | Encontre Seu Emprego dos Sonhos",
    description: "Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil. Mais de 1000 aplicações por mês. Comece grátis!",
    keywords: "emprego, vagas, IA, inteligência artificial, aplicação automática, currículo, LinkedIn, recrutamento, carreira, trabalho, busca de emprego",
    url: "https://autovagas.com.br/"
  },
  
  pricing: {
    title: "Preços e Planos - AutoVagas | Escolha o Melhor Plano para Sua Carreira",
    description: "Conheça nossos planos: Básico (R$ 54), Plus (R$ 97) e Premium (R$ 147). Aplicação automática em vagas com IA. 7 dias de garantia. Cancele quando quiser.",
    keywords: "preços autovagas, planos autovagas, assinatura emprego, custo aplicação vagas, plano básico plus premium",
    url: "https://autovagas.com.br/precos"
  },
  
  about: {
    title: "Sobre a AutoVagas - Como Nossa IA Revoluciona a Busca por Emprego",
    description: "Conheça a história da AutoVagas e como nossa inteligência artificial está transformando a forma como as pessoas encontram emprego. Tecnologia inovadora para sua carreira.",
    keywords: "sobre autovagas, história empresa, equipe autovagas, missão visão valores, tecnologia IA emprego",
    url: "https://autovagas.com.br/sobre"
  },
  
  howItWorks: {
    title: "Como Funciona a AutoVagas - Passo a Passo da Aplicação Automática em Vagas",
    description: "Descubra como nossa IA encontra vagas compatíveis com seu perfil e aplica automaticamente. Processo simples em 3 passos: cadastro, configuração e aplicação automática.",
    keywords: "como funciona autovagas, processo aplicação automática, passo a passo, tutorial autovagas, funcionamento IA vagas",
    url: "https://autovagas.com.br/como-funciona"
  },
  
  companies: {
    title: "AutoVagas para Empresas - Encontre os Melhores Talentos com IA",
    description: "Plataforma para empresas encontrarem candidatos ideais. Dashboard completo, análise de perfis com IA, gestão de vagas e processo seletivo otimizado.",
    keywords: "autovagas empresas, recrutamento IA, dashboard empresas, gestão vagas, seleção candidatos, RH tecnologia",
    url: "https://autovagas.com.br/empresas"
  },
  
  blog: {
    title: "Blog AutoVagas - Dicas de Carreira, Mercado de Trabalho e Tecnologia",
    description: "Artigos sobre carreira, dicas para entrevistas, tendências do mercado de trabalho, uso de IA no recrutamento e muito mais. Conteúdo atualizado semanalmente.",
    keywords: "blog autovagas, dicas carreira, mercado trabalho, entrevistas emprego, tendências RH, artigos emprego",
    url: "https://autovagas.com.br/blog"
  },
  
  faq: {
    title: "Perguntas Frequentes - AutoVagas | Tire Suas Dúvidas",
    description: "Respostas para as principais dúvidas sobre a AutoVagas: como funciona, preços, cancelamento, garantia e muito mais. Suporte completo para usuários.",
    keywords: "FAQ autovagas, perguntas frequentes, dúvidas autovagas, suporte autovagas, ajuda usuários",
    url: "https://autovagas.com.br/faq"
  },
  
  contact: {
    title: "Contato - AutoVagas | Fale Conosco",
    description: "Entre em contato com a equipe AutoVagas. Suporte técnico, parcerias, imprensa e dúvidas gerais. Respondemos em até 24 horas.",
    keywords: "contato autovagas, suporte autovagas, fale conosco, atendimento cliente, email autovagas",
    url: "https://autovagas.com.br/contato"
  },
  
  login: {
    title: "Login - AutoVagas | Acesse Sua Conta",
    description: "Faça login na sua conta AutoVagas e acompanhe suas aplicações automáticas, estatísticas e configurações do perfil.",
    keywords: "login autovagas, entrar conta, acesso usuário, área restrita",
    url: "https://autovagas.com.br/login",
    noindex: true
  },
  
  register: {
    title: "Cadastro - AutoVagas | Crie Sua Conta Grátis",
    description: "Cadastre-se grátis na AutoVagas e comece a receber aplicações automáticas em vagas compatíveis com seu perfil. Processo rápido e seguro.",
    keywords: "cadastro autovagas, criar conta, registro grátis, inscrever autovagas",
    url: "https://autovagas.com.br/cadastro"
  }
};
