const adminSettingsService = require('../../services/admin/adminSettings.service');

/**
 * Controlador para gerenciamento de configurações do sistema pelo administrador
 */
class AdminSettingsController {
  /**
   * Obtém todas as configurações do sistema
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSettings(req, res) {
    try {
      const settings = await adminSettingsService.getSettings();

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Erro ao obter configurações do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter configurações do sistema',
        error: error.message
      });
    }
  }

  /**
   * Atualiza as configurações do sistema
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateSettings(req, res) {
    try {
      const settings = req.body;
      
      // Validação básica
      if (!settings || Object.keys(settings).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma configuração fornecida para atualização'
        });
      }

      const updatedSettings = await adminSettingsService.updateSettings(settings);

      return res.status(200).json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações do sistema:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configurações do sistema',
        error: error.message
      });
    }
  }

  /**
   * Obtém configurações específicas por categoria
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSettingsByCategory(req, res) {
    try {
      const { category } = req.params;
      const allSettings = await adminSettingsService.getSettings();
      
      // Define as configurações por categoria
      const categorySettings = {
        general: {
          siteName: allSettings.siteName,
          siteDescription: allSettings.siteDescription,
          maintenanceMode: allSettings.maintenanceMode
        },
        email: {
          emailSender: allSettings.emailSender,
          emailReplyTo: allSettings.emailReplyTo,
          smtpHost: allSettings.smtpHost,
          smtpPort: allSettings.smtpPort,
          smtpUser: allSettings.smtpUser,
          smtpPassword: allSettings.smtpPassword
        },
        payment: {
          stripePublicKey: allSettings.stripePublicKey,
          stripeSecretKey: allSettings.stripeSecretKey,
          currencyCode: allSettings.currencyCode
        },
        scraper: {
          maxScraperInstances: allSettings.maxScraperInstances,
          scraperTimeout: allSettings.scraperTimeout,
          proxyRotationEnabled: allSettings.proxyRotationEnabled,
          maxRetries: allSettings.maxRetries
        },
        notifications: {
          emailNotifications: allSettings.emailNotifications,
          adminAlerts: allSettings.adminAlerts,
          userRegistrationNotifications: allSettings.userRegistrationNotifications,
          paymentNotifications: allSettings.paymentNotifications
        }
      };

      // Verifica se a categoria existe
      if (!categorySettings[category]) {
        return res.status(404).json({
          success: false,
          message: 'Categoria de configurações não encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: categorySettings[category]
      });
    } catch (error) {
      console.error('Erro ao obter configurações por categoria:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter configurações por categoria',
        error: error.message
      });
    }
  }

  /**
   * Atualiza configurações específicas por categoria
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateSettingsByCategory(req, res) {
    try {
      const { category } = req.params;
      const settings = req.body;
      
      // Validação básica
      if (!settings || Object.keys(settings).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma configuração fornecida para atualização'
        });
      }

      // Define as configurações permitidas por categoria
      const allowedSettings = {
        general: ['siteName', 'siteDescription', 'maintenanceMode'],
        email: ['emailSender', 'emailReplyTo', 'smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword'],
        payment: ['stripePublicKey', 'stripeSecretKey', 'currencyCode'],
        scraper: ['maxScraperInstances', 'scraperTimeout', 'proxyRotationEnabled', 'maxRetries'],
        notifications: ['emailNotifications', 'adminAlerts', 'userRegistrationNotifications', 'paymentNotifications']
      };

      // Verifica se a categoria existe
      if (!allowedSettings[category]) {
        return res.status(404).json({
          success: false,
          message: 'Categoria de configurações não encontrada'
        });
      }

      // Filtra apenas as configurações permitidas para a categoria
      const filteredSettings = {};
      for (const key in settings) {
        if (allowedSettings[category].includes(key)) {
          filteredSettings[key] = settings[key];
        }
      }

      // Atualiza as configurações
      const updatedSettings = await adminSettingsService.updateSettings(filteredSettings);

      // Filtra apenas as configurações da categoria para a resposta
      const categorySettings = {};
      for (const key of allowedSettings[category]) {
        categorySettings[key] = updatedSettings[key];
      }

      return res.status(200).json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        data: categorySettings
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações por categoria:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configurações por categoria',
        error: error.message
      });
    }
  }
}

module.exports = new AdminSettingsController();
