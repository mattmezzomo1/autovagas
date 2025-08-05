import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { 
  ArrowLeft, 
  Bot, 
  Calendar, 
  Clock, 
  User, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Brain,
  Video,
  Mic,
  FileText,
  Star
} from 'lucide-react';

export const AIInterviews: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data das entrevistas com IA
  const aiInterviews = [
    {
      id: '1',
      candidate: {
        name: 'Maria Santos',
        title: 'Product Manager',
        avatar: '/api/placeholder/40/40',
        email: 'maria.santos@email.com'
      },
      job: {
        title: 'Product Manager Senior',
        department: 'Produto'
      },
      scheduledDate: '2024-01-16',
      scheduledTime: '14:00',
      duration: 30,
      status: 'scheduled',
      type: 'technical',
      questions: 15,
      estimatedScore: null,
      aiConfig: {
        difficulty: 'intermediate',
        focus: ['product-strategy', 'analytics', 'leadership'],
        language: 'pt-BR'
      }
    },
    {
      id: '2',
      candidate: {
        name: 'Carlos Oliveira',
        title: 'UX Designer',
        avatar: '/api/placeholder/40/40',
        email: 'carlos.oliveira@email.com'
      },
      job: {
        title: 'Designer UX/UI',
        department: 'Design'
      },
      scheduledDate: '2024-01-16',
      scheduledTime: '10:00',
      duration: 45,
      status: 'in_progress',
      type: 'behavioral',
      questions: 12,
      estimatedScore: null,
      aiConfig: {
        difficulty: 'intermediate',
        focus: ['design-thinking', 'user-research', 'prototyping'],
        language: 'pt-BR'
      }
    },
    {
      id: '3',
      candidate: {
        name: 'Ana Costa',
        title: 'Desenvolvedora Frontend',
        avatar: '/api/placeholder/40/40',
        email: 'ana.costa@email.com'
      },
      job: {
        title: 'Desenvolvedor Frontend',
        department: 'Tecnologia'
      },
      scheduledDate: '2024-01-15',
      scheduledTime: '16:00',
      duration: 60,
      status: 'completed',
      type: 'technical',
      questions: 20,
      estimatedScore: 87,
      aiConfig: {
        difficulty: 'advanced',
        focus: ['react', 'javascript', 'css'],
        language: 'pt-BR'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredInterviews = aiInterviews.filter(interview => {
    const matchesSearch = interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <CompanyLayout
      title="Entrevistas com IA"
      description="Gerencie entrevistas automatizadas com inteligência artificial"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Nova Entrevista IA
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Agendadas</p>
                <p className="text-xl font-bold text-white">
                  {aiInterviews.filter(i => i.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Em Andamento</p>
                <p className="text-xl font-bold text-white">
                  {aiInterviews.filter(i => i.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Concluídas</p>
                <p className="text-xl font-bold text-white">
                  {aiInterviews.filter(i => i.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Score Médio</p>
                <p className="text-xl font-bold text-white">87%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por candidato ou vaga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all" className="bg-slate-800">Todos os status</option>
              <option value="scheduled" className="bg-slate-800">Agendadas</option>
              <option value="in_progress" className="bg-slate-800">Em Andamento</option>
              <option value="completed" className="bg-slate-800">Concluídas</option>
              <option value="cancelled" className="bg-slate-800">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Lista de Entrevistas */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-400" />
              Entrevistas com IA ({filteredInterviews.length})
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {filteredInterviews.map((interview) => (
              <div key={interview.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <img
                      src={interview.candidate.avatar}
                      alt={interview.candidate.name}
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{interview.candidate.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(interview.status)}`}>
                          {getStatusIcon(interview.status)}
                          <span className="ml-1">{getStatusText(interview.status)}</span>
                        </span>
                      </div>

                      <p className="text-white/80 mb-2">{interview.job.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(interview.scheduledDate).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {interview.scheduledTime} • {interview.duration}min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {interview.questions} perguntas
                        </span>
                        {interview.estimatedScore && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Score: {interview.estimatedScore}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {interview.aiConfig.focus.map((focus, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-xs"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {interview.status === 'scheduled' && (
                      <button className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Iniciar Entrevista">
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    {interview.status === 'in_progress' && (
                      <button className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors" title="Pausar Entrevista">
                        <Pause className="w-5 h-5" />
                      </button>
                    )}
                    {interview.status === 'completed' && (
                      <button 
                        onClick={() => navigate(`/company/interview-report/${interview.id}`)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" 
                        title="Ver Relatório"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors" title="Configurações">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IA Configuration Panel */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-400" />
            Configurações da IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Tipos de Entrevista</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Técnica (Programação, Design)</div>
                <div>• Comportamental (Soft Skills)</div>
                <div>• Mista (Técnica + Comportamental)</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Níveis de Dificuldade</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Júnior (10-15 perguntas)</div>
                <div>• Pleno (15-20 perguntas)</div>
                <div>• Sênior (20-25 perguntas)</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Recursos Disponíveis</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Entrevista por vídeo
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Análise de voz
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Relatório detalhado
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};
