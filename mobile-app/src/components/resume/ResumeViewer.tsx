import React, { useState } from 'react';
import { X, Download, Share2, Edit, ZoomIn, ZoomOut, RotateCw, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface ResumeViewerProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const ResumeViewer: React.FC<ResumeViewerProps> = ({
  isVisible,
  onClose,
  onEdit
}) => {
  const { addNotification } = useAppStore();
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleDownload = () => {
    // Simular download do PDF
    addNotification({
      type: 'success',
      message: 'Currículo baixado com sucesso!'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Currículo',
        text: 'Confira meu currículo profissional',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        type: 'success',
        message: 'Link copiado para a área de transferência!'
      });
    }
  };

  const handlePrint = () => {
    window.print();
    addNotification({
      type: 'info',
      message: 'Abrindo janela de impressão...'
    });
  };

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 25);
    }
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-white text-lg font-semibold">Visualizar Currículo</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-white text-sm min-w-[60px] text-center">
              {zoom}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/10"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-800 p-4">
        <div className="flex justify-center">
          <div 
            className="bg-white shadow-2xl transition-all duration-300"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center top'
            }}
          >
            {/* Simulated PDF Content */}
            <div className="w-[210mm] min-h-[297mm] p-8 text-black bg-white">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">João Silva</h1>
                <p className="text-lg text-gray-600 mb-1">Desenvolvedor Full Stack</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📧 joao.silva@email.com | 📱 (11) 99999-9999</p>
                  <p>🌐 linkedin.com/in/joaosilva | 📍 São Paulo, SP</p>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
                  RESUMO PROFISSIONAL
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Desenvolvedor Full Stack com 5+ anos de experiência em React, Node.js e TypeScript. 
                  Especialista em desenvolvimento de aplicações web modernas e escaláveis. Experiência 
                  em metodologias ágeis, arquitetura de software e liderança técnica de equipes.
                </p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
                  EXPERIÊNCIA PROFISSIONAL
                </h2>
                
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">Senior Full Stack Developer</h3>
                    <span className="text-sm text-gray-600">2022 - Presente</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">TechCorp Solutions • São Paulo, SP</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    <li>Desenvolvimento de aplicações React com TypeScript</li>
                    <li>Arquitetura e implementação de APIs REST com Node.js</li>
                    <li>Liderança técnica de equipe de 4 desenvolvedores</li>
                    <li>Implementação de testes automatizados (Jest, Cypress)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">Full Stack Developer</h3>
                    <span className="text-sm text-gray-600">2020 - 2022</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">StartupTech • São Paulo, SP</p>
                  <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                    <li>Desenvolvimento de plataforma SaaS com React e Node.js</li>
                    <li>Integração com APIs de terceiros (Stripe, AWS)</li>
                    <li>Otimização de performance e SEO</li>
                  </ul>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
                  HABILIDADES TÉCNICAS
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Frontend</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• React, Next.js, TypeScript</li>
                      <li>• HTML5, CSS3, Tailwind CSS</li>
                      <li>• Redux, Zustand</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Backend</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Node.js, Express, NestJS</li>
                      <li>• PostgreSQL, MongoDB</li>
                      <li>• Docker, AWS, Vercel</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
                  FORMAÇÃO ACADÊMICA
                </h2>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">Bacharelado em Ciência da Computação</h3>
                    <span className="text-sm text-gray-600">2016 - 2020</span>
                  </div>
                  <p className="text-sm text-gray-600">Universidade de São Paulo (USP)</p>
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
                  CERTIFICAÇÕES
                </h2>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• AWS Certified Developer Associate (2023)</li>
                  <li>• React Developer Certification - Meta (2022)</li>
                  <li>• Scrum Master Certified (2021)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            <Button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
