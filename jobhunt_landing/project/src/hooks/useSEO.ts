import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
  structuredData?: object;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    const {
      title = "AutoVagas - IA que Aplica em Vagas de Emprego Automaticamente",
      description = "Pare de procurar emprego. A AutoVagas usa IA para encontrar e aplicar automaticamente em vagas compatíveis com seu perfil. Mais de 1000 aplicações por mês. Comece grátis!",
      keywords = "emprego, vagas, IA, inteligência artificial, aplicação automática, currículo, LinkedIn, recrutamento, carreira, trabalho, busca de emprego",
      image = "https://autovagas.com.br/og-image.jpg",
      url = "https://autovagas.com.br/",
      type = "website",
      noindex = false,
      canonical,
      structuredData,
      breadcrumbs
    } = seoData;

    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
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

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (element) {
        element.href = href;
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      } else {
        element = document.createElement('link');
        element.rel = rel;
        element.href = href;
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('author', 'AutoVagas');
    updateMetaTag('language', 'Portuguese');
    updateMetaTag('revisit-after', '7 days');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'AutoVagas', true);
    updateMetaTag('og:locale', 'pt_BR', true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:creator', '@autovagas', true);
    updateMetaTag('twitter:site', '@autovagas', true);

    // Additional meta tags for better SEO
    updateMetaTag('theme-color', '#3b82f6');
    updateMetaTag('msapplication-TileColor', '#3b82f6');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'AutoVagas');

    // Canonical URL
    const canonicalUrl = canonical || url;
    updateLinkTag('canonical', canonicalUrl);

    // Alternate language versions (if applicable)
    updateLinkTag('alternate', url, { hreflang: 'pt-BR' });

    // Preconnect to important domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        if (domain.includes('gstatic')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    // Structured Data
    if (structuredData) {
      let structuredDataElement = document.querySelector('#dynamic-structured-data') as HTMLScriptElement;
      
      if (structuredDataElement) {
        structuredDataElement.textContent = JSON.stringify(structuredData);
      } else {
        structuredDataElement = document.createElement('script');
        structuredDataElement.id = 'dynamic-structured-data';
        structuredDataElement.type = 'application/ld+json';
        structuredDataElement.textContent = JSON.stringify(structuredData);
        document.head.appendChild(structuredDataElement);
      }
    }

    // Breadcrumb structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };

      let breadcrumbElement = document.querySelector('#breadcrumb-structured-data') as HTMLScriptElement;
      
      if (breadcrumbElement) {
        breadcrumbElement.textContent = JSON.stringify(breadcrumbSchema);
      } else {
        breadcrumbElement = document.createElement('script');
        breadcrumbElement.id = 'breadcrumb-structured-data';
        breadcrumbElement.type = 'application/ld+json';
        breadcrumbElement.textContent = JSON.stringify(breadcrumbSchema);
        document.head.appendChild(breadcrumbElement);
      }
    }

    // Cleanup function
    return () => {
      // Remove dynamic structured data when component unmounts
      const dynamicStructuredData = document.querySelector('#dynamic-structured-data');
      if (dynamicStructuredData) {
        dynamicStructuredData.remove();
      }
      
      const breadcrumbStructuredData = document.querySelector('#breadcrumb-structured-data');
      if (breadcrumbStructuredData) {
        breadcrumbStructuredData.remove();
      }
    };
  }, [seoData]);
};

export default useSEO;

// Utility function to generate SEO-friendly URLs
export const generateSEOUrl = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Utility function to truncate text for meta descriptions
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

// Utility function to extract keywords from text
export const extractKeywords = (text: string, maxKeywords: number = 10): string => {
  const commonWords = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'o', 'a', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'que', 'se', 'por', 'mais', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'esses', 'essa', 'essas', 'num', 'numa'];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
  
  return sortedWords.join(', ');
};
