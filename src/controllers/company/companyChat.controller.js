const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/config');
const webSocketService = require('../../services/websocket.service');
const cacheService = require('../../services/cache.service');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Controlador para chat da empresa
 */
class CompanyChatController {
  /**
   * Obtém todas as conversas da empresa
   */
  async getConversations(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { page = 1, limit = 20, search } = req.query;
      const offset = (page - 1) * limit;

      // Tentar obter do cache primeiro
      const cacheKey = `conversations:${companyUserId}:${page}:${limit}:${search || 'all'}`;
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        return res.status(200).json({
          success: true,
          data: cachedData.conversations,
          pagination: cachedData.pagination,
          cached: true
        });
      }

      let query = supabase
        .from('company_chat_conversations')
        .select(`
          *,
          candidate:candidateUserId (
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

      if (search) {
        query = query.ilike('candidate.fullName', `%${search}%`);
      }

      query = query
        .order('lastMessageTime', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: conversations, error, count } = await query;

      if (error) {
        throw error;
      }

      // Adicionar status online dos candidatos
      const conversationsWithStatus = conversations.map(conv => ({
        ...conv,
        candidate: {
          ...conv.candidate,
          isOnline: webSocketService.isUserOnline(conv.candidateUserId)
        }
      }));

      const result = {
        conversations: conversationsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

      // Cache por 5 minutos
      await cacheService.set(cacheKey, result, 300);

      return res.status(200).json({
        success: true,
        data: result.conversations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Erro ao obter conversas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém uma conversa específica
   */
  async getConversation(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      const { data: conversation, error } = await supabase
        .from('company_chat_conversations')
        .select(`
          *,
          candidate:candidateUserId (
            id,
            fullName,
            title,
            profileImage,
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
            message: 'Conversa não encontrada'
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Erro ao obter conversa:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria uma nova conversa
   */
  async createConversation(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { candidateUserId, jobId, initialMessage } = req.body;

      if (!candidateUserId) {
        return res.status(400).json({
          success: false,
          message: 'ID do candidato é obrigatório'
        });
      }

      // Verificar se já existe conversa
      const { data: existingConversation } = await supabase
        .from('company_chat_conversations')
        .select('id')
        .eq('companyUserId', companyUserId)
        .eq('candidateUserId', candidateUserId)
        .single();

      if (existingConversation) {
        return res.status(200).json({
          success: true,
          data: existingConversation,
          message: 'Conversa já existe'
        });
      }

      // Criar nova conversa
      const { data: conversation, error } = await supabase
        .from('company_chat_conversations')
        .insert([{
          companyUserId,
          candidateUserId,
          jobId,
          lastMessage: initialMessage || null,
          lastMessageTime: initialMessage ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Se há mensagem inicial, criar a mensagem
      if (initialMessage) {
        await this.createMessage(conversation.id, companyUserId, candidateUserId, initialMessage, 'company');
      }

      return res.status(201).json({
        success: true,
        data: conversation,
        message: 'Conversa criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém mensagens de uma conversa
   */
  async getMessages(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se a conversa pertence à empresa
      const { data: conversation } = await supabase
        .from('company_chat_conversations')
        .select('id')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversa não encontrada'
        });
      }

      const { data: messages, error, count } = await supabase
        .from('company_chat_messages')
        .select('*', { count: 'exact' })
        .eq('conversationId', id)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: messages.reverse(), // Reverter para ordem cronológica
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao obter mensagens:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Envia uma mensagem
   */
  async sendMessage(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo da mensagem é obrigatório'
        });
      }

      // Verificar se a conversa pertence à empresa
      const { data: conversation } = await supabase
        .from('company_chat_conversations')
        .select('candidateUserId')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversa não encontrada'
        });
      }

      // Criar mensagem
      const message = await this.createMessage(
        id,
        companyUserId,
        conversation.candidateUserId,
        content,
        'company'
      );

      // Atualizar conversa
      await supabase
        .from('company_chat_conversations')
        .update({
          lastMessage: content,
          lastMessageTime: new Date().toISOString()
        })
        .eq('id', id);

      // Enviar via WebSocket em tempo real
      await webSocketService.sendToConversation(id, 'new_message', {
        ...message,
        senderType: 'company'
      });

      // Notificar candidato se estiver online
      await webSocketService.sendToUser(conversation.candidateUserId, 'new_message_notification', {
        conversationId: id,
        message: {
          id: message.id,
          content: content.substring(0, 100),
          senderType: 'company',
          timestamp: message.createdAt
        }
      });

      // Invalidar cache de conversas
      await cacheService.deletePattern(`conversations:${companyUserId}*`);
      await cacheService.deletePattern(`messages:${id}*`);

      return res.status(201).json({
        success: true,
        data: message,
        message: 'Mensagem enviada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Marca conversa como lida
   */
  async markAsRead(req, res) {
    try {
      const companyUserId = req.companyUserId;
      const { id } = req.params;

      // Verificar se a conversa pertence à empresa
      const { data: conversation } = await supabase
        .from('company_chat_conversations')
        .select('id')
        .eq('id', id)
        .eq('companyUserId', companyUserId)
        .single();

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversa não encontrada'
        });
      }

      // Marcar mensagens como lidas
      await supabase
        .from('company_chat_messages')
        .update({ status: 'read' })
        .eq('conversationId', id)
        .eq('sender', 'candidate');

      // Resetar contador de não lidas
      await supabase
        .from('company_chat_conversations')
        .update({ unreadCount: 0 })
        .eq('id', id);

      return res.status(200).json({
        success: true,
        message: 'Conversa marcada como lida'
      });
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Cria uma mensagem
   */
  async createMessage(conversationId, companyUserId, candidateUserId, content, sender) {
    const { data: message, error } = await supabase
      .from('company_chat_messages')
      .insert([{
        conversationId,
        companyUserId,
        candidateUserId,
        content,
        sender,
        status: 'sent'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return message;
  }
}

module.exports = new CompanyChatController();
