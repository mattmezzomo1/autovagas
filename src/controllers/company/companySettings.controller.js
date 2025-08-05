const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para configurações da empresa
 */
class CompanySettingsController {
  /**
   * Obtém configurações da empresa
   */
  async getSettings(req, res) {
    try {
      const companyUserId = req.companyUserId;

      // Buscar dados da empresa
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('userId', companyUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Empresa não encontrada'
          });
        }
        throw error;
      }

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('fullName, email, phone')
        .eq('id', companyUserId)
        .single();

      if (userError) {
        throw userError;
      }

      const settings = {
        company: {
          ...company,
          settings: company.settings || {}
        },
        user: user,
        notifications: company.settings?.notifications || {
          emailNotifications: true,
          smsNotifications: false,
          newApplications: true,
          interviewReminders: true,
          weeklyReports: true
        },
        ai: company.settings?.ai || {
          autoAnalysis: true,
          matchThreshold: 70,
          autoSuggestions: true,
          language: 'pt-BR'
        },
        billing: {
          plan: company.subscriptionPlan,
          status: company.subscriptionStatus,
          startDate: company.subscriptionStartDate,
          endDate: company.subscriptionEndDate,
          credits: company.aiCredits
        }
      };

      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza configurações da empresa
   */
  async updateSettings(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { company, user, notifications, ai } = req.body;

      // Atualizar dados da empresa
      if (company) {
        const companyUpdateData = {
          ...company,
          settings: {
            notifications,
            ai,
            ...company.settings
          }
        };

        const { error: companyError } = await supabase
          .from('companies')
          .update(companyUpdateData)
          .eq('userId', companyUserId);

        if (companyError) {
          throw companyError;
        }
      }

      // Atualizar dados do usuário
      if (user) {
        const { error: userError } = await supabase
          .from('users')
          .update(user)
          .eq('id', companyUserId);

        if (userError) {
          throw userError;
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Configurações atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém membros da equipe
   */
  async getTeamMembers(req, res) {
    try {
      const companyUserId = req.companyUserId;

      // Por enquanto, retornamos dados mock
      // Em uma implementação real, você teria uma tabela de team_members
      const teamMembers = [
        {
          id: '1',
          name: 'Ana Costa',
          email: 'ana@empresa.com',
          role: 'Recrutadora',
          permissions: ['view_candidates', 'schedule_interviews'],
          status: 'active',
          joinedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Carlos Silva',
          email: 'carlos@empresa.com',
          role: 'Gerente de RH',
          permissions: ['all'],
          status: 'active',
          joinedAt: '2024-01-10'
        }
      ];

      return res.status(200).json({
        success: true,
        data: teamMembers
      });
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Adiciona membro à equipe
   */
  async addTeamMember(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { name, email, role, permissions } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email e cargo são obrigatórios'
        });
      }

      // Implementar lógica para adicionar membro
      // Por enquanto, retornamos sucesso
      const newMember = {
        id: Date.now().toString(),
        name,
        email,
        role,
        permissions: permissions || [],
        status: 'pending',
        joinedAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newMember,
        message: 'Membro adicionado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza membro da equipe
   */
  async updateTeamMember(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const updateData = req.body;

      // Implementar lógica para atualizar membro
      // Por enquanto, retornamos sucesso
      return res.status(200).json({
        success: true,
        message: 'Membro atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remove membro da equipe
   */
  async removeTeamMember(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Implementar lógica para remover membro
      // Por enquanto, retornamos sucesso
      return res.status(200).json({
        success: true,
        message: 'Membro removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém informações de faturamento
   */
  async getBillingInfo(req, res) {
    try {
      const companyUserId = req.companyUserId;

      // Buscar dados de faturamento
      const { data: company, error } = await supabase
        .from('companies')
        .select('subscriptionPlan, subscriptionStatus, subscriptionStartDate, subscriptionEndDate, stripeCustomerId, aiCredits')
        .eq('userId', companyUserId)
        .single();

      if (error) {
        throw error;
      }

      const billingInfo = {
        plan: company.subscriptionPlan,
        status: company.subscriptionStatus,
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
        credits: company.aiCredits,
        stripeCustomerId: company.stripeCustomerId,
        planDetails: this.getPlanDetails(company.subscriptionPlan),
        usage: {
          jobsPosted: 0, // Implementar contagem real
          candidatesAnalyzed: 0, // Implementar contagem real
          creditsUsed: 0 // Implementar contagem real
        }
      };

      return res.status(200).json({
        success: true,
        data: billingInfo
      });
    } catch (error) {
      console.error('Erro ao obter informações de faturamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza informações de faturamento
   */
  async updateBillingInfo(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { plan, paymentMethod } = req.body;

      // Implementar lógica de atualização de plano via Stripe
      // Por enquanto, retornamos sucesso
      return res.status(200).json({
        success: true,
        message: 'Informações de faturamento atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar faturamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Obtém detalhes do plano
   */
  getPlanDetails(plan) {
    const plans = {
      basic: {
        name: 'Básico',
        price: 97,
        features: ['5 vagas ativas', '50 candidatos/mês', 'Análise básica de IA'],
        limits: {
          jobs: 5,
          candidates: 50,
          aiAnalysis: 100
        }
      },
      professional: {
        name: 'Profissional',
        price: 197,
        features: ['20 vagas ativas', '200 candidatos/mês', 'Análise avançada de IA', 'Entrevistas automáticas'],
        limits: {
          jobs: 20,
          candidates: 200,
          aiAnalysis: 500
        }
      },
      enterprise: {
        name: 'Enterprise',
        price: 397,
        features: ['Vagas ilimitadas', 'Candidatos ilimitados', 'IA personalizada', 'Suporte prioritário'],
        limits: {
          jobs: -1, // Ilimitado
          candidates: -1, // Ilimitado
          aiAnalysis: -1 // Ilimitado
        }
      }
    };

    return plans[plan] || plans.basic;
  }
}

module.exports = new CompanySettingsController();
