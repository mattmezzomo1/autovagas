import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, Star, MessageSquare, Download, Filter, SlidersHorizontal, ChevronDown, Bot, Briefcase, MapPin, Building2, Brain, Calendar, Eye } from 'lucide-react';
import { InterviewScheduler } from '../components/company/InterviewScheduler';
import { TalentProfileModal } from '../components/company/TalentProfileModal';

export const JobCandidates: React.FC = () => {
  const { id } = useParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [showScheduler, setShowScheduler] = useState(false);
  const [candidateToSchedule, setCandidateToSchedule] = useState<any>(null);
  const [selectedTalentForModal, setSelectedTalentForModal] = useState<any>(null);
  const navigate = useNavigate();

  const handleSendMessage = () => {
    navigate('/company/chat');
  };

  const handleScheduleInterview = (candidate: any) => {
    setCandidateToSchedule(candidate);
    setShowScheduler(true);
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    console.log('Entrevista agendada para candidato da vaga:', scheduleData);
    setShowScheduler(false);
    setCandidateToSchedule(null);
    // Aqui você pode atualizar o status do candidato ou fazer outras ações necessárias
  };

  const viewProfile = (candidate: any) => {
    // Converter o formato do candidato para o formato esperado pelo TalentProfileModal
    const talentForModal = {
      id: candidate.id.toString(),
      name: candidate.name,
      email: candidate.email || `${candidate.name.toLowerCase().replace(' ', '.')}@email.com`,
      phone: '(11) 99999-9999',
      location: candidate.location,
      profileImage: undefined,
      currentRole: candidate.title,
      company: 'Não informado',
      experience: parseInt(candidate.experience) || 0,
      skills: candidate.skills || [],
      education: 'Não informado',
      salaryExpectation: 0,
      availability: 'looking',
      rating: candidate.match / 20, // Converter match de 0-100 para 0-5
      tags: [],
      lastContact: new Date().toISOString(),
      source: 'application',
      notes: `Candidato aplicou para a vaga há ${candidate.appliedAt}`,
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
  };

  const candidates = [
    {
      id: 1,
      name: 'João Silva',
      title: 'Desenvolvedor Full Stack Senior',
      location: 'São Paulo, SP',
      experience: '8 anos',
      match: 95,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      status: 'new',
      appliedAt: '2 dias atrás',
    },
    {
      id: 2,
      name: 'Maria Santos',
      title: 'Tech Lead',
      location: 'Rio de Janeiro, RJ',
      experience: '10 anos',
      match: 92,
      skills: ['React', 'Python', 'AWS', 'Docker'],
      status: 'reviewing',
      appliedAt: '3 dias atrás',
    },
    {
      id: 3,
      name: 'Pedro Costa',
      title: 'Desenvolvedor Full Stack',
      location: 'Curitiba, PR',
      experience: '6 anos',
      match: 88,
      skills: ['React', 'Node.js', 'MongoDB'],
      status: 'contacted',
      appliedAt: '5 dias atrás',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'reviewing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'contacted':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo';
      case 'reviewing':
        return 'Em análise';
      case 'contacted':
        return 'Contatado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/company"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Desenvolvedor Full Stack Senior</h1>
                    <div className="flex items-center gap-4 text-purple-200 mt-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        TechCorp Inc.
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        São Paulo, SP
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        48 candidatos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn-primary">
                <Bot className="w-5 h-5" />
                Buscar mais candidatos com IA
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Buscar candidatos..."
              className="w-full bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 pl-12 pr-4 py-3 text-purple-100 placeholder:text-purple-300/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn-secondary px-4"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
            <div className="relative">
              <button className="btn-secondary px-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Ordenar por
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white truncate">{candidate.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(candidate.status)}`}>
                          {getStatusText(candidate.status)}
                        </span>
                      </div>
                      <p className="text-purple-200 truncate">{candidate.title}</p>
                    </div>

                    {/* Match Score - Mais em evidência */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 ml-4">
                      <div className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                        candidate.match >= 90
                          ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-emerald-300/50'
                          : candidate.match >= 80
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-blue-300/50'
                          : 'bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300/50'
                      }`}>
                        <span className="text-sm sm:text-base font-extrabold">{candidate.match}%</span>
                        {candidate.match >= 90 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-yellow-800 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">match</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-purple-200 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience}
                    </div>
                    <div className="text-purple-300">
                      Aplicou {candidate.appliedAt}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-500/10 text-purple-200 rounded-full text-sm border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => viewProfile(candidate)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <Eye className="w-4 h-4" />
                      Ver perfil completo
                    </button>
                    <button
                      onClick={() => handleScheduleInterview(candidate)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <Calendar className="w-4 h-4" />
                      Agendar Entrevista
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="btn-primary px-4 py-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Enviar mensagem
                    </button>
                    <button className="btn-secondary px-4 py-2">
                      <Download className="w-4 h-4" />
                      Baixar currículo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          id: candidateToSchedule.id.toString(),
          name: candidateToSchedule.name,
          email: candidateToSchedule.email || `${candidateToSchedule.name.toLowerCase().replace(' ', '.')}@email.com`,
          currentRole: candidateToSchedule.title
        } : null}
        onSchedule={handleScheduleConfirm}
      />
    </div>
  );
};