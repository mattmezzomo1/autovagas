const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para calendário da empresa
 */
class CompanyCalendarController {
  /**
   * Obtém eventos do calendário
   */
  async getEvents(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { 
        startDate, 
        endDate, 
        type,
        page = 1, 
        limit = 50 
      } = req.query;

      const offset = (page - 1) * limit;

      let query = supabase
        .from('company_calendar_events')
        .select(`
          *,
          candidate:candidateId (
            id,
            fullName,
            title
          ),
          job:jobId (
            id,
            title
          )
        `, { count: 'exact' })
        .eq('companyUserId', companyUserId);

      // Filtros de data
      if (startDate) {
        query = query.gte('startDate', startDate);
      }

      if (endDate) {
        query = query.lte('endDate', endDate);
      }

      if (type) {
        query = query.eq('type', type);
      }

      query = query
        .order('startDate', { ascending: true })
        .range(offset, offset + limit - 1);

      const { data: events, error, count } = await query;

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter eventos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria um novo evento
   */
  async createEvent(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const {
        title,
        description,
        startDate,
        endDate,
        type,
        candidateId,
        jobId,
        location,
        isOnline,
        meetingUrl,
        attendees
      } = req.body;

      if (!title || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Título, data de início e fim são obrigatórios'
        });
      }

      const { data: event, error } = await supabase
        .from('company_calendar_events')
        .insert([{
          title,
          description,
          startDate,
          endDate,
          type: type || 'meeting',
          candidateId,
          jobId,
          location,
          isOnline: isOnline || false,
          meetingUrl,
          attendees,
          companyUserId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json({
        success: true,
        data: event,
        message: 'Evento criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém um evento específico
   */
  async getEventById(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: event, error } = await supabase
        .from('company_calendar_events')
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
            title
          )
        `)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Evento não encontrado'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Erro ao obter evento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza um evento
   */
  async updateEvent(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const updateData = req.body;

      const { data: event, error } = await supabase
        .from('company_calendar_events')
        .update(updateData)
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Evento não encontrado'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: event,
        message: 'Evento atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deleta um evento
   */
  async deleteEvent(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { error } = await supabase
        .from('company_calendar_events')
        .delete()
        .eq('id', id)
        .eq('companyUserId', companyUserId);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: 'Evento deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém disponibilidade do calendário
   */
  async getAvailability(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { date, duration = 60 } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Data é obrigatória'
        });
      }

      // Buscar eventos do dia
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: events, error } = await supabase
        .from('company_calendar_events')
        .select('startDate, endDate')
        .eq('companyUserId', companyUserId)
        .gte('startDate', startOfDay.toISOString())
        .lte('endDate', endOfDay.toISOString())
        .order('startDate', { ascending: true });

      if (error) {
        throw error;
      }

      // Calcular horários disponíveis
      const availability = this.calculateAvailability(events, date, duration);

      return res.status(200).json({
        success: true,
        data: {
          date,
          duration,
          availableSlots: availability,
          busySlots: events
        }
      });
    } catch (error) {
      console.error('Erro ao obter disponibilidade:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Calcula disponibilidade baseada nos eventos existentes
   */
  calculateAvailability(events, date, duration) {
    const workingHours = {
      start: 9, // 9:00
      end: 18   // 18:00
    };

    const slots = [];
    const durationInMs = duration * 60 * 1000;

    // Gerar slots de 30 em 30 minutos durante horário comercial
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + durationInMs);

        // Verificar se o slot não conflita com eventos existentes
        const hasConflict = events.some(event => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          
          return (slotStart < eventEnd && slotEnd > eventStart);
        });

        if (!hasConflict && slotEnd.getHours() <= workingHours.end) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: true
          });
        }
      }
    }

    return slots;
  }
}

module.exports = new CompanyCalendarController();
