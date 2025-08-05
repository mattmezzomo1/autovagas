import React, { useEffect, useState } from 'react';
import { Stepper } from '../components/Stepper';
import { BasicInfo } from '../components/signup/BasicInfo';
import { ProfessionalProfile } from '../components/signup/ProfessionalProfile';
import { Documents } from '../components/signup/Documents';
import { Preferences } from '../components/signup/Preferences';
import { useAuthStore } from '../store/auth';
import { Sparkles, Info } from 'lucide-react';

export const Signup: React.FC = () => {
  const { steps, currentStep, setStep, completeStep } = useAuthStore();
  const [animateIn, setAnimateIn] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [demoTooltip, setDemoTooltip] = useState(true);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateIn(true);

    // Auto-hide demo tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => setDemoTooltip(false), 5000);
    return () => clearTimeout(tooltipTimer);
  }, []);

  // Animation when changing steps
  const [animateStep, setAnimateStep] = useState(true);
  useEffect(() => {
    setAnimateStep(false);
    const timer = setTimeout(() => setAnimateStep(true), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfo demoMode={demoMode} />;
      case 2:
        return <ProfessionalProfile demoMode={demoMode} />;
      case 3:
        return <Documents demoMode={demoMode} />;
      case 4:
        return <Preferences demoMode={demoMode} />;
      default:
        return <BasicInfo demoMode={demoMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`max-w-4xl mx-auto relative transition-all duration-700 ease-out transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 pb-2">
            Crie sua conta profissional
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <p className="text-lg sm:text-xl text-purple-200">
              Configure seu perfil para encontrar as melhores oportunidades com IA
            </p>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex justify-center mb-8 relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20 flex items-center gap-3">
            <span className="text-sm text-purple-200">Modo Demo:</span>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${demoMode ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${demoMode ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>

          {demoTooltip && demoMode && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-indigo-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg border border-indigo-700 text-sm max-w-xs animate-pulse">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-300" />
                <span>Dados pré-preenchidos para demonstração</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-indigo-900/90 border-r border-b border-indigo-700"></div>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/20 shadow-2xl relative">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>

          {/* Content */}
          <div className="relative z-10">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={setStep}
            />

            <div className={`mt-12 transition-all duration-500 ease-out ${animateStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};