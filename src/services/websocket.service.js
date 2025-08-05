const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const redisService = require('./redis.service');

/**
 * Serviço de WebSocket para chat em tempo real
 */
class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userData
  }

  /**
   * Inicializa o servidor WebSocket
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Middleware de autenticação
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token de autenticação não fornecido'));
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Token inválido'));
      }
    });

    // Eventos de conexão
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    // Configurar Redis pub/sub para múltiplas instâncias
    this.setupRedisSubscription();

    console.log('WebSocket Service initialized');
  }

  /**
   * Manipula nova conexão
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;

    console.log(`User ${userId} (${userRole}) connected via WebSocket`);

    // Armazenar conexão
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, {
      userId,
      userRole,
      connectedAt: new Date()
    });

    // Entrar em salas baseadas no role
    if (userRole === 'company') {
      socket.join(`company:${userId}`);
    } else {
      socket.join(`candidate:${userId}`);
    }

    // Eventos do chat
    socket.on('join_conversation', (data) => {
      this.handleJoinConversation(socket, data);
    });

    socket.on('leave_conversation', (data) => {
      this.handleLeaveConversation(socket, data);
    });

    socket.on('send_message', (data) => {
      this.handleSendMessage(socket, data);
    });

    socket.on('typing_start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing_stop', (data) => {
      this.handleTypingStop(socket, data);
    });

    socket.on('mark_as_read', (data) => {
      this.handleMarkAsRead(socket, data);
    });

    // Eventos de desconexão
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Enviar status online
    this.broadcastUserStatus(userId, 'online');
  }

  /**
   * Manipula desconexão
   */
  handleDisconnection(socket) {
    const userData = this.userSockets.get(socket.id);
    
    if (userData) {
      const { userId } = userData;
      
      console.log(`User ${userId} disconnected from WebSocket`);
      
      // Remover da lista de conectados
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      // Broadcast status offline
      this.broadcastUserStatus(userId, 'offline');
    }
  }

  /**
   * Entrar em conversa
   */
  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    
    if (!conversationId) {
      return socket.emit('error', { message: 'ID da conversa é obrigatório' });
    }

    socket.join(`conversation:${conversationId}`);
    
    // Notificar outros participantes
    socket.to(`conversation:${conversationId}`).emit('user_joined_conversation', {
      userId: socket.userId,
      conversationId
    });
  }

  /**
   * Sair da conversa
   */
  handleLeaveConversation(socket, data) {
    const { conversationId } = data;
    
    if (!conversationId) {
      return socket.emit('error', { message: 'ID da conversa é obrigatório' });
    }

    socket.leave(`conversation:${conversationId}`);
    
    // Notificar outros participantes
    socket.to(`conversation:${conversationId}`).emit('user_left_conversation', {
      userId: socket.userId,
      conversationId
    });
  }

  /**
   * Enviar mensagem
   */
  async handleSendMessage(socket, data) {
    try {
      const { conversationId, content, recipientId } = data;
      
      if (!conversationId || !content || !recipientId) {
        return socket.emit('error', { message: 'Dados da mensagem incompletos' });
      }

      // Criar objeto da mensagem
      const message = {
        id: Date.now().toString(), // Temporário, será substituído pelo ID do banco
        conversationId,
        content,
        senderId: socket.userId,
        recipientId,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Enviar para todos na conversa
      this.io.to(`conversation:${conversationId}`).emit('new_message', message);

      // Enviar notificação push se o destinatário estiver offline
      if (!this.connectedUsers.has(recipientId)) {
        await this.sendPushNotification(recipientId, {
          type: 'new_message',
          title: 'Nova mensagem',
          body: content.substring(0, 100),
          data: { conversationId }
        });
      }

      // Publicar no Redis para outras instâncias
      await this.publishToRedis('message_sent', {
        conversationId,
        message,
        excludeSocketId: socket.id
      });

    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  }

  /**
   * Usuário começou a digitar
   */
  handleTypingStart(socket, data) {
    const { conversationId } = data;
    
    if (!conversationId) {
      return socket.emit('error', { message: 'ID da conversa é obrigatório' });
    }

    socket.to(`conversation:${conversationId}`).emit('user_typing_start', {
      userId: socket.userId,
      conversationId
    });
  }

  /**
   * Usuário parou de digitar
   */
  handleTypingStop(socket, data) {
    const { conversationId } = data;
    
    if (!conversationId) {
      return socket.emit('error', { message: 'ID da conversa é obrigatório' });
    }

    socket.to(`conversation:${conversationId}`).emit('user_typing_stop', {
      userId: socket.userId,
      conversationId
    });
  }

  /**
   * Marcar mensagens como lidas
   */
  async handleMarkAsRead(socket, data) {
    try {
      const { conversationId, messageIds } = data;
      
      if (!conversationId) {
        return socket.emit('error', { message: 'ID da conversa é obrigatório' });
      }

      // Notificar outros participantes
      socket.to(`conversation:${conversationId}`).emit('messages_read', {
        userId: socket.userId,
        conversationId,
        messageIds: messageIds || []
      });

      // Publicar no Redis
      await this.publishToRedis('messages_read', {
        conversationId,
        userId: socket.userId,
        messageIds,
        excludeSocketId: socket.id
      });

    } catch (error) {
      console.error('Error handling mark as read:', error);
      socket.emit('error', { message: 'Erro ao marcar como lida' });
    }
  }

  /**
   * Broadcast status do usuário
   */
  async broadcastUserStatus(userId, status) {
    try {
      // Enviar para contatos/conversas do usuário
      this.io.emit('user_status_change', {
        userId,
        status,
        timestamp: new Date().toISOString()
      });

      // Publicar no Redis
      await this.publishToRedis('user_status_change', {
        userId,
        status
      });

    } catch (error) {
      console.error('Error broadcasting user status:', error);
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Enviar mensagem para usuário específico
   */
  async sendToUser(userId, event, data) {
    try {
      const socketId = this.connectedUsers.get(userId);
      
      if (socketId) {
        this.io.to(socketId).emit(event, data);
        return true;
      }

      // Publicar no Redis para outras instâncias
      await this.publishToRedis('send_to_user', {
        userId,
        event,
        data
      });

      return false;
    } catch (error) {
      console.error('Error sending to user:', error);
      return false;
    }
  }

  /**
   * Enviar mensagem para conversa
   */
  async sendToConversation(conversationId, event, data, excludeUserId = null) {
    try {
      let room = this.io.to(`conversation:${conversationId}`);
      
      if (excludeUserId) {
        const excludeSocketId = this.connectedUsers.get(excludeUserId);
        if (excludeSocketId) {
          room = room.except(excludeSocketId);
        }
      }

      room.emit(event, data);

      // Publicar no Redis
      await this.publishToRedis('send_to_conversation', {
        conversationId,
        event,
        data,
        excludeUserId
      });

    } catch (error) {
      console.error('Error sending to conversation:', error);
    }
  }

  /**
   * Verificar se usuário está online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obter usuários online
   */
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalSockets: this.userSockets.size,
      rooms: this.io.sockets.adapter.rooms.size
    };
  }

  // ===== MÉTODOS REDIS =====

  /**
   * Configurar subscription do Redis
   */
  async setupRedisSubscription() {
    if (!redisService.isRedisConnected()) {
      return;
    }

    try {
      await redisService.subscribe('websocket_events', (message) => {
        this.handleRedisMessage(message);
      });
    } catch (error) {
      console.error('Error setting up Redis subscription:', error);
    }
  }

  /**
   * Publicar evento no Redis
   */
  async publishToRedis(type, data) {
    if (!redisService.isRedisConnected()) {
      return;
    }

    try {
      await redisService.publish('websocket_events', {
        type,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error publishing to Redis:', error);
    }
  }

  /**
   * Manipular mensagem do Redis
   */
  handleRedisMessage(message) {
    try {
      const { type, data } = message;

      switch (type) {
        case 'message_sent':
          this.handleRedisMessageSent(data);
          break;
        case 'messages_read':
          this.handleRedisMessagesRead(data);
          break;
        case 'user_status_change':
          this.handleRedisUserStatusChange(data);
          break;
        case 'send_to_user':
          this.handleRedisSendToUser(data);
          break;
        case 'send_to_conversation':
          this.handleRedisSendToConversation(data);
          break;
      }
    } catch (error) {
      console.error('Error handling Redis message:', error);
    }
  }

  handleRedisMessageSent(data) {
    const { conversationId, message, excludeSocketId } = data;
    
    let room = this.io.to(`conversation:${conversationId}`);
    if (excludeSocketId) {
      room = room.except(excludeSocketId);
    }
    
    room.emit('new_message', message);
  }

  handleRedisMessagesRead(data) {
    const { conversationId, userId, messageIds, excludeSocketId } = data;
    
    let room = this.io.to(`conversation:${conversationId}`);
    if (excludeSocketId) {
      room = room.except(excludeSocketId);
    }
    
    room.emit('messages_read', { userId, conversationId, messageIds });
  }

  handleRedisUserStatusChange(data) {
    const { userId, status } = data;
    this.io.emit('user_status_change', { userId, status, timestamp: new Date().toISOString() });
  }

  handleRedisSendToUser(data) {
    const { userId, event, data: eventData } = data;
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      this.io.to(socketId).emit(event, eventData);
    }
  }

  handleRedisSendToConversation(data) {
    const { conversationId, event, data: eventData, excludeUserId } = data;
    
    let room = this.io.to(`conversation:${conversationId}`);
    if (excludeUserId) {
      const excludeSocketId = this.connectedUsers.get(excludeUserId);
      if (excludeSocketId) {
        room = room.except(excludeSocketId);
      }
    }
    
    room.emit(event, eventData);
  }

  /**
   * Enviar notificação push (placeholder)
   */
  async sendPushNotification(userId, notification) {
    // Implementar integração com serviço de push notifications
    console.log(`Push notification for user ${userId}:`, notification);
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService;
