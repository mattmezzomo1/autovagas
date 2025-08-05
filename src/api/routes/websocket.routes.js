const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const webSocketService = require('../../services/websocket.service');

/**
 * Rotas para gerenciamento de WebSocket
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * Obtém estatísticas do WebSocket
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = webSocketService.getStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting WebSocket stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Verifica se um usuário está online
 */
router.get('/user/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const isOnline = webSocketService.isUserOnline(userId);

    return res.status(200).json({
      success: true,
      data: {
        userId,
        isOnline,
        status: isOnline ? 'online' : 'offline'
      }
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Obtém lista de usuários online
 */
router.get('/online-users', async (req, res) => {
  try {
    const onlineUsers = webSocketService.getOnlineUsers();

    return res.status(200).json({
      success: true,
      data: {
        count: onlineUsers.length,
        users: onlineUsers
      }
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Envia mensagem para usuário específico (admin only)
 */
router.post('/send-to-user', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { userId, event, data } = req.body;

    if (!userId || !event) {
      return res.status(400).json({
        success: false,
        message: 'UserId e event são obrigatórios'
      });
    }

    const sent = await webSocketService.sendToUser(userId, event, data);

    return res.status(200).json({
      success: true,
      data: {
        sent,
        message: sent ? 'Mensagem enviada com sucesso' : 'Usuário não está online'
      }
    });
  } catch (error) {
    console.error('Error sending message to user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Envia broadcast para todos os usuários (admin only)
 */
router.post('/broadcast', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { event, data } = req.body;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Event é obrigatório'
      });
    }

    // Enviar para todos os usuários conectados
    const onlineUsers = webSocketService.getOnlineUsers();
    const promises = onlineUsers.map(userId =>
      webSocketService.sendToUser(userId, event, data)
    );

    await Promise.all(promises);

    return res.status(200).json({
      success: true,
      data: {
        sentTo: onlineUsers.length,
        message: 'Broadcast enviado com sucesso'
      }
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Força desconexão de um usuário (admin only)
 */
router.post('/disconnect-user', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId é obrigatório'
      });
    }

    // Enviar evento de desconexão forçada
    const sent = await webSocketService.sendToUser(userId, 'force_disconnect', {
      reason: reason || 'Desconectado pelo administrador'
    });

    return res.status(200).json({
      success: true,
      data: {
        sent,
        message: sent ? 'Usuário desconectado' : 'Usuário não está online'
      }
    });
  } catch (error) {
    console.error('Error disconnecting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Obtém informações de saúde do WebSocket
 */
router.get('/health', async (req, res) => {
  try {
    const stats = webSocketService.getStats();

    const health = {
      status: 'healthy',
      connectedUsers: stats.connectedUsers,
      totalSockets: stats.totalSockets,
      rooms: stats.rooms,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting WebSocket health:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
