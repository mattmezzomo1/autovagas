import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MobileLayout } from '../components/layout/MobileLayout';
import {
  Brain, Clock, Star, Award, ChevronRight, Play, Pause, 
  RotateCcw, CheckCircle, AlertCircle, Mic, MicOff,
  Upload, FileText, MessageSquare, Target, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Question {
  id: number;
  type: 'text' | 'multiple_choice' | 'audio' | 'file';
  category: 'technical' | 'behavioral' | 'situational' | 'company';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  timeLimit: number; // em segundos
  points: number;
}

interface InterviewSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
}

export const InterviewSimulation: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Mock interview sessions
  const interviewSessions: InterviewSession[] = [
    {
      id: 'frontend-dev',
      title: 'Desenvolvedor Frontend',
      description: 'Entrevista focada em React, JavaScript e desenvolvimento frontend',
      duration: 30,
      totalQuestions: 15,
      categories: ['Técnico', 'Comportamental'],
      difficulty: 'intermediate',
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          category: 'technical',
          difficulty: 'medium',
          question: 'Qual é a principal diferença entre useState e useEffect no React?',
          options: [
            'useState gerencia estado, useEffect gerencia efeitos colaterais',
            'useState é para componentes funcionais, useEffect para classes',
            'useState é síncrono, useEffect é assíncrono',
            'Não há diferença significativa'
          ],
          timeLimit: 60,
          points: 10
        },
        {
          id: 2,
          type: 'text',
          category: 'behavioral',
          difficulty: 'medium',
          question: 'Descreva uma situação onde você teve que resolver um problema técnico complexo. Como você abordou?',
          timeLimit: 180,
          points: 15
        },
        {
          id: 3,
          type: 'audio',
          category: 'situational',
          difficulty: 'hard',
          question: 'Explique como você organizaria o desenvolvimento de uma nova feature em um projeto com prazo apertado.',
          timeLimit: 120,
          points: 20
        }
      ]
    },
    {
      id: 'fullstack-dev',
      title: 'Desenvolvedor Full Stack',
      description: 'Entrevista abrangente cobrindo frontend, backend e arquitetura',
      duration: 45,
      totalQuestions: 20,
      categories: ['Técnico', 'Arquitetura', 'Comportamental'],
      difficulty: 'advanced',
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          category: 'technical',
          difficulty: 'hard',
          question: 'Qual padrão de arquitetura é mais adequado para microserviços?',
          options: [
            'MVC (Model-View-Controller)',
            'Event-Driven Architecture',
            'Layered Architecture',
            'Hexagonal Architecture'
          ],
          timeLimit: 90,
          points: 15
        }
      ]
    },
    {
      id: 'product-manager',
      title: 'Gerente de Produto',
      description: 'Entrevista focada em estratégia, análise e gestão de produtos',
      duration: 40,
      totalQuestions: 12,
      categories: ['Estratégia', 'Análise', 'Liderança'],
      difficulty: 'intermediate',
      questions: [
        {
          id: 1,
          type: 'text',
          category: 'behavioral',
          difficulty: 'medium',
          question: 'Como você priorizaria features em um roadmap de produto com recursos limitados?',
          timeLimit: 240,
          points: 25
        }
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  const startSession = (session: InterviewSession) => {
    setCurrentSession(session);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(session.questions[0]?.timeLimit || 60);
    setIsActive(true);
    setIsPaused(false);
    setSessionCompleted(false);
    setScore(null);
  };

  const handleAnswer = (answer: any) => {
    if (!currentSession) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentSession.questions[currentQuestionIndex].id]: answer
    }));
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    
    if (currentQuestionIndex < currentSession.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(currentSession.questions[nextIndex].timeLimit);
      setIsActive(true);
      setIsPaused(false);
    } else {
      completeSession();
    }
  };

  const handleTimeUp = () => {
    addNotification({
      type: 'warning',
      message: 'Tempo esgotado para esta pergunta!'
    });
    nextQuestion();
  };

  const completeSession = () => {
    if (!currentSession) return;
    
    // Calculate score (simplified)
    const totalPoints = currentSession.questions.reduce((sum, q) => sum + q.points, 0);
    const answeredQuestions = Object.keys(answers).length;
    const calculatedScore = Math.round((answeredQuestions / currentSession.questions.length) * 100);
    
    setScore(calculatedScore);
    setSessionCompleted(true);
    setIsActive(false);
    
    addNotification({
      type: 'success',
      message: 'Simulação de entrevista concluída!'
    });
  };

  const resetSession = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(0);
    setIsActive(false);
    setIsPaused(false);
    setSessionCompleted(false);
    setScore(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'advanced': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (sessionCompleted && score !== null) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-6">
          {/* Results Header */}
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-white text-xl font-bold mb-2">Simulação Concluída!</h2>
                <p className="text-gray-300">{currentSession?.title}</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-gray-400 text-sm">Pontuação Final</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white font-semibold">{Object.keys(answers).length}</div>
                  <div className="text-gray-400 text-xs">Respondidas</div>
                </div>
                <div>
                  <div className="text-white font-semibold">{currentSession?.questions.length}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
                <div>
                  <div className="text-white font-semibold">{currentSession?.duration}min</div>
                  <div className="text-gray-400 text-xs">Duração</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análise de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Perguntas Técnicas</span>
                  <span className="text-green-400 font-medium">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Perguntas Comportamentais</span>
                  <span className="text-yellow-400 font-medium">70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Tempo de Resposta</span>
                  <span className="text-blue-400 font-medium">Bom</span>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <h4 className="text-blue-300 font-medium text-sm mb-2">Recomendações</h4>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• Pratique mais perguntas comportamentais</li>
                  <li>• Desenvolva exemplos específicos de projetos</li>
                  <li>• Melhore a estruturação das respostas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={resetSession}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Nova Simulação
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/resume')}
              className="w-full border-gray-600 text-gray-300"
            >
              Voltar ao Currículo
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (currentSession) {
    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100;

    return (
      <MobileLayout>
        <div className="p-4 space-y-4">
          {/* Progress Header */}
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium text-sm">{currentSession.title}</h3>
                  <p className="text-gray-400 text-xs">
                    Pergunta {currentQuestionIndex + 1} de {currentSession.questions.length}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-gray-400 text-xs">restante</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty === 'easy' ? 'Fácil' : 
                     currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </span>
                  <span className="text-gray-500 text-xs capitalize">
                    {currentQuestion.category === 'technical' ? 'Técnica' :
                     currentQuestion.category === 'behavioral' ? 'Comportamental' :
                     currentQuestion.category === 'situational' ? 'Situacional' : 'Empresa'}
                  </span>
                  <span className="text-blue-400 text-xs">{currentQuestion.points} pts</span>
                </div>
                
                <h4 className="text-white font-medium leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>

              {/* Question Type Specific UI */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left justify-start p-4 h-auto border-gray-600 text-gray-300 hover:bg-blue-500/10 hover:border-blue-500 ${
                        answers[currentQuestion.id] === option ? 'bg-blue-500/20 border-blue-500' : ''
                      }`}
                    >
                      <span className="mr-3 text-blue-400 font-medium">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Digite sua resposta aqui..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full h-32 p-3 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-500 text-xs">
                    {(answers[currentQuestion.id] || '').length} caracteres
                  </p>
                </div>
              )}

              {currentQuestion.type === 'audio' && (
                <div className="space-y-4">
                  <div className="bg-slate-800 border border-gray-600 rounded-lg p-4 text-center">
                    <Mic className={`w-12 h-12 mx-auto mb-3 ${isRecording ? 'text-red-400' : 'text-gray-400'}`} />
                    <p className="text-white font-medium mb-2">
                      {isRecording ? 'Gravando...' : 'Clique para gravar sua resposta'}
                    </p>
                    <Button
                      onClick={() => {
                        setIsRecording(!isRecording);
                        if (!isRecording) {
                          handleAnswer('audio_recorded');
                        }
                      }}
                      className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="border-gray-600 text-gray-300"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {currentQuestionIndex === currentSession.questions.length - 1 ? 'Finalizar' : 'Próxima'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Session Selection
  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Simulação de Entrevista IA</h2>
            <p className="text-gray-300 text-sm">
              Pratique suas habilidades de entrevista com nossa IA avançada
            </p>
          </CardContent>
        </Card>

        {/* Available Sessions */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Escolha uma simulação:</h3>
          
          {interviewSessions.map((session) => (
            <Card key={session.id} className="bg-black/20 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{session.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{session.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}min
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.totalQuestions} perguntas
                      </div>
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty === 'beginner' ? 'Iniciante' :
                         session.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {session.categories.map((category, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                
                <Button
                  onClick={() => startSession(session)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Simulação
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};
