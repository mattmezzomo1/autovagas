import React, { useState } from 'react';
import { X, Play, Clock, Users, Star, Award, BookOpen, CheckCircle, Lock, Download, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  longDescription: string;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  rating: number;
  studentsCount: number;
  price: number;
  originalPrice?: number;
  category: string;
  thumbnail: string;
  skills: string[];
  modules: {
    id: number;
    title: string;
    duration: string;
    lessons: number;
    preview: boolean;
  }[];
  requirements: string[];
  whatYouWillLearn: string[];
  certificate: boolean;
  language: string;
  lastUpdated: string;
}

interface CoursePreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  course: Course | null;
  onEnroll: (courseId: number) => void;
}

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
  isVisible,
  onClose,
  course,
  onEnroll
}) => {
  const { addNotification } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

  if (!isVisible || !course) return null;

  const handleEnroll = () => {
    setShowEnrollConfirm(true);
  };

  const confirmEnrollment = () => {
    onEnroll(course.id);
    setShowEnrollConfirm(false);
    onClose();
    addNotification({
      type: 'success',
      message: `Inscrição realizada com sucesso em "${course.title}"!`
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'text-green-400 bg-green-500/10';
      case 'Intermediário': return 'text-yellow-400 bg-yellow-500/10';
      case 'Avançado': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const discount = course.originalPrice ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-white text-lg font-semibold flex-1 text-center px-4">
            Preview do Curso
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950">
        {/* Course Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-4 opacity-80" />
              <p className="text-white/80 text-sm">Preview do Curso</p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                {course.category}
              </span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">{course.title}</h3>
            <p className="text-gray-300 text-sm">por {course.instructor}</p>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">{course.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.studentsCount.toLocaleString()} alunos</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{course.language}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <div className="text-2xl font-bold text-white">
              R$ {course.price.toFixed(2)}
            </div>
            {course.originalPrice && (
              <>
                <div className="text-lg text-gray-500 line-through">
                  R$ {course.originalPrice.toFixed(2)}
                </div>
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {discount}% OFF
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            {[
              { id: 'overview', name: 'Visão Geral' },
              { id: 'curriculum', name: 'Conteúdo' },
              { id: 'instructor', name: 'Instrutor' }
            ].map((tab) => (
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
                {tab.name}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-white font-semibold mb-3">Sobre este curso</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{course.longDescription}</p>
              </div>

              {/* What you'll learn */}
              <div>
                <h4 className="text-white font-semibold mb-3">O que você vai aprender</h4>
                <div className="space-y-2">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-white font-semibold mb-3">Requisitos</h4>
                <div className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-white font-semibold mb-3">Habilidades que você desenvolverá</h4>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certificate */}
              {course.certificate && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <div>
                      <h5 className="text-yellow-300 font-medium">Certificado de Conclusão</h5>
                      <p className="text-yellow-200 text-sm">
                        Receba um certificado ao concluir o curso
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Conteúdo do Curso</h4>
                <span className="text-gray-400 text-sm">
                  {course.modules.length} módulos • {course.modules.reduce((sum, m) => sum + m.lessons, 0)} aulas
                </span>
              </div>

              {course.modules.map((module, index) => (
                <Card key={module.id} className="bg-black/20 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">
                        {index + 1}. {module.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        {module.preview && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                            Preview
                          </span>
                        )}
                        <Lock className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{module.lessons} aulas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {course.instructor.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{course.instructor}</h4>
                  <p className="text-gray-400 text-sm">Instrutor Especialista</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>4.8 avaliação</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>15.2k alunos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-white font-medium mb-2">Sobre o instrutor</h5>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Especialista em desenvolvimento web com mais de 8 anos de experiência. 
                  Trabalhou em empresas como Google e Microsoft, desenvolvendo aplicações 
                  de grande escala. Apaixonado por ensinar e compartilhar conhecimento.
                </p>
              </div>

              <div>
                <h5 className="text-white font-medium mb-2">Experiência</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300 text-sm">Senior Developer na Google (2020-2023)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300 text-sm">Tech Lead na Microsoft (2018-2020)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-gray-300 text-sm">Full Stack Developer na Startup (2016-2018)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        {!showEnrollConfirm ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300"
            >
              Fechar
            </Button>
            <Button
              onClick={handleEnroll}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Inscrever-se Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Confirmar Inscrição</h4>
              <p className="text-blue-200 text-sm mb-3">
                Você está prestes a se inscrever no curso "{course.title}" por R$ {course.price.toFixed(2)}.
              </p>
              <div className="text-blue-200 text-xs">
                • Acesso vitalício ao conteúdo
                • Certificado de conclusão
                • Suporte do instrutor
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEnrollConfirm(false)}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmEnrollment}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmar Inscrição
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
