import React, { useState, useEffect } from 'react';
import { Book, ExternalLink, Star } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  imageUrl?: string;
  price?: number;
  discountPrice?: number;
  duration?: string;
  level: 'iniciante' | 'intermediário' | 'avançado';
  tags: string[];
  category: string;
  rating?: number;
  featured: boolean;
}

const CourseRecommendations: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    const fetchRecommendedCourses = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCourses: Course[] = [
          {
            id: '1',
            title: 'JavaScript Completo: Do Zero ao Avançado',
            description: 'Aprenda JavaScript do zero ao avançado com projetos práticos.',
            provider: 'Udemy',
            url: 'https://www.udemy.com/course/javascript-completo/',
            imageUrl: 'https://example.com/images/javascript-course.jpg',
            price: 199.99,
            discountPrice: 89.99,
            duration: '40 horas',
            level: 'iniciante',
            tags: ['JavaScript', 'Frontend', 'Web Development', 'ES6'],
            category: 'Programação',
            rating: 4.8,
            featured: true,
          },
          {
            id: '2',
            title: 'React: Desenvolvendo Aplicações Modernas',
            description: 'Aprenda a criar aplicações web modernas com React.',
            provider: 'Alura',
            url: 'https://www.alura.com.br/curso-online-react',
            imageUrl: 'https://example.com/images/react-course.jpg',
            price: 249.99,
            discountPrice: 129.99,
            duration: '35 horas',
            level: 'intermediário',
            tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
            category: 'Programação',
            rating: 4.7,
            featured: true,
          },
          {
            id: '3',
            title: 'Node.js: Construindo APIs Robustas',
            description: 'Aprenda a construir APIs RESTful com Node.js e Express.',
            provider: 'Udemy',
            url: 'https://www.udemy.com/course/nodejs-apis/',
            imageUrl: 'https://example.com/images/nodejs-course.jpg',
            price: 179.99,
            discountPrice: 99.99,
            duration: '30 horas',
            level: 'intermediário',
            tags: ['Node.js', 'JavaScript', 'Backend', 'API', 'Express'],
            category: 'Programação',
            rating: 4.6,
            featured: false,
          },
        ];
        
        setCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching recommended courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
        </div>
        <p className="text-purple-200 mb-4">
          Ainda não temos recomendações de cursos para você. Complete seu perfil para receber sugestões personalizadas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Book className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Cursos Recomendados</h3>
      </div>
      <p className="text-purple-200 mb-4">
        Cursos selecionados com base no seu perfil e interesses
      </p>
      
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-white">{course.title}</h4>
                <p className="text-sm text-purple-200 mt-1">{course.provider}</p>
                <div className="flex items-center mt-1">
                  {course.rating && (
                    <div className="flex items-center text-yellow-400 mr-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs ml-1">{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-xs text-purple-300">{course.level}</span>
                  {course.duration && (
                    <span className="text-xs text-purple-300 ml-2">• {course.duration}</span>
                  )}
                </div>
                <div className="mt-2">
                  {course.discountPrice && course.price && (
                    <div className="flex items-center">
                      <span className="text-green-400 font-medium">
                        R$ {course.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-purple-300 text-xs line-through ml-2">
                        R$ {course.price.toFixed(2)}
                      </span>
                      <span className="text-green-400 text-xs ml-2">
                        {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver curso
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendations;
