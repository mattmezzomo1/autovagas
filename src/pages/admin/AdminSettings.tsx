import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Shield,
  Database,
  Server,
  Mail,
  CreditCard,
  Bot,
  RefreshCw,
  Clock,
  AlertTriangle,
  Loader,
  CheckCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import adminApiService from '../../services/adminApi.service';

// Interface para as configurações
interface AdminSettingsState {
  // Configurações gerais
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;

  // Configurações de email
  emailSender: string;
  emailReplyTo: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;

  // Configurações de pagamento
  stripePublicKey: string;
  stripeSecretKey: string;
  currencyCode: string;

  // Configurações de scraper
  maxScraperInstances: number;
  scraperTimeout: number;
  proxyRotationEnabled: boolean;
  maxRetries: number;

  // Configurações de notificações
  emailNotifications: boolean;
  adminAlerts: boolean;
  userRegistrationNotifications: boolean;
  paymentNotifications: boolean;
}

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'payment' | 'scraper' | 'notifications'>('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para as configurações
  const [settings, setSettings] = useState<AdminSettingsState>({
    // Configurações gerais
    siteName: 'Autovagas',
    siteDescription: 'Plataforma de automação para busca de empregos',
    maintenanceMode: false,

    // Configurações de email
    emailSender: 'noreply@autovagas.com',
    emailReplyTo: 'suporte@autovagas.com',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'smtp_user',
    smtpPassword: '********',

    // Configurações de pagamento
    stripePublicKey: 'pk_live_51Qj4IyQLiH3tzpMQ8ydfzsuETwJXPaTiqbWVRxXU3wEUw7WKJ853phHQihjDzcTiCC8DJkE7lGAFyag7V0SG1GVb00NiJIjuL4',
    stripeSecretKey: '********',
    currencyCode: 'BRL',

    // Configurações de scraper
    maxScraperInstances: 10,
    scraperTimeout: 30,
    proxyRotationEnabled: true,
    maxRetries: 3,

    // Configurações de notificações
    emailNotifications: true,
    adminAlerts: true,
    userRegistrationNotifications: true,
    paymentNotifications: true
  });

  // Carrega as configurações da API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminApiService.getSettings();

        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          setError('Erro ao carregar configurações');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setError('Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Manipulador para alterações nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setSettings(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manipulador para salvar as configurações
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Envia os dados para a API
      const categorySettings = getCategorySettings();
      const response = await adminApiService.updateSettingsByCategory(activeTab, categorySettings);

      if (response.success) {
        // Mostra mensagem de sucesso
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setError('Erro ao salvar configurações');
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Obtém as configurações da categoria atual
  const getCategorySettings = () => {
    switch (activeTab) {
      case 'general':
        return {
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          maintenanceMode: settings.maintenanceMode
        };
      case 'email':
        return {
          emailSender: settings.emailSender,
          emailReplyTo: settings.emailReplyTo,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPassword: settings.smtpPassword
        };
      case 'payment':
        return {
          stripePublicKey: settings.stripePublicKey,
          stripeSecretKey: settings.stripeSecretKey,
          currencyCode: settings.currencyCode
        };
      case 'scraper':
        return {
          maxScraperInstances: settings.maxScraperInstances,
          scraperTimeout: settings.scraperTimeout,
          proxyRotationEnabled: settings.proxyRotationEnabled,
          maxRetries: settings.maxRetries
        };
      case 'notifications':
        return {
          emailNotifications: settings.emailNotifications,
          adminAlerts: settings.adminAlerts,
          userRegistrationNotifications: settings.userRegistrationNotifications,
          paymentNotifications: settings.paymentNotifications
        };
      default:
        return {};
    }
  };

  // Renderiza o conteúdo com base na aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-purple-200 mb-1">
                Nome do Site
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-purple-200 mb-1">
                Descrição do Site
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows={3}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-purple-200">
                Modo de Manutenção
              </label>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="emailSender" className="block text-sm font-medium text-purple-200 mb-1">
                Email de Envio
              </label>
              <input
                type="email"
                id="emailSender"
                name="emailSender"
                value={settings.emailSender}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="emailReplyTo" className="block text-sm font-medium text-purple-200 mb-1">
                Email de Resposta
              </label>
              <input
                type="email"
                id="emailReplyTo"
                name="emailReplyTo"
                value={settings.emailReplyTo}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-purple-200 mb-1">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={settings.smtpHost}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-purple-200 mb-1">
                  Porta SMTP
                </label>
                <input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  value={settings.smtpPort}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium text-purple-200 mb-1">
                  Usuário SMTP
                </label>
                <input
                  type="text"
                  id="smtpUser"
                  name="smtpUser"
                  value={settings.smtpUser}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-purple-200 mb-1">
                  Senha SMTP
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  name="smtpPassword"
                  value={settings.smtpPassword}
                  onChange={handleChange}
                  className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="stripePublicKey" className="block text-sm font-medium text-purple-200 mb-1">
                Chave Pública do Stripe
              </label>
              <input
                type="text"
                id="stripePublicKey"
                name="stripePublicKey"
                value={settings.stripePublicKey}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-purple-200 mb-1">
                Chave Secreta do Stripe
              </label>
              <input
                type="password"
                id="stripeSecretKey"
                name="stripeSecretKey"
                value={settings.stripeSecretKey}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="currencyCode" className="block text-sm font-medium text-purple-200 mb-1">
                Moeda
              </label>
              <select
                id="currencyCode"
                name="currencyCode"
                value={settings.currencyCode}
                onChange={handleChange}
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              >
                <option value="BRL">Real Brasileiro (BRL)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        );

      case 'scraper':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="maxScraperInstances" className="block text-sm font-medium text-purple-200 mb-1">
                Máximo de Instâncias Simultâneas
              </label>
              <input
                type="number"
                id="maxScraperInstances"
                name="maxScraperInstances"
                value={settings.maxScraperInstances}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="scraperTimeout" className="block text-sm font-medium text-purple-200 mb-1">
                Timeout (segundos)
              </label>
              <input
                type="number"
                id="scraperTimeout"
                name="scraperTimeout"
                value={settings.scraperTimeout}
                onChange={handleChange}
                min="5"
                max="300"
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label htmlFor="maxRetries" className="block text-sm font-medium text-purple-200 mb-1">
                Máximo de Tentativas
              </label>
              <input
                type="number"
                id="maxRetries"
                name="maxRetries"
                value={settings.maxRetries}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="proxyRotationEnabled"
                name="proxyRotationEnabled"
                checked={settings.proxyRotationEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="proxyRotationEnabled" className="ml-2 block text-sm text-purple-200">
                Habilitar Rotação de Proxies
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-purple-200">
                Notificações por Email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminAlerts"
                name="adminAlerts"
                checked={settings.adminAlerts}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="adminAlerts" className="ml-2 block text-sm text-purple-200">
                Alertas para Administradores
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="userRegistrationNotifications"
                name="userRegistrationNotifications"
                checked={settings.userRegistrationNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="userRegistrationNotifications" className="ml-2 block text-sm text-purple-200">
                Notificações de Novos Registros
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="paymentNotifications"
                name="paymentNotifications"
                checked={settings.paymentNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-black/20 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="paymentNotifications" className="ml-2 block text-sm text-purple-200">
                Notificações de Pagamentos
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title="Configurações do Sistema"
      description="Gerencie as configurações globais da plataforma"
    >
      {/* Mensagem de sucesso */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Indicador de carregamento */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-300">Carregando configurações...</p>
        </div>
      ) : (

      <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar de navegação */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10">
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'general'
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:bg-white/5'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span>Geral</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'email'
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:bg-white/5'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'payment'
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:bg-white/5'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Pagamento</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('scraper')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'scraper'
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:bg-white/5'
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                    <span>Scraper</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:bg-white/5'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notificações</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSave}>
              {renderTabContent()}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </AdminLayout>
  );
};
