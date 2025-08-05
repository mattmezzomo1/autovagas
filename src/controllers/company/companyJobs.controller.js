const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para gestão de vagas da empresa
 */
class CompanyJobsController {
  /**
   * Obtém todas as vagas da empresa
   */
  async getJobs(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        page = 1,
        limit = 10,
        search,
        status,
        department,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('companyUserId', companyUserId);

      // Filtros
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (department) {
        query = query.eq('department', department);
      }

      // Ordenação
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Paginação
      query = query.range(offset, offset + limit - 1);

      const { data: jobs, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter vagas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria uma nova vaga
   */
  async createJob(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const jobData = {
        ...req.body,
        companyUserId,
        status: req.body.status || 'draft'
      };

      // Validação básica
      if (!jobData.title || !jobData.description) {
        return res.status(400).json({
          success: false,
          message: 'Título e descrição são obrigatórios'
        });
      }

      const { data: job, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Criar atividade
      await this.createActivity(companyUserId, 'job_created', `Nova vaga criada: ${job.title}`, null, null, job.id);

      return res.status(201).json({
        success: true,
        data: job,
        message: 'Vaga criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém uma vaga específica
   */
  async getJobById(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Vaga não encontrada'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Erro ao obter vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza uma vaga
   */
  async updateJob(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const updateData = req.body;

      const { data: job, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Vaga não encontrada'
          });
        }
        throw error;
      }

      // Criar atividade
      await this.createActivity(companyUserId, 'job_updated', `Vaga atualizada: ${job.title}`, null, null, job.id);

      return res.status(200).json({
        success: true,
        data: job,
        message: 'Vaga atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deleta uma vaga
   */
  async deleteJob(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('companyUserId', companyUserId);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: 'Vaga deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza status da vaga
   */
  async updateJobStatus(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'paused', 'draft', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const { data: job, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: job,
        message: 'Status da vaga atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar status da vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém candidatos de uma vaga
   */
  async getJobCandidates(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se a vaga pertence à empresa
      const { data: job } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Vaga não encontrada'
        });
      }

      let query = supabase
        .from('applications')
        .select(`
          *,
          users:userId (
            id,
            fullName,
            title,
            email,
            phone,
            location,
            skills,
            profileImage
          )
        `, { count: 'exact' })
        .eq('jobId', id);

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: applications, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter candidatos da vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém analytics de uma vaga
   */
  async getJobAnalytics(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Verificar se a vaga pertence à empresa
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Vaga não encontrada'
        });
      }

      // Buscar estatísticas
      const { data: applications, error } = await supabase
        .from('applications')
        .select('status, createdAt')
        .eq('jobId', id);

      if (error) {
        throw error;
      }

      const analytics = {
        totalApplications: applications.length,
        views: job.views || 0,
        conversionRate: job.views > 0 ? ((applications.length / job.views) * 100).toFixed(1) : 0,
        statusBreakdown: applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {}),
        applicationsOverTime: this.groupApplicationsByDate(applications)
      };

      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Erro ao obter analytics da vaga:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Gera vaga com IA
   */
  async generateJobWithAI(req, res) {
    try {
      const { prompt, jobType, department } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt é obrigatório'
        });
      }

      // Aqui você integraria com OpenAI ou outro serviço de IA
      // Por enquanto, retornamos um mock
      const generatedJob = {
        title: 'Desenvolvedor Full Stack Senior',
        description: 'Estamos procurando um desenvolvedor experiente...',
        department: department || 'Tecnologia',
        jobType: jobType || 'full-time',
        skills: 'React, Node.js, TypeScript, AWS',
        requirements: '5+ anos de experiência em desenvolvimento web',
        responsibilities: 'Desenvolver aplicações web, liderar projetos técnicos',
        benefits: 'Vale refeição, Plano de saúde, Home office flexível',
        isGeneratedByAi: true
      };

      return res.status(200).json({
        success: true,
        data: generatedJob,
        message: 'Vaga gerada com IA com sucesso'
      });
    } catch (error) {
      console.error('Erro ao gerar vaga com IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém sugestões de vagas com IA
   */
  async getJobSuggestions(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { presentation, audioTranscript } = req.body;

      // Aqui você analisaria a apresentação/áudio com IA
      // Por enquanto, retornamos sugestões mock
      const suggestions = [
        {
          id: 1,
          title: 'Tech Lead - Microservices',
          department: 'Engenharia',
          priority: 'Alta',
          reason: 'Baseado na sua descrição de processos de microsserviços',
          requirements: ['Experiência com microservices', 'Kubernetes', 'Liderança técnica']
        },
        {
          id: 2,
          title: 'Product Manager - Fintech',
          department: 'Produto',
          priority: 'Média',
          reason: 'Alinhado com expansão para mercado financeiro',
          requirements: ['Experiência em fintech', 'Metodologias ágeis', 'Análise de dados']
        }
      ];

      return res.status(200).json({
        success: true,
        data: suggestions,
        message: 'Sugestões geradas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao obter sugestões de vagas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  async createActivity(companyUserId, type, title, candidateId = null, candidateName = null, jobId = null) {
    try {
      await supabase
        .from('company_activities')
        .insert([{
          type,
          title,
          companyUserId,
          candidateId,
          candidateName,
          jobId
        }]);
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
    }
  }

  groupApplicationsByDate(applications) {
    const grouped = applications.reduce((acc, app) => {
      const date = new Date(app.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}

module.exports = new CompanyJobsController();
