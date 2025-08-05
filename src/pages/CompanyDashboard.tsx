import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../components/company/CompanyLayout';
import {
  Building2,
  Users,
  Search,
  BriefcaseIcon,
  Bot,
  Plus,
  Bell,
  MessageSquare,
  Settings,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  X,
  Brain,
  Menu,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  Banknote,
  BarChart3,
  UserSearch,
  Loader2,
  ExternalLink,
  FileText,
  Video,
  UserCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Zap,
  Target,
  Award,
  Shield,
  PenTool,
  Briefcase,
  UserPlus,
  Heart,
  Filter,
  Mic,
  ClipboardCheck,
  FileSignature,
  GraduationCap
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      activeJobs: 12,
      candidates: 248,
      views: 1800,
      conversionRate: 13.4,
      talentsInCRM: 156,
      interviewsScheduled: 8,
      aiAnalysisCompleted: 24
    },
    recentActivities: [
      {
        id: '1',
        type: 'interview_completed',
        title: 'Entrevistei o candidato João Silva',
        description: 'Entrevista técnica concluída com sucesso',
        candidate: 'João Silva',
        action: 'Ver relatório',
        actionUrl: '/company/interview-report/1',
        timestamp: '2 horas atrás',
        icon: FileText,
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      },
      {
        id: '2',
        type: 'ai_interview_scheduled',
        title: 'Agendei entrevista com IA para Maria Santos',
        description: 'Entrevista automática agendada para amanhã às 14h',
        candidate: 'Maria Santos',
        action: 'Ver agenda',
        actionUrl: '/company/ai-interviews',
        timestamp: '4 horas atrás',
        icon: Bot,
        iconColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20'
      },
      {
        id: '3',
        type: 'human_interview_scheduled',
        title: 'Agendei entrevista humana com Carlos Oliveira',
        description: 'Reunião marcada para amanhã às 10h na sua agenda',
        candidate: 'Carlos Oliveira',
        action: 'Abrir agenda',
        actionUrl: '/company/calendar',
        timestamp: '6 horas atrás',
        icon: Calendar,
        iconColor: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
      },
      {
        id: '4',
        type: 'new_candidates',
        title: 'Recebemos 8 novos candidatos hoje',
        description: 'Candidatos para Desenvolvedor Full Stack e Product Manager',
        candidate: null,
        action: 'Ver lista',
        actionUrl: '/company/candidates',
        timestamp: '8 horas atrás',
        icon: UserCheck,
        iconColor: 'text-green-400',
        bgColor: 'bg-green-500/20'
      },
      {
        id: '5',
        type: 'ai_analysis_completed',
        title: 'IA finalizou análise de 12 candidatos',
        description: '3 candidatos com match superior a 90%',
        candidate: null,
        action: 'Ver análises',
        actionUrl: '/company/ai-analysis',
        timestamp: '1 dia atrás',
        icon: Brain,
        iconColor: 'text-indigo-400',
        bgColor: 'bg-indigo-500/20'
      }
    ],
    topCandidates: [
      { id: '1', name: 'João Silva', title: 'Desenvolvedor Full Stack', match: 95, skills: ['React', 'Node.js', 'TypeScript'] },
      { id: '2', name: 'Maria Santos', title: 'Product Manager', match: 92, skills: ['Strategy', 'Analytics', 'Agile'] },
      { id: '3', name: 'Carlos Oliveira', title: 'UX Designer', match: 88, skills: ['Figma', 'Research', 'Prototyping'] }
    ]
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNewJob = () => {
    navigate('/company/job/new');
  };

  const handleViewCandidates = (jobId: string = '1') => {
    navigate(`/company/job/${jobId}/candidates`);
  };

  const handleJobSuggestions = () => {
    navigate('/company/job-suggestions');
  };

  const handleOpenChat = () => {
    navigate('/company/chat');
  };

  if (isLoading) {
    return (
      <CompanyLayout
        title="Dashboard"
        description="Visão geral da sua empresa e atividades de recrutamento"
      >
        <div className="space-y-8">
          {/* Loading State */}
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="text-white/60">Carregando dashboard...</span>
            </div>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title="Dashboard"
      description="Visão geral da sua empresa e atividades de recrutamento"
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleNewJob}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Criar nova vaga"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Vaga</span>
            <span className="sm:hidden">Nova</span>
          </button>
          <button
            onClick={handleJobSuggestions}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Gestão com IA"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Gestão IA</span>
            <span className="sm:hidden">IA</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <span className="text-green-400 text-xs sm:text-sm font-medium">+2</span>
            </div>
            <p className="text-white/60 text-xs sm:text-sm">Vagas Ativas</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.metrics.activeJobs}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-xs sm:text-sm font-medium">+18</span>
            </div>
            <p className="text-white/60 text-xs sm:text-sm">Candidatos</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.metrics.candidates}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
              <span className="text-green-400 text-xs sm:text-sm font-medium">+12</span>
            </div>
            <p className="text-white/60 text-xs sm:text-sm">CRM Talentos</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.metrics.talentsInCRM}</p>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 hover:bg-black/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <span className="text-green-400 text-xs sm:text-sm font-medium">+8</span>
            </div>
            <p className="text-white/60 text-xs sm:text-sm">Análises IA</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.metrics.aiAnalysisCompleted}</p>
          </div>
        </div>

        {/* Main Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CRM de Talentos */}
          <Link
            to="/company/talent-crm"
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">CRM de Talentos</h3>
                <p className="text-white/60 text-sm">Gerencie seu banco de talentos</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Talentos cadastrados:</span>
                <span className="text-purple-400 font-semibold">{dashboardData.metrics.talentsInCRM}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Favoritos:</span>
                <span className="text-purple-400 font-semibold">23</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
              <span>Acessar CRM</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Busca de Talentos com IA */}
          <Link
            to="/company/talent-search"
            className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl border border-indigo-500/20 p-6 hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <UserSearch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Busca Inteligente</h3>
                <p className="text-white/60 text-sm">Encontre talentos com IA</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Matches encontrados:</span>
                <span className="text-indigo-400 font-semibold">47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Precisão média:</span>
                <span className="text-indigo-400 font-semibold">94%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm group-hover:text-indigo-300 transition-colors">
              <span>Buscar Talentos</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Entrevistas com IA */}
          <Link
            to="/company/ai-interviews"
            className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Entrevistas IA</h3>
                <p className="text-white/60 text-sm">Automatize entrevistas</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Agendadas:</span>
                <span className="text-emerald-400 font-semibold">{dashboardData.metrics.interviewsScheduled}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Concluídas hoje:</span>
                <span className="text-emerald-400 font-semibold">5</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm group-hover:text-emerald-300 transition-colors">
              <span>Ver Entrevistas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Banco de Candidatos */}
          <Link
            to="/company/candidates"
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Banco de Candidatos</h3>
                <p className="text-white/60 text-sm">Gerencie candidatos</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Total de candidatos:</span>
                <span className="text-blue-400 font-semibold">{dashboardData.metrics.candidates}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Novos hoje:</span>
                <span className="text-blue-400 font-semibold">18</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
              <span>Ver Candidatos</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Sistema de Admissão */}
          <Link
            to="/company/admission"
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl border border-yellow-500/20 p-6 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Sistema de Admissão</h3>
                <p className="text-white/60 text-sm">Processo de contratação</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Em processo:</span>
                <span className="text-yellow-400 font-semibold">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Finalizados:</span>
                <span className="text-yellow-400 font-semibold">8</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-400 text-sm group-hover:text-yellow-300 transition-colors">
              <span>Ver Admissões</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Analytics */}
          <Link
            to="/company/analytics"
            className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl border border-red-500/20 p-6 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Analytics</h3>
                <p className="text-white/60 text-sm">Relatórios e métricas</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Taxa de conversão:</span>
                <span className="text-red-400 font-semibold">{dashboardData.metrics.conversionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Visualizações:</span>
                <span className="text-red-400 font-semibold">{(dashboardData.metrics.views / 1000).toFixed(1)}k</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-400 text-sm group-hover:text-red-300 transition-colors">
              <span>Ver Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Recent Activities */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Atividades Recentes</h3>
                </div>
                <Link
                  to="/company/activities"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg px-2 py-1"
                  aria-label="Ver todas as atividades"
                >
                  Ver todas
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group border-l-4 border-transparent hover:border-blue-400/50">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${activity.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${activity.iconColor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm sm:text-base leading-tight">
                                  {activity.title}
                                </h4>
                                <p className="text-white/70 text-xs sm:text-sm mt-1 leading-relaxed">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-white/40" />
                                  <span className="text-white/60 text-xs">{activity.timestamp}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Link
                                  to={activity.actionUrl}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                >
                                  {activity.action}
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Nenhuma atividade recente</h4>
                    <p className="text-white/60 text-sm mb-4">As atividades aparecerão aqui conforme você interage com candidatos</p>
                    <Link
                      to="/company/candidates"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-200 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      Ver Candidatos
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis - Análises Recentes da IA */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Análises Recentes da IA</h3>
                </div>
                <Link
                  to="/company/ai-analysis"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg px-2 py-1"
                  aria-label="Ver todas as análises"
                >
                  Ver todas
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {dashboardData.topCandidates.length > 0 ? (
                  dashboardData.topCandidates.map((candidate, index) => (
                    <div key={candidate.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group border border-emerald-500/10">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm sm:text-base truncate">{candidate.name}</h4>
                                <p className="text-white/60 text-xs sm:text-sm truncate">{candidate.title}</p>
                              </div>

                              {/* Match Score - Mais em evidência */}
                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                                  candidate.match >= 90
                                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-emerald-300/50'
                                    : candidate.match >= 80
                                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-blue-300/50'
                                    : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300/50'
                                }`}>
                                  <span className="text-xs sm:text-sm font-extrabold">{candidate.match}%</span>
                                  {candidate.match >= 90 && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                      <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400 font-medium">match</span>
                                </div>
                              </div>
                            </div>

                            {/* AI Analysis Comment */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-emerald-200 text-xs font-medium mb-1">Análise da IA:</p>
                                  <p className="text-white/90 text-xs leading-relaxed">
                                    {candidate.match >= 90
                                      ? `Candidato excepcional! Possui ${candidate.skills.slice(0, 2).join(' e ')} que são requisitos essenciais. Experiência sólida e perfil alinhado com a cultura da empresa.`
                                      : candidate.match >= 80
                                      ? `Bom candidato com potencial. Domina ${candidate.skills[0]} mas pode precisar de desenvolvimento em algumas áreas. Recomendo entrevista técnica.`
                                      : `Candidato interessante mas com algumas lacunas. Possui ${candidate.skills[0]} mas faltam skills complementares. Considere para posições júnior.`
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Validation Questions */}
                              <div className="border-t border-emerald-500/20 pt-2 mt-2">
                                <p className="text-yellow-300 text-xs font-medium mb-1">💡 Perguntas de Validação:</p>
                                <ul className="text-white/80 text-xs space-y-1">
                                  <li>• {candidate.match >= 90 ? 'Está disponível para início imediato?' : 'Tem interesse em treinamento adicional?'}</li>
                                  <li>• {candidate.match >= 80 ? 'Experiência com metodologias ágeis?' : 'Flexibilidade para trabalho híbrido?'}</li>
                                </ul>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {candidate.skills.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs hover:bg-purple-500/30 transition-colors"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">IA aguardando candidatos</h4>
                    <p className="text-white/60 text-sm mb-4">A IA analisará automaticamente novos candidatos</p>
                    <Link
                      to="/company/talent-search"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all duration-200 text-sm"
                    >
                      <UserSearch className="w-4 h-4" />
                      Buscar Talentos
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions and Stats */}
          <div className="space-y-6 lg:space-y-8">
            {/* AI Performance Stats */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Performance da IA</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Precisão das análises</span>
                  <span className="text-emerald-400 font-bold">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Tempo médio de análise</span>
                  <span className="text-emerald-400 font-bold">2.3s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Candidatos analisados</span>
                  <span className="text-emerald-400 font-bold">1,247</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>IA ativa e analisando</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
