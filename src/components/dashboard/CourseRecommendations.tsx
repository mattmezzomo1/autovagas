import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Clock, ExternalLink, Tag } from 'lucide-react';
import { Course } from '../../types/course';
import { courseService } from '../../services/CourseService';
import { useAuthStore } from '../../store/auth';

export const CourseRecommendations: React.FC = () => {
  const { profile } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendedCourses();
  }, []);

  const loadRecommendedCourses = () => {
    setIsLoading(true);
    try {
      // Obter cursos recomendados com base no perfil do usuário
      const skills = profile.skills || [];
      const jobTitle = profile.jobTitle || '';
      const recommendedCourses = courseService.getRecommendedCourses(skills, jobTitle);
      setCourses(recommendedCourses);
    } catch (error) {
      console.error('Erro ao carregar cursos recomendados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-purple-200 mb-2">Nenhum curso recomendado encontrado</p>
          <p className="text-sm text-gray-400">
            Adicione mais habilidades ao seu perfil para receber recomendações personalizadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium text-white">{course.title}</h4>
                <p className="text-sm text-purple-200">{course.provider}</p>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    course.level === 'iniciante' ? 'bg-green-500/20 text-green-300' :
                    course.level === 'intermediário' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {course.level}
                  </span>
                  
                  {course.rating && (
                    <span className="flex items-center gap-1 text-yellow-300 text-xs">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                  
                  {course.duration && (
                    <span className="flex items-center gap-1 text-purple-200 text-xs">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-gray-400 line-clamp-2">{course.description}</p>
                
                {course.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded-full text-xs text-purple-200"
                      >
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 3 && (
                      <span className="text-xs text-purple-300">+{course.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                {course.price !== undefined && (
                  <div className="text-right">
                    {course.discountPrice !== undefined ? (
                      <>
                        <span className="text-gray-400 text-xs line-through">R$ {course.price.toFixed(2)}</span>
                        <p className="text-white font-medium">R$ {course.discountPrice.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-white font-medium">R$ {course.price.toFixed(2)}</p>
                    )}
                  </div>
                )}
                
                <a 
                  href={course.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ver curso
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
