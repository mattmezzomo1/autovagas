import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyLayout } from '../../components/company/CompanyLayout';
import { TalentProfileModal } from '../../components/company/TalentProfileModal';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Brain, 
  MessageSquare, 
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Award,
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';

export const InterviewReport: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [selectedTalentForModal, setSelectedTalentForModal] = useState<any>(null);

  // Mock data - em produção viria de uma API
  const interviewReport = {
    id: reportId,
    candidate: {
      name: 'João Silva',
      title: 'Desenvolvedor Full Stack',
      avatar: '/api/placeholder/80/80',
      email: 'joao.silva@email.com'
    },
    job: {
      title: 'Desenvolvedor Full Stack Senior',
      department: 'Tecnologia'
    },
    interview: {
      date: '2024-01-15',
      time: '14:00',
      duration: '45 minutos',
      type: 'Técnica',
      interviewer: 'Ana Costa',
      status: 'completed'
    },
    scores: {
      overall: 85,
      technical: 90,
      communication: 80,
      cultural: 85,
      experience: 88
    },
    evaluation: {
      strengths: [
        'Excelente conhecimento em React e Node.js',
        'Boa capacidade de resolução de problemas',
        'Comunicação clara e objetiva',
        'Experiência sólida com metodologias ágeis'
      ],
      weaknesses: [
        'Conhecimento limitado em AWS',
        'Pouca experiência com testes automatizados',
        'Necessita desenvolvimento em liderança'
      ],
      recommendations: [
        'Candidato altamente recomendado para a posição',
        'Considerar plano de desenvolvimento em AWS',
        'Agendar segunda entrevista com o time'
      ]
    },
    questions: [
      {
        question: 'Como você estruturaria uma aplicação React de grande escala?',
        answer: 'Utilizaria uma arquitetura baseada em componentes com Context API para estado global, implementaria lazy loading e code splitting...',
        score: 9,
        feedback: 'Resposta excelente, demonstrou conhecimento profundo'
      },
      {
        question: 'Explique o conceito de middleware no Express.js',
        answer: 'Middleware são funções que têm acesso ao objeto de requisição, resposta e próxima função middleware...',
        score: 8,
        feedback: 'Boa explicação, poderia ter dado mais exemplos práticos'
      },
      {
        question: 'Como você lidaria com um conflito em equipe?',
        answer: 'Primeiro ouviria todas as partes envolvidas, buscaria entender os pontos de vista...',
        score: 7,
        feedback: 'Resposta adequada, mostra maturidade emocional'
      }
    ],
    aiInsights: {
      summary: 'Candidato demonstrou forte competência técnica e boa adequação cultural. Recomendado para próxima fase.',
      confidence: 92,
      keyPoints: [
        'Conhecimento técnico acima da média',
        'Boa capacidade de comunicação',
        'Alinhamento com valores da empresa',
        'Potencial de crescimento elevado'
      ]
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 70) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const viewCandidateProfile = () => {
    // Converter os dados do candidato para o formato esperado pelo TalentProfileModal
    const talentForModal = {
      id: interviewReport.candidate.email,
      name: interviewReport.candidate.name,
      email: interviewReport.candidate.email,
      phone: '(11) 99999-9999',
      location: 'São Paulo, SP',
      profileImage: interviewReport.candidate.avatar,
      currentRole: interviewReport.candidate.title,
      company: 'Não informado',
      experience: 5,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      education: 'Ciência da Computação',
      salaryExpectation: 12000,
      availability: 'looking',
      rating: interviewReport.scores.overall / 20, // Converter de 0-100 para 0-5
      tags: ['entrevistado', 'candidato-ativo'],
      lastContact: interviewReport.interview.date,
      source: 'application',
      notes: `Entrevista realizada em ${interviewReport.interview.date} às ${interviewReport.interview.time}. Score geral: ${interviewReport.scores.overall}%`,
      interactions: {
        emails: 2,
        calls: 1,
        meetings: 1,
        lastInteraction: interviewReport.interview.date
      },
      matchScore: interviewReport.scores.overall,
      status: 'active',
      pipelineStatus: 'entrevista_feita'
    };
    setSelectedTalentForModal(talentForModal);
  };

  return (
    <CompanyLayout
      title="Relatório de Entrevista"
      description={`${interviewReport.candidate.name} • ${interviewReport.job.title}`}
      actions={
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/company')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={viewCandidateProfile}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Perfil Completo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header do Relatório */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              <img
                src={interviewReport.candidate.avatar}
                alt={interviewReport.candidate.name}
                className="w-20 h-20 rounded-full mx-auto sm:mx-0"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">{interviewReport.candidate.name}</h1>
                <p className="text-purple-200 text-lg mb-4">{interviewReport.candidate.title}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(interviewReport.interview.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{interviewReport.interview.time} • {interviewReport.interview.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{interviewReport.interview.interviewer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Entrevista {interviewReport.interview.type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Geral */}
            <div className="flex flex-col items-center gap-2">
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${getScoreBg(interviewReport.scores.overall)} border-2`}>
                <span className="text-2xl font-extrabold">{interviewReport.scores.overall}%</span>
                {interviewReport.scores.overall >= 85 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-800 fill-current" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Score Geral</p>
                <p className="text-white/60 text-sm">Muito Bom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scores Detalhados */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Avaliação por Competência
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(interviewReport.scores).filter(([key]) => key !== 'overall').map(([key, score]) => (
                  <div key={key} className={`p-4 rounded-xl border ${getScoreBg(score)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium capitalize">
                        {key === 'technical' ? 'Técnico' : 
                         key === 'communication' ? 'Comunicação' :
                         key === 'cultural' ? 'Cultural' : 'Experiência'}
                      </span>
                      <span className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perguntas e Respostas */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Perguntas e Respostas
              </h2>
              <div className="space-y-6">
                {interviewReport.questions.map((q, index) => (
                  <div key={index} className="border-l-4 border-blue-500/30 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium text-sm">{q.question}</h3>
                      <span className={`text-lg font-bold ${getScoreColor(q.score * 10)}`}>{q.score}/10</span>
                    </div>
                    <p className="text-white/80 text-sm mb-2 italic">"{q.answer}"</p>
                    <p className="text-blue-300 text-xs">{q.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights da IA */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                Insights da IA
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-emerald-400 font-bold">{interviewReport.aiInsights.confidence}%</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Confiança da Análise</p>
                    <p className="text-emerald-200 text-sm">{interviewReport.aiInsights.summary}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {interviewReport.aiInsights.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-white/80 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pontos Fortes */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-400" />
                Pontos Fortes
              </h2>
              <div className="space-y-2">
                {interviewReport.evaluation.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pontos de Melhoria */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Pontos de Melhoria
              </h2>
              <div className="space-y-2">
                {interviewReport.evaluation.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Recomendações
              </h2>
              <div className="space-y-2">
                {interviewReport.evaluation.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Próximas Ações</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  Aprovar Candidato
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4" />
                  Agendar 2ª Entrevista
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reprovar Candidato
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Talent Profile Modal */}
      <TalentProfileModal
        talent={selectedTalentForModal}
        isOpen={!!selectedTalentForModal}
        onClose={() => setSelectedTalentForModal(null)}
        onUpdate={(updatedTalent) => {
          // Aqui você pode atualizar os dados do candidato se necessário
          setSelectedTalentForModal(null);
        }}
      />
    </CompanyLayout>
  );
};
