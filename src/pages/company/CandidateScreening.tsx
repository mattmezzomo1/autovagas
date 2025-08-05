import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { AIScreeningConfig } from '../../components/company/AIScreeningConfig';
import { CandidateAnalysisModal } from '../../components/company/CandidateAnalysisModal';
import {
  ArrowLeft, Brain, Users, Filter, Search, Star, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, MessageSquare, Download,
  BarChart3, Target, Zap, Settings, RefreshCw, Play
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage?: string;
  resumeUrl?: string;
  appliedAt: string;
  status: 'pending' | 'screening' | 'approved' | 'rejected';
  aiScore: number;
  matchPercentage: number;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    skillsMatch: {
      skill: string;
      required: boolean;
      hasSkill: boolean;
      proficiency: number;
    }[];
    experienceMatch: {
      required: number;
      candidate: number;
      match: boolean;
    };
    culturalFit: number;
    overallAssessment: string;
  };
  screeningCriteria: {
    education: boolean;
    experience: boolean;
    skills: boolean;
    location: boolean;
    salary: boolean;
  };
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  salaryMin: number;
  salaryMax: number;
}

export const CandidateScreening: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isScreening, setIsScreening] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockJob: Job = {
      id: jobId || '1',
      title: 'Desenvolvedor Full Stack Senior',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      requirements: ['5+ anos de experiência', 'React', 'Node.js', 'TypeScript'],
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      experienceYears: 5,
      salaryMin: 8000,
      salaryMax: 12000
    };

    const mockCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-9999',
        location: 'São Paulo, SP',
        appliedAt: '2024-01-15T10:30:00Z',
        status: 'pending',
        aiScore: 92,
        matchPercentage: 88,
        aiAnalysis: {
          strengths: ['Experiência sólida em React', 'Conhecimento avançado em TypeScript', 'Experiência com AWS'],
          weaknesses: ['Pouca experiência com testes automatizados', 'Não menciona experiência com PostgreSQL'],
          recommendations: ['Avaliar conhecimento em banco de dados', 'Verificar experiência com metodologias ágeis'],
          skillsMatch: [
            { skill: 'React', required: true, hasSkill: true, proficiency: 90 },
            { skill: 'Node.js', required: true, hasSkill: true, proficiency: 85 },
            { skill: 'TypeScript', required: true, hasSkill: true, proficiency: 95 },
            { skill: 'PostgreSQL', required: false, hasSkill: false, proficiency: 0 },
            { skill: 'AWS', required: false, hasSkill: true, proficiency: 80 }
          ],
          experienceMatch: { required: 5, candidate: 6, match: true },
          culturalFit: 85,
          overallAssessment: 'Candidata altamente qualificada com excelente match técnico. Recomendada para próxima etapa.'
        },
        screeningCriteria: {
          education: true,
          experience: true,
          skills: true,
          location: true,
          salary: true
        }
      },
      {
        id: '2',
        name: 'Carlos Santos',
        email: 'carlos.santos@email.com',
        phone: '(11) 88888-8888',
        location: 'Rio de Janeiro, RJ',
        appliedAt: '2024-01-14T14:20:00Z',
        status: 'screening',
        aiScore: 76,
        matchPercentage: 72,
        aiAnalysis: {
          strengths: ['Boa experiência em Node.js', 'Conhecimento em metodologias ágeis'],
          weaknesses: ['Experiência limitada com React', 'Localização distante'],
          recommendations: ['Avaliar disponibilidade para mudança', 'Testar conhecimentos em React'],
          skillsMatch: [
            { skill: 'React', required: true, hasSkill: true, proficiency: 60 },
            { skill: 'Node.js', required: true, hasSkill: true, proficiency: 90 },
            { skill: 'TypeScript', required: true, hasSkill: true, proficiency: 70 },
            { skill: 'PostgreSQL', required: false, hasSkill: true, proficiency: 85 },
            { skill: 'AWS', required: false, hasSkill: false, proficiency: 0 }
          ],
          experienceMatch: { required: 5, candidate: 4, match: false },
          culturalFit: 78,
          overallAssessment: 'Candidato com potencial, mas com algumas lacunas técnicas e geográficas.'
        },
        screeningCriteria: {
          education: true,
          experience: false,
          skills: true,
          location: false,
          salary: true
        }
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 77777-7777',
        location: 'São Paulo, SP',
        appliedAt: '2024-01-13T09:15:00Z',
        status: 'approved',
        aiScore: 95,
        matchPercentage: 94,
        aiAnalysis: {
          strengths: ['Experiência excepcional', 'Todas as skills técnicas', 'Liderança técnica'],
          weaknesses: ['Pode estar overqualified', 'Expectativa salarial alta'],
          recommendations: ['Verificar interesse real na posição', 'Discutir plano de carreira'],
          skillsMatch: [
            { skill: 'React', required: true, hasSkill: true, proficiency: 95 },
            { skill: 'Node.js', required: true, hasSkill: true, proficiency: 90 },
            { skill: 'TypeScript', required: true, hasSkill: true, proficiency: 90 },
            { skill: 'PostgreSQL', required: false, hasSkill: true, proficiency: 85 },
            { skill: 'AWS', required: false, hasSkill: true, proficiency: 90 }
          ],
          experienceMatch: { required: 5, candidate: 8, match: true },
          culturalFit: 92,
          overallAssessment: 'Candidata excepcional com match perfeito. Altamente recomendada.'
        },
        screeningCriteria: {
          education: true,
          experience: true,
          skills: true,
          location: true,
          salary: true
        }
      }
    ];

    setJob(mockJob);
    setCandidates(mockCandidates);
    setFilteredCandidates(mockCandidates);
    setIsLoading(false);
  }, [jobId]);

  // Filter candidates based on search and filters
  useEffect(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (scoreFilter !== 'all') {
      switch (scoreFilter) {
        case 'high':
          filtered = filtered.filter(candidate => candidate.aiScore >= 80);
          break;
        case 'medium':
          filtered = filtered.filter(candidate => candidate.aiScore >= 60 && candidate.aiScore < 80);
          break;
        case 'low':
          filtered = filtered.filter(candidate => candidate.aiScore < 60);
          break;
      }
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, statusFilter, scoreFilter]);

  const handleBulkScreening = async () => {
    setIsScreening(true);
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Atualizar status dos candidatos pendentes
    setCandidates(prev => prev.map(candidate => 
      candidate.status === 'pending' 
        ? { ...candidate, status: candidate.aiScore >= 75 ? 'approved' : 'rejected' as any }
        : candidate
    ));
    
    setIsScreening(false);
  };

  const handleAIConfigSave = (criteria: any) => {
    console.log('Salvando configuração da IA:', criteria);
    // Aqui seria feita a chamada para a API para salvar as configurações
  };

  const handleApproveCandidate = (candidateId: string) => {
    setCandidates(prev => prev.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, status: 'approved' as any }
        : candidate
    ));
    setSelectedCandidate(null);
  };

  const handleRejectCandidate = (candidateId: string) => {
    setCandidates(prev => prev.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, status: 'rejected' as any }
        : candidate
    ));
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'screening': return 'text-blue-400 bg-blue-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'screening': return 'Triagem';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <CompanyLayout title="Carregando..." description="">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout
      title={`Triagem IA - ${job?.title}`}
      description="Classificação automática de candidatos com inteligência artificial"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/company/jobs')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleBulkScreening}
            disabled={isScreening || candidates.filter(c => c.status === 'pending').length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScreening ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processando IA...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Executar Triagem IA
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Job Summary */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Resumo da Vaga</h2>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{candidates.length} candidatos</span>
              <span>•</span>
              <span>{candidates.filter(c => c.status === 'pending').length} pendentes</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-white mb-2">Requisitos Principais</h3>
              <div className="space-y-1">
                {job?.requirements.slice(0, 3).map((req, index) => (
                  <div key={index} className="text-sm text-white/70">• {req}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Skills Técnicas</h3>
              <div className="flex flex-wrap gap-1">
                {job?.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Critérios</h3>
              <div className="text-sm text-white/70">
                <div>Experiência: {job?.experienceYears}+ anos</div>
                <div>Localização: {job?.location}</div>
                <div>Salário: R$ {job?.salaryMin?.toLocaleString()} - R$ {job?.salaryMax?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar candidatos..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="screening">Em Triagem</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>

              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Notas</option>
                <option value="high">Alta (80+)</option>
                <option value="medium">Média (60-79)</option>
                <option value="low">Baixa (&lt;60)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{candidates.length}</div>
                <div className="text-xs text-white/60">Total</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {candidates.filter(c => c.status === 'approved').length}
                </div>
                <div className="text-xs text-white/60">Aprovados</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {candidates.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-xs text-white/60">Pendentes</div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {Math.round(candidates.reduce((acc, c) => acc + c.aiScore, 0) / candidates.length)}
                </div>
                <div className="text-xs text-white/60">Nota Média</div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Candidatos ({filteredCandidates.length})
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => setShowAIConfig(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                Configurar IA
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{candidate.name}</h3>
                      <p className="text-white/60 text-sm">{candidate.email}</p>
                      <p className="text-white/50 text-xs">{candidate.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(candidate.aiScore)}`}>
                        {candidate.aiScore}
                      </div>
                      <div className="text-xs text-white/60">Score IA</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getScoreColor(candidate.matchPercentage)}`}>
                        {candidate.matchPercentage}%
                      </div>
                      <div className="text-xs text-white/60">Match</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {getStatusLabel(candidate.status)}
                    </span>
                  </div>
                </div>

                {/* AI Analysis Summary */}
                <div className="mb-4">
                  <p className="text-white/80 text-sm mb-3">{candidate.aiAnalysis.overallAssessment}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-green-400 text-xs font-medium mb-2">Pontos Fortes</h4>
                      <ul className="space-y-1">
                        {candidate.aiAnalysis.strengths.slice(0, 2).map((strength, index) => (
                          <li key={index} className="text-white/60 text-xs">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-xs font-medium mb-2">Pontos de Atenção</h4>
                      <ul className="space-y-1">
                        {candidate.aiAnalysis.weaknesses.slice(0, 2).map((weakness, index) => (
                          <li key={index} className="text-white/60 text-xs">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-blue-400 text-xs font-medium mb-2">Skills Match</h4>
                      <div className="flex flex-wrap gap-1">
                        {candidate.aiAnalysis.skillsMatch.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded ${
                              skill.hasSkill
                                ? 'bg-green-500/20 text-green-200'
                                : 'bg-red-500/20 text-red-200'
                            }`}
                          >
                            {skill.skill} {skill.hasSkill && `(${skill.proficiency}%)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Análise
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm">
                      <MessageSquare className="w-4 h-4" />
                      Contatar
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {candidate.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveCandidate(candidate.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejectCandidate(candidate.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum candidato encontrado</h3>
              <p className="text-white/60">Tente ajustar os filtros ou aguarde novos candidatos</p>
            </div>
          )}
        </div>

        {/* AI Configuration Modal */}
        <AIScreeningConfig
          isOpen={showAIConfig}
          onClose={() => setShowAIConfig(false)}
          onSave={handleAIConfigSave}
        />

        {/* Candidate Analysis Modal */}
        <CandidateAnalysisModal
          candidate={selectedCandidate}
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onApprove={handleApproveCandidate}
          onReject={handleRejectCandidate}
        />
      </div>
    </CompanyLayout>
  );
};
