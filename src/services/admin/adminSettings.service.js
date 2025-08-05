const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Inicializa o cliente Supabase
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey || config.supabase.key
);

/**
 * Serviço para gerenciamento de configurações do sistema pelo administrador
 */
class AdminSettingsService {
  /**
   * Obtém todas as configurações do sistema
   * @returns {Promise<Object>} - Configurações do sistema
   */
  async getSettings() {
    try {
      // Obtém as configurações do banco de dados
      const { data: settings, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) {
        console.error('Erro ao obter configurações do sistema:', error);
        throw new Error('Erro ao obter configurações do sistema');
      }

      // Converte o array de configurações em um objeto
      const settingsObject = {};
      settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });

      // Adiciona configurações do arquivo .env
      const envConfig = {
        // Configurações gerais
        siteName: process.env.SITE_NAME || 'Autovagas',
        siteDescription: process.env.SITE_DESCRIPTION || 'Plataforma de automação para busca de empregos',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',

        // Configurações de email
        emailSender: process.env.EMAIL_SENDER || 'noreply@autovagas.com',
        emailReplyTo: process.env.EMAIL_REPLY_TO || 'suporte@autovagas.com',
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: process.env.SMTP_PASSWORD ? '********' : '',

        // Configurações de pagamento
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY ? '********' : '',
        currencyCode: process.env.CURRENCY_CODE || 'BRL',

        // Configurações de scraper
        maxScraperInstances: parseInt(process.env.MAX_CONCURRENT_TASKS || '10'),
        scraperTimeout: parseInt(process.env.DEFAULT_SCRAPER_TIMEOUT || '60000') / 1000, // Converte para segundos
        proxyRotationEnabled: process.env.PROXY_ROTATION_ENABLED === 'true',
        maxRetries: parseInt(process.env.MAX_RETRIES || '3'),

        // Configurações de notificações
        emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
        adminAlerts: process.env.ADMIN_ALERTS === 'true',
        userRegistrationNotifications: process.env.USER_REGISTRATION_NOTIFICATIONS === 'true',
        paymentNotifications: process.env.PAYMENT_NOTIFICATIONS === 'true'
      };

      // Combina as configurações do banco de dados com as do .env
      return { ...envConfig, ...settingsObject };
    } catch (error) {
      console.error('Erro no serviço de configurações admin:', error);
      throw error;
    }
  }

  /**
   * Atualiza as configurações do sistema
   * @param {Object} settings - Novas configurações
   * @returns {Promise<Object>} - Configurações atualizadas
   */
  async updateSettings(settings) {
    try {
      // Configurações que podem ser atualizadas no banco de dados
      const dbSettings = [
        'siteName',
        'siteDescription',
        'maintenanceMode',
        'emailNotifications',
        'adminAlerts',
        'userRegistrationNotifications',
        'paymentNotifications'
      ];

      // Configurações que precisam ser atualizadas no arquivo .env
      const envSettings = [
        'emailSender',
        'emailReplyTo',
        'smtpHost',
        'smtpPort',
        'smtpUser',
        'smtpPassword',
        'stripePublicKey',
        'stripeSecretKey',
        'currencyCode',
        'maxScraperInstances',
        'scraperTimeout',
        'proxyRotationEnabled',
        'maxRetries'
      ];

      // Atualiza as configurações no banco de dados
      for (const key of dbSettings) {
        if (settings[key] !== undefined) {
          const { error } = await supabase
            .from('system_settings')
            .upsert({
              key,
              value: typeof settings[key] === 'boolean' ? settings[key].toString() : settings[key],
              updatedAt: new Date()
            });

          if (error) {
            console.error(`Erro ao atualizar configuração ${key}:`, error);
            throw new Error(`Erro ao atualizar configuração ${key}`);
          }
        }
      }

      // Atualiza as configurações no arquivo .env
      if (envSettings.some(key => settings[key] !== undefined)) {
        await this.updateEnvFile(settings, envSettings);
      }

      // Retorna as configurações atualizadas
      return await this.getSettings();
    } catch (error) {
      console.error('Erro no serviço de configurações admin:', error);
      throw error;
    }
  }

  /**
   * Atualiza o arquivo .env com as novas configurações
   * @param {Object} settings - Novas configurações
   * @param {Array} keys - Chaves a serem atualizadas
   * @returns {Promise<void>}
   */
  async updateEnvFile(settings, keys) {
    try {
      // Caminho para o arquivo .env
      const envPath = path.resolve(process.cwd(), '.env');

      // Lê o arquivo .env atual
      let envContent = await fs.readFile(envPath, 'utf8');

      // Mapeia as chaves do objeto settings para as variáveis de ambiente
      const envMapping = {
        emailSender: 'EMAIL_SENDER',
        emailReplyTo: 'EMAIL_REPLY_TO',
        smtpHost: 'SMTP_HOST',
        smtpPort: 'SMTP_PORT',
        smtpUser: 'SMTP_USER',
        smtpPassword: 'SMTP_PASSWORD',
        stripePublicKey: 'STRIPE_PUBLIC_KEY',
        stripeSecretKey: 'STRIPE_SECRET_KEY',
        currencyCode: 'CURRENCY_CODE',
        maxScraperInstances: 'MAX_CONCURRENT_TASKS',
        scraperTimeout: 'DEFAULT_SCRAPER_TIMEOUT',
        proxyRotationEnabled: 'PROXY_ROTATION_ENABLED',
        maxRetries: 'MAX_RETRIES'
      };

      // Atualiza cada configuração no conteúdo do arquivo
      for (const key of keys) {
        if (settings[key] !== undefined && envMapping[key]) {
          const envKey = envMapping[key];
          let value = settings[key];

          // Tratamentos especiais para certos tipos de valores
          if (typeof value === 'boolean') {
            value = value ? 'true' : 'false';
          } else if (key === 'scraperTimeout' && typeof value === 'number') {
            // Converte segundos para milissegundos
            value = value * 1000;
          }

          // Não atualiza senhas se o valor for mascarado
          if ((key === 'smtpPassword' || key === 'stripeSecretKey') && value === '********') {
            continue;
          }

          // Verifica se a variável já existe no arquivo
          const regex = new RegExp(`^${envKey}=.*`, 'm');
          if (regex.test(envContent)) {
            // Atualiza a variável existente
            envContent = envContent.replace(regex, `${envKey}=${value}`);
          } else {
            // Adiciona a nova variável ao final do arquivo
            envContent += `\n${envKey}=${value}`;
          }
        }
      }

      // Escreve o conteúdo atualizado no arquivo .env
      await fs.writeFile(envPath, envContent);

      // Recarrega as variáveis de ambiente
      Object.assign(process.env, dotenv.parse(envContent));
    } catch (error) {
      console.error('Erro ao atualizar arquivo .env:', error);
      throw new Error('Erro ao atualizar configurações do sistema');
    }
  }
}

module.exports = new AdminSettingsService();
