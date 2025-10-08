import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  Award, 
  CheckCircle,
  Lock,
  Download,
  Share2,
  Bookmark,
  MoreHorizontal,
  PlayCircle,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  thumbnail: string;
  duration: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  totalRatings: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  certificateAvailable: boolean;
  certificateEarned: boolean;
  modules: CourseModule[];
  skills: string[];
  requirements: string[];
  whatYouWillLearn: string[];
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessonsCount: number;
  completedLessons: number;
  isUnlocked: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  isCompleted: boolean;
  isUnlocked: boolean;
  videoUrl?: string;
  materials?: string[];
}

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  const loadCourse = async (id: string) => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockCourse: Course = {
        id: id,
        title: 'Desenvolvimento Full Stack com React e Node.js',
        description: 'Aprenda a criar aplicações web completas do zero',
        longDescription: 'Este curso completo de desenvolvimento full stack vai te ensinar desde os fundamentos do React até a criação de APIs robustas com Node.js. Você aprenderá a construir aplicações web modernas, escaláveis e profissionais.',
        instructor: 'João Silva',
        instructorBio: 'Desenvolvedor Full Stack com mais de 8 anos de experiência. Trabalhou em startups e grandes empresas, criando soluções inovadoras.',
        instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        duration: 1200, // 20 horas
        totalLessons: 45,
        completedLessons: 23,
        progressPercentage: 51,
        category: 'Programação',
        level: 'intermediate',
        rating: 4.8,
        totalRatings: 1247,
        enrolledAt: '2024-01-15',
        lastAccessedAt: '2024-01-20',
        certificateAvailable: true,
        certificateEarned: false,
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express.js', 'REST APIs'],
        requirements: ['Conhecimento básico de HTML/CSS', 'JavaScript fundamentals', 'Vontade de aprender'],
        whatYouWillLearn: [
          'Criar aplicações React do zero',
          'Desenvolver APIs REST com Node.js',
          'Integrar frontend e backend',
          'Trabalhar com bancos de dados',
          'Deploy de aplicações',
          'Boas práticas de desenvolvimento'
        ],
        modules: [
          {
            id: 'm1',
            title: 'Fundamentos do React',
            description: 'Conceitos básicos e componentes',
            duration: 300,
            lessonsCount: 12,
            completedLessons: 12,
            isUnlocked: true,
            lessons: [
              {
                id: 'l1',
                title: 'Introdução ao React',
                description: 'O que é React e por que usar',
                duration: 25,
                type: 'video',
                isCompleted: true,
                isUnlocked: true,
                videoUrl: 'https://example.com/video1.mp4'
              },
              {
                id: 'l2',
                title: 'Criando seu primeiro componente',
                description: 'Componentes funcionais e JSX',
                duration: 30,
                type: 'video',
                isCompleted: true,
                isUnlocked: true,
                videoUrl: 'https://example.com/video2.mp4'
              }
            ]
          },
          {
            id: 'm2',
            title: 'Estado e Props',
            description: 'Gerenciamento de estado em React',
            duration: 240,
            lessonsCount: 8,
            completedLessons: 6,
            isUnlocked: true,
            lessons: [
              {
                id: 'l3',
                title: 'Entendendo Props',
                description: 'Como passar dados entre componentes',
                duration: 20,
                type: 'video',
                isCompleted: true,
                isUnlocked: true
              },
              {
                id: 'l4',
                title: 'useState Hook',
                description: 'Gerenciando estado local',
                duration: 35,
                type: 'video',
                isCompleted: false,
                isUnlocked: true
              }
            ]
          },
          {
            id: 'm3',
            title: 'Backend com Node.js',
            description: 'Criando APIs REST',
            duration: 360,
            lessonsCount: 15,
            completedLessons: 0,
            isUnlocked: false,
            lessons: []
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

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getLevelColor = (level: Course['level']): string => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getLevelLabel = (level: Course['level']): string => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!course) return null;
    
    for (const module of course.modules) {
      if (!module.isUnlocked) continue;
      
      for (const lesson of module.lessons) {
        if (!lesson.isCompleted && lesson.isUnlocked) {
          return lesson;
        }
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </PageContainer>
    );
  }

  if (!course) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">Curso não encontrado</h3>
          <p className="text-purple-200 mb-6">O curso que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/dashboard?tab=courses')}
            className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar aos Cursos
          </button>
        </div>
      </PageContainer>
    );
  }

  const nextLesson = getNextLesson();

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard?tab=courses')}
            className="flex items-center gap-2 text-purple-200 hover:text-purple-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar aos Cursos</span>
            <span className="sm:hidden">Voltar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Course Header */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 sm:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => navigate(`/course/${course.id}/watch`)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 sm:p-4 transition-colors"
                  >
                    <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </button>
                </div>

                {/* Progress overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-2 bg-black/50">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${course.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-purple-200 mb-4 text-sm sm:text-base">{course.description}</p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${getLevelColor(course.level)}`}>
                        {getLevelLabel(course.level)}
                      </span>
                      <span className="text-purple-400 text-xs sm:text-sm">{course.category}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-white font-medium text-xs sm:text-sm">{course.rating}</span>
                        <span className="text-purple-300 text-xs hidden sm:inline">({course.totalRatings} avaliações)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-purple-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{course.totalLessons} aulas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{course.totalRatings} alunos</span>
                        <span className="sm:hidden">{course.totalRatings}</span>
                      </div>
                      {course.certificateAvailable && (
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                          <span className="hidden sm:inline">Certificado</span>
                          <span className="sm:hidden">Cert.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:gap-2">
                    <button className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors">
                      <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </button>
                    <button className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </button>
                    <button className="p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors sm:hidden">
                      <MoreHorizontal className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                    <span className="text-purple-300">Seu Progresso</span>
                    <span className="text-white font-medium">{course.progressPercentage}% concluído</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-2 sm:h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm mt-2 text-purple-300">
                    <span>{course.completedLessons} de {course.totalLessons} aulas concluídas</span>
                    {course.certificateEarned ? (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Certificado obtido</span>
                        <span className="sm:hidden">Cert.</span>
                      </span>
                    ) : course.progressPercentage === 100 ? (
                      <span className="text-green-400 text-xs sm:text-sm">Pronto para certificado!</span>
                    ) : (
                      <span className="hidden sm:inline">Faltam {course.totalLessons - course.completedLessons} aulas</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => navigate(`/course/${course.id}/watch`)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{nextLesson ? `Continuar: ${nextLesson.title}` : course.progressPercentage > 0 ? 'Continuar Curso' : 'Iniciar Curso'}</span>
                    <span className="sm:hidden">{course.progressPercentage > 0 ? 'Continuar' : 'Iniciar'}</span>
                  </button>

                  {course.certificateEarned && (
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Ver Certificado</span>
                      <span className="sm:hidden">Cert.</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Conteúdo do Curso</h2>

              <div className="space-y-3 sm:space-y-4">
                {course.modules.map((module, index) => (
                  <div key={module.id} className="border border-white/10 rounded-lg sm:rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          module.completedLessons === module.lessonsCount
                            ? 'bg-green-500'
                            : module.completedLessons > 0
                            ? 'bg-blue-500'
                            : module.isUnlocked
                            ? 'bg-purple-500'
                            : 'bg-gray-500'
                        }`}>
                          {module.completedLessons === module.lessonsCount ? (
                            <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                          ) : module.isUnlocked ? (
                            <span className="text-white font-semibold text-xs sm:text-sm">{index + 1}</span>
                          ) : (
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          )}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{module.title}</h3>
                          <p className="text-purple-200 text-xs sm:text-sm truncate">{module.description}</p>
                          <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs text-purple-400">
                            <span>{module.lessonsCount} aulas</span>
                            <span className="hidden sm:inline">{formatDuration(module.duration)}</span>
                            <span className="hidden sm:inline">{module.completedLessons}/{module.lessonsCount} concluídas</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!module.isUnlocked && (
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        )}
                        <div className={`transform transition-transform text-xs sm:text-sm ${
                          expandedModules.has(module.id) ? 'rotate-180' : ''
                        }`}>
                          ▼
                        </div>
                      </div>
                    </button>

                    {/* Module Lessons */}
                    {expandedModules.has(module.id) && module.lessons.length > 0 && (
                      <div className="border-t border-white/10 bg-black/10">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-white/5 transition-colors ${
                              lessonIndex < module.lessons.length - 1 ? 'border-b border-white/5' : ''
                            }`}
                          >
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
                              <h4 className={`font-medium text-sm sm:text-base truncate ${lesson.isCompleted ? 'text-green-400' : 'text-white'}`}>
                                {lesson.title}
                              </h4>
                              <p className="text-purple-300 text-xs sm:text-sm truncate">{lesson.description}</p>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-purple-400 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">{lesson.duration}min</span>
                              <span className="sm:hidden">{lesson.duration}m</span>
                              {lesson.type === 'video' && <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                              {lesson.type === 'text' && <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </div>

                            {lesson.isUnlocked && (
                              <button
                                onClick={() => navigate(`/course/${course.id}/watch?lesson=${lesson.id}`)}
                                className="text-purple-400 hover:text-purple-300 transition-colors text-xs sm:text-sm px-2 py-1 rounded"
                              >
                                <span className="hidden sm:inline">{lesson.isCompleted ? 'Revisar' : 'Assistir'}</span>
                                <span className="sm:hidden">▶</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Instructor */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Instrutor</h3>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructor}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">{course.instructor}</h4>
                  <p className="text-purple-300 text-xs sm:text-sm">Instrutor</p>
                </div>
              </div>
              <p className="text-purple-200 text-xs sm:text-sm">{course.instructorBio}</p>
            </div>

            {/* What you'll learn */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">O que você vai aprender</h3>
              <ul className="space-y-2">
                {course.whatYouWillLearn.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-purple-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Habilidades que você vai desenvolver</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {course.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs sm:text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-black/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Pré-requisitos</h3>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-purple-200">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
