import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { TalentProfileModal } from '../../components/company/TalentProfileModal';
import { InterviewScheduler } from '../../components/company/InterviewScheduler';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  MessageSquare,
  Heart,
  Brain,
  Users,
  TrendingUp,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';

export const CompanyCandidates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMatchAnalysis, setShowMatchAnalysis] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedTalentForModal, setSelectedTalentForModal] = useState<any>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState<any>(null);

  // Mock data das vagas
  const jobs = [
    { id: '1', title: 'Desenvolvedor Full Stack Senior', department: 'Tecnologia' },
    { id: '2', title: 'Product Manager', department: 'Produto' },
    { id: '3', title: 'Designer UX/UI', department: 'Design' },
    { id: '4', title: 'Analista de Marketing', department: 'Marketing' }
  ];

  const candidates = [
    {
      id: '1',
      name: 'João Silva',
      title: 'Desenvolvedor Full Stack',
      location: 'São Paulo, SP',
      experience: 5,
      skills: ['React', 'Node.js', 'TypeScript'],
      aiScore: 92,
      status: 'new',
      appliedAt: '2024-01-15',
      avatar: '/api/placeholder/40/40',
      appliedJob: {
        id: '1',
        title: 'Desenvolvedor Full Stack Senior',
        department: 'Tecnologia'
      },
      matchAnalysis: {
        overall: 92,
        requirements: [
          {
            requirement: 'React com 3+ anos de experiência',
            candidateLevel: 'React com 4 anos de experiência',
            score: 100,
            status: 'excellent'
          },
          {
            requirement: 'Node.js com 3+ anos de experiência',
            candidateLevel: 'Node.js com 4 anos de experiência',
            score: 100,
            status: 'excellent'
          },
          {
            requirement: 'TypeScript avançado',
            candidateLevel: 'TypeScript intermediário/avançado',
            score: 85,
            status: 'good'
          },
          {
            requirement: 'Inglês avançado',
            candidateLevel: 'Inglês intermediário',
            score: 70,
            status: 'partial'
          },
          {
            requirement: 'Experiência com AWS',
            candidateLevel: 'Sem experiência comprovada',
            score: 30,
            status: 'poor'
          }
        ]
      }
    },
    {
      id: '2',
      name: 'Maria Santos',
      title: 'Product Manager',
      location: 'Rio de Janeiro, RJ',
      experience: 7,
      skills: ['Product Strategy', 'Analytics', 'Agile'],
      aiScore: 88,
      status: 'reviewed',
      appliedAt: '2024-01-14',
      avatar: '/api/placeholder/40/40',
      appliedJob: {
        id: '2',
        title: 'Product Manager',
        department: 'Produto'
      },
      matchAnalysis: {
        overall: 88,
        requirements: [
          {
            requirement: 'Experiência em Product Management 5+ anos',
            candidateLevel: '7 anos de experiência',
            score: 100,
            status: 'excellent'
          },
          {
            requirement: 'Conhecimento em Analytics',
            candidateLevel: 'Forte experiência em Analytics',
            score: 95,
            status: 'excellent'
          },
          {
            requirement: 'Metodologias Ágeis',
            candidateLevel: 'Experiência com Scrum e Kanban',
            score: 90,
            status: 'excellent'
          },
          {
            requirement: 'Liderança de equipes',
            candidateLevel: 'Liderou equipes de até 5 pessoas',
            score: 80,
            status: 'good'
          },
          {
            requirement: 'MBA ou pós-graduação',
            candidateLevel: 'Graduação em Administração',
            score: 60,
            status: 'partial'
          }
        ]
      }
    }
  ];

  // Funções dos botões
  const toggleFavorite = (candidateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(candidateId)) {
        newFavorites.delete(candidateId);
      } else {
        newFavorites.add(candidateId);
      }
      return newFavorites;
    });
  };

  const openChat = (candidate: any) => {
    // Navegar para o chat com o candidato
    navigate(`/company/chat/${candidate.id}`, {
      state: {
        candidateName: candidate.name,
        candidateTitle: candidate.title,
        candidateAvatar: candidate.avatar
      }
    });
  };

  const viewProfile = (candidateId: string) => {
    // Encontrar o candidato e abrir o modal
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      // Converter o formato do candidato para o formato esperado pelo TalentProfileModal
      const talentForModal = {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || '(11) 99999-9999',
        location: candidate.location,
        profileImage: candidate.avatar,
        currentRole: candidate.title,
        company: candidate.company || 'Não informado',
        experience: candidate.experience || 0,
        skills: candidate.skills || [],
        education: candidate.education || 'Não informado',
        salaryExpectation: candidate.salaryExpectation || 0,
        availability: 'looking',
        rating: candidate.rating || 0,
        tags: candidate.tags || [],
        lastContact: new Date().toISOString(),
        source: 'application',
        notes: candidate.notes || '',
        interactions: {
          emails: 0,
          calls: 0,
          meetings: 0,
          lastInteraction: new Date().toISOString()
        },
        matchScore: candidate.match,
        status: 'active',
        pipelineStatus: 'inscrito'
      };
      setSelectedTalentForModal(talentForModal);
    }
  };

  const openMatchAnalysis = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowMatchAnalysis(true);
  };

  const handleScheduleInterview = (candidate: any) => {
    setCandidateToSchedule(candidate);
    setShowScheduler(true);
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    // Aqui você pode atualizar o status do candidato
    console.log('Entrevista agendada:', scheduleData);
    setShowScheduler(false);
    setCandidateToSchedule(null);
  };

  const closeMatchAnalysis = () => {
    setShowMatchAnalysis(false);
    setSelectedCandidate(null);
  };

  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesJob = filterJob === 'all' || candidate.appliedJob.id === filterJob;

    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <CompanyLayout
      title="Banco de Candidatos"
      description="Gerencie todos os candidatos da sua empresa"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar candidatos por nome, cargo ou skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
              >
                <option value="all" className="bg-slate-800">Todas as vagas</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id} className="bg-slate-800">
                    {job.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-slate-800">Todos os status</option>
                <option value="new" className="bg-slate-800">Novos</option>
                <option value="reviewed" className="bg-slate-800">Analisados</option>
                <option value="interviewed" className="bg-slate-800">Entrevistados</option>
                <option value="hired" className="bg-slate-800">Contratados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total de Candidatos</p>
                <p className="text-2xl font-bold text-white">248</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Score Médio IA</p>
                <p className="text-2xl font-bold text-white">85</p>
              </div>
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-white">12.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Candidatos ({filteredCandidates.length})
                {filterJob !== 'all' && (
                  <span className="text-purple-400 text-base font-normal ml-2">
                    • {jobs.find(job => job.id === filterJob)?.title}
                  </span>
                )}
              </h2>
              {favorites.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                  <span className="text-red-400 text-sm font-medium">
                    {favorites.size} favorito{favorites.size !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">{candidate.name}</h3>
                            {/* Badge da Vaga Aplicada */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex-shrink-0">
                              <Briefcase className="w-3 h-3 text-indigo-400" />
                              <span className="text-indigo-400 text-xs font-medium truncate max-w-[150px]">
                                {candidate.appliedJob.title}
                              </span>
                            </div>
                          </div>
                          <p className="text-white/80 mb-2 truncate">{candidate.title}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {candidate.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {candidate.experience} anos
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs hover:bg-purple-500/30 transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* AI Score - Mais em evidência e clicável */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openMatchAnalysis(candidate)}
                            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-white shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer ${
                              candidate.aiScore >= 90
                                ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-emerald-300/50 hover:from-emerald-300 hover:to-green-400'
                                : candidate.aiScore >= 80
                                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-blue-300/50 hover:from-blue-300 hover:to-indigo-400'
                                : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300/50 hover:from-yellow-300 hover:to-orange-400'
                            }`}
                            title="Clique para ver análise detalhada"
                          >
                            <span className="text-xs sm:text-sm font-extrabold">{candidate.aiScore}%</span>
                            {candidate.aiScore >= 90 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                              </div>
                            )}
                          </button>
                          <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">IA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {/* Botão Favoritar */}
                    <button
                      onClick={() => toggleFavorite(candidate.id)}
                      className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        favorites.has(candidate.id)
                          ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                          : 'text-white/60 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title={favorites.has(candidate.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      aria-label={favorites.has(candidate.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(candidate.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Botão Chat */}
                    <button
                      onClick={() => openChat(candidate)}
                      className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title={`Conversar com ${candidate.name}`}
                      aria-label={`Conversar com ${candidate.name}`}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>

                    {/* Botão Agendar Entrevista */}
                    <button
                      onClick={() => handleScheduleInterview(candidate)}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      aria-label={`Agendar entrevista com ${candidate.name}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Agendar</span>
                    </button>

                    {/* Botão Ver Perfil */}
                    <button
                      onClick={() => viewProfile(candidate.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label={`Ver perfil de ${candidate.name}`}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver Perfil</span>
                      <span className="sm:hidden">Perfil</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Análise Detalhada do Match */}
        {showMatchAnalysis && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                    selectedCandidate.aiScore >= 90
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                      : selectedCandidate.aiScore >= 80
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                      : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  }`}>
                    <span className="text-lg font-extrabold">{selectedCandidate.aiScore}%</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Análise Detalhada do Match</h2>
                    <p className="text-white/60">{selectedCandidate.name} • {selectedCandidate.appliedJob.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeMatchAnalysis}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-emerald-400" />
                      Resumo da Análise
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      A IA analisou {selectedCandidate.matchAnalysis.requirements.length} requisitos principais da vaga
                      e determinou um match de <span className="text-emerald-400 font-semibold">{selectedCandidate.aiScore}%</span>
                      baseado na experiência, skills e perfil do candidato.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Análise por Requisito:</h3>
                    {selectedCandidate.matchAnalysis.requirements.map((req: any, index: number) => {
                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'excellent':
                            return <CheckCircle className="w-5 h-5 text-emerald-400" />;
                          case 'good':
                            return <CheckCircle className="w-5 h-5 text-blue-400" />;
                          case 'partial':
                            return <AlertCircle className="w-5 h-5 text-yellow-400" />;
                          case 'poor':
                            return <XCircle className="w-5 h-5 text-red-400" />;
                          default:
                            return <AlertCircle className="w-5 h-5 text-gray-400" />;
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'excellent':
                            return 'border-emerald-500/30 bg-emerald-500/10';
                          case 'good':
                            return 'border-blue-500/30 bg-blue-500/10';
                          case 'partial':
                            return 'border-yellow-500/30 bg-yellow-500/10';
                          case 'poor':
                            return 'border-red-500/30 bg-red-500/10';
                          default:
                            return 'border-gray-500/30 bg-gray-500/10';
                        }
                      };

                      return (
                        <div
                          key={index}
                          className={`rounded-xl p-4 border ${getStatusColor(req.status)}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(req.status)}
                                <h4 className="text-white font-medium text-sm">
                                  {req.requirement}
                                </h4>
                              </div>
                              <p className="text-white/80 text-sm mb-2">
                                <span className="text-white/60">Candidato possui:</span> {req.candidateLevel}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                req.score >= 90 ? 'text-emerald-400' :
                                req.score >= 70 ? 'text-blue-400' :
                                req.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {req.score}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recomendações da IA */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                      Recomendações da IA
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedCandidate.aiScore >= 90 ? (
                        <>
                          <p className="text-emerald-200">✅ <strong>Candidato altamente recomendado!</strong></p>
                          <p className="text-white/80">• Agendar entrevista prioritária</p>
                          <p className="text-white/80">• Verificar disponibilidade para início</p>
                          <p className="text-white/80">• Preparar proposta competitiva</p>
                        </>
                      ) : selectedCandidate.aiScore >= 80 ? (
                        <>
                          <p className="text-blue-200">🔍 <strong>Candidato promissor com potencial</strong></p>
                          <p className="text-white/80">• Realizar entrevista técnica detalhada</p>
                          <p className="text-white/80">• Avaliar gaps de conhecimento</p>
                          <p className="text-white/80">• Considerar plano de desenvolvimento</p>
                        </>
                      ) : (
                        <>
                          <p className="text-yellow-200">⚠️ <strong>Candidato requer avaliação cuidadosa</strong></p>
                          <p className="text-white/80">• Focar em pontos fortes durante entrevista</p>
                          <p className="text-white/80">• Avaliar capacidade de aprendizado</p>
                          <p className="text-white/80">• Considerar para posições júnior/trainee</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Talent Profile Modal */}
        <TalentProfileModal
          talent={selectedTalentForModal}
          isOpen={!!selectedTalentForModal}
          onClose={() => setSelectedTalentForModal(null)}
          onUpdate={(updatedTalent) => {
            // Aqui você pode atualizar o candidato na lista se necessário
            setSelectedTalentForModal(null);
          }}
        />

        {/* Interview Scheduler */}
        <InterviewScheduler
          isOpen={showScheduler}
          onClose={() => {
            setShowScheduler(false);
            setCandidateToSchedule(null);
          }}
          candidate={candidateToSchedule ? {
            id: candidateToSchedule.id,
            name: candidateToSchedule.name,
            email: candidateToSchedule.email,
            currentRole: candidateToSchedule.title
          } : null}
          onSchedule={handleScheduleConfirm}
        />
      </div>
    </CompanyLayout>
  );
};
