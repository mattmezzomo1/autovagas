import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  CheckCircle, 
  BarChart3,
  Calendar,
  Users,
  Star,
  Download,
  Filter,
  Search,
  Grid3X3,
  List,
  TrendingUp,
  PlayCircle,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  duration: number; // em minutos
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  certificateAvailable: boolean;
  certificateEarned: boolean;
  modules: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessonsCount: number;
  completedLessons: number;
  isUnlocked: boolean;
}

export const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Desenvolvimento Full Stack com React e Node.js',
          description: 'Aprenda a criar aplicações web completas do zero',
          instructor: 'João Silva',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
          duration: 1200, // 20 horas
          totalLessons: 45,
          completedLessons: 23,
          progressPercentage: 51,
          category: 'Programação',
          level: 'intermediate',
          rating: 4.8,
          enrolledAt: '2024-01-15',
          lastAccessedAt: '2024-01-20',
          certificateAvailable: true,
          certificateEarned: false,
          modules: [
            {
              id: 'm1',
              title: 'Fundamentos do React',
              description: 'Conceitos básicos e componentes',
              duration: 300,
              lessonsCount: 12,
              completedLessons: 12,
              isUnlocked: true
            },
            {
              id: 'm2',
              title: 'Estado e Props',
              description: 'Gerenciamento de estado em React',
              duration: 240,
              lessonsCount: 8,
              completedLessons: 6,
              isUnlocked: true
            },
            {
              id: 'm3',
              title: 'Backend com Node.js',
              description: 'Criando APIs REST',
              duration: 360,
              lessonsCount: 15,
              completedLessons: 0,
              isUnlocked: false
            }
          ]
        },
        {
          id: '2',
          title: 'Design UX/UI Completo',
          description: 'Do wireframe ao protótipo funcional',
          instructor: 'Maria Santos',
          thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
          duration: 900, // 15 horas
          totalLessons: 32,
          completedLessons: 32,
          progressPercentage: 100,
          category: 'Design',
          level: 'beginner',
          rating: 4.9,
          enrolledAt: '2023-12-10',
          lastAccessedAt: '2024-01-18',
          certificateAvailable: true,
          certificateEarned: true,
          modules: []
        },
        {
          id: '3',
          title: 'Marketing Digital e Growth Hacking',
          description: 'Estratégias para crescimento acelerado',
          instructor: 'Pedro Costa',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          duration: 600, // 10 horas
          totalLessons: 25,
          completedLessons: 5,
          progressPercentage: 20,
          category: 'Marketing',
          level: 'intermediate',
          rating: 4.7,
          enrolledAt: '2024-01-22',
          lastAccessedAt: '2024-01-22',
          certificateAvailable: true,
          certificateEarned: false,
          modules: []
        }
      ];
      
      setCourses(mockCourses);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">Nenhum curso encontrado</h3>
        <p className="text-purple-200 mb-6">Você ainda não possui cursos. Explore nossa biblioteca e comece a aprender!</p>
        <button
          onClick={() => navigate('/courses')}
          className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 flex items-center gap-2 mx-auto"
        >
          <BookOpen className="w-5 h-5" />
          Explorar Cursos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/20 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{courses.length}</div>
              <div className="text-purple-300 text-sm">Cursos Ativos</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {courses.filter(c => c.certificateEarned).length}
              </div>
              <div className="text-purple-300 text-sm">Concluídos</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {Math.round(courses.reduce((acc, course) => acc + course.progressPercentage, 0) / courses.length)}%
              </div>
              <div className="text-purple-300 text-sm">Progresso Médio</div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {courses.filter(c => c.certificateAvailable).length}
              </div>
              <div className="text-purple-300 text-sm">Certificados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category === 'all' ? 'Todas as Categorias' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-purple-500 text-white' 
                : 'bg-black/20 text-purple-300 hover:bg-black/30'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-purple-500 text-white' 
                : 'bg-black/20 text-purple-300 hover:bg-black/30'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-200 cursor-pointer group ${
              viewMode === 'list' ? 'flex' : ''
            }`}
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
              <img
                src={course.thumbnail}
                alt={course.title}
                className={`w-full object-cover ${viewMode === 'list' ? 'h-32' : 'h-48'}`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
              
              {/* Progress overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>

              {/* Certificate badge */}
              {course.certificateEarned && (
                <div className="absolute top-2 right-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              )}
            </div>

            <div className="p-4 flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-purple-200 text-sm mb-2">por {course.instructor}</p>
                </div>
                <button className="text-purple-400 hover:text-purple-300 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-purple-300 text-sm mb-3 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs ${getLevelColor(course.level)}`}>
                  {getLevelLabel(course.level)}
                </span>
                <span className="text-purple-400 text-xs">{course.category}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-purple-300 mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.totalLessons} aulas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-purple-300">Progresso</span>
                    <span className="text-white font-medium">{course.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.id}/watch`);
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {course.progressPercentage > 0 ? 'Continuar' : 'Iniciar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
