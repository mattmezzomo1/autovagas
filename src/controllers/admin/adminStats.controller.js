const adminStatsService = require('../../services/admin/adminStats.service');

/**
 * Controlador para estatísticas do sistema para o administrador
 */
class AdminStatsController {
  /**
   * Obtém estatísticas gerais do sistema
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getGeneralStats(req, res) {
    try {
      const stats = await adminStatsService.getGeneralStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas gerais:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas gerais',
        error: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de usuários por plano
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUsersByPlan(req, res) {
    try {
      const stats = await adminStatsService.getUsersByPlan();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários por plano:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas de usuários por plano',
        error: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de receita mensal
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMonthlyRevenue(req, res) {
    try {
      const stats = await adminStatsService.getMonthlyRevenue();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de receita mensal:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas de receita mensal',
        error: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de distribuição de usuários
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUserDistribution(req, res) {
    try {
      const stats = await adminStatsService.getUserDistribution();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de distribuição de usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas de distribuição de usuários',
        error: error.message
      });
    }
  }

  /**
   * Obtém atividades recentes do sistema
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getRecentActivities(req, res) {
    try {
      const { limit } = req.query;
      const activities = await adminStatsService.getRecentActivities(parseInt(limit) || 5);

      return res.status(200).json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Erro ao obter atividades recentes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter atividades recentes',
        error: error.message
      });
    }
  }

  /**
   * Obtém todas as estatísticas em uma única chamada
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getAllStats(req, res) {
    try {
      const [generalStats, usersByPlan, monthlyRevenue, userDistribution, recentActivities] = await Promise.all([
        adminStatsService.getGeneralStats(),
        adminStatsService.getUsersByPlan(),
        adminStatsService.getMonthlyRevenue(),
        adminStatsService.getUserDistribution(),
        adminStatsService.getRecentActivities(5)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          generalStats,
          usersByPlan,
          monthlyRevenue,
          userDistribution,
          recentActivities
        }
      });
    } catch (error) {
      console.error('Erro ao obter todas as estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter todas as estatísticas',
        error: error.message
      });
    }
  }
}

module.exports = new AdminStatsController();
