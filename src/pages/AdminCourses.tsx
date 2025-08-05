import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Tag,
  Clock,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Course } from '../types/course';
import { courseService } from '../services/CourseService';
import { CourseForm } from '../components/admin/CourseForm';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    setIsLoading(true);
    try {
      const allCourses = courseService.getAllCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      showNotification('error', 'Erro ao carregar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = () => {
    setCurrentCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      const success = courseService.deleteCourse(id);
      if (success) {
        showNotification('success', 'Curso excluído com sucesso');
        loadCourses();
      } else {
        showNotification('error', 'Erro ao excluir curso');
      }
    }
  };

  const handleFormSubmit = (success: boolean, message: string) => {
    setShowForm(false);
    showNotification(success ? 'success' : 'error', message);
    if (success) {
      loadCourses();
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Administração de Cursos"
      description="Gerencie os cursos disponíveis para recomendação pela IA"
    >
      {notification && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p>{notification.message}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 pl-10 pr-4 py-2 text-white"
            />
          </div>
          <button
            onClick={handleAddCourse}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white"
          >
            <Plus className="w-5 h-5" />
            Adicionar Curso
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
            <p className="text-purple-200 mb-4">Nenhum curso encontrado</p>
            <button
              onClick={handleAddCourse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-purple-200 border border-white/10"
            >
              <Plus className="w-5 h-5" />
              Adicionar seu primeiro curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-black/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{course.title}</h3>
                    <p className="text-purple-200 text-sm">{course.provider}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.level === 'iniciante' ? 'bg-green-500/20 text-green-300' :
                        course.level === 'intermediário' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {course.level}
                      </span>

                      {course.rating && (
                        <span className="flex items-center gap-1 text-yellow-300 text-sm">
                          <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                          {course.rating.toFixed(1)}
                        </span>
                      )}

                      {course.duration && (
                        <span className="flex items-center gap-1 text-purple-200 text-sm">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-gray-300 line-clamp-2">{course.description}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded-full text-xs text-purple-200"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visitar
                    </a>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-300 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {showForm && (
        <CourseForm
          course={currentCourse}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </AdminLayout>
  );
};
