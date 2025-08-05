// Google Analytics and tracking utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    clarity: (...args: any[]) => void;
  }
}

// Google Analytics configuration
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
export const CLARITY_PROJECT_ID = process.env.REACT_APP_CLARITY_PROJECT_ID || 'CLARITY_PROJECT_ID';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track conversions
export const trackConversion = (conversionId: string, value?: number, currency = 'BRL') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency,
    });
  }
};

// Predefined tracking events
export const trackingEvents = {
  // User interactions
  signUp: (method: string) => trackEvent('sign_up', 'engagement', method),
  login: (method: string) => trackEvent('login', 'engagement', method),
  logout: () => trackEvent('logout', 'engagement'),
  
  // Pricing and purchases
  viewPricing: () => trackEvent('view_pricing', 'engagement'),
  selectPlan: (planName: string) => trackEvent('select_plan', 'engagement', planName),
  startCheckout: (planName: string, value: number) => trackEvent('begin_checkout', 'ecommerce', planName, value),
  completePurchase: (planName: string, value: number) => trackEvent('purchase', 'ecommerce', planName, value),
  
  // Content engagement
  watchVideo: (videoTitle: string) => trackEvent('video_play', 'engagement', videoTitle),
  downloadResource: (resourceName: string) => trackEvent('download', 'engagement', resourceName),
  shareContent: (contentType: string, method: string) => trackEvent('share', 'engagement', `${contentType}_${method}`),
  
  // Navigation
  clickCTA: (ctaText: string, location: string) => trackEvent('click_cta', 'engagement', `${ctaText}_${location}`),
  scrollToSection: (sectionName: string) => trackEvent('scroll_to_section', 'engagement', sectionName),
  
  // Form interactions
  startForm: (formName: string) => trackEvent('form_start', 'engagement', formName),
  completeForm: (formName: string) => trackEvent('form_complete', 'engagement', formName),
  formError: (formName: string, errorType: string) => trackEvent('form_error', 'engagement', `${formName}_${errorType}`),
  
  // Feature usage
  useAIFeature: (featureName: string) => trackEvent('use_ai_feature', 'engagement', featureName),
  viewJobApplications: () => trackEvent('view_applications', 'engagement'),
  configureProfile: () => trackEvent('configure_profile', 'engagement'),
  
  // Support and help
  openChat: () => trackEvent('open_chat', 'engagement'),
  viewFAQ: () => trackEvent('view_faq', 'engagement'),
  contactSupport: (method: string) => trackEvent('contact_support', 'engagement', method),
  
  // Business metrics
  jobApplicationSent: (platform: string) => trackEvent('job_application_sent', 'business', platform),
  interviewScheduled: () => trackEvent('interview_scheduled', 'business'),
  jobOfferReceived: () => trackEvent('job_offer_received', 'business'),
};

// Enhanced ecommerce tracking
export const ecommerceTracking = {
  viewItem: (itemId: string, itemName: string, category: string, value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BRL',
        value: value,
        items: [{
          item_id: itemId,
          item_name: itemName,
          category: category,
          quantity: 1,
          price: value,
        }]
      });
    }
  },
  
  addToCart: (itemId: string, itemName: string, category: string, value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: value,
        items: [{
          item_id: itemId,
          item_name: itemName,
          category: category,
          quantity: 1,
          price: value,
        }]
      });
    }
  },
  
  purchase: (transactionId: string, items: any[], value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'BRL',
        value: value,
        items: items
      });
    }
  }
};

// User properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      custom_map: properties
    });
  }
};

// Microsoft Clarity tracking
export const clarityTracking = {
  identify: (userId: string, sessionId?: string, pageId?: string, friendlyName?: string) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('identify', userId, sessionId, pageId, friendlyName);
    }
  },
  
  consent: () => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent');
    }
  },
  
  upgrade: (reason: string) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('upgrade', reason);
    }
  }
};

// Cookie consent management
export const cookieConsent = {
  granted: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      });
    }
  },
  
  denied: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted', // Security storage is always granted
      });
    }
  }
};

// Performance monitoring
export const performanceTracking = {
  measurePageLoad: () => {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        trackEvent('page_load_time', 'performance', window.location.pathname, loadTime);
      });
    }
  },
  
  measureLCP: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackEvent('largest_contentful_paint', 'performance', window.location.pathname, Math.round(lastEntry.startTime));
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },
  
  measureFID: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          trackEvent('first_input_delay', 'performance', window.location.pathname, Math.round(entry.processingStart - entry.startTime));
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
};

// Initialize all tracking
export const initializeTracking = () => {
  initGA();
  performanceTracking.measurePageLoad();
  performanceTracking.measureLCP();
  performanceTracking.measureFID();
};
