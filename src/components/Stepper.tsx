import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { SignupSteps } from '../types/auth';

interface StepperProps {
  steps: SignupSteps;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center group">
              <button
                onClick={() => step.isCompleted && onStepClick(step.id)}
                disabled={!step.isCompleted && step.id !== currentStep}
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    step.isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-emerald-400 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                      : currentStep === step.id
                      ? 'bg-gradient-to-br from-indigo-400 to-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                      : 'border-white/20 bg-white/5 backdrop-blur-sm text-white/60'
                  }
                  ${step.isCompleted ? 'cursor-pointer hover:-translate-y-1' : currentStep === step.id ? 'scale-110' : 'cursor-default'}
                  transform-gpu
                `}
              >
                {step.isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : currentStep === step.id ? (
                  <div className="relative">
                    <span className="text-lg font-semibold">{step.id}</span>
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-2 text-yellow-300 animate-pulse" />
                  </div>
                ) : (
                  <span className="text-lg font-semibold">{step.id}</span>
                )}
              </button>
              <div className="text-center mt-4">
                <div className={`text-sm font-medium transition-colors duration-300
                  ${currentStep === step.id ? 'text-white' : step.isCompleted ? 'text-purple-200' : 'text-white/60'}
                `}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 max-w-[120px] transition-colors duration-300
                  ${currentStep === step.id ? 'text-purple-200' : 'text-white/40'}
                `}>
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 relative mx-2">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out
                    ${step.isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/10'}`}
                />
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out
                    ${currentStep > step.id ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-transparent'}`}
                  style={{
                    width: currentStep === step.id + 1 ? '50%' : '0%',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};