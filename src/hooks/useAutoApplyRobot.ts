import { useEffect, useState } from 'react';
import { AutoApplyRobotService, AutoApplyRobotConfig, AutoApplyRobotEvents } from '../services/AutoApplyRobotService';
import { useAuthStore } from '../store/auth';
import { ApplicationResult, ScrapedJob } from '../services/webscraper';

/**
 * Hook para gerenciar o robô de auto-aplicação
 */
export const useAutoApplyRobot = () => {
  const { profile } = useAuthStore();
  const [robotService] = useState(() => new AutoApplyRobotService());
  const [isConfigured, setIsConfigured] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [foundJobs, setFoundJobs] = useState<ScrapedJob[]>([]);
  const [analyzedJobs, setAnalyzedJobs] = useState<(ScrapedJob & { matchScore: number })[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<ApplicationResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [todayApplicationCount, setTodayApplicationCount] = useState(0);

  // Configura os eventos do robô
  useEffect(() => {
    const events: Partial<AutoApplyRobotEvents> = {
      onStart: () => {
        setIsActive(true);
        setError(null);
      },
      onStop: () => {
        setIsActive(false);
      },
      onJobFound: (job) => {
        setFoundJobs(prev => [...prev, job]);
      },
      onJobAnalyzed: (job) => {
        setAnalyzedJobs(prev => [...prev, job]);
      },
      onJobApplied: (result) => {
        setAppliedJobs(prev => [...prev, result]);
        setTodayApplicationCount(robotService.getTodayApplicationCount());
      },
      onError: (err) => {
        setError(err);
        console.error('Erro no robô de auto-aplicação:', err);
      },
      onComplete: (results) => {
        setAppliedJobs(results);
        setTodayApplicationCount(robotService.getTodayApplicationCount());
      }
    };

    // Registra os eventos
    for (const [event, handler] of Object.entries(events)) {
      robotService.on(event as keyof AutoApplyRobotEvents, handler as any);
    }

    // Cleanup
    return () => {
      robotService.dispose().catch(console.error);
    };
  }, [robotService]);

  /**
   * Configura o robô de auto-aplicação
   */
  const configureRobot = async (config: AutoApplyRobotConfig) => {
    try {
      await robotService.configure(config);
      setIsConfigured(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  /**
   * Ativa o robô de auto-aplicação
   */
  const activateRobot = async () => {
    if (!isConfigured) {
      setError(new Error('O robô não foi configurado'));
      return false;
    }

    try {
      const result = await robotService.activate(profile);
      setIsActive(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  /**
   * Desativa o robô de auto-aplicação
   */
  const deactivateRobot = async () => {
    try {
      await robotService.deactivate();
      setIsActive(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  /**
   * Verifica o status de uma aplicação
   */
  const checkApplicationStatus = async (applicationId: string, platform: 'linkedin' | 'gupy' | 'catho') => {
    try {
      return await robotService.checkApplicationStatus(platform, applicationId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return 'Erro ao verificar status';
    }
  };

  /**
   * Limpa os dados de vagas encontradas e analisadas
   */
  const clearJobData = () => {
    setFoundJobs([]);
    setAnalyzedJobs([]);
  };

  return {
    isConfigured,
    isActive,
    foundJobs,
    analyzedJobs,
    appliedJobs,
    error,
    todayApplicationCount,
    configureRobot,
    activateRobot,
    deactivateRobot,
    checkApplicationStatus,
    clearJobData
  };
};
