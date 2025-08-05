import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Bot, 
  Calendar, 
  Clock, 
  User, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

// Interface para log de bot
interface BotLog {
  id: string;
  userId: string;
  userName: string;
  platform: 'linkedin' | 'infojobs' | 'catho' | 'indeed';
  action: 'search' | 'apply' | 'login' | 'logout';
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: Date;
  duration: number; // em segundos
}

export const AdminBotLogs: React.FC = () => {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<BotLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Simula carregamento de dados
  useEffect(() => {
    // Em um cenário real, esses dados viriam da API
    setTimeout(() => {
      const mockLogs: BotLog[] = [
        {
          id: 'log_1',
          userId: 'user_1',
          userName: 'João Silva',
          platform: 'linkedin',
          action: 'login',
          status: 'success',
          message: 'Login realizado com sucesso',
          timestamp: new Date('2023-12-15T08:30:00'),
          duration: 2
        },
        {
          id: 'log_2',
          userId: 'user_1',
          userName: 'João Silva',
          platform: 'linkedin',
          action: 'search',
          status: 'success',
          message: 'Busca por vagas concluída',
          details: 'Encontradas 15 vagas para "desenvolvedor web"',
          timestamp: new Date('2023-12-15T08:32:00'),
          duration: 8
        },
        {
          id: 'log_3',
          userId: 'user_1',
          userName: 'João Silva',
          platform: 'linkedin',
          action: 'apply',
          status: 'error',
          message: 'Falha ao aplicar para vaga',
          details: 'Erro: Captcha detectado',
          timestamp: new Date('2023-12-15T08:35:00'),
          duration: 5
        },
        {
          id: 'log_4',
          userId: 'user_2',
          userName: 'Maria Oliveira',
          platform: 'infojobs',
          action: 'login',
          status: 'success',
          message: 'Login realizado com sucesso',
          timestamp: new Date('2023-12-15T09:15:00'),
          duration: 3
        },
        {
          id: 'log_5',
          userId: 'user_2',
          userName: 'Maria Oliveira',
          platform: 'infojobs',
          action: 'search',
          status: 'warning',
          message: 'Busca concluída com avisos',
          details: 'Alguns filtros não puderam ser aplicados',
          timestamp: new Date('2023-12-15T09:18:00'),
          duration: 7
        },
        {
          id: 'log_6',
          userId: 'user_3',
          userName: 'Pedro Santos',
          platform: 'catho',
          action: 'login',
          status: 'error',
          message: 'Falha ao realizar login',
          details: 'Credenciais inválidas',
          timestamp: new Date('2023-12-15T10:00:00'),
          duration: 4
        },
        {
          id: 'log_7',
          userId: 'user_4',
          userName: 'Ana Ferreira',
          platform: 'indeed',
          action: 'apply',
          status: 'success',
          message: 'Aplicação realizada com sucesso',
          details: 'Vaga: Desenvolvedor Full Stack',
          timestamp: new Date('2023-12-15T11:30:00'),
          duration: 6
        }
      ];
      
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtra logs com base na busca e filtros
  useEffect(() => {
    let result = [...logs];
    
    // Filtro por busca
    if (searchQuery) {
      result = result.filter(log => 
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filtro por plataforma
    if (selectedPlatform !== 'all') {
      result = result.filter(log => log.platform === selectedPlatform);
    }
    
    // Filtro por ação
    if (selectedAction !== 'all') {
      result = result.filter(log => log.action === selectedAction);
    }
    
    // Filtro por status
    if (selectedStatus !== 'all') {
      result = result.filter(log => log.status === selectedStatus);
    }
    
    // Filtro por data
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate.getFullYear() === filterDate.getFullYear() &&
               logDate.getMonth() === filterDate.getMonth() &&
               logDate.getDate() === filterDate.getDate();
      });
    }
    
    setFilteredLogs(result);
  }, [logs, searchQuery, selectedPlatform, selectedAction, selectedStatus, selectedDate]);

  // Renderiza o ícone de plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <span className="text-blue-400">LinkedIn</span>;
      case 'infojobs':
        return <span className="text-green-400">InfoJobs</span>;
      case 'catho':
        return <span className="text-orange-400">Catho</span>;
      case 'indeed':
        return <span className="text-purple-400">Indeed</span>;
      default:
        return null;
    }
  };

  // Renderiza o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  // Formata a duração em segundos para um formato legível
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <AdminLayout 
      title="Logs dos Bots" 
      description="Visualize e analise os logs de execução dos bots de scraping e auto-aplicação"
    >
      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Busca */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
          <input
            type="text"
            placeholder="Buscar logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white"
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filtro por Plataforma */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todas as Plataformas</option>
          <option value="linkedin">LinkedIn</option>
          <option value="infojobs">InfoJobs</option>
          <option value="catho">Catho</option>
          <option value="indeed">Indeed</option>
        </select>
        
        {/* Filtro por Ação */}
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todas as Ações</option>
          <option value="login">Login</option>
          <option value="search">Busca</option>
          <option value="apply">Aplicação</option>
          <option value="logout">Logout</option>
        </select>
        
        {/* Filtro por Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 text-purple-200"
        >
          <option value="all">Todos os Status</option>
          <option value="success">Sucesso</option>
          <option value="error">Erro</option>
          <option value="warning">Aviso</option>
          <option value="info">Informação</option>
        </select>
        
        {/* Filtro por Data */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2">
          <Calendar className="w-5 h-5 text-purple-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-purple-200 outline-none"
          />
        </div>
      </div>
      
      {/* Tabela de Logs */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
          <p className="text-purple-200 mb-4">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Plataforma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Mensagem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-200">
                        {log.timestamp.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-purple-300">
                        {log.timestamp.toLocaleTimeString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                          {log.userName[0].toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{log.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPlatformIcon(log.platform)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      {log.action === 'login' && 'Login'}
                      {log.action === 'search' && 'Busca'}
                      {log.action === 'apply' && 'Aplicação'}
                      {log.action === 'logout' && 'Logout'}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-200">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(log.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {log.details && (
                        <button className="p-1 text-purple-300 hover:text-purple-200">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
