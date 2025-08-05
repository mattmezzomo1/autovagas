const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

// Inicializa o cliente Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey || config.supabase.key
);

/**
 * Serviço para estatísticas do sistema para o administrador
 */
class AdminStatsService {
  /**
   * Obtém estatísticas gerais do sistema
   * @returns {Promise<Object>} - Estatísticas gerais
   */
  async getGeneralStats() {
    try {
      // Obtém o total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (usersError) {
        console.error('Erro ao contar usuários:', usersError);
        throw new Error('Erro ao obter estatísticas de usuários');
      }

      // Obtém o total de assinaturas ativas
      const { count: activeSubscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (subsError) {
        console.error('Erro ao contar assinaturas ativas:', subsError);
        throw new Error('Erro ao obter estatísticas de assinaturas');
      }

      // Obtém o total de execuções de bots
      const { count: botExecutions, error: botsError } = await supabase
        .from('bot_logs')
        .select('id', { count: 'exact', head: true });

      if (botsError) {
        console.error('Erro ao contar execuções de bots:', botsError);
        throw new Error('Erro ao obter estatísticas de bots');
      }

      // Calcula a receita mensal (soma dos preços das assinaturas ativas)
      const { data: subscriptions, error: revenueError } = await supabase
        .from('subscriptions')
        .select('price')
        .eq('status', 'active');

      if (revenueError) {
        console.error('Erro ao calcular receita mensal:', revenueError);
        throw new Error('Erro ao obter estatísticas de receita');
      }

      const revenueMonth = subscriptions.reduce((total, sub) => total + (sub.price || 0), 0);

      // Calcula a taxa de conversão (usuários com assinatura / total de usuários)
      const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

      // Calcula a taxa de retenção (assinaturas ativas há mais de 30 dias / total de assinaturas)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: totalSubscriptions, error: totalSubsError } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true });

      if (totalSubsError) {
        console.error('Erro ao contar total de assinaturas:', totalSubsError);
        throw new Error('Erro ao obter estatísticas de retenção');
      }

      const { count: oldSubscriptions, error: oldSubsError } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('startDate', thirtyDaysAgo.toISOString());

      if (oldSubsError) {
        console.error('Erro ao contar assinaturas antigas:', oldSubsError);
        throw new Error('Erro ao obter estatísticas de retenção');
      }

      const retentionRate = totalSubscriptions > 0 ? (oldSubscriptions / totalSubscriptions) * 100 : 0;

      return {
        totalUsers,
        activeSubscriptions,
        botExecutions,
        revenueMonth,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        retentionRate: parseFloat(retentionRate.toFixed(1))
      };
    } catch (error) {
      console.error('Erro no serviço de estatísticas admin:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de usuários por plano
   * @returns {Promise<Object>} - Estatísticas de usuários por plano
   */
  async getUsersByPlan() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscriptionPlan')
        .not('subscriptionPlan', 'is', null);

      if (error) {
        console.error('Erro ao obter usuários por plano:', error);
        throw new Error('Erro ao obter estatísticas de usuários por plano');
      }

      const planCounts = {
        basic: 0,
        plus: 0,
        premium: 0
      };

      data.forEach(user => {
        if (user.subscriptionPlan && planCounts.hasOwnProperty(user.subscriptionPlan)) {
          planCounts[user.subscriptionPlan]++;
        }
      });

      return planCounts;
    } catch (error) {
      console.error('Erro no serviço de estatísticas admin:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de receita mensal dos últimos 12 meses
   * @returns {Promise<Array>} - Estatísticas de receita mensal
   */
  async getMonthlyRevenue() {
    try {
      // Obtém a data atual
      const currentDate = new Date();

      // Cria um array para armazenar os dados de receita mensal
      const monthlyRevenue = [];

      // Obtém os dados de receita para os últimos 12 meses
      for (let i = 0; i < 12; i++) {
        const month = currentDate.getMonth() - i;
        const year = currentDate.getFullYear();

        // Ajusta o ano se o mês for negativo
        const adjustedMonth = month < 0 ? 12 + month : month;
        const adjustedYear = month < 0 ? year - 1 : year;

        // Cria as datas de início e fim do mês
        const startDate = new Date(adjustedYear, adjustedMonth, 1);
        const endDate = new Date(adjustedYear, adjustedMonth + 1, 0);

        // Consulta as assinaturas criadas ou renovadas nesse mês
        const { data: subscriptions, error } = await supabase
          .from('subscriptions')
          .select('price')
          .gte('lastPayment', startDate.toISOString())
          .lte('lastPayment', endDate.toISOString());

        if (error) {
          console.error('Erro ao obter receita mensal:', error);
          throw new Error('Erro ao obter estatísticas de receita mensal');
        }

        // Calcula a receita total para o mês
        const revenue = subscriptions.reduce((total, sub) => total + (sub.price || 0), 0);

        // Adiciona os dados ao array
        monthlyRevenue.unshift({
          month: startDate.toLocaleString('default', { month: 'short' }),
          revenue
        });
      }

      return monthlyRevenue;
    } catch (error) {
      console.error('Erro no serviço de estatísticas admin:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de distribuição de usuários por tipo
   * @returns {Promise<Object>} - Estatísticas de distribuição de usuários
   */
  async getUserDistribution() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role');

      if (error) {
        console.error('Erro ao obter distribuição de usuários:', error);
        throw new Error('Erro ao obter estatísticas de distribuição de usuários');
      }

      const distribution = {
        candidate: 0,
        company: 0,
        admin: 0
      };

      data.forEach(user => {
        if (user.role && distribution.hasOwnProperty(user.role)) {
          distribution[user.role]++;
        }
      });

      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

      return {
        distribution,
        percentages: {
          candidate: total > 0 ? parseFloat(((distribution.candidate / total) * 100).toFixed(1)) : 0,
          company: total > 0 ? parseFloat(((distribution.company / total) * 100).toFixed(1)) : 0,
          admin: total > 0 ? parseFloat(((distribution.admin / total) * 100).toFixed(1)) : 0
        }
      };
    } catch (error) {
      console.error('Erro no serviço de estatísticas admin:', error);
      throw error;
    }
  }

  /**
   * Obtém atividades recentes do sistema
   * @param {number} limit - Limite de atividades a retornar
   * @returns {Promise<Array>} - Lista de atividades recentes
   */
  async getRecentActivities(limit = 5) {
    try {
      // Obtém novos usuários registrados recentemente
      const { data: newUsers, error: usersError } = await supabase
        .from('users')
        .select('id, fullName, createdAt')
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (usersError) {
        console.error('Erro ao obter novos usuários:', usersError);
        throw new Error('Erro ao obter atividades recentes de usuários');
      }

      // Obtém novas assinaturas criadas recentemente
      const { data: newSubscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('id, plan, createdAt')
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (subsError) {
        console.error('Erro ao obter novas assinaturas:', subsError);
        throw new Error('Erro ao obter atividades recentes de assinaturas');
      }

      // Obtém execuções de bots recentes
      const { data: recentBotExecutions, error: botsError } = await supabase
        .from('bot_logs')
        .select('id, createdAt')
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (botsError) {
        console.error('Erro ao obter execuções de bots recentes:', botsError);
        throw new Error('Erro ao obter atividades recentes de bots');
      }

      // Formata as atividades recentes
      const activities = [
        ...newUsers.map(user => ({
          type: 'user',
          message: `Novo usuário registrado: ${user.fullName}`,
          timestamp: user.createdAt
        })),
        ...newSubscriptions.map(sub => ({
          type: 'subscription',
          message: `Nova assinatura ${sub.plan} criada`,
          timestamp: sub.createdAt
        })),
        ...recentBotExecutions.map(bot => ({
          type: 'bot',
          message: `Execução de bot realizada`,
          timestamp: bot.createdAt
        }))
      ];

      // Ordena as atividades por data (mais recentes primeiro)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Retorna apenas o número solicitado de atividades
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Erro no serviço de estatísticas admin:', error);
      throw error;
    }
  }
}

module.exports = new AdminStatsService();
