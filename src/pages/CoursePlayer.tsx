import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  CheckCircle,
  Lock,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Download,
  MessageSquare,
  Star
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  isUnlocked: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz';
  isCompleted: boolean;
  isUnlocked: boolean;
  videoUrl?: string;
  materials?: string[];
  transcript?: string;
}

export const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (course && lessonId) {
      const lesson = findLessonById(lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
      }
    } else if (course && !currentLesson) {
      // Load first available lesson
      const firstLesson = getFirstAvailableLesson();
      if (firstLesson) {
        setCurrentLesson(firstLesson);
        setSearchParams({ lesson: firstLesson.id });
      }
    }
  }, [course, searchParams]);

  const loadCourse = async (id: string) => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockCourse: Course = {
        id: id,
        title: 'Desenvolvimento Full Stack com React e Node.js',
        modules: [
          {
            id: 'm1',
            title: 'Fundamentos do React',
            isUnlocked: true,
            lessons: [
              {
                id: 'l1',
                title: 'Introdução ao React',
                description: 'O que é React e por que usar',
                duration: 1500, // 25 minutes in seconds
                type: 'video',
                isCompleted: true,
                isUnlocked: true,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                materials: ['slides.pdf', 'codigo-exemplo.zip'],
                transcript: 'Bem-vindos ao curso de React. Nesta aula vamos aprender...'
              },
              {
                id: 'l2',
                title: 'Criando seu primeiro componente',
                description: 'Componentes funcionais e JSX',
                duration: 1800, // 30 minutes
                type: 'video',
                isCompleted: false,
                isUnlocked: true,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                materials: ['componentes-exemplo.zip']
              }
            ]
          },
          {
            id: 'm2',
            title: 'Estado e Props',
            isUnlocked: true,
            lessons: [
              {
                id: 'l3',
                title: 'Entendendo Props',
                description: 'Como passar dados entre componentes',
                duration: 1200, // 20 minutes
                type: 'video',
                isCompleted: false,
                isUnlocked: true,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
              }
            ]
          }
        ]
      };
      
      setCourse(mockCourse);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findLessonById = (lessonId: string): Lesson | null => {
    if (!course) return null;
    
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  const getFirstAvailableLesson = (): Lesson | null => {
    if (!course) return null;
    
    for (const module of course.modules) {
      if (!module.isUnlocked) continue;
      
      for (const lesson of module.lessons) {
        if (lesson.isUnlocked) return lesson;
      }
    }
    return null;
  };

  const getNextLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    let foundCurrent = false;
    
    for (const module of course.modules) {
      if (!module.isUnlocked) continue;
      
      for (const lesson of module.lessons) {
        if (foundCurrent && lesson.isUnlocked) {
          return lesson;
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const getPreviousLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    let previousLesson: Lesson | null = null;
    
    for (const module of course.modules) {
      if (!module.isUnlocked) continue;
      
      for (const lesson of module.lessons) {
        if (lesson.id === currentLesson.id) {
          return previousLesson;
        }
        if (lesson.isUnlocked) {
          previousLesson = lesson;
        }
      }
    }
    return null;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    if (!lesson.isUnlocked) return;
    
    setCurrentLesson(lesson);
    setSearchParams({ lesson: lesson.id });
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const markLessonAsCompleted = async () => {
    if (!currentLesson) return;
    
    // Mock API call to mark lesson as completed
    console.log(`Marking lesson ${currentLesson.id} as completed`);
    
    // Update local state
    if (course) {
      const updatedCourse = { ...course };
      for (const module of updatedCourse.modules) {
        const lesson = module.lessons.find(l => l.id === currentLesson.id);
        if (lesson) {
          lesson.isCompleted = true;
          break;
        }
      }
      setCourse(updatedCourse);
      setCurrentLesson({ ...currentLesson, isCompleted: true });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Aula não encontrada</h3>
          <p className="text-purple-200 mb-6">A aula que você está procurando não existe ou não está disponível.</p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Curso
          </button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-purple-200 hover:text-purple-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-semibold text-sm sm:text-base truncate">{course.title}</h1>
            <p className="text-purple-300 text-xs sm:text-sm truncate">{currentLesson.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 sm:p-2 text-purple-200 hover:text-purple-100 hover:bg-white/10 rounded-lg transition-colors"
          >
            <List className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {!currentLesson.isCompleted && (
            <button
              onClick={markLessonAsCompleted}
              className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Marcar como Concluída</span>
              <span className="sm:hidden">Concluir</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Video Area */}
        <div className={`flex-1 flex flex-col ${showSidebar ? 'sm:mr-80' : ''}`}>
          {/* Video Player */}
          <div className="relative bg-black flex-1 flex items-center justify-center min-h-[200px] sm:min-h-[400px]">
            {currentLesson.type === 'video' && currentLesson.videoUrl ? (
              <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (nextLesson) {
                      navigateToLesson(nextLesson);
                    }
                  }}
                />

                {/* Video Controls */}
                {showControls && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
                    {/* Progress Bar */}
                    <div className="mb-2 sm:mb-4">
                      <div className="relative h-1 sm:h-1.5 bg-white/20 rounded-full cursor-pointer">
                        <div
                          className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          value={currentTime}
                          onChange={(e) => handleSeek(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-purple-300 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>

                        <button
                          onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                          className="text-white hover:text-purple-300 transition-colors hidden sm:block"
                        >
                          <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <button
                          onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                          className="text-white hover:text-purple-300 transition-colors hidden sm:block"
                        >
                          <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={handleMute}
                            className="text-white hover:text-purple-300 transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(Number(e.target.value))}
                            className="w-12 sm:w-20 hidden sm:block"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-white hover:text-purple-300 transition-colors"
                          >
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          {showSettings && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-2 min-w-24 sm:min-w-32">
                              <div className="text-white text-xs sm:text-sm mb-2">Velocidade</div>
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                <button
                                  key={rate}
                                  onClick={() => handlePlaybackRateChange(rate)}
                                  className={`block w-full text-left px-2 py-1 text-xs sm:text-sm rounded hover:bg-white/10 transition-colors ${
                                    playbackRate === rate ? 'text-purple-400' : 'text-white'
                                  }`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleFullscreen}
                          className="text-white hover:text-purple-300 transition-colors"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-white mb-2">Conteúdo não disponível</h3>
                <p className="text-purple-200">Este tipo de aula ainda não está disponível no player.</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 p-3 sm:p-6">
            <div className="max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{currentLesson.title}</h2>
                  <p className="text-purple-200 mb-3 sm:mb-4 text-sm sm:text-base">{currentLesson.description}</p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-purple-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{Math.ceil(currentLesson.duration / 60)} minutos</span>
                    </div>
                    {currentLesson.isCompleted && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Concluída</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentLesson.materials && currentLesson.materials.length > 0 && (
                    <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-xs sm:text-sm">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Materiais</span>
                      <span className="sm:hidden">Mat.</span>
                    </button>
                  )}

                  {currentLesson.transcript && (
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-xs sm:text-sm"
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Transcrição</span>
                      <span className="sm:hidden">Trans.</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => previousLesson && navigateToLesson(previousLesson)}
                  disabled={!previousLesson}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-black/20 text-purple-300 rounded-lg hover:bg-black/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Aula Anterior</span>
                  <span className="sm:hidden">Anterior</span>
                </button>

                <button
                  onClick={() => nextLesson && navigateToLesson(nextLesson)}
                  disabled={!nextLesson}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Próxima Aula</span>
                  <span className="sm:hidden">Próxima</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Transcript */}
              {showTranscript && currentLesson.transcript && (
                <div className="mt-6 p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Transcrição</h3>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-purple-200 text-sm leading-relaxed">{currentLesson.transcript}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto w-full sm:w-80 bg-black/90 sm:bg-black/60 backdrop-blur-sm border-l border-white/10 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Conteúdo do Curso</h3>
                <p className="text-purple-300 text-xs sm:text-sm truncate">{course.title}</p>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="sm:hidden text-purple-300 hover:text-purple-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {course.modules.map((module) => (
                <div key={module.id} className="border-b border-white/10">
                  <div className="p-3 sm:p-4">
                    <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      {module.isUnlocked ? (
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      ) : (
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      )}
                      <span className="truncate">{module.title}</span>
                    </h4>
                    
                    <div className="space-y-1 sm:space-y-2">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            navigateToLesson(lesson);
                            if (window.innerWidth < 768) setShowSidebar(false);
                          }}
                          disabled={!lesson.isUnlocked}
                          className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors ${
                            currentLesson.id === lesson.id
                              ? 'bg-purple-500/20 border border-purple-500/30'
                              : lesson.isUnlocked
                              ? 'hover:bg-white/5'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              lesson.isCompleted
                                ? 'bg-green-500'
                                : lesson.isUnlocked
                                ? 'bg-purple-500'
                                : 'bg-gray-500'
                            }`}>
                              {lesson.isCompleted ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              ) : lesson.isUnlocked ? (
                                <Play className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              ) : (
                                <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className={`font-medium text-xs sm:text-sm truncate ${
                                currentLesson.id === lesson.id
                                  ? 'text-purple-300'
                                  : lesson.isCompleted
                                  ? 'text-green-400'
                                  : 'text-white'
                              }`}>
                                {lesson.title}
                              </h5>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1 text-xs text-purple-400">
                                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span>{Math.ceil(lesson.duration / 60)}min</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
