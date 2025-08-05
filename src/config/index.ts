/**
 * Configurações do frontend
 */

// Configuração da API
export const API_CONFIG = {
  BASE_URL: '/api', // Usa proxy do Vite
  TIMEOUT: 30000, // 30 segundos
};

// Configurações de autenticação
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
};

// Configurações da aplicação
export const APP_CONFIG = {
  NAME: 'Autovagas',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de automação para busca de empregos',
};

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  DURATION: 3000, // 3 segundos
  POSITION: 'bottom-right' as const,
};

// Configurações de validação
export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Configurações de upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5242880, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Configurações de tema
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#8B5CF6',
  SECONDARY_COLOR: '#EC4899',
  SUCCESS_COLOR: '#10B981',
  ERROR_COLOR: '#EF4444',
  WARNING_COLOR: '#F59E0B',
  INFO_COLOR: '#3B82F6',
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  APP_CONFIG,
  PAGINATION_CONFIG,
  NOTIFICATION_CONFIG,
  VALIDATION_CONFIG,
  UPLOAD_CONFIG,
  THEME_CONFIG,
};
