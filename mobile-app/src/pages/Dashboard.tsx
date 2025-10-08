import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Share2, Crown, Zap, Activity, TrendingUp, Target, Clock, CheckCircle, AlertCircle, Plus, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { SubscriptionPlansModal } from '../components/modals/SubscriptionPlansModal';
import { PlatformConnectionModal } from '../components/modals/PlatformConnectionModal';
import { AdvancedSearchModal } from '../components/search/AdvancedSearchModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { robotActive, toggleRobot, addNotification } = useAppStore();

  // Estados locais
  const [stats, setStats] = useState({
    applicationsToday: 12,
    totalApplications: 248,
    responseRate: 18,
    interviewsScheduled: 3,
    platformsConnected: 2,
    totalPlatforms: 5
  });

  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [platforms] = useState([
    { name: 'LinkedIn', connected: true, icon: '💼' },
    { name: 'InfoJobs', connected: true, icon: '🔍' },
    { name: 'Catho', connected: false, icon: '📋' },
    { name: 'Indeed', connected: false, icon: '🌐' },
    { name: 'Vagas.com', connected: false, icon: '💻' }
  ]);

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'application_sent',
      title: 'Aplicação enviada',
      description: 'Google - Senior React Developer',
      time: '2h',
      status: 'success'
    },
    {
      id: 2,
      type: 'job_found',
      title: 'Nova vaga encontrada',
      description: 'Microsoft - Frontend Engineer',
      time: '4h',
      status: 'info'
    },
    {
      id: 3,
      type: 'interview_scheduled',
      title: 'Entrevista agendada',
      description: 'Netflix - UI Developer',
      time: '1d',
      status: 'success'
    },
    {
      id: 4,
      type: 'application_viewed',
      title: 'Aplicação visualizada',
      description: 'Spotify - Frontend Developer',
      time: '2d',
      status: 'warning'
    }
  ]);

  // Funções
  const handleUpgrade = () => {
    setShowPlansModal(true);
  };

  const handleSelectPlan = (plan: 'basic' | 'plus' | 'premium') => {
    addNotification({
      type: 'success',
      message: `Plano ${plan} selecionado! Redirecionando para pagamento...`
    });
    // Aqui seria a integração com o sistema de pagamento
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AutoVagas - Encontre seu emprego dos sonhos',
        text: 'Descubra a plataforma que está revolucionando a busca por empregos!',
        url: window.location.origin
      });
    } else {
      addNotification({
        type: 'success',
        message: 'Link copiado para a área de transferência!'
      });
    }
  };

  const handleConnectPlatform = (platformName: string) => {
    setShowPlatformModal(true);
  };

  const handlePlatformConnect = (platformId: string, credentials: { email: string; password: string }) => {
    addNotification({
      type: 'success',
      message: `${platformId} conectado com sucesso!`
    });
    // Aqui seria a lógica real de conexão com a plataforma
  };

  const handleRobotToggle = () => {
    toggleRobot();
    addNotification({
      type: robotActive ? 'warning' : 'success',
      message: robotActive ? 'Robô pausado' : 'Robô ativado - Buscando vagas...'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application_sent': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'job_found': return <Target className="w-4 h-4 text-blue-400" />;
      case 'interview_scheduled': return <Clock className="w-4 h-4 text-purple-400" />;
      case 'application_viewed': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Card Principal */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Bem-vindo de volta!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'US'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{user?.name || 'Usuário'}</p>
                <p className="text-purple-200 text-sm">Profissional</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">{stats.applicationsToday}</p>
                <p className="text-purple-200 text-xs">aplicações hoje</p>
              </div>
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="text-center">
                <p className="text-white text-lg font-bold">{stats.totalApplications}</p>
                <p className="text-purple-200 text-xs">Total</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-bold">{stats.responseRate}%</p>
                <p className="text-purple-200 text-xs">Resposta</p>
              </div>
              <div className="text-center">
                <p className="text-white text-lg font-bold">{stats.interviewsScheduled}</p>
                <p className="text-purple-200 text-xs">Entrevistas</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 flex-1"
                onClick={handleUpgrade}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conexões de Plataformas */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Plataformas</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">
                  {stats.platformsConnected}/{stats.totalPlatforms}
                </span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  className={`text-xs transition-all duration-200 ${
                    platform.connected
                      ? 'border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-blue-500/50'
                  }`}
                  onClick={() => !platform.connected && handleConnectPlatform(platform.name)}
                  disabled={platform.connected}
                >
                  <span className="mr-1">{platform.icon}</span>
                  {platform.connected ? '✓' : <Plus className="w-3 h-3 mr-1" />}
                  {platform.name}
                </Button>
              ))}
            </div>

            {stats.platformsConnected < stats.totalPlatforms && (
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-xs text-center">
                  Conecte mais plataformas para encontrar mais oportunidades!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card do Robô */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Zap className={`w-5 h-5 ${robotActive ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
              Auto-Aplicação por IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Status do Robô</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  robotActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm ${
                  robotActive ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {robotActive ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>

            {/* Estatísticas do robô */}
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                <p className="text-white text-sm font-bold">{stats.applicationsToday}</p>
                <p className="text-blue-200 text-xs">Hoje</p>
              </div>
              <div className="text-center p-2 bg-cyan-500/10 rounded-lg">
                <p className="text-white text-sm font-bold">24h</p>
                <p className="text-cyan-200 text-xs">Ativo</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className={`flex-1 transition-all duration-200 ${
                  robotActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handleRobotToggle}
              >
                {robotActive ? 'Pausar' : 'Ativar'}
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/robot')}
              >
                Painel
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                onClick={() => navigate('/robot')}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Busca Avançada */}
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Busca Avançada</h3>
                <p className="text-gray-400 text-sm">Encontre vagas específicas</p>
              </div>
              <Button
                onClick={() => setShowAdvancedSearch(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Atividade Recente</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 text-xs"
                onClick={() => navigate('/robot')}
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${getActivityColor(activity.status)}`}
                  onClick={() => navigate('/jobs')}
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="text-center py-6">
                  <Activity className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhuma atividade recente</p>
                  <p className="text-gray-500 text-xs">Ative o robô para começar!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Planos */}
      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Modal de Conexão de Plataformas */}
      <PlatformConnectionModal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onConnect={handlePlatformConnect}
      />

      {/* Modal de Busca Avançada */}
      {showAdvancedSearch && (
        <AdvancedSearchModal
          isVisible={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onSelectJob={(jobId) => {
            setShowAdvancedSearch(false);
            navigate(`/job/${jobId}`);
          }}
        />
      )}
    </MobileLayout>
  );
};
