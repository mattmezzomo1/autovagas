const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');
const cacheService = require('../../services/cache.service');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para o dashboard da empresa
 */
class CompanyDashboardController {
  /**
   * Obtém dados completos do dashboard
   */
  async getDashboardData(req, res) {
    try {
      const companyUserId = req.companyUserId;

      // Tentar obter do cache primeiro
      const cachedData = await cacheService.getDashboardData(companyUserId);

      if (cachedData) {
        return res.status(200).json({
          success: true,
          data: cachedData,
          cached: true
        });
      }

      // Buscar métricas em paralelo
      const [metrics, activities, topCandidates] = await Promise.all([
        this.getMetricsData(companyUserId),
        this.getRecentActivitiesData(companyUserId),
        this.getTopCandidatesData(companyUserId)
      ]);

      const dashboardData = {
        metrics,
        recentActivities: activities,
        topCandidates
      };

      // Cache por 5 minutos
      await cacheService.cacheDashboardData(companyUserId, dashboardData, 300);

      return res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém métricas do dashboard
   */
  async getMetrics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const metrics = await this.getMetricsData(companyUserId);

      return res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém atividades recentes
   */
  async getRecentActivities(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { limit = 10 } = req.query;

      const activities = await this.getRecentActivitiesData(companyUserId, limit);

      return res.status(200).json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Erro ao obter atividades recentes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém candidatos top
   */
  async getTopCandidates(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { limit = 5 } = req.query;

      const candidates = await this.getTopCandidatesData(companyUserId, limit);

      return res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      console.error('Erro ao obter candidatos top:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém todas as atividades com paginação
   */
  async getActivities(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { page = 1, limit = 20, type } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('company_activities')
        .select('*')
        .eq('companyUserId', companyUserId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('type', type);
      }

      const { data: activities, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter atividades:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria uma nova atividade
   */
  async createActivity(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { type, title, description, candidateId, candidateName, jobId, actionUrl, metadata } = req.body;

      const { data: activity, error } = await supabase
        .from('company_activities')
        .insert([{
          type,
          title,
          description,
          candidateId,
          candidateName,
          jobId,
          actionUrl,
          metadata,
          companyUserId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        success: true,
        data: activity,
        message: 'Atividade criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtém dados das métricas
   */
  async getMetricsData(companyUserId) {
    const [jobsResult, candidatesResult, viewsResult] = await Promise.all([
      // Vagas ativas
      supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('companyUserId', companyUserId)
        .eq('status', 'active'),

      // Total de candidatos
      supabase
        .from('applications')
        .select('userId', { count: 'exact' })
        .in('jobId',
          supabase
            .from('jobs')
            .select('id')
            .eq('companyUserId', companyUserId)
        ),

      // Total de visualizações
      supabase
        .from('jobs')
        .select('views')
        .eq('companyUserId', companyUserId)
    ]);

    const activeJobs = jobsResult.count || 0;
    const totalCandidates = candidatesResult.count || 0;
    const totalViews = viewsResult.data?.reduce((sum, job) => sum + (job.views || 0), 0) || 0;
    const conversionRate = totalViews > 0 ? ((totalCandidates / totalViews) * 100).toFixed(1) : 0;

    return {
      activeJobs,
      candidates: totalCandidates,
      views: totalViews,
      conversionRate: parseFloat(conversionRate)
    };
  }

  /**
   * Obtém dados das atividades recentes
   */
  async getRecentActivitiesData(companyUserId, limit = 5) {
    const { data: activities, error } = await supabase
      .from('company_activities')
      .select('*')
      .eq('companyUserId', companyUserId)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return activities || [];
  }

  /**
   * Obtém dados dos candidatos top
   */
  async getTopCandidatesData(companyUserId, limit = 3) {
    // Buscar aplicações com maior match score
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        users:userId (
          id,
          fullName,
          title,
          skills,
          profileImage
        ),
        jobs:jobId (
          id,
          title,
          companyUserId
        )
      `)
      .eq('jobs.companyUserId', companyUserId)
      .not('matchScore', 'is', null)
      .order('matchScore', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return applications?.map(app => ({
      id: app.users.id,
      name: app.users.fullName,
      title: app.users.title,
      match: app.matchScore,
      skills: app.users.skills ? app.users.skills.split(',') : [],
      profileImage: app.users.profileImage
    })) || [];
  }
}

module.exports = new CompanyDashboardController();
