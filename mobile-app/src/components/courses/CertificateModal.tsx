import React, { useState } from 'react';
import { X, Download, Share2, Award, Calendar, BookOpen, Star, CheckCircle, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface Course {
  id: number;
  title: string;
  instructor: string;
  completedDate: string;
  duration: string;
  grade: number;
  skills: string[];
}

interface CertificateModalProps {
  isVisible: boolean;
  onClose: () => void;
  course: Course | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isVisible,
  onClose,
  course
}) => {
  const { addNotification } = useAppStore();
  const [downloading, setDownloading] = useState(false);

  if (!isVisible || !course) return null;

  const handleDownload = async () => {
    setDownloading(true);
    
    // Simular download
    setTimeout(() => {
      setDownloading(false);
      addNotification({
        type: 'success',
        message: 'Certificado baixado com sucesso!'
      });
    }, 2000);
  };

  const handleShare = () => {
    // Simular compartilhamento
    if (navigator.share) {
      navigator.share({
        title: `Certificado - ${course.title}`,
        text: `Acabei de concluir o curso "${course.title}" na AutoVagas!`,
        url: window.location.href
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        type: 'success',
        message: 'Link copiado para a área de transferência!'
      });
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-400';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 90) return 'Excelente';
    if (grade >= 80) return 'Muito Bom';
    if (grade >= 70) return 'Bom';
    return 'Satisfatório';
  };

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
          <h2 className="text-white text-lg font-semibold">Certificado de Conclusão</h2>
          <div className="w-10" />
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Certificate Card */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/20 mb-6">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Certificado de Conclusão</h3>
                <p className="text-gray-300 text-sm">AutoVagas - Plataforma de Educação Profissional</p>
              </div>

              {/* Certificate Content */}
              <div className="text-center mb-8">
                <p className="text-gray-300 text-sm mb-4">Certificamos que</p>
                <h4 className="text-xl font-bold text-white mb-4">João da Silva</h4>
                <p className="text-gray-300 text-sm mb-2">concluiu com sucesso o curso</p>
                <h5 className="text-lg font-semibold text-blue-300 mb-6">"{course.title}"</h5>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="bg-black/20 rounded-lg p-4">
                      <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Data de Conclusão</p>
                      <p className="text-white text-sm font-medium">
                        {new Date(course.completedDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-black/20 rounded-lg p-4">
                      <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Carga Horária</p>
                      <p className="text-white text-sm font-medium">{course.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Star className={`w-6 h-6 ${getGradeColor(course.grade)}`} />
                    <span className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>
                      {course.grade}%
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${getGradeColor(course.grade)}`}>
                    {getGradeLabel(course.grade)}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-2">Instrutor</p>
                  <p className="text-white text-sm font-medium">{course.instructor}</p>
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <p>Certificado ID: AV-{course.id}-2024</p>
                    <p>Verificação: autovagas.com/verify</p>
                  </div>
                  <div className="text-right">
                    <p>AutoVagas Educação</p>
                    <p>Plataforma Oficial</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card className="bg-black/20 border-white/10 mb-6">
            <CardContent className="p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Detalhes do Curso
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-gray-400 text-sm mb-2">Habilidades Desenvolvidas</h5>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-gray-400 text-sm mb-1">Instrutor</h5>
                    <p className="text-white text-sm">{course.instructor}</p>
                  </div>
                  <div>
                    <h5 className="text-gray-400 text-sm mb-1">Duração</h5>
                    <p className="text-white text-sm">{course.duration}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Conquistas
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h5 className="text-green-300 font-medium text-sm">Curso Concluído</h5>
                    <p className="text-green-200 text-xs">Parabéns por completar todos os módulos!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Star className="w-5 h-5 text-blue-400" />
                  <div>
                    <h5 className="text-blue-300 font-medium text-sm">Excelente Performance</h5>
                    <p className="text-blue-200 text-xs">Nota final acima de {course.grade}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <h5 className="text-purple-300 font-medium text-sm">Certificado Desbloqueado</h5>
                    <p className="text-purple-200 text-xs">Certificado oficial disponível para download</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-gray-600 text-gray-300"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Baixando...' : 'Baixar PDF'}
          </Button>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-gray-500 text-xs">
            Este certificado pode ser verificado em autovagas.com/verify
          </p>
        </div>
      </div>
    </div>
  );
};
