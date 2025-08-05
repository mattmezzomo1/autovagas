const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para gestão de candidatos da empresa
 */
class CompanyCandidatesController {
  /**
   * Obtém todos os candidatos da empresa
   */
  async getCandidates(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      // Buscar candidatos através das aplicações
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
            profileImage,
            experience
          ),
          jobs:jobId (
            id,
            title,
            department,
            companyUserId
          )
        `, { count: 'exact' })
        .eq('jobs.companyUserId', companyUserId);

      // Filtros
      if (search) {
        query = query.or(`users.fullName.ilike.%${search}%,users.title.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (jobId) {
        query = query.eq('jobId', jobId);
      }

      // Ordenação
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Paginação
      query = query.range(offset, offset + limit - 1);

      const { data: applications, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transformar dados para o formato esperado
      const candidates = applications.map(app => ({
        id: app.users.id,
        name: app.users.fullName,
        title: app.users.title,
        email: app.users.email,
        phone: app.users.phone,
        location: app.users.location,
        experience: app.users.experience,
        skills: app.users.skills ? app.users.skills.split(',') : [],
        profileImage: app.users.profileImage,
        applicationId: app.id,
        applicationStatus: app.status,
        matchScore: app.matchScore,
        appliedAt: app.createdAt,
        jobId: app.jobs.id,
        jobTitle: app.jobs.title,
        department: app.jobs.department
      }));

      return res.status(200).json({
        success: true,
        data: candidates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter candidatos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém um candidato específico
   */
  async getCandidateById(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Verificar se o candidato se candidatou para alguma vaga da empresa
      const { data: application, error } = await supabase
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
            bio,
            experience,
            profileImage,
            linkedinUrl,
            githubUrl,
            portfolioUrl
          ),
          jobs:jobId (
            id,
            title,
            companyUserId
          )
        `)
        .eq('userId', id)
        .eq('jobs.companyUserId', companyUserId)
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Candidato não encontrado'
          });
        }
        throw error;
      }

      const candidate = {
        ...application.users,
        skills: application.users.skills ? application.users.skills.split(',') : [],
        applicationInfo: {
          id: application.id,
          status: application.status,
          matchScore: application.matchScore,
          appliedAt: application.createdAt,
          jobId: application.jobs.id,
          jobTitle: application.jobs.title
        }
      };

      return res.status(200).json({
        success: true,
        data: candidate
      });
    } catch (error) {
      console.error('Erro ao obter candidato:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém perfil completo do candidato
   */
  async getCandidateProfile(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Buscar todas as aplicações do candidato para vagas da empresa
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:jobId (
            id,
            title,
            department,
            companyUserId
          )
        `)
        .eq('userId', id)
        .eq('jobs.companyUserId', companyUserId);

      if (error) {
        throw error;
      }

      if (!applications.length) {
        return res.status(404).json({
          success: false,
          message: 'Candidato não encontrado'
        });
      }

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) {
        throw userError;
      }

      const profile = {
        ...user,
        skills: user.skills ? user.skills.split(',') : [],
        applications: applications.map(app => ({
          id: app.id,
          status: app.status,
          matchScore: app.matchScore,
          appliedAt: app.createdAt,
          jobId: app.jobs.id,
          jobTitle: app.jobs.title,
          department: app.jobs.department
        }))
      };

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Erro ao obter perfil do candidato:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Toggle favorito do candidato
   */
  async toggleFavorite(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Implementar lógica de favoritos
      // Por enquanto, retornamos sucesso
      return res.status(200).json({
        success: true,
        message: 'Favorito atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém análise de match do candidato
   */
  async getMatchAnalysis(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { jobId } = req.query;

      // Buscar aplicação específica
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          *,
          users:userId (
            fullName,
            skills,
            experience
          ),
          jobs:jobId (
            title,
            requirements,
            skills,
            experienceYears,
            companyUserId
          )
        `)
        .eq('userId', id)
        .eq('jobId', jobId)
        .eq('jobs.companyUserId', companyUserId)
        .single();

      if (error) {
        throw error;
      }

      // Gerar análise de match (mock)
      const analysis = {
        overallMatch: application.matchScore || 85,
        breakdown: {
          skills: 90,
          experience: 80,
          requirements: 85
        },
        strengths: [
          'Experiência sólida em React e Node.js',
          'Conhecimento avançado em TypeScript',
          'Experiência com metodologias ágeis'
        ],
        gaps: [
          'Pouca experiência com AWS',
          'Falta certificação em cloud'
        ],
        recommendations: [
          'Agendar entrevista técnica',
          'Verificar disponibilidade para início',
          'Discutir expectativas salariais'
        ]
      };

      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Erro ao obter análise de match:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Gera análise com IA do candidato
   */
  async generateAIAnalysis(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { jobId } = req.body;

      // Aqui você integraria com OpenAI para análise
      // Por enquanto, retornamos análise mock
      const aiAnalysis = {
        summary: 'Candidato excepcional com forte background técnico',
        match: 92,
        strengths: [
          'Experiência sólida em tecnologias modernas',
          'Boa comunicação e trabalho em equipe',
          'Histórico de projetos relevantes'
        ],
        concerns: [
          'Pode estar acima do orçamento',
          'Experiência limitada em liderança'
        ],
        questions: [
          'Está disponível para início imediato?',
          'Tem experiência com metodologias ágeis?',
          'Qual sua expectativa salarial?'
        ],
        recommendation: 'Recomendo fortemente para entrevista'
      };

      return res.status(200).json({
        success: true,
        data: aiAnalysis,
        message: 'Análise de IA gerada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao gerar análise de IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca candidatos
   */
  async searchCandidates(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        query,
        skills,
        location,
        experience,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;

      // Buscar candidatos que se candidataram para vagas da empresa
      let searchQuery = supabase
        .from('applications')
        .select(`
          *,
          users:userId (
            id,
            fullName,
            title,
            email,
            location,
            skills,
            experience,
            profileImage
          ),
          jobs:jobId (
            companyUserId
          )
        `, { count: 'exact' })
        .eq('jobs.companyUserId', companyUserId);

      // Filtros
      if (query) {
        searchQuery = searchQuery.or(`users.fullName.ilike.%${query}%,users.title.ilike.%${query}%`);
      }

      if (skills) {
        searchQuery = searchQuery.ilike('users.skills', `%${skills}%`);
      }

      if (location) {
        searchQuery = searchQuery.ilike('users.location', `%${location}%`);
      }

      if (experience) {
        searchQuery = searchQuery.gte('users.experience', parseInt(experience));
      }

      searchQuery = searchQuery
        .order('matchScore', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: applications, error, count } = await searchQuery;

      if (error) {
        throw error;
      }

      const candidates = applications.map(app => ({
        id: app.users.id,
        name: app.users.fullName,
        title: app.users.title,
        email: app.users.email,
        location: app.users.location,
        experience: app.users.experience,
        skills: app.users.skills ? app.users.skills.split(',') : [],
        profileImage: app.users.profileImage,
        matchScore: app.matchScore,
        appliedAt: app.createdAt
      }));

      return res.status(200).json({
        success: true,
        data: candidates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Convida candidato
   */
  async inviteCandidate(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { candidateId, jobId, message } = req.body;

      if (!candidateId || !jobId) {
        return res.status(400).json({
          success: false,
          message: 'ID do candidato e da vaga são obrigatórios'
        });
      }

      // Implementar lógica de convite
      // Por enquanto, retornamos sucesso
      return res.status(200).json({
        success: true,
        message: 'Convite enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao convidar candidato:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca talentos
   */
  async searchTalents(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        skills,
        experience,
        location,
        availability,
        page = 1,
        limit = 20
      } = req.body;

      // Implementar busca avançada de talentos
      // Por enquanto, retornamos dados mock
      const talents = [
        {
          id: '1',
          name: 'João Silva',
          title: 'Desenvolvedor Full Stack',
          experience: 5,
          skills: ['React', 'Node.js', 'TypeScript'],
          location: 'São Paulo, SP',
          availability: 'Disponível',
          match: 95,
          profileImage: null
        },
        {
          id: '2',
          name: 'Maria Santos',
          title: 'UX Designer',
          experience: 3,
          skills: ['Figma', 'Adobe XD', 'User Research'],
          location: 'Rio de Janeiro, RJ',
          availability: 'Em 30 dias',
          match: 88,
          profileImage: null
        }
      ];

      return res.status(200).json({
        success: true,
        data: talents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: talents.length,
          totalPages: 1
        }
      });
    } catch (error) {
      console.error('Erro ao buscar talentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca talentos com IA
   */
  async aiTalentSearch(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { description, requirements } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: 'Descrição é obrigatória'
        });
      }

      // Implementar busca com IA
      // Por enquanto, retornamos dados mock
      const aiResults = {
        searchQuery: description,
        suggestedSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        candidates: [
          {
            id: '1',
            name: 'Ana Costa',
            title: 'Senior Full Stack Developer',
            match: 96,
            reasoning: 'Experiência sólida em React e Node.js, com projetos em AWS',
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
            experience: 6,
            location: 'São Paulo, SP'
          },
          {
            id: '2',
            name: 'Carlos Oliveira',
            title: 'Full Stack Developer',
            match: 89,
            reasoning: 'Boa experiência em tecnologias solicitadas, falta experiência em AWS',
            skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
            experience: 4,
            location: 'Belo Horizonte, MG'
          }
        ]
      };

      return res.status(200).json({
        success: true,
        data: aiResults,
        message: 'Busca com IA realizada com sucesso'
      });
    } catch (error) {
      console.error('Erro na busca com IA:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new CompanyCandidatesController();
