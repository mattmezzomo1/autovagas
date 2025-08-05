const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

// Inicializa o cliente Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey || config.supabase.key
);

/**
 * Serviço para gerenciamento de assinaturas pelo administrador
 */
class AdminSubscriptionService {
  /**
   * Obtém todas as assinaturas com paginação e filtros
   * @param {Object} options - Opções de consulta
   * @param {number} options.page - Número da página
   * @param {number} options.limit - Limite de itens por página
   * @param {string} options.search - Termo de busca (nome ou email do usuário)
   * @param {string} options.plan - Filtro por plano (basic, plus, premium)
   * @param {string} options.status - Filtro por status (active, canceled, expired, pending)
   * @returns {Promise<Object>} - Assinaturas e metadados de paginação
   */
  async getSubscriptions({ page = 1, limit = 10, search = '', plan = '', status = '' }) {
    try {
      // Inicia a consulta
      let query = supabase
        .from('subscriptions')
        .select(`
          id,
          plan,
          status,
          startDate,
          endDate,
          autoRenew,
          price,
          lastPayment,
          users:userId (id, fullName, email)
        `, { count: 'exact' });

      // Aplica filtros se fornecidos
      if (search) {
        query = query.or(`users.fullName.ilike.%${search}%,users.email.ilike.%${search}%`);
      }

      if (plan && plan !== 'all') {
        query = query.eq('plan', plan);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Aplica paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Executa a consulta
      const { data: subscriptions, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar assinaturas:', error);
        throw new Error('Erro ao buscar assinaturas');
      }

      // Formata os dados para o formato esperado pelo frontend
      const formattedSubscriptions = subscriptions.map(subscription => ({
        id: subscription.id,
        userId: subscription.users.id,
        userName: subscription.users.fullName,
        userEmail: subscription.users.email,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        price: subscription.price,
        lastPayment: subscription.lastPayment
      }));

      return {
        subscriptions: formattedSubscriptions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro no serviço de assinaturas admin:', error);
      throw error;
    }
  }

  /**
   * Obtém uma assinatura pelo ID
   * @param {string} subscriptionId - ID da assinatura
   * @returns {Promise<Object>} - Dados da assinatura
   */
  async getSubscriptionById(subscriptionId) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          plan,
          status,
          startDate,
          endDate,
          autoRenew,
          price,
          lastPayment,
          users:userId (id, fullName, email)
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) {
        console.error('Erro ao buscar assinatura por ID:', error);
        throw new Error('Erro ao buscar assinatura');
      }

      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }

      return {
        id: subscription.id,
        userId: subscription.users.id,
        userName: subscription.users.fullName,
        userEmail: subscription.users.email,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        price: subscription.price,
        lastPayment: subscription.lastPayment
      };
    } catch (error) {
      console.error('Erro no serviço de assinaturas admin:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma assinatura existente
   * @param {string} subscriptionId - ID da assinatura
   * @param {Object} subscriptionData - Dados atualizados da assinatura
   * @returns {Promise<Object>} - Assinatura atualizada
   */
  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      // Verifica se a assinatura existe
      const { data: existingSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('id', subscriptionId)
        .single();

      if (subError || !existingSubscription) {
        throw new Error('Assinatura não encontrada');
      }

      // Prepara os dados para atualização
      const updateData = {
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        autoRenew: subscriptionData.autoRenew,
        price: subscriptionData.price,
        updatedAt: new Date()
      };

      // Atualiza a assinatura
      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select(`
          id,
          plan,
          status,
          startDate,
          endDate,
          autoRenew,
          price,
          lastPayment,
          users:userId (id, fullName, email)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar assinatura:', error);
        throw new Error('Erro ao atualizar assinatura');
      }

      // Atualiza também o plano de assinatura do usuário
      await supabase
        .from('users')
        .update({ subscriptionPlan: subscriptionData.plan })
        .eq('id', updatedSubscription.users.id);

      return {
        id: updatedSubscription.id,
        userId: updatedSubscription.users.id,
        userName: updatedSubscription.users.fullName,
        userEmail: updatedSubscription.users.email,
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        startDate: updatedSubscription.startDate,
        endDate: updatedSubscription.endDate,
        autoRenew: updatedSubscription.autoRenew,
        price: updatedSubscription.price,
        lastPayment: updatedSubscription.lastPayment
      };
    } catch (error) {
      console.error('Erro no serviço de assinaturas admin:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova assinatura
   * @param {Object} subscriptionData - Dados da assinatura
   * @returns {Promise<Object>} - Assinatura criada
   */
  async createSubscription(subscriptionData) {
    try {
      // Verifica se o usuário existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, fullName, email')
        .eq('id', subscriptionData.userId)
        .single();

      if (userError || !user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica se o usuário já tem uma assinatura ativa
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('userId', subscriptionData.userId)
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        throw new Error('Usuário já possui uma assinatura ativa');
      }

      // Prepara os dados para inserção
      const newSubscription = {
        userId: subscriptionData.userId,
        plan: subscriptionData.plan,
        status: subscriptionData.status || 'active',
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        autoRenew: subscriptionData.autoRenew,
        price: subscriptionData.price,
        lastPayment: new Date()
      };

      // Insere a nova assinatura
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert([newSubscription])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar assinatura:', error);
        throw new Error('Erro ao criar assinatura');
      }

      // Atualiza o plano de assinatura do usuário
      await supabase
        .from('users')
        .update({ subscriptionPlan: subscriptionData.plan })
        .eq('id', subscriptionData.userId);

      return {
        id: subscription.id,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        price: subscription.price,
        lastPayment: subscription.lastPayment
      };
    } catch (error) {
      console.error('Erro no serviço de assinaturas admin:', error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura
   * @param {string} subscriptionId - ID da assinatura
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async cancelSubscription(subscriptionId) {
    try {
      // Verifica se a assinatura existe
      const { data: existingSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id, userId')
        .eq('id', subscriptionId)
        .single();

      if (subError || !existingSubscription) {
        throw new Error('Assinatura não encontrada');
      }

      // Atualiza o status da assinatura para cancelada
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updatedAt: new Date()
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Erro ao cancelar assinatura:', error);
        throw new Error('Erro ao cancelar assinatura');
      }

      return true;
    } catch (error) {
      console.error('Erro no serviço de assinaturas admin:', error);
      throw error;
    }
  }
}

module.exports = new AdminSubscriptionService();
