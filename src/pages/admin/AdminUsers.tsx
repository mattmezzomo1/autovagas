import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Download,
  Mail,
  User,
  Shield,
  Building,
  AlertCircle,
  Loader
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { UserFormModal, UserFormData } from '../../components/admin/UserFormModal';
import adminApiService from '../../services/adminApi.service';

// Interface para usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'company' | 'admin';
  subscriptionPlan: 'basic' | 'plus' | 'premium' | null;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');

  // Estados para o modal de formulário
  const [showUserForm, setShowUserForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  // Carrega os dados da API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await adminApiService.getUsers({
          page: 1,
          limit: 50,
          role: selectedRole !== 'all' ? selectedRole : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          plan: selectedPlan !== 'all' ? selectedPlan : undefined,
          search: searchQuery || undefined
        });

        if (response.success && response.data) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          showUserNotification('Erro ao carregar usuários', 'error');
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showUserNotification('Erro ao carregar usuários', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [selectedRole, selectedStatus, selectedPlan]);

  // Filtra usuários com base na busca e filtros
  useEffect(() => {
    let result = [...users];

    // Filtro por busca
    if (searchQuery) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por role
    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      result = result.filter(user => user.status === selectedStatus);
    }

    // Filtro por plano
    if (selectedPlan !== 'all') {
      if (selectedPlan === 'none') {
        result = result.filter(user => user.subscriptionPlan === null);
      } else {
        result = result.filter(user => user.subscriptionPlan === selectedPlan);
      }
    }

    setFilteredUsers(result);
  }, [users, searchQuery, selectedRole, selectedStatus, selectedPlan]);

  // Renderiza o ícone de role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'company':
        return <Building className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-green-400" />;
    }
  };

  // Renderiza o badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Ativo</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Inativo</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Suspenso</span>;
      default:
        return null;
    }
  };

  // Renderiza o badge de plano
  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Nenhum</span>;

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

  // Manipuladores para o modal de usuário
  const handleAddUser = () => {
    setCurrentUser(undefined);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowUserForm(true);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      if (userData.id) {
        // Editar usuário existente
        const response = await adminApiService.updateUser(userData.id, userData);
        if (response.success) {
          // Recarrega a lista de usuários
          const usersResponse = await adminApiService.getUsers({
            page: 1,
            limit: 50,
            role: selectedRole !== 'all' ? selectedRole : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            plan: selectedPlan !== 'all' ? selectedPlan : undefined
          });

          if (usersResponse.success && usersResponse.data) {
            setUsers(usersResponse.data);
          }

          showUserNotification('Usuário atualizado com sucesso!', 'success');
        } else {
          showUserNotification('Erro ao atualizar usuário', 'error');
        }
      } else {
        // Adicionar novo usuário
        const response = await adminApiService.createUser(userData);
        if (response.success) {
          // Recarrega a lista de usuários
          const usersResponse = await adminApiService.getUsers({
            page: 1,
            limit: 50,
            role: selectedRole !== 'all' ? selectedRole : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            plan: selectedPlan !== 'all' ? selectedPlan : undefined
          });

          if (usersResponse.success && usersResponse.data) {
            setUsers(usersResponse.data);
          }

          showUserNotification('Usuário adicionado com sucesso!', 'success');
        } else {
          showUserNotification('Erro ao adicionar usuário', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      showUserNotification('Erro ao salvar usuário', 'error');
    } finally {
      setShowUserForm(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await adminApiService.deleteUser(id);
        if (response.success) {
          // Atualiza a lista local
          setUsers(users.filter(user => user.id !== id));
          showUserNotification('Usuário excluído com sucesso!', 'success');
        } else {
          showUserNotification('Erro ao excluir usuário', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showUserNotification('Erro ao excluir usuário', 'error');
      }
    }
  };

  const showUserNotification = (message: string, type: 'success' | 'error') => {
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
      title="Gerenciamento de Usuários"
      description="Visualize, edite e gerencie todos os usuários da plataforma"
    >
      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Busca */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            placeholder="Buscar usuários..."
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
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filtro por Role */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todos os Tipos</option>
          <option value="candidate">Candidatos</option>
          <option value="company">Empresas</option>
          <option value="admin">Administradores</option>
        </select>

        {/* Filtro por Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="suspended">Suspensos</option>
        </select>

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
          <option value="none">Sem Plano</option>
        </select>
      </div>

      {/* Tabela de Usuários */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
          <p className="text-purple-200 mb-4">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Data de Cadastro</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-purple-300">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm text-purple-200">
                          {user.role === 'candidate' ? 'Candidato' :
                           user.role === 'company' ? 'Empresa' : 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(user.subscriptionPlan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      {user.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1 text-purple-300 hover:text-purple-200"
                          title="Enviar email"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-purple-300 hover:text-purple-200"
                          title="Editar usuário"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Excluir usuário"
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

      {/* Modal de Formulário de Usuário */}
      {showUserForm && (
        <UserFormModal
          onClose={() => setShowUserForm(false)}
          onSave={handleSaveUser}
          user={currentUser}
          title={currentUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
        />
      )}
    </AdminLayout>
  );
};
