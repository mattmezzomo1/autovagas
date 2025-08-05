import React, { useState, useEffect } from 'react';
import {
  BarChart as BarChartIcon,
  PieChart,
  LineChart,
  Users,
  CreditCard,
  Bot,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Loader,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import adminApiService from '../../services/adminApi.service';

// Componente de card para estatísticas
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, color }) => {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-300',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-300',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-300',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl border border-white/10`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>

          {change && (
            <div className="flex items-center mt-2">
              {change.isPositive ? (
                <ArrowUp className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {change.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/10`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Componente para gráfico de barras
const BarChartComponent: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Usuários por Plano</h2>
      <div className="h-64 flex items-end justify-around gap-4">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-t from-purple-500 to-purple-400 w-16 rounded-t-lg" style={{ height: '30%' }}></div>
          <p className="mt-2 text-purple-200">Básico</p>
          <p className="text-white font-semibold">320</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-t from-blue-500 to-blue-400 w-16 rounded-t-lg" style={{ height: '60%' }}></div>
          <p className="mt-2 text-purple-200">Plus</p>
          <p className="text-white font-semibold">480</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-t from-pink-500 to-pink-400 w-16 rounded-t-lg" style={{ height: '100%' }}></div>
          <p className="mt-2 text-purple-200">Premium</p>
          <p className="text-white font-semibold">650</p>
        </div>
      </div>
    </div>
  );
};

// Componente para gráfico de linha
const LineChartComponent: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Receita Mensal (R$)</h2>
      <div className="h-64 relative">
        {/* Simulação de um gráfico de linha */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-white/10"></div>
        </div>
        <div className="absolute inset-0 flex items-center" style={{ top: '25%' }}>
          <div className="w-full h-px bg-white/10"></div>
        </div>
        <div className="absolute inset-0 flex items-center" style={{ top: '50%' }}>
          <div className="w-full h-px bg-white/10"></div>
        </div>
        <div className="absolute inset-0 flex items-center" style={{ top: '75%' }}>
          <div className="w-full h-px bg-white/10"></div>
        </div>

        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,80 L10,75 L20,70 L30,60 L40,55 L50,40 L60,35 L70,30 L80,25 L90,20 L100,15"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-purple-200">
          <span>Jan</span>
          <span>Fev</span>
          <span>Mar</span>
          <span>Abr</span>
          <span>Mai</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Ago</span>
          <span>Set</span>
          <span>Out</span>
          <span>Nov</span>
          <span>Dez</span>
        </div>
      </div>
    </div>
  );
};

// Componente para gráfico de pizza
const PieChartComponent: React.FC = () => {
  return (
    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Distribuição de Usuários</h2>
      <div className="flex items-center justify-center h-64">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="188.5 251.3" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="20" strokeDasharray="62.8 251.3" strokeDashoffset="-188.5" />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EC4899" strokeWidth="20" strokeDasharray="31.4 251.3" strokeDashoffset="-125.7" />
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-purple-200">Candidatos (75%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-purple-200">Empresas (20%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
          <span className="text-purple-200">Admins (5%)</span>
        </div>
      </div>
    </div>
  );
};

export const AdminStats: React.FC = () => {
  // Estados para as estatísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    botExecutions: 0,
    revenueMonth: 0,
    conversionRate: 0,
    retentionRate: 0
  });

  const [usersByPlan, setUsersByPlan] = useState({
    basic: 0,
    plus: 0,
    premium: 0
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{month: string, revenue: number}>>([]);

  const [userDistribution, setUserDistribution] = useState({
    percentages: {
      candidate: 0,
      company: 0,
      admin: 0
    }
  });

  const [recentActivities, setRecentActivities] = useState<Array<{
    type: string,
    message: string,
    timestamp: string
  }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os dados da API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminApiService.getAllStats();

        if (response.success && response.data) {
          // Atualiza os estados com os dados da API
          setStats(response.data.generalStats);
          setUsersByPlan(response.data.usersByPlan);
          setMonthlyRevenue(response.data.monthlyRevenue);
          setUserDistribution(response.data.userDistribution);
          setRecentActivities(response.data.recentActivities);
        } else {
          setError('Erro ao carregar estatísticas');
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setError('Erro ao carregar estatísticas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout
      title="Estatísticas da Plataforma"
      description="Análise detalhada de métricas e desempenho da plataforma"
    >
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3 text-white">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Indicador de carregamento */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-300">Carregando estatísticas...</p>
        </div>
      ) : (
        <>
          {/* Barra de ações */}
          <div className="flex justify-end mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10">
              <Download className="w-5 h-5" />
              <span>Exportar Relatório</span>
            </button>
          </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6 text-purple-300" />}
          change={{ value: 15.2, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Assinaturas Ativas"
          value={stats.activeSubscriptions}
          icon={<CreditCard className="w-6 h-6 text-blue-300" />}
          change={{ value: 9.7, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Execuções de Bots"
          value={stats.botExecutions}
          icon={<Bot className="w-6 h-6 text-green-300" />}
          change={{ value: 22.3, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Receita Mensal (R$)"
          value={`R$ ${stats.revenueMonth.toLocaleString()}`}
          icon={<BarChartIcon className="w-6 h-6 text-pink-300" />}
          change={{ value: 12.5, isPositive: true }}
          color="pink"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          icon={<LineChart className="w-6 h-6 text-orange-300" />}
          change={{ value: 3.2, isPositive: true }}
          color="orange"
        />
        <StatCard
          title="Taxa de Retenção"
          value={`${stats.retentionRate}%`}
          icon={<PieChart className="w-6 h-6 text-purple-300" />}
          change={{ value: 1.5, isPositive: false }}
          color="purple"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChartComponent />
        <LineChartComponent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent />

        {/* Atividade Recente */}
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white">5 novos usuários registrados</p>
                <p className="text-purple-300 text-sm">Há 2 horas atrás</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white">12 novas assinaturas</p>
                <p className="text-purple-300 text-sm">Hoje</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white">358 execuções de bots</p>
                <p className="text-purple-300 text-sm">Nas últimas 24 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </AdminLayout>
  );
};
