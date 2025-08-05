import React, { useState } from 'react';
import { Play, Pause, Settings, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { autoApplyService } from '../../services/webscraper/AutoApplyService';
import { JobSearchParams, Platform, ScraperCredentials } from '../../services/webscraper/types';
import { useAuthStore } from '../../store/auth';
import { RobotPaywallModal } from './RobotPaywallModal';

export const ScraperControl: React.FC = () => {
  const { profile } = useAuthStore();
  const [isRunning, setIsRunning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Estados para paywall
  const [showPaywall, setShowPaywall] = useState(false);

  // Configurações do scraper
  const [config, setConfig] = useState<{
    platforms: Record<Platform, boolean>;
    keywords: string;
    locations: string;
    remote: boolean;
    jobTypes: string[];
  }>({
    platforms: {
      linkedin: true,
      infojobs: true,
      catho: true,
      indeed: true
    },
    keywords: profile.jobTitle || '',
    locations: profile.location || '',
    remote: true,
    jobTypes: ['CLT', 'PJ']
  });

  // Verifica se o usuário tem um plano que permite usar o robô
  const hasEligiblePlan = () => {
    // Agora todos os planos (basic, plus, premium) permitem automação
    return profile.subscription?.plan === 'basic' ||
           profile.subscription?.plan === 'plus' ||
           profile.subscription?.plan === 'premium';
  };

  const handleStartScraping = () => {
    // SEMPRE mostra o paywall quando tentar iniciar o scraper
    setShowPaywall(true);
  };

  const startScraping = async () => {
    try {
      setIsRunning(true);
      setStatus('running');
      setMessage('Inicializando o robô de scraping...');
      setProgress(10);

      // Inicializa o serviço
      await autoApplyService.initialize();
      setProgress(20);

      // Define as credenciais (simuladas para demonstração)
      const credentials: ScraperCredentials = {
        username: 'usuario@exemplo.com',
        password: 'senha123'
      };

      // Define as credenciais para cada plataforma selecionada
      Object.entries(config.platforms)
        .filter(([_, enabled]) => enabled)
        .forEach(([platform]) => {
          autoApplyService.setCredentials(platform as Platform, credentials);
        });

      setProgress(30);
      setMessage('Realizando login nas plataformas...');

      // Realiza login em todas as plataformas
      const loginResults = await autoApplyService.loginAll();
      const loggedInPlatforms = Object.entries(loginResults)
        .filter(([_, success]) => success)
        .map(([platform]) => platform);

      setProgress(40);
      setMessage(`Login realizado com sucesso em: ${loggedInPlatforms.join(', ')}`);

      // Prepara os parâmetros de busca
      const searchParams: JobSearchParams = {
        keywords: config.keywords.split(',').map(k => k.trim()),
        locations: config.locations.split(',').map(l => l.trim()),
        remote: config.remote,
        jobTypes: config.jobTypes
      };

      setProgress(50);
      setMessage('Buscando vagas...');

      // Inicia o processo de auto-aplicação
      await autoApplyService.startAutoApply(profile, searchParams, 70);

      setProgress(100);
      setStatus('success');
      setMessage('Processo de scraping concluído com sucesso!');
    } catch (error) {
      console.error('Erro durante o scraping:', error);
      setStatus('error');
      setMessage(`Erro durante o scraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopScraping = () => {
    autoApplyService.stopAutoApply();
    setIsRunning(false);
    setStatus('idle');
    setMessage('Processo de scraping interrompido pelo usuário.');
  };

  const handlePlatformToggle = (platform: Platform) => {
    setConfig(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform]
      }
    }));
  };

  const handleJobTypeToggle = (jobType: string) => {
    setConfig(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(t => t !== jobType)
        : [...prev.jobTypes, jobType]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Robô de Scraping</h2>
        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Configurações */}
      {isConfiguring && (
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold text-white">Configurações</h3>

          <div>
            <label className="block text-sm text-purple-200 mb-1">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.platforms).map(([platform, enabled]) => (
                <button
                  key={platform}
                  onClick={() => handlePlatformToggle(platform as Platform)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    enabled
                      ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-1">Palavras-chave</label>
            <input
              type="text"
              value={config.keywords}
              onChange={e => setConfig(prev => ({ ...prev, keywords: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              placeholder="desenvolvedor, programador, engenheiro"
            />
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-1">Localizações</label>
            <input
              type="text"
              value={config.locations}
              onChange={e => setConfig(prev => ({ ...prev, locations: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              placeholder="São Paulo, Rio de Janeiro, Remoto"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-purple-200">
              <input
                type="checkbox"
                checked={config.remote}
                onChange={e => setConfig(prev => ({ ...prev, remote: e.target.checked }))}
                className="rounded border-white/20 bg-white/5"
              />
              Incluir vagas remotas
            </label>
          </div>

          <div>
            <label className="block text-sm text-purple-200 mb-1">Tipos de Contrato</label>
            <div className="flex flex-wrap gap-2">
              {['CLT', 'PJ', 'Estágio', 'Freelancer'].map(jobType => (
                <button
                  key={jobType}
                  onClick={() => handleJobTypeToggle(jobType)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    config.jobTypes.includes(jobType)
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {jobType}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status e controles */}
      <div className="bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {status === 'idle' && <div className="w-3 h-3 rounded-full bg-gray-500"></div>}
            {status === 'running' && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>}
            {status === 'success' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
            {status === 'error' && <div className="w-3 h-3 rounded-full bg-red-500"></div>}

            <span className="text-sm font-medium text-white">
              {status === 'idle' && 'Pronto para iniciar'}
              {status === 'running' && 'Em execução'}
              {status === 'success' && 'Concluído com sucesso'}
              {status === 'error' && 'Erro'}
            </span>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={handleStartScraping}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm"
                disabled={status === 'running'}
              >
                <Play className="w-4 h-4" />
                Iniciar
              </button>
            ) : (
              <button
                onClick={stopScraping}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/80 text-white text-sm"
              >
                <Pause className="w-4 h-4" />
                Parar
              </button>
            )}

            <button
              onClick={() => {
                setStatus('idle');
                setMessage('');
                setProgress(0);
              }}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
              title="Limpar status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            status === 'error'
              ? 'bg-red-500/10 border border-red-500/20 text-red-300'
              : status === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
          }`}>
            <div className="flex items-start gap-2">
              {status === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
              {status === 'running' && <RefreshCw className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />}
              <span>{message}</span>
            </div>
          </div>
        )}

        {status === 'running' && (
          <div className="mt-4">
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Robot Paywall Modal */}
      <RobotPaywallModal
        actionType="scraper"
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
};
