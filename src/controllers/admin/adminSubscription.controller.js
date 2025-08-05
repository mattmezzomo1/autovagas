const adminSubscriptionService = require('../../services/admin/adminSubscription.service');

/**
 * Controlador para gerenciamento de assinaturas pelo administrador
 */
class AdminSubscriptionController {
  /**
   * Obtém todas as assinaturas com paginação e filtros
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSubscriptions(req, res) {
    try {
      const { page, limit, search, plan, status } = req.query;
      
      const result = await adminSubscriptionService.getSubscriptions({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || '',
        plan: plan || 'all',
        status: status || 'all'
      });

      return res.status(200).json({
        success: true,
        data: result.subscriptions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao obter assinaturas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter assinaturas',
        error: error.message
      });
    }
  }

  /**
   * Obtém uma assinatura pelo ID
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;
      
      const subscription = await adminSubscriptionService.getSubscriptionById(id);

      return res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Erro ao obter assinatura por ID:', error);
      
      if (error.message === 'Assinatura não encontrada') {
        return res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao obter assinatura',
        error: error.message
      });
    }
  }

  /**
   * Cria uma nova assinatura
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async createSubscription(req, res) {
    try {
      const subscriptionData = {
        userId: req.body.userId,
        plan: req.body.plan,
        status: req.body.status || 'active',
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        autoRenew: req.body.autoRenew,
        price: req.body.price
      };

      // Validação básica
      if (!subscriptionData.userId || !subscriptionData.plan || !subscriptionData.startDate || !subscriptionData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos. Usuário, plano, data de início e data de término são obrigatórios'
        });
      }

      const newSubscription = await adminSubscriptionService.createSubscription(subscriptionData);

      return res.status(201).json({
        success: true,
        message: 'Assinatura criada com sucesso',
        data: newSubscription
      });
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      if (error.message === 'Usuário já possui uma assinatura ativa') {
        return res.status(400).json({
          success: false,
          message: 'Usuário já possui uma assinatura ativa'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao criar assinatura',
        error: error.message
      });
    }
  }

  /**
   * Atualiza uma assinatura existente
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const subscriptionData = {
        plan: req.body.plan,
        status: req.body.status,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        autoRenew: req.body.autoRenew,
        price: req.body.price
      };

      // Validação básica
      if (!subscriptionData.plan || !subscriptionData.startDate || !subscriptionData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos. Plano, data de início e data de término são obrigatórios'
        });
      }

      const updatedSubscription = await adminSubscriptionService.updateSubscription(id, subscriptionData);

      return res.status(200).json({
        success: true,
        message: 'Assinatura atualizada com sucesso',
        data: updatedSubscription
      });
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      
      if (error.message === 'Assinatura não encontrada') {
        return res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar assinatura',
        error: error.message
      });
    }
  }

  /**
   * Cancela uma assinatura
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      
      await adminSubscriptionService.cancelSubscription(id);

      return res.status(200).json({
        success: true,
        message: 'Assinatura cancelada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      
      if (error.message === 'Assinatura não encontrada') {
        return res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar assinatura',
        error: error.message
      });
    }
  }
}

module.exports = new AdminSubscriptionController();
