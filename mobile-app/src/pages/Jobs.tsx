import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Search, MapPin, Clock, SlidersHorizontal,
  Briefcase, Building, DollarSign, Calendar, Eye, Send,
  MessageCircle, CheckCircle, TrendingUp,
  Heart, Bookmark, ExternalLink, RefreshCw, Target,
  Video, Users, Play
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { ApplicationFeedback } from '../components/feedback/ApplicationFeedback';
import { ChatModal } from '../components/chat/ChatModal';
import { AdvancedSearchModal } from '../components/search/AdvancedSearchModal';

export const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();

  // Estados locais
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'suggested' | 'applications' | 'saved'>('suggested');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    remote: false,
    platform: 'all'
  });

  const [showApplicationFeedback, setShowApplicationFeedback] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string } | null>(null);
  const [selectedChat, setSelectedChat] = useState<{ title: string; company: string; recruiterName: string; recruiterRole: string } | null>(null);

  // Mock data para entrevistas
  const scheduledInterviews = [
    {
      id: 1,
      company: 'TechCorp',
      position: 'Senior React Developer',
      date: '2024-01-15',
      time: '14:00',
      type: 'video',
      status: 'scheduled',
      interviewerName: 'Ana Silva',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      logo: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=TC'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'Frontend Engineer',
      date: '2024-01-16',
      time: '10:30',
      type: 'presencial',
      status: 'confirmed',
      interviewerName: 'Carlos Santos',
      address: 'Av. Paulista, 1000 - São Paulo',
      logo: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=SX'
    },
    {
      id: 3,
      company: 'InnovaTech',
      position: 'Full Stack Developer',
      date: '2024-01-18',
      time: '16:00',
      type: 'video',
      status: 'pending',
      interviewerName: 'Maria Oliveira',
      meetingLink: 'https://zoom.us/j/123456789',
      logo: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=IT'
    }
  ];

  // Dados mockados
  const [suggestedJobs] = useState([
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'Google',
      location: 'São Paulo, SP',
      salary: 'R$ 15.000 - R$ 20.000',
      match: 95,
      time: '2h',
      platform: 'LinkedIn',
      description: 'Desenvolver aplicações React de alta performance...',
      requirements: ['React', 'TypeScript', 'Node.js'],
      benefits: ['Vale refeição', 'Plano de saúde', 'Home office'],
      saved: false,
      applied: false,
      type: 'CLT',
      experience: 'Senior'
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'Microsoft',
      location: 'Remoto',
      salary: 'R$ 12.000 - R$ 18.000',
      match: 87,
      time: '4h',
      platform: 'InfoJobs',
      description: 'Criar interfaces modernas e responsivas...',
      requirements: ['Vue.js', 'JavaScript', 'CSS'],
      benefits: ['Flexibilidade', 'Cursos', 'Stock options'],
      saved: true,
      applied: false,
      type: 'PJ',
      experience: 'Pleno'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'Netflix',
      location: 'Rio de Janeiro, RJ',
      salary: 'R$ 10.000 - R$ 16.000',
      match: 82,
      time: '1d',
      platform: 'Catho',
      description: 'Desenvolver soluções completas...',
      requirements: ['React', 'Python', 'AWS'],
      benefits: ['Netflix grátis', 'Gympass', 'Auxílio creche'],
      saved: false,
      applied: true,
      type: 'CLT',
      experience: 'Pleno'
    },
    {
      id: 4,
      title: 'UI/UX Developer',
      company: 'Spotify',
      location: 'São Paulo, SP',
      salary: 'R$ 8.000 - R$ 14.000',
      match: 78,
      time: '2d',
      platform: 'Indeed',
      description: 'Criar experiências de usuário incríveis...',
      requirements: ['Figma', 'React', 'Design Systems'],
      benefits: ['Spotify Premium', 'Horário flexível', 'Day off'],
      saved: true,
      applied: false,
      type: 'CLT',
      experience: 'Júnior'
    }
  ]);

  const [applications] = useState([
    {
      id: 1,
      company: 'Netflix',
      role: 'Full Stack Developer',
      status: 'Em análise',
      color: 'blue',
      appliedDate: '2024-01-15',
      platform: 'Catho',
      lastUpdate: '2h',
      nextStep: 'Aguardando retorno do RH',
      hasMessages: true,
      messageCount: 2
    },
    {
      id: 2,
      company: 'Spotify',
      role: 'React Developer',
      status: 'Entrevista agendada',
      color: 'green',
      appliedDate: '2024-01-12',
      platform: 'LinkedIn',
      lastUpdate: '1d',
      nextStep: 'Entrevista técnica - 18/01 às 14h',
      hasMessages: true,
      messageCount: 5
    },
    {
      id: 3,
      company: 'Uber',
      role: 'Frontend Engineer',
      status: 'Aplicado',
      color: 'yellow',
      appliedDate: '2024-01-10',
      platform: 'InfoJobs',
      lastUpdate: '3d',
      nextStep: 'Aguardando primeira resposta',
      hasMessages: false,
      messageCount: 0
    },
    {
      id: 4,
      company: 'iFood',
      role: 'Mobile Developer',
      status: 'Rejeitado',
      color: 'red',
      appliedDate: '2024-01-08',
      platform: 'Indeed',
      lastUpdate: '5d',
      nextStep: 'Processo finalizado',
      hasMessages: true,
      messageCount: 1
    }
  ]);

  const [savedJobs] = useState(
    suggestedJobs.filter(job => job.saved)
  );

  // Funções
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addNotification({
        type: 'info',
        message: `Buscando por "${query}"...`
      });
    }
  };

  const handleApplyJob = (jobId: number) => {
    const job = suggestedJobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob({ title: job.title, company: job.company });
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

  const handleSaveJob = (jobId: number) => {
    addNotification({
      type: 'success',
      message: 'Vaga salva nos favoritos!'
    });
  };

  const handleViewJob = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  // Funções para entrevistas
  const handleJoinInterview = (interview: any) => {
    if (interview.type === 'video') {
      // Navegar para nossa funcionalidade interna de entrevista
      navigate(`/interview/${interview.id}`, {
        state: {
          company: interview.company,
          position: interview.position,
          interviewerName: interview.interviewerName,
          time: interview.time,
          date: interview.date
        }
      });
      addNotification({
        type: 'success',
        message: `Entrando na entrevista com ${interview.company}...`
      });
    } else if (interview.type === 'presencial' && interview.address) {
      // Abrir Google Maps com o endereço
      const encodedAddress = encodeURIComponent(interview.address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, '_blank');
      addNotification({
        type: 'info',
        message: `Abrindo localização no Google Maps...`
      });
    }
  };

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400';
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getInterviewStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const formatInterviewDate = (date: string) => {
    const interviewDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (interviewDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (interviewDate.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return interviewDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const handleOpenChat = (applicationId: number) => {
    // Encontrar a aplicação correspondente
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setSelectedChat({
        title: application.role,
        company: application.company,
        recruiterName: 'Ana Silva',
        recruiterRole: 'Tech Recruiter'
      });
      setShowChatModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em análise': return 'bg-blue-500/20 text-blue-400';
      case 'entrevista agendada': return 'bg-green-500/20 text-green-400';
      case 'aplicado': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejeitado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-green-400 bg-green-500/20';
    if (match >= 80) return 'text-yellow-400 bg-yellow-500/20';
    if (match >= 70) return 'text-blue-400 bg-blue-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vagas, empresas, tecnologias..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAdvancedSearch(true)}
                title="Busca Avançada"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="space-y-3 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Localização"
                    className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                  <select
                    className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    value={filters.experience}
                    onChange={(e) => setFilters({...filters, experience: e.target.value})}
                  >
                    <option value="">Experiência</option>
                    <option value="junior">Júnior</option>
                    <option value="pleno">Pleno</option>
                    <option value="senior">Sênior</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Salário mín."
                    className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({...filters, salaryMin: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Salário máx."
                    className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters({...filters, salaryMax: e.target.value})}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Entrevistas */}
        {scheduledInterviews.length > 0 && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" />
                  Entrevistas
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-sm font-medium">{scheduledInterviews.length}</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledInterviews.slice(0, 2).map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={interview.logo}
                        alt={interview.company}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">
                              {interview.position}
                            </h4>
                            <p className="text-gray-400 text-xs">
                              {interview.company}
                            </p>
                          </div>
                          <span className={`text-xs font-medium ${getInterviewStatusColor(interview.status)}`}>
                            {getInterviewStatusText(interview.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatInterviewDate(interview.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {interview.time}
                          </div>
                          <div className="flex items-center gap-1">
                            {interview.type === 'video' ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <MapPin className="w-3 h-3" />
                            )}
                            {interview.type === 'video' ? 'Online' : 'Presencial'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">
                            com {interview.interviewerName}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleJoinInterview(interview)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                            disabled={interview.status === 'pending'}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {interview.type === 'video' ? 'Entrar' : 'Ver Local'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {scheduledInterviews.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                    onClick={() => navigate('/interviews')}
                  >
                    Ver todas as {scheduledInterviews.length} entrevistas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation */}
        <div className="flex bg-black/20 rounded-lg p-1 border border-white/10">
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'suggested'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('suggested')}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              Sugeridas ({suggestedJobs.length})
            </div>
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Aplicações ({applications.length})
            </div>
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <div className="flex items-center justify-center gap-2">
              <Bookmark className="w-4 h-4" />
              Salvas ({savedJobs.length})
            </div>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'suggested' && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Vagas Sugeridas para Você
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => addNotification({ type: 'info', message: 'Atualizando sugestões...' })}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewJob(job.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <p className="text-gray-400 text-xs">{job.company}</p>
                          <span className="text-gray-500">•</span>
                          <span className="text-blue-400 text-xs">{job.platform}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getMatchColor(job.match)}`}>
                          {job.match}%
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                        >
                          <Heart className={`w-4 h-4 ${job.saved ? 'fill-current text-red-400' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.type}
                      </div>
                    </div>

                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                          +{job.requirements.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">{job.salary}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs px-3 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job.id);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        {!job.applied ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyJob(job.id);
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Aplicar
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-green-400 text-xs px-3 py-1">
                            <CheckCircle className="w-3 h-3" />
                            Aplicado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aba de Aplicações */}
        {activeTab === 'applications' && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  Minhas Aplicações
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium">{applications.length}</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{app.role}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <p className="text-gray-400 text-xs">{app.company}</p>
                          <span className="text-gray-500">•</span>
                          <span className="text-blue-400 text-xs">{app.platform}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        {app.hasMessages && (
                          <div className="relative">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            {app.messageCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{app.messageCount}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Aplicado em {new Date(app.appliedDate).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atualizado {app.lastUpdate}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                      <p className="text-blue-300 text-xs">
                        <strong>Próximo passo:</strong> {app.nextStep}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs flex-1"
                        onClick={() => handleViewJob(app.id)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Vaga
                      </Button>
                      {app.hasMessages && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs flex-1"
                          onClick={() => handleOpenChat(app.id)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat ({app.messageCount})
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={() => addNotification({ type: 'info', message: 'Abrindo link externo...' })}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aba de Vagas Salvas */}
        {activeTab === 'saved' && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-purple-400" />
                  Vagas Salvas
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-sm font-medium">{savedJobs.length}</span>
                  <Heart className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 cursor-pointer"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-400 text-xs">{job.company}</p>
                            <span className="text-gray-500">•</span>
                            <span className="text-blue-400 text-xs">{job.platform}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getMatchColor(job.match)}`}>
                            {job.match}%
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              addNotification({ type: 'info', message: 'Vaga removida dos favoritos' });
                            }}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job.id);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyJob(job.id);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Aplicar Agora
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-2">Nenhuma vaga salva ainda</p>
                  <p className="text-gray-500 text-xs">
                    Salve vagas interessantes para aplicar depois
                  </p>
                  <Button
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveTab('suggested')}
                  >
                    Explorar Vagas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
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

      {/* Chat Modal */}
      {showChatModal && selectedChat && (
        <ChatModal
          isVisible={showChatModal}
          jobTitle={selectedChat.title}
          company={selectedChat.company}
          recruiterName={selectedChat.recruiterName}
          recruiterRole={selectedChat.recruiterRole}
          onClose={() => {
            setShowChatModal(false);
            setSelectedChat(null);
          }}
        />
      )}

      {/* Advanced Search Modal */}
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
