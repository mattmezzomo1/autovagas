import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BarChart3, Search, CheckCircle, Settings, Activity,
  Target, TrendingUp, Eye, Send, Filter,
  Calendar, MapPin, Briefcase, Bot, RefreshCw, PauseCircle, PlayCircle
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { ApplicationFeedback } from '../components/feedback/ApplicationFeedback';

export const RobotPanel: React.FC = () => {
  const navigate = useNavigate();
  const { robotActive, toggleRobot, addNotification } = useAppStore();

  // Estados locais
  const [stats, setStats] = useState({
    applicationsToday: 24,
    totalApplications: 156,
    responsesReceived: 18,
    interviewsScheduled: 5,
    matchScore: 89,
    activeTime: '6h 32m',
    platformsActive: 3,
    queueSize: 12
  });

  const [showApplicationFeedback, setShowApplicationFeedback] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string } | null>(null);

  const [realTimeActivities, setRealTimeActivities] = useState([
    {
      id: 1,
      type: 'analyzing',
      title: 'Analisando vaga',
      description: 'Amazon - Senior Cloud Engineer',
      timestamp: new Date(),
      status: 'active'
    },
    {
      id: 2,
      type: 'applied',
      title: 'Aplicação enviada',
      description: 'Netflix - Senior Frontend Developer',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'success'
    },
    {
      id: 3,
      type: 'found',
      title: 'Nova vaga encontrada',
      description: 'Spotify - React Developer',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'info'
    }
  ]);

  const [foundJobs] = useState([
    {
      id: 1,
      company: 'Spotify',
      role: 'Senior React Developer',
      match: 95,
      location: 'São Paulo, SP',
      salary: 'R$ 12.000 - R$ 18.000',
      platform: 'LinkedIn',
      applied: false
    },
    {
      id: 2,
      company: 'Uber',
      role: 'Frontend Engineer',
      match: 87,
      location: 'Remote',
      salary: 'R$ 10.000 - R$ 15.000',
      platform: 'InfoJobs',
      applied: true
    },
    {
      id: 3,
      company: 'Airbnb',
      role: 'UI/UX Developer',
      match: 82,
      location: 'Rio de Janeiro, RJ',
      salary: 'R$ 9.000 - R$ 14.000',
      platform: 'Catho',
      applied: false
    },
    {
      id: 4,
      company: 'iFood',
      role: 'Full Stack Developer',
      match: 78,
      location: 'São Paulo, SP',
      salary: 'R$ 8.000 - R$ 12.000',
      platform: 'Indeed',
      applied: false
    }
  ]);

  // Funções
  const handleRobotToggle = () => {
    toggleRobot();
    addNotification({
      type: robotActive ? 'warning' : 'success',
      message: robotActive ? 'Robô pausado' : 'Robô ativado - Iniciando busca...'
    });
  };

  const handleSettings = () => {
    addNotification({
      type: 'info',
      message: 'Configurações do robô em desenvolvimento...'
    });
  };

  const handleViewJob = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  const handleApplyJob = (jobId: number) => {
    const job = foundJobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob({ title: job.role, company: job.company });
      setShowApplicationFeedback(true);
    }
  };

  const handleApplicationComplete = () => {
    addNotification({
      type: 'success',
      message: 'Aplicação enviada com sucesso!'
    });
    setShowApplicationFeedback(false);
    setSelectedJob(null);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analyzing': return <Search className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'applied': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'found': return <Target className="w-4 h-4 text-purple-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 border-blue-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'info': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Simular atividade em tempo real
  useEffect(() => {
    if (!robotActive) return;

    const interval = setInterval(() => {
      // Simular nova atividade ocasionalmente
      if (Math.random() > 0.7) {
        const activities = [
          { type: 'analyzing', title: 'Analisando vaga', description: 'Meta - Software Engineer' },
          { type: 'found', title: 'Nova vaga encontrada', description: 'Google - Frontend Developer' },
          { type: 'applied', title: 'Aplicação enviada', description: 'Tesla - React Developer' }
        ];

        const newActivity = {
          id: Date.now(),
          ...activities[Math.floor(Math.random() * activities.length)],
          timestamp: new Date(),
          status: 'active'
        };

        setRealTimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [robotActive]);

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Controle do Robô */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Bot className={`w-6 h-6 ${robotActive ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
                Controle do Robô
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300"
                onClick={handleSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Status Atual</p>
                <p className={`text-sm ${robotActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {robotActive ? 'Ativo - Buscando vagas' : 'Pausado'}
                </p>
                {robotActive && (
                  <p className="text-blue-200 text-xs mt-1">
                    Tempo ativo: {stats.activeTime}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className={`w-4 h-4 rounded-full mb-2 ${robotActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <p className="text-xs text-gray-400">{stats.queueSize} na fila</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRobotToggle}
                className={`flex-1 transition-all duration-200 ${
                  robotActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {robotActive ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                onClick={() => navigate('/jobs')}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas de Hoje
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => addNotification({ type: 'info', message: 'Atualizando estatísticas...' })}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Send className="w-4 h-4 text-purple-400" />
                  <p className="text-2xl font-bold text-purple-400">{stats.applicationsToday}</p>
                </div>
                <p className="text-gray-400 text-sm">Aplicações</p>
                <p className="text-purple-300 text-xs">+{Math.floor(stats.applicationsToday * 0.3)} desde ontem</p>
              </div>

              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <p className="text-2xl font-bold text-blue-400">{stats.responsesReceived}</p>
                </div>
                <p className="text-gray-400 text-sm">Respostas</p>
                <p className="text-blue-300 text-xs">{Math.round((stats.responsesReceived / stats.totalApplications) * 100)}% taxa</p>
              </div>

              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <p className="text-2xl font-bold text-green-400">{stats.interviewsScheduled}</p>
                </div>
                <p className="text-gray-400 text-sm">Entrevistas</p>
                <p className="text-green-300 text-xs">Próxima: amanhã</p>
              </div>

              <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <p className="text-2xl font-bold text-yellow-400">{stats.matchScore}%</p>
                </div>
                <p className="text-gray-400 text-sm">Match Score</p>
                <p className="text-yellow-300 text-xs">Média geral</p>
              </div>
            </div>

            {/* Resumo adicional */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Total de aplicações:</span>
                <span className="text-white font-medium">{stats.totalApplications}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">Plataformas ativas:</span>
                <span className="text-blue-300 font-medium">{stats.platformsActive}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade em Tempo Real */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Activity className={`w-5 h-5 ${robotActive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                Atividade em Tempo Real
              </CardTitle>
              {robotActive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">Ao vivo</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {robotActive ? (
                realTimeActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${getActivityColor(activity.status)}`}
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
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <PauseCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Robô pausado</p>
                  <p className="text-gray-500 text-xs">Ative o robô para ver atividades em tempo real</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vagas Encontradas */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Vagas Encontradas Hoje
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">{foundJobs.length}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => navigate('/jobs')}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foundJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleViewJob(job.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{job.role}</p>
                      <p className="text-gray-400 text-xs">{job.company}</p>
                    </div>
                    <div className="text-right ml-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        job.match >= 90 ? 'bg-green-500/20 text-green-400' :
                        job.match >= 80 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {job.match}% match
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {job.platform}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs font-medium">{job.salary}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs px-2 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewJob(job.id);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      {!job.applied && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyJob(job.id);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Aplicar
                        </Button>
                      )}
                      {job.applied && (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Aplicado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {foundJobs.length > 4 && (
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  onClick={() => navigate('/jobs')}
                >
                  Ver todas as {foundJobs.length} vagas encontradas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback de Aplicação */}
      {showApplicationFeedback && selectedJob && (
        <ApplicationFeedback
          isVisible={showApplicationFeedback}
          jobTitle={selectedJob.title}
          company={selectedJob.company}
          onClose={() => {
            setShowApplicationFeedback(false);
            setSelectedJob(null);
          }}
          onComplete={handleApplicationComplete}
        />
      )}
    </MobileLayout>
  );
};
