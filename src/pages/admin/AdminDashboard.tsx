import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Bot, 
  BookOpen, 
  BarChart, 
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

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

export const AdminDashboard: React.FC = () => {
  // Dados simulados para o dashboard
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    botExecutions: 0,
    coursesCount: 0,
    revenueMonth: 0,
    conversionRate: 0
  });

  // Simula carregamento de dados
  useEffect(() => {
    // Em um cenário real, esses dados viriam da API
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        activeSubscriptions: 845,
        botExecutions: 12350,
        coursesCount: 78,
        revenueMonth: 45680,
        conversionRate: 24.5
      });
    }, 1000);
  }, []);

  return (
    <AdminLayout 
      title="Dashboard Administrativo" 
      description="Visão geral e estatísticas da plataforma"
    >
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6 text-purple-300" />}
          change={{ value: 12.5, isPositive: true }}
          color="purple"
        />
        <StatCard
          title="Assinaturas Ativas"
          value={stats.activeSubscriptions}
          icon={<CreditCard className="w-6 h-6 text-blue-300" />}
          change={{ value: 8.3, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Execuções de Bots"
          value={stats.botExecutions}
          icon={<Bot className="w-6 h-6 text-green-300" />}
          change={{ value: 15.7, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Cursos Disponíveis"
          value={stats.coursesCount}
          icon={<BookOpen className="w-6 h-6 text-orange-300" />}
          change={{ value: 5.2, isPositive: true }}
          color="orange"
        />
        <StatCard
          title="Receita Mensal (R$)"
          value={`R$ ${stats.revenueMonth.toLocaleString()}`}
          icon={<BarChart className="w-6 h-6 text-pink-300" />}
          change={{ value: 10.8, isPositive: true }}
          color="pink"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp className="w-6 h-6 text-purple-300" />}
          change={{ value: 2.1, isPositive: false }}
          color="purple"
        />
      </div>

      {/* Seções adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            {/* Aqui viriam os itens de atividade recente */}
            <p className="text-purple-200">Carregando atividades recentes...</p>
          </div>
        </div>

        {/* Alertas e Notificações */}
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Alertas e Notificações</h2>
          <div className="space-y-4">
            {/* Aqui viriam os alertas e notificações */}
            <p className="text-purple-200">Nenhum alerta pendente.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
