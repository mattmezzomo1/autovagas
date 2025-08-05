import { supabase } from '../config/database';
import { logger } from '../utils/logger';

interface ExtensionStatistics {
  userId: string;
  eventType: 'job_found' | 'application_submitted' | 'error' | 'session_start' | 'session_end';
  data: any;
  tabUrl?: string;
  timestamp: Date;
  platform: string;
}

interface UserSettings {
  platforms: {
    linkedin: boolean;
    infojobs: boolean;
    catho: boolean;
    indeed: boolean;
    vagas: boolean;
  };
  searchCriteria: {
    keywords: string[];
    locations: string[];
    jobTypes: string[];
    workModels: string[];
    salaryMin: number;
    experienceLevel: string;
  };
  applicationSettings: {
    coverLetterTemplate: string;
    autoFillProfile: boolean;
    skipAppliedJobs: boolean;
    delayBetweenApplications: number;
  };
}

interface UserLimits {
  monthlyLimit: number;
  monthlyUsed: number;
  dailyLimit: number;
  dailyUsed: number;
  resetDate: Date;
}

interface ApplicationData {
  jobId: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  url: string;
  salary?: string;
  description?: string;
  appliedAt: Date;
}

export class ExtensionService {
  // Salva estatísticas da extensão
  async saveStatistics(stats: ExtensionStatistics): Promise<void> {
    try {
      const { error } = await supabase
        .from('extension_statistics')
        .insert({
          user_id: stats.userId,
          event_type: stats.eventType,
          data: stats.data,
          tab_url: stats.tabUrl,
          timestamp: stats.timestamp.toISOString(),
          platform: stats.platform,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.info(`Extension statistics saved for user ${stats.userId}: ${stats.eventType}`);
    } catch (error) {
      logger.error('Error saving extension statistics:', error);
      throw error;
    }
  }

  // Obtém configurações do usuário
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('extension_settings')
        .select('settings')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Retorna configurações padrão se não existir
      if (!data) {
        return this.getDefaultSettings();
      }

      return data.settings;
    } catch (error) {
      logger.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Salva configurações do usuário
  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('extension_settings')
        .upsert({
          user_id: userId,
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      logger.info(`Extension settings saved for user ${userId}`);
    } catch (error) {
      logger.error('Error saving user settings:', error);
      throw error;
    }
  }

  // Obtém limites de uso do usuário
  async getUserLimits(userId: string): Promise<UserLimits> {
    try {
      // Obtém informações do usuário e plano
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      // Define limites baseado no plano
      const planLimits = {
        basic: { monthly: 50, daily: 10 },
        plus: { monthly: 100, daily: 20 },
        premium: { monthly: 1000, daily: 100 }
      };

      const plan = user.subscription?.plan || 'basic';
      const limits = planLimits[plan] || planLimits.basic;

      // Calcula uso atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Uso mensal
      const { count: monthlyUsed } = await supabase
        .from('extension_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('applied_at', startOfMonth.toISOString());

      // Uso diário
      const { count: dailyUsed } = await supabase
        .from('extension_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('applied_at', startOfDay.toISOString());

      // Próxima data de reset (primeiro dia do próximo mês)
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      return {
        monthlyLimit: limits.monthly,
        monthlyUsed: monthlyUsed || 0,
        dailyLimit: limits.daily,
        dailyUsed: dailyUsed || 0,
        resetDate
      };
    } catch (error) {
      logger.error('Error getting user limits:', error);
      throw error;
    }
  }

  // Verifica se o usuário pode fazer mais aplicações
  async canUserApply(userId: string): Promise<boolean> {
    try {
      const limits = await this.getUserLimits(userId);
      
      return limits.monthlyUsed < limits.monthlyLimit && 
             limits.dailyUsed < limits.dailyLimit;
    } catch (error) {
      logger.error('Error checking if user can apply:', error);
      return false;
    }
  }

  // Registra uma nova aplicação
  async registerApplication(userId: string, applicationData: ApplicationData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('extension_applications')
        .insert({
          user_id: userId,
          job_id: applicationData.jobId,
          title: applicationData.title,
          company: applicationData.company,
          location: applicationData.location,
          platform: applicationData.platform,
          url: applicationData.url,
          salary: applicationData.salary,
          description: applicationData.description,
          applied_at: applicationData.appliedAt.toISOString(),
          status: 'applied',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info(`Application registered for user ${userId}: ${applicationData.title} at ${applicationData.company}`);
      return data;
    } catch (error) {
      logger.error('Error registering application:', error);
      throw error;
    }
  }

  // Atualiza limites do usuário (chamado após aplicação)
  async updateUserLimits(userId: string): Promise<void> {
    try {
      // Salva estatística de uso
      await this.saveStatistics({
        userId,
        eventType: 'application_submitted',
        data: { timestamp: new Date() },
        timestamp: new Date(),
        platform: 'extension'
      });

      logger.info(`User limits updated for user ${userId}`);
    } catch (error) {
      logger.error('Error updating user limits:', error);
      throw error;
    }
  }

  // Obtém estatísticas do usuário
  async getUserStatistics(userId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    platform?: string;
  } = {}): Promise<any> {
    try {
      let query = supabase
        .from('extension_applications')
        .select('*')
        .eq('user_id', userId);

      if (filters.startDate) {
        query = query.gte('applied_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('applied_at', filters.endDate.toISOString());
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform);
      }

      const { data: applications, error } = await query.order('applied_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Calcula estatísticas
      const totalApplications = applications?.length || 0;
      
      const platformStats = applications?.reduce((acc, app) => {
        acc[app.platform] = (acc[app.platform] || 0) + 1;
        return acc;
      }, {}) || {};

      const monthlyApplications = applications?.filter(app => {
        const appDate = new Date(app.applied_at);
        const now = new Date();
        return appDate.getMonth() === now.getMonth() && 
               appDate.getFullYear() === now.getFullYear();
      }).length || 0;

      return {
        totalApplications,
        monthlyApplications,
        platformStats,
        recentApplications: applications?.slice(0, 10) || []
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Obtém histórico de aplicações
  async getApplicationHistory(userId: string, options: {
    page: number;
    limit: number;
    platform?: string;
    status?: string;
  }): Promise<any> {
    try {
      const { page, limit, platform, status } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('extension_applications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (platform) {
        query = query.eq('platform', platform);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('applied_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        applications: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      logger.error('Error getting application history:', error);
      throw error;
    }
  }

  // Configurações padrão
  private getDefaultSettings(): UserSettings {
    return {
      platforms: {
        linkedin: true,
        infojobs: true,
        catho: true,
        indeed: true,
        vagas: true
      },
      searchCriteria: {
        keywords: [],
        locations: [],
        jobTypes: ['CLT', 'PJ'],
        workModels: ['Remoto', 'Híbrido', 'Presencial'],
        salaryMin: 0,
        experienceLevel: 'any'
      },
      applicationSettings: {
        coverLetterTemplate: '',
        autoFillProfile: true,
        skipAppliedJobs: true,
        delayBetweenApplications: 5000
      }
    };
  }
}
