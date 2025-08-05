import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  RefreshCw,
  Ban,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { SubscriptionFormModal, SubscriptionFormData } from '../../components/admin/SubscriptionFormModal';
import adminApiService from '../../services/adminApi.service';

// Interface para assinatura
interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'basic' | 'plus' | 'premium';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  lastPayment: Date;
}

export const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estados para o modal de formulário
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | undefined>(undefined);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  // Carrega os dados da API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiService.getSubscriptions({
          page: 1,
          limit: 50,
          plan: selectedPlan !== 'all' ? selectedPlan : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchQuery || undefined
        });

        if (response.success && response.data) {
          setSubscriptions(response.data);
          setFilteredSubscriptions(response.data);
        } else {
          showSubscriptionNotification('Erro ao carregar assinaturas', 'error');
        }
      } catch (error) {
        console.error('Erro ao carregar assinaturas:', error);
        showSubscriptionNotification('Erro ao carregar assinaturas', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [selectedPlan, selectedStatus]);

  // Filtra assinaturas com base na busca e filtros
  useEffect(() => {
    let result = [...subscriptions];

    // Filtro por busca
    if (searchQuery) {
      result = result.filter(subscription =>
        subscription.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por plano
    if (selectedPlan !== 'all') {
      result = result.filter(subscription => subscription.plan === selectedPlan);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      result = result.filter(subscription => subscription.status === selectedStatus);
    }

    setFilteredSubscriptions(result);
  }, [subscriptions, searchQuery, selectedPlan, selectedStatus]);

  // Renderiza o badge de plano
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Básico</span>;
      case 'plus':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">Plus</span>;
      case 'premium':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Premium</span>;
      default:
        return null;
    }
  };

  // Renderiza o badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Ativa</span>;
      case 'canceled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Cancelada</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Expirada</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pendente</span>;
      default:
        return null;
    }
  };

  // Manipuladores para o modal de assinatura
  const handleAddSubscription = () => {
    setCurrentSubscription(undefined);
    setShowSubscriptionForm(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    setShowSubscriptionForm(true);
  };

  const handleSaveSubscription = async (subscriptionData: SubscriptionFormData) => {
    try {
      if (subscriptionData.id) {
        // Editar assinatura existente
        const response = await adminApiService.updateSubscription(subscriptionData.id, subscriptionData);
        if (response.success) {
          // Recarrega a lista de assinaturas
          const subscriptionsResponse = await adminApiService.getSubscriptions({
            page: 1,
            limit: 50,
            plan: selectedPlan !== 'all' ? selectedPlan : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined
          });

          if (subscriptionsResponse.success && subscriptionsResponse.data) {
            setSubscriptions(subscriptionsResponse.data);
          }

          showSubscriptionNotification('Assinatura atualizada com sucesso!', 'success');
        } else {
          showSubscriptionNotification('Erro ao atualizar assinatura', 'error');
        }
      } else {
        // Adicionar nova assinatura
        const response = await adminApiService.createSubscription(subscriptionData);
        if (response.success) {
          // Recarrega a lista de assinaturas
          const subscriptionsResponse = await adminApiService.getSubscriptions({
            page: 1,
            limit: 50,
            plan: selectedPlan !== 'all' ? selectedPlan : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined
          });

          if (subscriptionsResponse.success && subscriptionsResponse.data) {
            setSubscriptions(subscriptionsResponse.data);
          }

          showSubscriptionNotification('Assinatura adicionada com sucesso!', 'success');
        } else {
          showSubscriptionNotification('Erro ao adicionar assinatura', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      showSubscriptionNotification('Erro ao salvar assinatura', 'error');
    } finally {
      setShowSubscriptionForm(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
      try {
        const response = await adminApiService.cancelSubscription(id);
        if (response.success) {
          // Atualiza a lista local
          setSubscriptions(subscriptions.filter(subscription => subscription.id !== id));
          showSubscriptionNotification('Assinatura excluída com sucesso!', 'success');
        } else {
          showSubscriptionNotification('Erro ao excluir assinatura', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir assinatura:', error);
        showSubscriptionNotification('Erro ao excluir assinatura', 'error');
      }
    }
  };

  const showSubscriptionNotification = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);

    // Esconde a notificação após 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <AdminLayout
      title="Gerenciamento de Assinaturas"
      description="Visualize, edite e gerencie todas as assinaturas da plataforma"
    >
      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Busca */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            placeholder="Buscar assinaturas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={handleAddSubscription}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Assinatura</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filtro por Plano */}
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todos os Planos</option>
          <option value="basic">Básico</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
        </select>

        {/* Filtro por Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativas</option>
          <option value="canceled">Canceladas</option>
          <option value="expired">Expiradas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      {/* Tabela de Assinaturas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
          <p className="text-purple-200 mb-4">Nenhuma assinatura encontrada</p>
        </div>
      ) : (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Início</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Término</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Renovação</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                          {subscription.userName[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{subscription.userName}</div>
                          <div className="text-sm text-purple-300">{subscription.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(subscription.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      R$ {subscription.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      {subscription.startDate.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      {subscription.endDate.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription.autoRenew ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <RefreshCw className="w-4 h-4" />
                          Automática
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <Ban className="w-4 h-4" />
                          Desativada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditSubscription(subscription)}
                          className="p-1 text-purple-300 hover:text-purple-200"
                          title="Editar assinatura"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Excluir assinatura"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Notificação */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 ${
          notificationType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notificationType === 'success' ? (
            <Shield className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Modal de Formulário de Assinatura */}
      {showSubscriptionForm && (
        <SubscriptionFormModal
          onClose={() => setShowSubscriptionForm(false)}
          onSave={handleSaveSubscription}
          subscription={currentSubscription}
          title={currentSubscription ? 'Editar Assinatura' : 'Adicionar Nova Assinatura'}
        />
      )}
    </AdminLayout>
  );
};
