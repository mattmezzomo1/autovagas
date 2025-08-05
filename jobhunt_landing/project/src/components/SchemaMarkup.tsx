import React from 'react';

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'service' | 'faq' | 'article' | 'breadcrumb' | 'review';
  data?: any;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data = {} }) => {
  const getSchemaData = () => {
    const baseUrl = process.env.REACT_APP_SITE_URL || 'https://autovagas.com.br';
    
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AutoVagas",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": "Plataforma de IA que aplica automaticamente em vagas de emprego compatíveis com seu perfil",
          "foundingDate": "2024",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999",
            "contactType": "customer service",
            "availableLanguage": "Portuguese",
            "areaServed": "BR"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BR",
            "addressLocality": "São Paulo",
            "addressRegion": "SP"
          },
          "sameAs": [
            "https://www.linkedin.com/company/autovagas",
            "https://www.instagram.com/autovagas",
            "https://twitter.com/autovagas",
            "https://www.facebook.com/autovagas"
          ],
          ...data
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "AutoVagas",
          "url": baseUrl,
          "description": "IA que aplica automaticamente em vagas de emprego compatíveis com seu perfil",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/buscar?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "AutoVagas",
            "logo": `${baseUrl}/logo.png`
          },
          ...data
        };

      case 'service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AutoVagas - Aplicação Automática em Vagas",
          "description": "Serviço de IA que encontra e aplica automaticamente em vagas de emprego compatíveis com seu perfil profissional",
          "provider": {
            "@type": "Organization",
            "name": "AutoVagas",
            "url": baseUrl
          },
          "areaServed": "BR",
          "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": baseUrl,
            "serviceType": "Online"
          },
          "category": "Employment Services",
          "offers": [
            {
              "@type": "Offer",
              "name": "Plano Básico",
              "price": "54",
              "priceCurrency": "BRL",
              "description": "100 aplicações por mês com IA",
              "url": `${baseUrl}/precos`
            },
            {
              "@type": "Offer",
              "name": "Plano Plus",
              "price": "97",
              "priceCurrency": "BRL",
              "description": "500 aplicações por mês com IA avançada",
              "url": `${baseUrl}/precos`
            },
            {
              "@type": "Offer",
              "name": "Plano Premium",
              "price": "147",
              "priceCurrency": "BRL",
              "description": "1000 aplicações por mês com IA personalizada",
              "url": `${baseUrl}/precos`
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          ...data
        };

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions || [
            {
              "@type": "Question",
              "name": "Isso realmente funciona?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim! Nossa IA foi treinada para identificar e aplicar em vagas compatíveis com seu perfil, aumentando significativamente suas chances de conseguir entrevistas."
              }
            },
            {
              "@type": "Question",
              "name": "A IA aplica mesmo quando estou offline?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim, a IA trabalha 24/7 buscando e aplicando em vagas que correspondam ao seu perfil, mesmo quando você não está online."
              }
            },
            {
              "@type": "Question",
              "name": "E se eu não gostar? Tem reembolso?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oferecemos garantia de 7 dias. Se você não estiver satisfeito, devolvemos 100% do seu dinheiro."
              }
            }
          ]
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title || "AutoVagas - IA que Aplica em Vagas Automaticamente",
          "description": data.description || "Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil.",
          "image": data.image || `${baseUrl}/og-image.jpg`,
          "author": {
            "@type": "Organization",
            "name": "AutoVagas"
          },
          "publisher": {
            "@type": "Organization",
            "name": "AutoVagas",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "datePublished": data.datePublished || "2024-01-01",
          "dateModified": data.dateModified || "2024-12-24",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url || baseUrl
          },
          ...data
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items || [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": baseUrl
            }
          ]
        };

      case 'review':
        return {
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "Service",
            "name": "AutoVagas"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": data.rating || "5",
            "bestRating": "5"
          },
          "name": data.title || "Excelente serviço de aplicação automática",
          "author": {
            "@type": "Person",
            "name": data.authorName || "Usuário AutoVagas"
          },
          "reviewBody": data.content || "A AutoVagas revolucionou minha busca por emprego. Consegui várias entrevistas sem esforço!",
          "datePublished": data.datePublished || "2024-12-24",
          ...data
        };

      default:
        return {};
    }
  };

  const schemaData = getSchemaData();

  if (!schemaData || Object.keys(schemaData).length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
};

export default SchemaMarkup;

// Predefined schema configurations
export const schemaConfigs = {
  homepage: {
    organization: {},
    website: {},
    service: {},
    faq: {}
  },
  
  pricing: {
    service: {
      name: "Planos AutoVagas",
      description: "Escolha o melhor plano para sua carreira profissional"
    }
  },
  
  blog: {
    website: {
      name: "Blog AutoVagas",
      description: "Artigos sobre carreira, mercado de trabalho e tecnologia"
    }
  },
  
  faq: {
    faq: {
      questions: [
        {
          "@type": "Question",
          "name": "Como funciona a AutoVagas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nossa IA analisa seu perfil e aplica automaticamente em vagas compatíveis em diversas plataformas de emprego."
          }
        },
        {
          "@type": "Question",
          "name": "Quais plataformas são suportadas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Suportamos LinkedIn, InfoJobs, Catho, Indeed, Vagas.com e outras principais plataformas de emprego do Brasil."
          }
        },
        {
          "@type": "Question",
          "name": "É seguro usar a AutoVagas?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sim, utilizamos as melhores práticas de segurança e criptografia para proteger seus dados pessoais e profissionais."
          }
        }
      ]
    }
  }
};
