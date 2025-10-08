import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Search, Star, Clock, Play, BookOpen, Filter, TrendingUp,
  Award, CheckCircle, Users, Target, Zap, Calendar,
  BarChart3, Trophy, Bookmark, Heart, Download, Share2,
  PlayCircle, PauseCircle, RotateCcw, FastForward, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { CoursePreviewModal } from '../components/courses/CoursePreviewModal';
import { CertificateModal } from '../components/courses/CertificateModal';
import '../styles/courses.css';

export const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();

  // Estados locais
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recommended' | 'my-courses' | 'completed'>('recommended');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    duration: '',
    price: '',
    rating: ''
  });

  // Estados para tabs responsivas
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Dados mockados
  const [recommendedCourses] = useState([
    {
      id: 1,
      title: 'React Avançado com TypeScript',
      instructor: 'João Silva',
      duration: '8h 30min',
      rating: 4.8,
      reviews: 1247,
      price: 199,
      originalPrice: 299,
      level: 'Avançado',
      category: 'Frontend',
      thumbnail: '🚀',
      students: 15420,
      lastUpdated: '2024-01-10',
      certificate: true,
      bestseller: true,
      skills: ['React', 'TypeScript', 'Hooks', 'Context API'],
      description: 'Domine React com TypeScript e construa aplicações profissionais',
      saved: false
    },
    {
      id: 2,
      title: 'Node.js e Express Completo',
      instructor: 'Maria Santos',
      duration: '12h 15min',
      rating: 4.9,
      reviews: 892,
      price: 249,
      originalPrice: 349,
      level: 'Intermediário',
      category: 'Backend',
      thumbnail: '📘',
      students: 8930,
      lastUpdated: '2024-01-08',
      certificate: true,
      bestseller: false,
      skills: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      description: 'Crie APIs robustas e escaláveis com Node.js',
      saved: true
    },
    {
      id: 3,
      title: 'AWS para Desenvolvedores',
      instructor: 'Carlos Oliveira',
      duration: '15h 45min',
      rating: 4.7,
      reviews: 654,
      price: 349,
      originalPrice: 499,
      level: 'Intermediário',
      category: 'Cloud',
      thumbnail: '☁️',
      students: 5670,
      lastUpdated: '2024-01-05',
      certificate: true,
      bestseller: false,
      skills: ['AWS', 'EC2', 'S3', 'Lambda'],
      description: 'Domine os principais serviços da AWS',
      saved: false
    }
  ]);

  const [myCourses] = useState([
    {
      id: 1,
      title: 'JavaScript Moderno ES6+',
      instructor: 'Ana Costa',
      progress: 75,
      nextLesson: 'Async/Await Avançado',
      currentLesson: 18,
      totalLessons: 24,
      timeSpent: '12h 30min',
      estimatedTime: '4h 15min',
      lastAccessed: '2 dias',
      certificate: false,
      thumbnail: '⚡',
      category: 'JavaScript',
      enrolled: '2024-01-01'
    },
    {
      id: 2,
      title: 'CSS Grid e Flexbox Mastery',
      instructor: 'Pedro Lima',
      progress: 100,
      nextLesson: 'Concluído',
      currentLesson: 18,
      totalLessons: 18,
      timeSpent: '8h 45min',
      estimatedTime: '0min',
      lastAccessed: '1 semana',
      certificate: true,
      thumbnail: '🎨',
      category: 'CSS',
      enrolled: '2023-12-15'
    },
    {
      id: 3,
      title: 'Python para Data Science',
      instructor: 'Lucia Ferreira',
      progress: 45,
      nextLesson: 'Pandas DataFrame',
      currentLesson: 12,
      totalLessons: 28,
      timeSpent: '15h 20min',
      estimatedTime: '18h 40min',
      lastAccessed: '5 dias',
      certificate: false,
      thumbnail: '🐍',
      category: 'Data Science',
      enrolled: '2024-01-10'
    }
  ]);

  const [completedCourses] = useState([
    {
      id: 1,
      title: 'React Avançado com TypeScript',
      instructor: 'João Silva',
      duration: '8h 30min',
      completedDate: '2024-01-15',
      grade: 95,
      thumbnail: '🚀',
      certificate: true,
      skills: ['React', 'TypeScript', 'Hooks', 'Context API'],
      rating: 5
    },
    {
      id: 2,
      title: 'Node.js e Express Completo',
      instructor: 'Maria Santos',
      duration: '12h 15min',
      completedDate: '2024-01-10',
      grade: 88,
      thumbnail: '📘',
      certificate: true,
      skills: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      rating: 5
    },
    {
      id: 3,
      title: 'Python para Data Science',
      instructor: 'Carlos Oliveira',
      duration: '15h 45min',
      completedDate: '2024-01-05',
      grade: 92,
      thumbnail: '🐍',
      certificate: true,
      skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
      rating: 4
    }
  ]);

  const [learningStats] = useState({
    totalCourses: 12,
    completedCourses: 4,
    totalHours: 156,
    certificates: 4,
    currentStreak: 7,
    averageRating: 4.8,
    skillsLearned: 28,
    nextGoal: 'Certificação AWS'
  });

  // Funções para tabs responsivas
  const checkTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

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

  useEffect(() => {
    const handleResize = () => checkTabsScroll();
    const tabsElement = tabsRef.current;

    if (tabsElement) {
      tabsElement.addEventListener('scroll', checkTabsScroll);
      window.addEventListener('resize', handleResize);
      checkTabsScroll(); // Check initial state
    }

    return () => {
      if (tabsElement) {
        tabsElement.removeEventListener('scroll', checkTabsScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Funções
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addNotification({
        type: 'info',
        message: `Buscando por "${query}"...`
      });
    }
  };

  const handleSaveCourse = (courseId: number) => {
    addNotification({
      type: 'success',
      message: 'Curso salvo na lista de desejos!'
    });
  };

  const handlePreviewCourse = (course: any) => {
    // Expandir dados do curso para o preview
    const expandedCourse = {
      ...course,
      longDescription: course.description + '. Este curso abrangente te levará do básico ao avançado, com projetos práticos e exercícios hands-on. Ideal para profissionais que querem se destacar no mercado de trabalho.',
      studentsCount: course.students,
      modules: [
        { id: 1, title: 'Introdução e Fundamentos', duration: '2h', lessons: 8, preview: true },
        { id: 2, title: 'Conceitos Intermediários', duration: '4h', lessons: 12, preview: false },
        { id: 3, title: 'Tópicos Avançados', duration: '3h', lessons: 10, preview: false },
        { id: 4, title: 'Projeto Final', duration: '2h', lessons: 6, preview: false }
      ],
      requirements: [
        'Conhecimento básico de programação',
        'Computador com acesso à internet',
        'Vontade de aprender'
      ],
      whatYouWillLearn: [
        'Dominar os conceitos fundamentais da tecnologia',
        'Criar projetos práticos do zero',
        'Implementar melhores práticas da indústria',
        'Preparar-se para oportunidades de carreira',
        'Desenvolver um portfólio profissional'
      ],
      language: 'Português'
    };

    setSelectedCourse(expandedCourse);
    setShowPreviewModal(true);
  };

  const handleEnrollCourse = (courseId: number) => {
    addNotification({
      type: 'success',
      message: 'Inscrição realizada com sucesso!'
    });
    setShowPreviewModal(false);
  };

  const handleContinueCourse = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewCertificate = (course: any) => {
    setSelectedCertificate(course);
    setShowCertificateModal(true);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante': return 'text-green-400 bg-green-500/20';
      case 'intermediário': return 'text-yellow-400 bg-yellow-500/20';
      case 'avançado': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return 'text-blue-400 bg-blue-500/20';
      case 'backend': return 'text-green-400 bg-green-500/20';
      case 'cloud': return 'text-purple-400 bg-purple-500/20';
      case 'javascript': return 'text-yellow-400 bg-yellow-500/20';
      case 'css': return 'text-pink-400 bg-pink-500/20';
      case 'data science': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="bg-black/20 border-white/10">
          <CardContent className="p-4">
            <div className="search-container">
              <Search className="search-icon w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cursos, instrutores, tecnologias..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">Categoria</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="cloud">Cloud</option>
                    <option value="data-science">Data Science</option>
                  </select>
                  <select
                    className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    value={filters.level}
                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                  >
                    <option value="">Nível</option>
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas de Aprendizado */}
        <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Meu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="progress-stats-grid">
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-lg font-bold">{learningStats.completedCourses}</span>
                </div>
                <p className="text-purple-200 text-xs">Concluídos</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-lg font-bold">{learningStats.totalHours}h</span>
                </div>
                <p className="text-blue-200 text-xs">Estudadas</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-lg font-bold">{learningStats.certificates}</span>
                </div>
                <p className="text-green-200 text-xs">Certificados</p>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-lg font-bold">{learningStats.currentStreak}</span>
                </div>
                <p className="text-orange-200 text-xs">Dias seguidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Tabs Navigation */}
        <div className="w-full bg-gray-800/50 rounded-lg p-1 mb-6">
          <div className="flex space-x-1">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'recommended'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveTab('recommended')}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden xs:inline">Recomendados</span>
              <span className="xs:hidden">Rec.</span>
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'my-courses'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveTab('my-courses')}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden xs:inline">Meus ({myCourses.length})</span>
              <span className="xs:hidden">Meus</span>
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'completed'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Feitos ({completedCourses.length})</span>
              <span className="xs:hidden">Feitos</span>
            </button>
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'recommended' && (
          <Card className="bg-black/20 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Recomendados para Você
                </CardTitle>
                <span className="text-purple-400 text-xs">
                  {recommendedCourses.length} cursos
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="courses-grid space-y-4 md:space-y-0">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="course-card p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm mb-1 truncate">{course.title}</h3>
                            <p className="text-gray-400 text-xs mb-1">{course.instructor}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-400 ml-2"
                            onClick={() => handleSaveCourse(course.id)}
                          >
                            <Heart className={`w-4 h-4 ${course.saved ? 'fill-current text-red-400' : ''}`} />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            {course.rating} ({course.reviews})
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.students.toLocaleString()}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(course.category)}`}>
                            {course.category}
                          </span>
                          {course.bestseller && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                              Bestseller
                            </span>
                          )}
                          {course.certificate && (
                            <Award className="w-4 h-4 text-purple-400" />
                          )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {course.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {course.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                              +{course.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-green-400 font-bold text-sm">R$ {course.price}</span>
                          {course.originalPrice > course.price && (
                            <span className="text-gray-500 text-xs line-through">R$ {course.originalPrice}</span>
                          )}
                        </div>
                        {course.originalPrice > course.price && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-medium">
                            -{Math.round((1 - course.price / course.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                          onClick={() => handlePreviewCourse(course)}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handlePreviewCourse(course)}
                        >
                          Inscrever-se
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meus Cursos */}
        {activeTab === 'my-courses' && (
          <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Meus Cursos
                </CardTitle>
                <span className="text-blue-400 text-xs">
                  {myCourses.length} ativos
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="courses-grid space-y-4 md:space-y-0">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="course-card p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm mb-1 truncate">{course.title}</h3>
                            <p className="text-blue-200 text-xs mb-1">{course.instructor}</p>
                            <p className="text-blue-300 text-xs">
                              {course.progress === 100
                                ? 'Curso concluído!'
                                : `Próxima aula: ${course.nextLesson}`
                              }
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(course.category)}`}>
                              {course.category}
                            </span>
                          </div>
                        </div>

                        {/* Estatísticas do curso */}
                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                          <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                            <div className="text-blue-400 font-medium">{course.currentLesson}/{course.totalLessons}</div>
                            <div className="text-blue-200">Aulas</div>
                          </div>
                          <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                            <div className="text-blue-400 font-medium">{course.timeSpent}</div>
                            <div className="text-blue-200">Estudado</div>
                          </div>
                          <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
                            <div className="text-blue-400 font-medium">{course.estimatedTime}</div>
                            <div className="text-blue-200">Restante</div>
                          </div>
                        </div>

                        {/* Progresso */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-200">Progresso do curso</span>
                            <span className="text-blue-400 font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                              style={{width: `${course.progress}%`}}
                            ></div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-blue-200">
                            <Calendar className="w-3 h-3" />
                            Último acesso: {course.lastAccessed}
                          </div>
                          <div className="flex gap-2">
                            {course.progress === 100 ? (
                              <>
                                {course.certificate && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-500 text-green-400 hover:bg-green-500/10"
                                    onClick={() => addNotification({ type: 'success', message: 'Baixando certificado...' })}
                                  >
                                    <Award className="w-3 h-3 mr-1" />
                                    Certificado
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                                  onClick={() => handleContinueCourse(course.id)}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  Revisar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                                  onClick={() => addNotification({ type: 'info', message: 'Abrindo detalhes...' })}
                                >
                                  <BookOpen className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleContinueCourse(course.id)}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Continuar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Cursos Concluídos */}
        {activeTab === 'completed' && (
          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-400" />
                  Cursos Concluídos
                </CardTitle>
                <span className="text-green-400 text-xs">
                  {completedCourses.length} certificados
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {completedCourses.length > 0 ? (
                <div className="courses-grid space-y-4 md:space-y-0">
                  {completedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="course-card p-4 sm:p-6 rounded-lg bg-green-500/10 border border-green-500/20 hover:border-green-400/40 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          {course.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-3">
                              <h3 className="text-white font-medium text-sm sm:text-base mb-1 truncate">{course.title}</h3>
                              <p className="text-green-200 text-xs sm:text-sm mb-2 truncate">por {course.instructor}</p>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-300">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">Concluído em {new Date(course.completedDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-green-400 font-bold text-xl sm:text-2xl">{course.grade}%</div>
                                <div className="text-green-200 text-xs sm:text-sm whitespace-nowrap">Nota Final</div>
                              </div>
                              {course.certificate && (
                                <Award className="w-6 h-6 text-yellow-400 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Skills desenvolvidas */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {course.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-xs sm:text-sm px-3 py-1 bg-green-500/20 text-green-300 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {course.skills.length > 3 && (
                                <span className="text-xs sm:text-sm px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                                  +{course.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Estatísticas de conclusão */}
                          <div className="grid grid-cols-3 gap-3 mb-4 text-xs sm:text-sm">
                            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-green-400 font-medium text-sm sm:text-base">{course.duration}</div>
                              <div className="text-green-200 mt-1">Duração</div>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                      i < course.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-green-200">Avaliação</div>
                            </div>
                            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-green-400 font-medium text-sm sm:text-base">100%</div>
                              <div className="text-green-200 mt-1">Completo</div>
                            </div>
                          </div>

                          {/* Barra de progresso completa */}
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full w-full"></div>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-3">
                            <Button
                              size="default"
                              variant="outline"
                              className="border-green-500 text-green-300 hover:bg-green-500/10 flex-1"
                              onClick={() => addNotification({ type: 'info', message: 'Compartilhando conquista...' })}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Compartilhar
                            </Button>
                            {course.certificate && (
                              <Button
                                size="default"
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                onClick={() => handleViewCertificate(course)}
                              >
                                <Award className="w-4 h-4 mr-2" />
                                Ver Certificado
                              </Button>
                            )}
                            <Button
                              size="default"
                              variant="outline"
                              className="border-green-500 text-green-300 hover:bg-green-500/10 flex-1"
                                onClick={() => handleContinueCourse(course.id)}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Revisar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                  <p className="text-white text-sm mb-2">Nenhum curso concluído ainda</p>
                  <p className="text-green-200 text-xs mb-4">
                    Complete seus primeiros cursos para ganhar certificados
                  </p>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab('my-courses')}
                  >
                    Ver Meus Cursos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Preview Modal */}
      <CoursePreviewModal
        isVisible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        course={selectedCourse}
        onEnroll={handleEnrollCourse}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isVisible={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        course={selectedCertificate}
      />
    </MobileLayout>
  );
};
