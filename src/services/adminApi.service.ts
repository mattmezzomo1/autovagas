import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/index';

// Configuração da URL da API
const API_URL = API_CONFIG.BASE_URL;

// Configuração do axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Interceptor para adicionar o token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Serviço para gerenciar as chamadas de API para o dashboard administrativo
 */
class AdminApiService {
  private token: string | null = null;

  /**
   * Define o token de autenticação
   * @param token Token JWT
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Obtém o token de autenticação
   * @returns Token JWT
   */
  getToken(): string | null {
    return this.token || localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  /**
   * Cria o cabeçalho de autorização (não mais necessário com interceptors)
   * @returns Cabeçalho de autorização
   * @deprecated Use axiosInstance que já adiciona o token automaticamente
   */
  private getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Obtém todos os usuários com paginação e filtros
   * @param params Parâmetros de consulta
   * @returns Lista de usuários e metadados de paginação
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    plan?: string;
  }) {
    try {
      const response = await axiosInstance.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      throw error;
    }
  }

  /**
   * Obtém um usuário pelo ID
   * @param id ID do usuário
   * @returns Dados do usuário
   */
  async getUserById(id: string) {
    try {
      const response = await axiosInstance.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   * @param userData Dados do usuário
   * @returns Usuário criado
   */
  async createUser(userData: any) {
    try {
      const response = await axiosInstance.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente
   * @param id ID do usuário
   * @param userData Dados atualizados do usuário
   * @returns Usuário atualizado
   */
  async updateUser(id: string, userData: any) {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove um usuário
   * @param id ID do usuário
   * @returns Mensagem de sucesso
   */
  async deleteUser(id: string) {
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as assinaturas com paginação e filtros
   * @param params Parâmetros de consulta
   * @returns Lista de assinaturas e metadados de paginação
   */
  async getSubscriptions(params: {
    page?: number;
    limit?: number;
    search?: string;
    plan?: string;
    status?: string;
  }) {
    try {
      const response = await axiosInstance.get('/admin/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter assinaturas:', error);
      throw error;
    }
  }

  /**
   * Obtém uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Dados da assinatura
   */
  async getSubscriptionById(id: string) {
    try {
      const response = await axiosInstance.get(`/admin/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter assinatura por ID:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova assinatura
   * @param subscriptionData Dados da assinatura
   * @returns Assinatura criada
   */
  async createSubscription(subscriptionData: any) {
    try {
      const response = await axiosInstance.post('/admin/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma assinatura existente
   * @param id ID da assinatura
   * @param subscriptionData Dados atualizados da assinatura
   * @returns Assinatura atualizada
   */
  async updateSubscription(id: string, subscriptionData: any) {
    try {
      const response = await axiosInstance.put(`/admin/subscriptions/${id}`, subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura
   * @param id ID da assinatura
   * @returns Mensagem de sucesso
   */
  async cancelSubscription(id: string) {
    try {
      const response = await axiosInstance.post(`/admin/subscriptions/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as estatísticas do sistema
   * @returns Estatísticas do sistema
   */
  async getAllStats() {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as configurações do sistema
   * @returns Configurações do sistema
   */
  async getSettings() {
    try {
      const response = await axiosInstance.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      throw error;
    }
  }

  /**
   * Atualiza as configurações do sistema
   * @param settings Novas configurações
   * @returns Configurações atualizadas
   */
  async updateSettings(settings: any) {
    try {
      const response = await axiosInstance.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }

  /**
   * Obtém configurações específicas por categoria
   * @param category Categoria de configurações
   * @returns Configurações da categoria
   */
  async getSettingsByCategory(category: string) {
    try {
      const response = await axiosInstance.get(`/admin/settings/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter configurações da categoria ${category}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza configurações específicas por categoria
   * @param category Categoria de configurações
   * @param settings Novas configurações
   * @returns Configurações atualizadas
   */
  async updateSettingsByCategory(category: string, settings: any) {
    try {
      const response = await axiosInstance.put(`/admin/settings/${category}`, settings);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar configurações da categoria ${category}:`, error);
      throw error;
    }
  }
}

export default new AdminApiService();
