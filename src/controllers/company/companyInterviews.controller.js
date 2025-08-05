const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para entrevistas da empresa
 */
class CompanyInterviewsController {
  /**
   * Obtém todas as entrevistas
   */
  async getInterviews(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { page = 1, limit = 20, status, type } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title,
            profileImage
          ),
          job:jobId (
            id,
            title
          )
        `, { count: 'exact' })
        .eq('companyUserId', companyUserId);

      if (status) {
        query = query.eq('status', status);
      }

      if (type) {
        query = query.eq('interviewType', type);
      }

      query = query
        .order('scheduledDate', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: interviews, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter entrevistas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Agenda uma entrevista
   */
  async scheduleInterview(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        candidateId,
        jobId,
        interviewType,
        scheduledDate,
        duration,
        interviewer,
        notes
      } = req.body;

      if (!candidateId || !jobId || !interviewType || !scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Candidato, vaga, tipo e data são obrigatórios'
        });
      }

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .insert([{
          candidateId,
          jobId,
          interviewType,
          scheduledDate,
          duration: duration || 60,
          interviewer,
          notes,
          status: 'scheduled',
          companyUserId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Criar atividade
      await this.createActivity(
        companyUserId,
        'human_interview_scheduled',
        `Entrevista agendada com candidato`,
        candidateId,
        null,
        jobId
      );

      return res.status(201).json({
        success: true,
        data: interview,
        message: 'Entrevista agendada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao agendar entrevista:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém uma entrevista específica
   */
  async getInterviewById(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title,
            email,
            profileImage
          ),
          job:jobId (
            id,
            title,
            department
          )
        `)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Entrevista não encontrada'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Erro ao obter entrevista:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza uma entrevista
   */
  async updateInterview(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const updateData = req.body;

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .update(updateData)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Entrevista não encontrada'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview,
        message: 'Entrevista atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar entrevista:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cancela uma entrevista
   */
  async cancelInterview(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview,
        message: 'Entrevista cancelada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao cancelar entrevista:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria relatório de entrevista
   */
  async createInterviewReport(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const {
        overallScore,
        technicalScore,
        communicationScore,
        culturalScore,
        experienceScore,
        questions,
        feedback,
        strengths,
        improvements,
        recommendation,
        notes
      } = req.body;

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .update({
          status: 'completed',
          overallScore,
          technicalScore,
          communicationScore,
          culturalScore,
          experienceScore,
          questions,
          feedback,
          strengths,
          improvements,
          recommendation,
          notes
        })
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Criar atividade
      await this.createActivity(
        companyUserId,
        'interview_completed',
        `Entrevista finalizada com relatório`,
        interview.candidateId,
        null,
        interview.jobId
      );

      return res.status(200).json({
        success: true,
        data: interview,
        message: 'Relatório de entrevista criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém relatório de entrevista
   */
  async getInterviewReport(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: interview, error } = await supabase
        .from('interview_reports')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title,
            email
          ),
          job:jobId (
            id,
            title,
            department
          )
        `)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Erro ao obter relatório:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém entrevistas com IA
   */
  async getAIInterviews(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('ai_interviews')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title,
            profileImage
          ),
          job:jobId (
            id,
            title
          )
        `, { count: 'exact' })
        .eq('companyUserId', companyUserId);

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order('scheduledDate', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: interviews, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter entrevistas IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Agenda entrevista com IA
   */
  async scheduleAIInterview(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        candidateId,
        jobId,
        scheduledDate,
        scheduledTime,
        duration
      } = req.body;

      if (!candidateId || !jobId || !scheduledDate || !scheduledTime) {
        return res.status(400).json({
          success: false,
          message: 'Candidato, vaga, data e horário são obrigatórios'
        });
      }

      const { data: interview, error } = await supabase
        .from('ai_interviews')
        .insert([{
          candidateId,
          jobId,
          scheduledDate,
          scheduledTime,
          duration: duration || 30,
          status: 'scheduled',
          companyUserId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Criar atividade
      await this.createActivity(
        companyUserId,
        'ai_interview_scheduled',
        `Entrevista com IA agendada`,
        candidateId,
        null,
        jobId
      );

      return res.status(201).json({
        success: true,
        data: interview,
        message: 'Entrevista com IA agendada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao agendar entrevista IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém entrevista IA específica
   */
  async getAIInterviewById(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: interview, error } = await supabase
        .from('ai_interviews')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title,
            email
          ),
          job:jobId (
            id,
            title,
            department
          )
        `)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Erro ao obter entrevista IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Completa entrevista IA
   */
  async completeAIInterview(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { responses, aiAnalysis, overallScore } = req.body;

      const { data: interview, error } = await supabase
        .from('ai_interviews')
        .update({
          status: 'completed',
          completed: true,
          responses,
          aiAnalysis,
          overallScore
        })
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: interview,
        message: 'Entrevista IA completada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao completar entrevista IA:', error);
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
}

module.exports = new CompanyInterviewsController();
