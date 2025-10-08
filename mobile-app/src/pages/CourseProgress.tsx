import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MobileLayout } from '../components/layout/MobileLayout';
import {
  Play, Pause, CheckCircle, Lock, Clock, BookOpen, Award,
  ChevronRight, RotateCcw, Download, Share2, Star, Users,
  Target, TrendingUp, Calendar, FileText, Video, Headphones
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  completed: boolean;
  locked: boolean;
  description?: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  completed: boolean;
  progress: number;
}

interface CourseData {
  id: number;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  totalDuration: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  enrolledDate: string;
  lastAccessed: string;
  certificate: boolean;
  modules: Module[];
  nextLesson?: {
    moduleId: number;
    lessonId: number;
    title: string;
  };
}

export const CourseProgress: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { addNotification } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'progress'>('overview');

  // Mock course data
  const courseData: CourseData = {
    id: parseInt(courseId || '1'),
    title: 'React Avançado com TypeScript',
    instructor: 'João Silva',
    description: 'Domine React com TypeScript e construa aplicações robustas e escaláveis',
    thumbnail: '🚀',
    totalDuration: '8h 30min',
    progress: 65,
    completedLessons: 13,
    totalLessons: 20,
    enrolledDate: '2024-01-10',
    lastAccessed: '2024-01-20',
    certificate: true,
    nextLesson: {
      moduleId: 2,
      lessonId: 3,
      title: 'Hooks Avançados'
    },
    modules: [
      {
        id: 1,
        title: 'Fundamentos do TypeScript',
        description: 'Aprenda os conceitos básicos do TypeScript',
        completed: true,
        progress: 100,
        lessons: [
          { id: 1, title: 'Introdução ao TypeScript', type: 'video', duration: '15min', completed: true, locked: false },
          { id: 2, title: 'Tipos Básicos', type: 'video', duration: '20min', completed: true, locked: false },
          { id: 3, title: 'Interfaces e Types', type: 'video', duration: '25min', completed: true, locked: false },
          { id: 4, title: 'Quiz: Fundamentos', type: 'quiz', duration: '10min', completed: true, locked: false }
        ]
      },
      {
        id: 2,
        title: 'React com TypeScript',
        description: 'Integre TypeScript com React de forma eficiente',
        completed: false,
        progress: 60,
        lessons: [
          { id: 5, title: 'Componentes Tipados', type: 'video', duration: '30min', completed: true, locked: false },
          { id: 6, title: 'Props e State Tipados', type: 'video', duration: '25min', completed: true, locked: false },
          { id: 7, title: 'Hooks Avançados', type: 'video', duration: '35min', completed: false, locked: false },
          { id: 8, title: 'Context API Tipada', type: 'video', duration: '40min', completed: false, locked: false },
          { id: 9, title: 'Projeto Prático', type: 'assignment', duration: '60min', completed: false, locked: true }
        ]
      },
      {
        id: 3,
        title: 'Testes e Deploy',
        description: 'Teste e publique suas aplicações React',
        completed: false,
        progress: 0,
        lessons: [
          { id: 10, title: 'Testes Unitários', type: 'video', duration: '45min', completed: false, locked: true },
          { id: 11, title: 'Testes de Integração', type: 'video', duration: '50min', completed: false, locked: true },
          { id: 12, title: 'Deploy na Vercel', type: 'video', duration: '30min', completed: false, locked: true }
        ]
      }
    ]
  };

  const handleContinueLearning = () => {
    if (courseData.nextLesson) {
      navigate(`/course/${courseId}/lesson/${courseData.nextLesson.moduleId}/${courseData.nextLesson.lessonId}`);
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (lesson.locked) {
      addNotification({
        type: 'warning',
        message: 'Complete as aulas anteriores para desbloquear'
      });
      return;
    }

    // Find the module that contains this lesson
    const module = courseData.modules.find(m => m.lessons.some(l => l.id === lesson.id));
    if (module) {
      navigate(`/course/${courseId}/lesson/${module.id}/${lesson.id}`);
    }
  };

  const handleDownloadCertificate = () => {
    if (courseData.progress === 100) {
      addNotification({
        type: 'success',
        message: 'Certificado baixado com sucesso!'
      });
    } else {
      addNotification({
        type: 'warning',
        message: 'Complete o curso para baixar o certificado'
      });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'assignment': return <BookOpen className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-blue-400';
      case 'text': return 'text-green-400';
      case 'quiz': return 'text-yellow-400';
      case 'assignment': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Course Header */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                {courseData.thumbnail}
              </div>
              <div className="flex-1">
                <h2 className="text-white text-lg font-bold mb-1">{courseData.title}</h2>
                <p className="text-gray-300 text-sm mb-2">por {courseData.instructor}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{courseData.totalDuration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{courseData.completedLessons}/{courseData.totalLessons} aulas</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Progresso do Curso</span>
                <span className="text-blue-400 font-medium">{courseData.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${courseData.progress}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleContinueLearning}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Continuar Aprendendo
              </Button>
              {courseData.certificate && (
                <Button
                  variant="outline"
                  onClick={handleDownloadCertificate}
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  <Award className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-white font-semibold">{courseData.completedLessons}</div>
              <div className="text-gray-400 text-xs">Concluídas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-white font-semibold">{courseData.progress}%</div>
              <div className="text-gray-400 text-xs">Progresso</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-white font-semibold">15</div>
              <div className="text-gray-400 text-xs">Dias</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Visão Geral', icon: TrendingUp },
            { id: 'content', name: 'Conteúdo', icon: BookOpen },
            { id: 'progress', name: 'Progresso', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Next Lesson */}
            {courseData.nextLesson && (
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-blue-300 font-medium mb-1">Próxima Aula</h4>
                      <p className="text-white text-sm">{courseData.nextLesson.title}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleContinueLearning}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Informações do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Data de Inscrição</span>
                  <span className="text-white text-sm">
                    {new Date(courseData.enrolledDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Último Acesso</span>
                  <span className="text-white text-sm">
                    {new Date(courseData.lastAccessed).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Duração Total</span>
                  <span className="text-white text-sm">{courseData.totalDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Certificado</span>
                  <span className="text-green-400 text-sm">
                    {courseData.certificate ? 'Disponível' : 'Não disponível'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Sobre o Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {courseData.description}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {courseData.modules.map((module) => (
              <Card key={module.id} className="bg-black/20 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      {module.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                      )}
                      {module.title}
                    </CardTitle>
                    <span className="text-blue-400 text-sm">{module.progress}%</span>
                  </div>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                        lesson.completed
                          ? 'bg-green-500/10 border-green-500/20'
                          : lesson.locked
                          ? 'bg-gray-500/10 border-gray-500/20'
                          : 'bg-blue-500/10 border-blue-500/20 hover:border-blue-400/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${getLessonTypeColor(lesson.type)}`}>
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : lesson.locked ? (
                            <Lock className="w-4 h-4 text-gray-500" />
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                        </div>
                        <div>
                          <h5 className={`text-sm font-medium ${
                            lesson.locked ? 'text-gray-500' : 'text-white'
                          }`}>
                            {lesson.title}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration}</span>
                            <span className="capitalize">{lesson.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartLesson(lesson)}
                        disabled={lesson.locked}
                        className={`${
                          lesson.completed
                            ? 'text-green-400 hover:text-green-300'
                            : lesson.locked
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        {lesson.completed ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Overall Progress */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {courseData.progress}%
                  </div>
                  <p className="text-gray-400 text-sm">Curso Concluído</p>
                </div>
                
                <div className="space-y-3">
                  {courseData.modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{module.title}</span>
                        <span className="text-blue-400">{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            module.completed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Conquistas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h5 className="text-green-300 font-medium text-sm">Primeiro Módulo Completo</h5>
                    <p className="text-green-200 text-xs">Parabéns por completar seu primeiro módulo!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Star className="w-6 h-6 text-blue-400" />
                  <div>
                    <h5 className="text-blue-300 font-medium text-sm">Meio Caminho Andado</h5>
                    <p className="text-blue-200 text-xs">Você já completou mais de 50% do curso!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                  <Award className="w-6 h-6 text-gray-500" />
                  <div>
                    <h5 className="text-gray-400 font-medium text-sm">Certificado de Conclusão</h5>
                    <p className="text-gray-500 text-xs">Complete o curso para desbloquear</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
