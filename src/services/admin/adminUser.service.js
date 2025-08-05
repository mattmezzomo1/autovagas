const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');
const bcrypt = require('bcrypt');

// Inicializa o cliente Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey || config.supabase.key
);

/**
 * Serviço para gerenciamento de usuários pelo administrador
 */
class AdminUserService {
  /**
   * Obtém todos os usuários com paginação e filtros
   * @param {Object} options - Opções de consulta
   * @param {number} options.page - Número da página
   * @param {number} options.limit - Limite de itens por página
   * @param {string} options.search - Termo de busca (nome ou email)
   * @param {string} options.role - Filtro por role (candidate, company, admin)
   * @param {string} options.status - Filtro por status (active, inactive, suspended)
   * @param {string} options.plan - Filtro por plano (basic, plus, premium, null)
   * @returns {Promise<Object>} - Usuários e metadados de paginação
   */
  async getUsers({ page = 1, limit = 10, search = '', role = '', status = '', plan = '' }) {
    try {
      // Inicia a consulta
      let query = supabase
        .from('users')
        .select('id, email, fullName, role, status, subscriptionPlan, createdAt', { count: 'exact' });

      // Aplica filtros se fornecidos
      if (search) {
        query = query.or(`fullName.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (role && role !== 'all') {
        query = query.eq('role', role);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (plan) {
        if (plan === 'none') {
          query = query.is('subscriptionPlan', null);
        } else if (plan !== 'all') {
          query = query.eq('subscriptionPlan', plan);
        }
      }

      // Aplica paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Executa a consulta
      const { data: users, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw new Error('Erro ao buscar usuários');
      }

      // Formata os dados para o formato esperado pelo frontend
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        status: user.status || 'active',
        createdAt: user.createdAt
      }));

      return {
        users: formattedUsers,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro no serviço de usuários admin:', error);
      throw error;
    }
  }

  /**
   * Obtém um usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Dados do usuário
   */
  async getUserById(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        throw new Error('Erro ao buscar usuário');
      }

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        status: user.status || 'active',
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Erro no serviço de usuários admin:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Usuário criado
   */
  async createUser(userData) {
    try {
      // Verifica se o email já está em uso
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Gera hash da senha
      const hashedPassword = await bcrypt.hash(userData.password || 'changeme123', 10);

      // Prepara os dados para inserção
      const newUser = {
        email: userData.email,
        fullName: userData.name,
        password: hashedPassword,
        role: userData.role,
        subscriptionPlan: userData.subscriptionPlan,
        status: userData.status || 'active'
      };

      // Insere o novo usuário
      const { data: user, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        throw new Error('Erro ao criar usuário');
      }

      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        status: user.status,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Erro no serviço de usuários admin:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Dados atualizados do usuário
   * @returns {Promise<Object>} - Usuário atualizado
   */
  async updateUser(userId, userData) {
    try {
      // Verifica se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Prepara os dados para atualização
      const updateData = {
        fullName: userData.name,
        role: userData.role,
        subscriptionPlan: userData.subscriptionPlan,
        status: userData.status,
        updatedAt: new Date()
      };

      // Atualiza o usuário
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw new Error('Erro ao atualizar usuário');
      }

      return {
        id: updatedUser.id,
        name: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        subscriptionPlan: updatedUser.subscriptionPlan,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt
      };
    } catch (error) {
      console.error('Erro no serviço de usuários admin:', error);
      throw error;
    }
  }

  /**
   * Remove um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteUser(userId) {
    try {
      // Verifica se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Remove o usuário (soft delete)
      const { error } = await supabase
        .from('users')
        .update({ deletedAt: new Date() })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao remover usuário:', error);
        throw new Error('Erro ao remover usuário');
      }

      return true;
    } catch (error) {
      console.error('Erro no serviço de usuários admin:', error);
      throw error;
    }
  }
}

module.exports = new AdminUserService();
