const adminUserService = require('../../services/admin/adminUser.service');

/**
 * Controlador para gerenciamento de usuários pelo administrador
 */
class AdminUserController {
  /**
   * Obtém todos os usuários com paginação e filtros
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUsers(req, res) {
    try {
      const { page, limit, search, role, status, plan } = req.query;
      
      const result = await adminUserService.getUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || '',
        role: role || 'all',
        status: status || 'all',
        plan: plan || 'all'
      });

      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter usuários',
        error: error.message
      });
    }
  }

  /**
   * Obtém um usuário pelo ID
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await adminUserService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao obter usuário por ID:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao obter usuário',
        error: error.message
      });
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async createUser(req, res) {
    try {
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password || 'changeme123', // Senha padrão se não fornecida
        role: req.body.role,
        subscriptionPlan: req.body.subscriptionPlan,
        status: req.body.status || 'active'
      };

      // Validação básica
      if (!userData.name || !userData.email) {
        return res.status(400).json({
          success: false,
          message: 'Nome e email são obrigatórios'
        });
      }

      const newUser = await adminUserService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.message === 'Email já está em uso') {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = {
        name: req.body.name,
        role: req.body.role,
        subscriptionPlan: req.body.subscriptionPlan,
        status: req.body.status
      };

      // Validação básica
      if (!userData.name) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      const updatedUser = await adminUserService.updateUser(id, userData);

      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  }

  /**
   * Remove um usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      await adminUserService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao remover usuário',
        error: error.message
      });
    }
  }
}

module.exports = new AdminUserController();
