import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Clock,
  Star,
  Play,
  Square,
  BarChart3,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { interviewAIService, InterviewSession, InterviewMessage, InterviewScore } from '../services/interviewAI.service';

export const InterviewChat: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [finalScore, setFinalScore] = useState<InterviewScore | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados para configuração da entrevista
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'general'>('general');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState<'junior' | 'mid' | 'senior'>('mid');

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartInterview = async () => {
    if (!position.trim() || !company.trim()) {
      alert('Por favor, preencha a posição e empresa');
      return;
    }

    setIsLoading(true);
    try {
      const session = await interviewAIService.startInterviewSession(
        interviewType,
        position,
        company,
        difficulty,
        profile
      );

      setCurrentSession(session);
      setIsSessionActive(true);
      setShowStartModal(false);
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      alert('Erro ao iniciar entrevista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentSession || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      await interviewAIService.sendMessage(currentSession.id, userMessage);

      // Recarregar sessão atualizada
      const updatedSession = interviewAIService.getRecentSessions()
        .find(s => s.id === currentSession.id);

      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!currentSession) return;

    setIsLoading(true);
    try {
      const score = await interviewAIService.endInterviewSession(currentSession.id);
      setFinalScore(score);
      setIsSessionActive(false);
      setShowScoreModal(true);
    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
      alert('Erro ao finalizar entrevista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionDuration = () => {
    if (!currentSession) return '0min';

    const start = new Date(currentSession.startTime);
    const end = currentSession.endTime ? new Date(currentSession.endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);

    return `${duration}min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Treinamento de Entrevista com IA</h1>
              <p className="text-purple-200">Pratique suas habilidades de entrevista com nossa IA especializada</p>
            </div>

            {currentSession && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-purple-300">Duração</div>
                  <div className="text-white font-medium">{getSessionDuration()}</div>
                </div>

                {isSessionActive ? (
                  <button
                    onClick={handleEndInterview}
                    disabled={isLoading}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                    Finalizar
                  </button>
                ) : (
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Pontuação
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Container */}
        {currentSession ? (
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            {/* Session Info */}
            <div className="bg-black/30 border-b border-white/10 p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    Entrevista {currentSession.type} - {currentSession.position}
                  </h3>
                  <p className="text-purple-200 text-sm">
                    {currentSession.company} • Nível {currentSession.difficulty}
                  </p>
                </div>
                <div className={`ml-auto px-3 py-1 rounded-full text-sm ${
                  isSessionActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {isSessionActive ? 'Em andamento' : 'Finalizada'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md ${
                    msg.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-100'
                  } rounded-2xl p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {msg.role === 'user' ? 'Você' : 'Entrevistador IA'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-purple-100 rounded-2xl p-4 max-w-md">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs font-medium">Entrevistador IA</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isSessionActive && (
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua resposta..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !message.trim()}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhuma entrevista ativa</h3>
            <p className="text-purple-200 mb-6">Inicie uma nova sessão de treinamento para praticar suas habilidades.</p>
            <button
              onClick={() => setShowStartModal(true)}
              className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Iniciar Entrevista
            </button>
          </div>
        )}
      </div>

      {/* Start Interview Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Configurar Entrevista</h2>
              <p className="text-purple-200 text-sm">Configure os detalhes da sua entrevista simulada</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Tipo de Entrevista
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="general">Geral</option>
                  <option value="technical">Técnica</option>
                  <option value="behavioral">Comportamental</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Posição
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: TechCorp Inc."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Nível de Dificuldade
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="junior">Júnior</option>
                  <option value="mid">Pleno</option>
                  <option value="senior">Sênior</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 btn-secondary px-4 py-3"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartInterview}
                disabled={isLoading || !position.trim() || !company.trim()}
                className="flex-1 btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {isLoading ? 'Iniciando...' : 'Iniciar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && finalScore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full my-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Resultado da Entrevista</h2>
              <p className="text-purple-200 text-sm">Aqui está sua pontuação e feedback detalhado</p>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${getScoreColor(finalScore.overall)} mb-2`}>
                {finalScore.overall}/100
              </div>
              <div className="text-purple-200">Pontuação Geral</div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalScore.technical)}`}>
                  {finalScore.technical}
                </div>
                <div className="text-purple-200 text-sm">Técnico</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalScore.communication)}`}>
                  {finalScore.communication}
                </div>
                <div className="text-purple-200 text-sm">Comunicação</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalScore.problemSolving)}`}>
                  {finalScore.problemSolving}
                </div>
                <div className="text-purple-200 text-sm">Resolução</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(finalScore.confidence)}`}>
                  {finalScore.confidence}
                </div>
                <div className="text-purple-200 text-sm">Confiança</div>
              </div>
            </div>

            {/* Feedback Sections */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Pontos Fortes
                </h3>
                <ul className="space-y-1">
                  {finalScore.strengths.map((strength, index) => (
                    <li key={index} className="text-purple-200 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Áreas para Melhoria
                </h3>
                <ul className="space-y-1">
                  {finalScore.improvements.map((improvement, index) => (
                    <li key={index} className="text-purple-200 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Feedback Geral
                </h3>
                <ul className="space-y-1">
                  {finalScore.feedback.map((feedback, index) => (
                    <li key={index} className="text-purple-200 text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      {feedback}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setCurrentSession(null);
                  setFinalScore(null);
                }}
                className="flex-1 btn-secondary px-4 py-3"
              >
                Nova Entrevista
              </button>
              <button
                onClick={() => setShowScoreModal(false)}
                className="flex-1 btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-3"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
