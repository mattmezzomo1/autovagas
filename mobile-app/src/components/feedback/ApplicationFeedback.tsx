import React, { useState, useEffect } from 'react';
import { Check, Loader, AlertCircle, X, Bot, Zap, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface ApplicationFeedbackProps {
  isVisible: boolean;
  jobTitle: string;
  company: string;
  onClose: () => void;
  onComplete?: () => void;
}

type ApplicationStatus = 'preparing' | 'analyzing' | 'applying' | 'success' | 'error';

export const ApplicationFeedback: React.FC<ApplicationFeedbackProps> = ({
  isVisible,
  jobTitle,
  company,
  onClose,
  onComplete
}) => {
  const [status, setStatus] = useState<ApplicationStatus>('preparing');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = {
    preparing: {
      icon: Bot,
      title: 'Preparando aplicação',
      description: 'Analisando seus dados e a vaga...',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    analyzing: {
      icon: Zap,
      title: 'Analisando compatibilidade',
      description: 'Verificando match com seus requisitos...',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    applying: {
      icon: Loader,
      title: 'Enviando aplicação',
      description: 'Aplicando para a vaga automaticamente...',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    success: {
      icon: Check,
      title: 'Aplicação enviada!',
      description: 'Sua candidatura foi enviada com sucesso.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    error: {
      icon: AlertCircle,
      title: 'Erro na aplicação',
      description: 'Não foi possível enviar a aplicação.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    const sequence = async () => {
      // Preparando (0-25%)
      setStatus('preparing');
      setCurrentStep('Carregando dados do perfil...');
      await animateProgress(0, 25, 1000);

      // Analisando (25-60%)
      setStatus('analyzing');
      setCurrentStep('Calculando compatibilidade...');
      await animateProgress(25, 60, 1500);

      // Aplicando (60-90%)
      setStatus('applying');
      setCurrentStep('Preenchendo formulário...');
      await animateProgress(60, 90, 2000);

      // Finalizando (90-100%)
      setCurrentStep('Finalizando aplicação...');
      await animateProgress(90, 100, 500);

      // Resultado final
      const success = Math.random() > 0.1; // 90% de sucesso
      setStatus(success ? 'success' : 'error');
      
      if (success && onComplete) {
        setTimeout(() => onComplete(), 1000);
      }
    };

    sequence();
  }, [isVisible, onComplete]);

  const animateProgress = (from: number, to: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentProgress = from + (to - from) * progress;
        
        setProgress(currentProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  if (!isVisible) return null;

  const currentStepData = steps[status];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 w-full max-w-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Aplicação Automática</h3>
            {(status === 'success' || status === 'error') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Job Info */}
          <div className="mb-6 p-3 bg-slate-800 rounded-lg">
            <h4 className="text-white font-medium">{jobTitle}</h4>
            <p className="text-slate-400 text-sm">{company}</p>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full ${currentStepData.bgColor} flex items-center justify-center mx-auto mb-4`}>
              <Icon 
                className={`w-8 h-8 ${currentStepData.color} ${status === 'applying' ? 'animate-spin' : ''}`} 
              />
            </div>
            
            <h4 className="text-white font-semibold text-lg mb-2">
              {currentStepData.title}
            </h4>
            
            <p className="text-slate-400 text-sm mb-4">
              {currentStepData.description}
            </p>

            {status !== 'success' && status !== 'error' && (
              <div className="space-y-2">
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Current Step */}
                <p className="text-slate-500 text-xs">
                  {currentStep}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
                <Check className="w-4 h-4" />
                <span>Aplicação adicionada à fila de processamento</span>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continuar
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Tente novamente em alguns minutos</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setStatus('preparing');
                    setProgress(0);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status !== 'success' && status !== 'error' && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Processando...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
