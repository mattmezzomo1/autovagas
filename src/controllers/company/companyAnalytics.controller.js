const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para analytics da empresa
 */
class CompanyAnalyticsController {
  /**
   * Obtém analytics gerais da empresa
   */
  async getAnalytics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { timeRange = '30d' } = req.query;

      const [jobsAnalytics, candidatesAnalytics, performanceAnalytics] = await Promise.all([
        this.getJobsAnalyticsData(companyUserId, timeRange),
        this.getCandidatesAnalyticsData(companyUserId, timeRange),
        this.getPerformanceAnalyticsData(companyUserId, timeRange)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          jobs: jobsAnalytics,
          candidates: candidatesAnalytics,
          performance: performanceAnalytics,
          timeRange
        }
      });
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém analytics específicos de vagas
   */
  async getJobsAnalytics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { timeRange = '30d' } = req.query;

      const analytics = await this.getJobsAnalyticsData(companyUserId, timeRange);

      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Erro ao obter analytics de vagas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém analytics específicos de candidatos
   */
  async getCandidatesAnalytics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { timeRange = '30d' } = req.query;

      const analytics = await this.getCandidatesAnalyticsData(companyUserId, timeRange);

      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Erro ao obter analytics de candidatos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém analytics de performance
   */
  async getPerformanceAnalytics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { timeRange = '30d' } = req.query;

      const analytics = await this.getPerformanceAnalyticsData(companyUserId, timeRange);

      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Erro ao obter analytics de performance:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Gera relatórios
   */
  async generateReports(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { type, timeRange = '30d', format = 'json' } = req.query;

      let reportData;

      switch (type) {
        case 'jobs':
          reportData = await this.getJobsAnalyticsData(companyUserId, timeRange);
          break;
        case 'candidates':
          reportData = await this.getCandidatesAnalyticsData(companyUserId, timeRange);
          break;
        case 'performance':
          reportData = await this.getPerformanceAnalyticsData(companyUserId, timeRange);
          break;
        default:
          reportData = await this.getAnalyticsData(companyUserId, timeRange);
      }

      if (format === 'csv') {
        // Implementar conversão para CSV
        return res.status(200).json({
          success: true,
          message: 'Funcionalidade CSV em desenvolvimento'
        });
      }

      return res.status(200).json({
        success: true,
        data: reportData,
        meta: {
          type,
          timeRange,
          format,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao gerar relatórios:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtém dados de analytics de vagas
   */
  async getJobsAnalyticsData(companyUserId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    const [jobsResult, applicationsResult] = await Promise.all([
      supabase
        .from('jobs')
        .select('*')
        .eq('companyUserId', companyUserId)
        .gte('createdAt', dateFilter),
      
      supabase
        .from('applications')
        .select(`
          *,
          jobs:jobId (
            companyUserId
          )
        `)
        .eq('jobs.companyUserId', companyUserId)
        .gte('createdAt', dateFilter)
    ]);

    const jobs = jobsResult.data || [];
    const applications = applicationsResult.data || [];

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      totalApplications: applications.length,
      avgApplicationsPerJob: jobs.length > 0 ? (applications.length / jobs.length).toFixed(1) : 0,
      topPerformingJobs: this.getTopPerformingJobs(jobs, applications),
      jobsByStatus: this.groupJobsByStatus(jobs),
      applicationsOverTime: this.groupApplicationsByDate(applications)
    };
  }

  /**
   * Obtém dados de analytics de candidatos
   */
  async getCandidatesAnalyticsData(companyUserId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        users:userId (
          fullName,
          title,
          location
        ),
        jobs:jobId (
          companyUserId
        )
      `)
      .eq('jobs.companyUserId', companyUserId)
      .gte('createdAt', dateFilter);

    if (error) {
      throw error;
    }

    return {
      totalCandidates: applications.length,
      uniqueCandidates: new Set(applications.map(a => a.userId)).size,
      avgMatchScore: this.calculateAvgMatchScore(applications),
      candidatesByStatus: this.groupCandidatesByStatus(applications),
      topCandidates: this.getTopCandidates(applications),
      candidatesByLocation: this.groupCandidatesByLocation(applications)
    };
  }

  /**
   * Obtém dados de analytics de performance
   */
  async getPerformanceAnalyticsData(companyUserId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    const [jobsResult, applicationsResult, viewsResult] = await Promise.all([
      supabase
        .from('jobs')
        .select('views, applicantsCount')
        .eq('companyUserId', companyUserId)
        .gte('createdAt', dateFilter),
      
      supabase
        .from('applications')
        .select(`
          status,
          createdAt,
          jobs:jobId (
            companyUserId
          )
        `)
        .eq('jobs.companyUserId', companyUserId)
        .gte('createdAt', dateFilter),

      supabase
        .from('jobs')
        .select('views')
        .eq('companyUserId', companyUserId)
    ]);

    const jobs = jobsResult.data || [];
    const applications = applicationsResult.data || [];
    const totalViews = viewsResult.data?.reduce((sum, job) => sum + (job.views || 0), 0) || 0;

    const conversionRate = totalViews > 0 ? ((applications.length / totalViews) * 100).toFixed(1) : 0;
    const avgTimeToHire = this.calculateAvgTimeToHire(applications);

    return {
      totalViews,
      conversionRate: parseFloat(conversionRate),
      avgTimeToHire,
      hireRate: this.calculateHireRate(applications),
      performanceOverTime: this.getPerformanceOverTime(applications),
      topPerformingMetrics: {
        bestConversionJob: this.getBestConversionJob(jobs),
        fastestHire: this.getFastestHire(applications)
      }
    };
  }

  /**
   * Obtém filtro de data baseado no timeRange
   */
  getDateFilter(timeRange) {
    const now = new Date();
    const days = parseInt(timeRange.replace('d', ''));
    const date = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return date.toISOString();
  }

  /**
   * Agrupa vagas por status
   */
  groupJobsByStatus(jobs) {
    return jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Agrupa aplicações por data
   */
  groupApplicationsByDate(applications) {
    const grouped = applications.reduce((acc, app) => {
      const date = new Date(app.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  /**
   * Obtém vagas com melhor performance
   */
  getTopPerformingJobs(jobs, applications) {
    return jobs
      .map(job => {
        const jobApplications = applications.filter(app => app.jobId === job.id);
        return {
          id: job.id,
          title: job.title,
          applications: jobApplications.length,
          views: job.views || 0,
          conversionRate: job.views > 0 ? ((jobApplications.length / job.views) * 100).toFixed(1) : 0
        };
      })
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);
  }

  /**
   * Calcula score médio de match
   */
  calculateAvgMatchScore(applications) {
    const withScores = applications.filter(app => app.matchScore);
    if (withScores.length === 0) return 0;
    
    const sum = withScores.reduce((acc, app) => acc + app.matchScore, 0);
    return (sum / withScores.length).toFixed(1);
  }

  /**
   * Agrupa candidatos por status
   */
  groupCandidatesByStatus(applications) {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Obtém top candidatos
   */
  getTopCandidates(applications) {
    return applications
      .filter(app => app.matchScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map(app => ({
        id: app.userId,
        name: app.users.fullName,
        title: app.users.title,
        matchScore: app.matchScore
      }));
  }

  /**
   * Agrupa candidatos por localização
   */
  groupCandidatesByLocation(applications) {
    return applications.reduce((acc, app) => {
      const location = app.users.location || 'Não informado';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Calcula tempo médio para contratação
   */
  calculateAvgTimeToHire(applications) {
    const hired = applications.filter(app => app.status === 'accepted');
    if (hired.length === 0) return 0;

    // Implementar cálculo real baseado em datas
    return 18; // Mock: 18 dias
  }

  /**
   * Calcula taxa de contratação
   */
  calculateHireRate(applications) {
    if (applications.length === 0) return 0;
    const hired = applications.filter(app => app.status === 'accepted').length;
    return ((hired / applications.length) * 100).toFixed(1);
  }

  /**
   * Obtém performance ao longo do tempo
   */
  getPerformanceOverTime(applications) {
    // Implementar agrupamento por semana/mês
    return this.groupApplicationsByDate(applications);
  }

  /**
   * Obtém vaga com melhor conversão
   */
  getBestConversionJob(jobs) {
    // Implementar lógica para encontrar melhor conversão
    return jobs[0] || null;
  }

  /**
   * Obtém contratação mais rápida
   */
  getFastestHire(applications) {
    // Implementar lógica para encontrar contratação mais rápida
    return applications.find(app => app.status === 'accepted') || null;
  }
}

module.exports = new CompanyAnalyticsController();
