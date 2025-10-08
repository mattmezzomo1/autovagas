import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Upload, Eye, Wand2, FileText, Target, BookOpen, Download,
  Edit, Trash2, Plus, Star, TrendingUp, Award, CheckCircle,
  AlertCircle, RefreshCw, Zap, Brain, MessageSquare, Play,
  BarChart3, Calendar, Clock, Users, Lightbulb
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { ResumeViewer } from '../components/resume/ResumeViewer';
import { FileUploadModal } from '../components/resume/FileUploadModal';
import { ImprovementSuggestionsModal } from '../components/resume/ImprovementSuggestionsModal';
import { DocumentUploadModal } from '../components/resume/DocumentUploadModal';

export const Resume: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImprovementsModal, setShowImprovementsModal] = useState(false);
  const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);

  // Estados locais
  const [resumeData, setResumeData] = useState({
    fileName: 'curriculo_joao_silva.pdf',
    lastUpdated: '2 dias',
    score: 78,
    hasResume: true,
    analyzing: false
  });

  const [aiSuggestions] = useState([
    {
      id: 1,
      type: 'improvement',
      title: 'Adicionar palavras-chave',
      description: 'Inclua "React", "TypeScript" e "Node.js" para melhor match com vagas',
      impact: '+12 pontos',
      priority: 'high'
    },
    {
      id: 2,
      type: 'structure',
      title: 'Reorganizar seções',
      description: 'Mova "Experiência" para o topo para destacar sua senioridade',
      impact: '+8 pontos',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'content',
      title: 'Quantificar resultados',
      description: 'Adicione métricas específicas aos seus projetos (ex: "Aumentou performance em 40%")',
      impact: '+15 pontos',
      priority: 'high'
    }
  ]);

  const [documents] = useState([
    {
      id: 1,
      name: 'Currículo Principal',
      type: 'PDF',
      size: '245 KB',
      lastModified: '2024-01-15',
      status: 'active',
      downloads: 24,
      views: 156
    },
    {
      id: 2,
      name: 'Carta de Apresentação',
      type: 'PDF',
      size: '180 KB',
      lastModified: '2024-01-12',
      status: 'draft',
      downloads: 8,
      views: 45
    },
    {
      id: 3,
      name: 'Portfólio Técnico',
      type: 'PDF',
      size: '1.2 MB',
      lastModified: '2024-01-10',
      status: 'active',
      downloads: 15,
      views: 89
    },
    {
      id: 4,
      name: 'Certificados',
      type: 'ZIP',
      size: '3.4 MB',
      lastModified: '2024-01-08',
      status: 'archived',
      downloads: 5,
      views: 23
    }
  ]);

  const [careerPlan] = useState({
    currentLevel: 'Pleno',
    targetLevel: 'Sênior',
    progress: 60,
    completedGoals: 3,
    totalGoals: 5,
    nextMilestone: 'Certificação AWS',
    estimatedTime: '6 meses',
    skills: [
      { name: 'React', level: 85, target: 95 },
      { name: 'TypeScript', level: 70, target: 90 },
      { name: 'Node.js', level: 60, target: 85 },
      { name: 'AWS', level: 30, target: 75 }
    ]
  });

  const [interviewStats] = useState({
    totalSessions: 12,
    averageScore: 82,
    improvement: '+15%',
    lastSession: '3 dias',
    strongAreas: ['Conhecimento Técnico', 'Comunicação'],
    improvementAreas: ['Liderança', 'Gestão de Conflitos']
  });

  // Funções
  const handleFileUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = (file: File) => {
    addNotification({
      type: 'success',
      message: `Currículo "${file.name}" enviado com sucesso!`
    });
    // Aqui você adicionaria o arquivo à lista de documentos
  };

  const handleDocumentUploadComplete = (file: File, type: string) => {
    const typeNames: { [key: string]: string } = {
      cv: 'Currículo',
      cover_letter: 'Carta de Apresentação',
      recommendation: 'Carta de Recomendação',
      portfolio: 'Portfólio Técnico',
      certificate: 'Certificado',
      other: 'Documento'
    };

    addNotification({
      type: 'success',
      message: `${typeNames[type]} "${file.name}" enviado com sucesso!`
    });
    // Aqui você adicionaria o documento à lista
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeData(prev => ({ ...prev, analyzing: true }));
      addNotification({
        type: 'info',
        message: 'Analisando currículo com IA...'
      });

      // Simular análise
      setTimeout(() => {
        setResumeData(prev => ({
          ...prev,
          fileName: file.name,
          lastUpdated: 'agora',
          analyzing: false,
          hasResume: true
        }));
        addNotification({
          type: 'success',
          message: 'Currículo analisado! Score: 78/100'
        });
      }, 3000);
    }
  };

  const handleImproveResume = () => {
    setResumeData(prev => ({ ...prev, analyzing: true }));
    addNotification({
      type: 'info',
      message: 'IA otimizando seu currículo...'
    });

    setTimeout(() => {
      setResumeData(prev => ({
        ...prev,
        score: Math.min(100, prev.score + 15),
        analyzing: false
      }));
      addNotification({
        type: 'success',
        message: 'Currículo otimizado! +15 pontos no score!'
      });
    }, 4000);
  };

  const handleStartInterview = () => {
    navigate('/interview-simulation');
  };

  const handleViewDocument = (docId: number) => {
    // Se for o currículo principal (ID 1), abrir o visualizador
    if (docId === 1) {
      setShowResumeViewer(true);
    } else {
      addNotification({
        type: 'info',
        message: 'Abrindo documento...'
      });
    }
  };

  const handleDownloadDocument = (docId: number) => {
    // Simular download do documento
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      // Criar um link de download simulado
      const link = document.createElement('a');
      link.href = '#'; // Em produção, seria a URL real do arquivo
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification({
        type: 'success',
        message: `Download de "${doc.name}" iniciado!`
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'draft': return 'text-yellow-400 bg-yellow-500/20';
      case 'archived': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* Meu Currículo */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Meu Currículo
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  resumeData.score >= 90 ? 'bg-green-500/20 text-green-400' :
                  resumeData.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {resumeData.score}/100
                </div>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumeData.hasResume ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    {resumeData.analyzing ? (
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <FileText className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{resumeData.fileName}</p>
                    <p className="text-purple-200 text-xs">
                      {resumeData.analyzing ? 'Analisando...' : `Atualizado há ${resumeData.lastUpdated}`}
                    </p>
                  </div>
                </div>

                {/* Score Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Score de compatibilidade</span>
                    <span className="text-purple-300 font-medium">{resumeData.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                      style={{width: `${resumeData.score}%`}}
                    ></div>
                  </div>
                  <p className="text-purple-200 text-xs">
                    {resumeData.score >= 90 ? 'Excelente! Seu currículo está otimizado.' :
                     resumeData.score >= 70 ? 'Bom! Algumas melhorias podem aumentar suas chances.' :
                     'Há espaço para melhorias significativas.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/10 flex-1"
                    onClick={() => handleViewDocument(1)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                    onClick={() => handleDownloadDocument(1)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                    onClick={handleFileUpload}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-white text-sm mb-2">Nenhum currículo encontrado</p>
                <p className="text-purple-200 text-xs mb-4">
                  Faça upload do seu currículo para começar a análise com IA
                </p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleFileUpload}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Melhorar com IA */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Otimização com IA
              </CardTitle>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">+35 pontos possíveis</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-200 text-sm">
              Nossa IA identificou oportunidades para otimizar seu currículo e aumentar suas chances de aprovação.
            </p>

            {/* Sugestões da IA */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Sugestões Personalizadas
              </h4>
              {aiSuggestions.slice(0, 2).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-blue-300 text-sm font-medium">{suggestion.title}</p>
                      <p className="text-blue-200 text-xs mt-1">{suggestion.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      <span className="text-green-400 text-xs font-medium">{suggestion.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleImproveResume}
                disabled={resumeData.analyzing}
              >
                {resumeData.analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Aplicar Melhorias
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                onClick={() => setShowImprovementsModal(true)}
              >
                Ver Todas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Meus Documentos
              </CardTitle>
              <Button
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-xs"
                onClick={() => setShowDocumentUploadModal(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status === 'active' ? 'Ativo' :
                           doc.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">
                        {doc.type} • {doc.size} • Modificado em {new Date(doc.lastModified).toLocaleDateString('pt-BR')}
                      </p>

                      {/* Estatísticas */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {doc.views} visualizações
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {doc.downloads} downloads
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs flex-1"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs"
                      onClick={() => handleDownloadDocument(doc.id)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => addNotification({ type: 'info', message: 'Editando documento...' })}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                      onClick={() => addNotification({ type: 'warning', message: 'Documento removido' })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treinamento para Entrevista */}
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Treinamento IA
              </CardTitle>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-xs font-medium">{interviewStats.improvement}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-200 text-sm">
              Pratique entrevistas com nossa IA avançada e receba feedback personalizado em tempo real.
            </p>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">{interviewStats.averageScore}</span>
                </div>
                <p className="text-green-200 text-xs">Score médio</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">{interviewStats.totalSessions}</span>
                </div>
                <p className="text-green-200 text-xs">Sessões</p>
              </div>
            </div>

            {/* Pontos fortes e fracos */}
            <div className="space-y-3">
              <div>
                <p className="text-green-300 text-xs font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Pontos Fortes
                </p>
                <div className="flex flex-wrap gap-1">
                  {interviewStats.strongAreas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-yellow-300 text-xs font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Para Melhorar
                </p>
                <div className="flex flex-wrap gap-1">
                  {interviewStats.improvementAreas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleStartInterview}
              >
                <Play className="w-4 h-4 mr-2" />
                Nova Simulação
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-300 hover:bg-green-500/10"
                onClick={() => addNotification({ type: 'info', message: 'Abrindo histórico...' })}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-green-200 text-xs text-center">
              Última sessão: há {interviewStats.lastSession}
            </p>
          </CardContent>
        </Card>

        {/* Plano de Carreira */}
        <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Plano de Carreira
              </CardTitle>
              <div className="text-right">
                <p className="text-orange-400 text-sm font-medium">{careerPlan.currentLevel} → {careerPlan.targetLevel}</p>
                <p className="text-orange-200 text-xs">{careerPlan.estimatedTime}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-orange-200 text-sm">Progresso para {careerPlan.targetLevel}</span>
                <span className="text-orange-400 font-medium text-sm">
                  {careerPlan.completedGoals}/{careerPlan.totalGoals} objetivos
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-500"
                  style={{width: `${careerPlan.progress}%`}}
                ></div>
              </div>
              <p className="text-orange-200 text-xs">
                Próximo marco: {careerPlan.nextMilestone}
              </p>
            </div>

            {/* Skills Progress */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-400" />
                Desenvolvimento de Skills
              </h4>
              {careerPlan.skills.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-200">{skill.name}</span>
                    <span className="text-orange-300">{skill.level}% / {skill.target}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="relative h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-400/30 h-full rounded-full"
                        style={{width: `${skill.target}%`}}
                      ></div>
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-400 h-full rounded-full absolute top-0 left-0"
                        style={{width: `${skill.level}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate('/career-roadmap')}
              >
                <Target className="w-4 h-4 mr-2" />
                Ver Roadmap
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-500 text-orange-300 hover:bg-orange-500/10"
                onClick={() => addNotification({ type: 'info', message: 'Abrindo cursos recomendados...' })}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Viewer */}
      {showResumeViewer && (
        <ResumeViewer
          isVisible={showResumeViewer}
          onClose={() => setShowResumeViewer(false)}
          onEdit={() => {
            addNotification({
              type: 'info',
              message: 'Abrindo editor de currículo...'
            });
          }}
        />
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          isVisible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
          acceptedTypes={['.pdf', '.doc', '.docx']}
          maxSize={10}
          title="Upload de Currículo"
        />
      )}

      {/* Improvement Suggestions Modal */}
      {showImprovementsModal && (
        <ImprovementSuggestionsModal
          isVisible={showImprovementsModal}
          onClose={() => setShowImprovementsModal(false)}
        />
      )}

      {/* Document Upload Modal */}
      {showDocumentUploadModal && (
        <DocumentUploadModal
          isVisible={showDocumentUploadModal}
          onClose={() => setShowDocumentUploadModal(false)}
          onUploadComplete={handleDocumentUploadComplete}
        />
      )}
    </MobileLayout>
  );
};
