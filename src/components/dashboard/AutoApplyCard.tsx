import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Activity } from 'lucide-react';

interface AutoApplyCardProps {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

export const AutoApplyCard: React.FC<AutoApplyCardProps> = ({
  isActive,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`auto-apply-card ${className}`}>
      <div className="auto-apply-content">
        <div className="auto-apply-main">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm sm:text-base truncate">
              Auto-Aplicação por IA
            </h3>
            <p className="text-purple-200 text-xs sm:text-sm">
              {isActive
                ? 'Bot ativo e procurando vagas'
                : 'Ative o bot para aplicar automaticamente'}
            </p>
          </div>
        </div>
        
        <div className="auto-apply-actions">
          {isActive && (
            <div className="auto-apply-links">
              <Link
                to="/activity"
                className="auto-apply-link"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Ver atividade</span>
                <span className="sm:hidden">Atividade</span>
              </Link>
              <Link
                to="/scraper"
                className="auto-apply-link"
              >
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Painel do Robô</span>
                <span className="sm:hidden">Painel</span>
              </Link>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className={`toggle-switch toggle-switch-sm ${
              isActive ? 'bg-indigo-500' : 'bg-gray-700'
            }`}
            aria-label={isActive ? 'Desativar auto-aplicação' : 'Ativar auto-aplicação'}
          >
            <span
              className={`toggle-slider toggle-slider-sm ${
                isActive ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de status para mostrar informações adicionais
interface AutoApplyStatusProps {
  isActive: boolean;
  applicationsToday?: number;
  maxApplicationsPerDay?: number;
  lastActivity?: string;
  className?: string;
}

export const AutoApplyStatus: React.FC<AutoApplyStatusProps> = ({
  isActive,
  applicationsToday = 0,
  maxApplicationsPerDay = 50,
  lastActivity,
  className = ''
}) => {
  const progressPercentage = (applicationsToday / maxApplicationsPerDay) * 100;

  return (
    <div className={`bg-white/5 rounded-lg p-3 mt-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-purple-200 text-xs sm:text-sm">Status do Bot</span>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-purple-300 text-xs">Aplicações hoje</span>
          <span className="text-white text-xs font-medium">
            {applicationsToday}/{maxApplicationsPerDay}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        {lastActivity && (
          <div className="flex justify-between items-center">
            <span className="text-purple-300 text-xs">Última atividade</span>
            <span className="text-purple-200 text-xs">{lastActivity}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente compacto para mobile
export const AutoApplyCardCompact: React.FC<AutoApplyCardProps> = ({
  isActive,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20 p-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium text-xs">Auto-IA</h4>
            <p className="text-purple-200 text-xs">
              {isActive ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-300 ${
            isActive ? 'bg-indigo-500' : 'bg-gray-700'
          }`}
          aria-label={isActive ? 'Desativar' : 'Ativar'}
        >
          <span
            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform duration-300 ${
              isActive ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
