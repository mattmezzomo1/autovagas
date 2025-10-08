import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MobileLayout } from '../components/layout/MobileLayout';
import '../styles/lesson-view.css';
import {
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward,
  ArrowLeft, Download, Share2, BookOpen, MessageCircle, Users,
  Clock, CheckCircle, Star, ThumbsUp, ThumbsDown, Send,
  FileText, Link, Eye, Heart, Flag, MoreVertical, Plus, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'moderator';
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
  liked: boolean;
}

interface Material {
  id: number;
  title: string;
  type: 'pdf' | 'link' | 'code' | 'image';
  url: string;
  size?: string;
  description?: string;
}

interface Note {
  id: number;
  timestamp: number;
  content: string;
  createdAt: string;
}

interface LessonData {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  videoUrl?: string;
  videoId?: string;
  videoProvider?: 'vimeo' | 'dailymotion' | 'youtube';
  content?: string;
  completed: boolean;
  materials: Material[];
  transcript?: string;
  nextLesson?: {
    id: number;
    title: string;
    moduleId: number;
  };
  previousLesson?: {
    id: number;
    title: string;
    moduleId: number;
  };
}

export const LessonView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, lessonId } = useParams();
  const { addNotification } = useAppStore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'comments' | 'notes'>('overview');
  const [newComment, setNewComment] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      timestamp: 120, // 2:00
      content: 'Importante: Diferença entre interface e type',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      timestamp: 300, // 5:00
      content: 'Lembrar de praticar os exemplos mostrados',
      createdAt: '2024-01-15T10:35:00Z'
    }
  ]);

  // Mock data - In real app, this would come from API
  const getVideoData = () => {
    const lessonNumber = parseInt(lessonId || '1');
    const videoOptions = [
      {
        videoId: '76979871', // Vimeo - Big Buck Bunny
        videoProvider: 'vimeo' as const,
        title: 'Introdução ao TypeScript'
      },
      {
        videoId: 'x2to0hs', // Dailymotion - Sample video
        videoProvider: 'dailymotion' as const,
        title: 'Tipos Básicos em TypeScript'
      },
      {
        videoId: 'dQw4w9WgXcQ', // YouTube - Sample video
        videoProvider: 'youtube' as const,
        title: 'Interfaces e Classes'
      }
    ];

    const videoData = videoOptions[lessonNumber % videoOptions.length] || videoOptions[0];

    return {
      ...videoData,
      id: lessonNumber,
      description: 'Nesta aula, você aprenderá os conceitos fundamentais do TypeScript, incluindo tipos básicos, interfaces e como configurar seu ambiente de desenvolvimento.',
      type: 'video' as const,
      duration: '15:30',
      completed: false,
    };
  };

  const [lessonData] = useState<LessonData>(() => ({
    ...getVideoData(),
    materials: [
      {
        id: 1,
        title: 'Slides da Aula',
        type: 'pdf',
        url: '/materials/typescript-intro.pdf',
        size: '2.5 MB',
        description: 'Slides utilizados na apresentação'
      },
      {
        id: 2,
        title: 'Código de Exemplo',
        type: 'code',
        url: '/materials/typescript-examples.zip',
        size: '1.2 MB',
        description: 'Exemplos práticos de código TypeScript'
      },
      {
        id: 3,
        title: 'Documentação Oficial',
        type: 'link',
        url: 'https://www.typescriptlang.org/docs/',
        description: 'Link para a documentação oficial do TypeScript'
      }
    ],
    transcript: `Olá pessoal, bem-vindos à nossa aula sobre TypeScript. Hoje vamos aprender os conceitos fundamentais desta linguagem que tem revolucionado o desenvolvimento JavaScript...`,
    nextLesson: {
      id: 2,
      title: 'Tipos Básicos',
      moduleId: 1
    },
    previousLesson: undefined
  }));

  const [comments] = useState<Comment[]>([
    {
      id: 1,
      user: {
        name: 'Maria Silva',
        avatar: '/avatars/maria.jpg',
        role: 'student'
      },
      content: 'Excelente explicação! Finalmente entendi a diferença entre interface e type.',
      timestamp: '2 horas atrás',
      likes: 12,
      replies: [
        {
          id: 2,
          user: {
            name: 'Prof. João Santos',
            avatar: '/avatars/joao.jpg',
            role: 'instructor'
          },
          content: 'Fico feliz que tenha ficado claro! Na próxima aula vamos aprofundar mais esse conceito.',
          timestamp: '1 hora atrás',
          likes: 5,
          replies: [],
          liked: false
        }
      ],
      liked: true
    },
    {
      id: 3,
      user: {
        name: 'Carlos Oliveira',
        avatar: '/avatars/carlos.jpg',
        role: 'student'
      },
      content: 'Poderia disponibilizar mais exemplos práticos? Estou com dificuldade em alguns conceitos.',
      timestamp: '3 horas atrás',
      likes: 8,
      replies: [],
      liked: false
    }
  ]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCompleteLesson = () => {
    addNotification({
      type: 'success',
      message: 'Aula concluída com sucesso!'
    });
    
    // Navigate to next lesson if available
    if (lessonData.nextLesson) {
      navigate(`/course/${courseId}/lesson/${lessonData.nextLesson.moduleId}/${lessonData.nextLesson.id}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addNotification({
        type: 'success',
        message: 'Comentário adicionado!'
      });
      setNewComment('');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now(),
        timestamp: currentTime,
        content: newNote,
        createdAt: new Date().toISOString()
      };

      setNotes(prev => [...prev, note].sort((a, b) => a.timestamp - b.timestamp));
      setNewNote('');
      setShowAddNote(false);

      addNotification({
        type: 'success',
        message: 'Nota adicionada!'
      });
    }
  };

  const handleJumpToNote = (timestamp: number) => {
    handleSeek(timestamp);
    if (videoRef.current && !isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const checkTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkTabsScroll();
    const handleResize = () => checkTabsScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 120;
      const newScrollLeft = direction === 'left'
        ? tabsRef.current.scrollLeft - scrollAmount
        : tabsRef.current.scrollLeft + scrollAmount;

      tabsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'link': return <Link className="w-5 h-5 text-blue-400" />;
      case 'code': return <BookOpen className="w-5 h-5 text-green-400" />;
      case 'image': return <Eye className="w-5 h-5 text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-4 lesson-container">
        {/* Header */}
        <div className="flex items-center gap-3 lesson-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">{lessonData.title}</h1>
            <p className="text-gray-400 text-sm">Módulo {moduleId} • {lessonData.duration}</p>
          </div>
        </div>

        {/* Video Player */}
        {lessonData.type === 'video' && (
          <Card className="bg-black border-gray-700 overflow-hidden">
            <div className="video-container bg-black">
              {lessonData.videoProvider === 'vimeo' && lessonData.videoId && (
                <iframe
                  src={`https://player.vimeo.com/video/${lessonData.videoId}?h=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=0&loop=0&muted=0&controls=1&title=1&portrait=0&byline=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={lessonData.title}
                />
              )}

              {lessonData.videoProvider === 'dailymotion' && lessonData.videoId && (
                <iframe
                  src={`https://www.dailymotion.com/embed/video/${lessonData.videoId}?autoplay=0&mute=0&controls=1&ui-logo=0&ui-start-screen-info=0&ui-highlight=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={lessonData.title}
                />
              )}

              {lessonData.videoProvider === 'youtube' && lessonData.videoId && (
                <iframe
                  src={`https://www.youtube.com/embed/${lessonData.videoId}?rel=0&showinfo=0&controls=1&autoplay=0&mute=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lessonData.title}
                />
              )}

              {/* Fallback for old videoUrl format */}
              {!lessonData.videoProvider && lessonData.videoUrl && (
                <video
                  ref={videoRef}
                  src={lessonData.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              )}
            </div>
          </Card>
        )}

        {/* Lesson Description */}
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <p className="text-gray-300 text-sm leading-relaxed">{lessonData.description}</p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg p-1 lesson-tabs relative">
          {/* Scroll buttons for mobile */}
          {canScrollLeft && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scrollTabs('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 p-0 bg-slate-700/80 hover:bg-slate-600/80 text-white md:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          {canScrollRight && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scrollTabs('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 p-0 bg-slate-700/80 hover:bg-slate-600/80 text-white md:hidden"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Mobile: Scrollable tabs */}
          <div
            ref={tabsRef}
            className={`flex overflow-x-auto scrollbar-hide gap-1 md:grid md:grid-cols-4 md:gap-1 tabs-container ${
              canScrollLeft ? 'can-scroll-left' : ''
            } ${canScrollRight ? 'can-scroll-right' : ''}`}
            onScroll={checkTabsScroll}
          >
            {[
              { id: 'overview', name: 'Visão Geral', shortName: 'Geral', icon: BookOpen },
              { id: 'materials', name: 'Materiais', shortName: 'Materiais', icon: Download },
              { id: 'notes', name: 'Notas', shortName: 'Notas', icon: FileText },
              { id: 'comments', name: 'Comentários', shortName: 'Chat', icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 min-w-0 px-3 py-2 md:flex-1 tab-button ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="text-xs md:text-sm truncate tab-button-text">
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.shortName}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Progress and Actions */}
            <Card className="bg-black/20 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-medium">Progresso da Aula</h3>
                    <p className="text-gray-400 text-sm">
                      {lessonData.completed ? 'Concluída' : 'Em andamento'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lessonData.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {!lessonData.completed && (
                    <Button
                      onClick={handleCompleteLesson}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Concluída
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Transcrição
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            {showTranscript && lessonData.transcript && (
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">Transcrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {lessonData.transcript}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="grid grid-cols-2 gap-3">
              {lessonData.previousLesson && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/course/${courseId}/lesson/${lessonData.previousLesson!.moduleId}/${lessonData.previousLesson!.id}`)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <SkipBack className="w-4 h-4 mr-2" />
                  Aula Anterior
                </Button>
              )}

              {lessonData.nextLesson && (
                <Button
                  onClick={() => navigate(`/course/${courseId}/lesson/${lessonData.nextLesson!.moduleId}/${lessonData.nextLesson!.id}`)}
                  className={`bg-blue-600 hover:bg-blue-700 ${!lessonData.previousLesson ? 'col-span-2' : ''}`}
                >
                  Próxima Aula
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Materiais da Aula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lessonData.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getMaterialIcon(material.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm">{material.title}</h4>
                      {material.description && (
                        <p className="text-gray-400 text-xs mt-1">{material.description}</p>
                      )}
                      {material.size && (
                        <p className="text-gray-500 text-xs mt-1">{material.size}</p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        addNotification({
                          type: 'info',
                          message: `Baixando ${material.title}...`
                        });
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {lessonData.materials.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Nenhum material disponível para esta aula</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note Button */}
            <Card className="bg-black/20 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Minhas Notas</h3>
                    <p className="text-gray-400 text-sm">
                      Adicione notas em momentos específicos da aula
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddNote(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Nota
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Note Modal */}
            {showAddNote && (
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Nova Nota</h4>
                      <span className="text-blue-400 text-sm">
                        {formatTime(currentTime)}
                      </span>
                    </div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Digite sua nota..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowAddNote(false)}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        Salvar Nota
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="bg-black/20 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleJumpToNote(note.timestamp)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex-shrink-0"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {formatTime(note.timestamp)}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-sm">{note.content}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(note.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(note.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNotes(prev => prev.filter(n => n.id !== note.id));
                          addNotification({
                            type: 'success',
                            message: 'Nota removida!'
                          });
                        }}
                        className="text-gray-400 hover:text-red-400 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {notes.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-2">Nenhuma nota ainda</p>
                  <p className="text-gray-500 text-xs">
                    Adicione notas para marcar pontos importantes da aula
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add Comment */}
            <Card className="bg-black/20 border-white/10">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário ou tire uma dúvida..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs">
                      Seja respeitoso e construtivo nos comentários
                    </p>
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-black/20 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {comment.user.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm">{comment.user.name}</h4>
                          {comment.user.role === 'instructor' && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                              Instrutor
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                        </div>

                        <p className="text-gray-300 text-sm mb-3">{comment.content}</p>

                        <div className="flex items-center gap-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`text-xs ${comment.liked ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-300`}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {comment.likes}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white text-xs"
                          >
                            Responder
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-400 text-xs"
                          >
                            <Flag className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-700 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-medium">
                                    {reply.user.name.charAt(0)}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-white font-medium text-sm">{reply.user.name}</h5>
                                    {reply.user.role === 'instructor' && (
                                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                        Instrutor
                                      </span>
                                    )}
                                    <span className="text-gray-500 text-xs">{reply.timestamp}</span>
                                  </div>

                                  <p className="text-gray-300 text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-2">Nenhum comentário ainda</p>
                  <p className="text-gray-500 text-xs">Seja o primeiro a comentar sobre esta aula!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Add Note Button (only visible during video playback) */}
        {lessonData.type === 'video' && isPlaying && !showAddNote && (
          <Button
            onClick={() => setShowAddNote(true)}
            className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-10"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>
    </MobileLayout>
  );
};
