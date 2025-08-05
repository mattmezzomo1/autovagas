const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth.middleware');
const cacheService = require('../../services/cache.service');
const redisService = require('../../services/redis.service');

/**
 * Rotas para gerenciamento de cache
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * Obtém estatísticas do cache
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = cacheService.getStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Obtém informações detalhadas do Redis
 */
router.get('/redis/info', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const info = await redisService.getInfo();

    return res.status(200).json({
      success: true,
      data: {
        connected: redisService.isRedisConnected(),
        info: info
      }
    });
  } catch (error) {
    console.error('Error getting Redis info:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Limpa cache específico por chave
 */
router.delete('/key/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const companyUserId = req.companyUserId || req.user.id;

    // Verificar se a chave pertence ao usuário ou se é admin
    if (req.user.role !== 'admin' && !key.includes(companyUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const deleted = await cacheService.del(key);

    return res.status(200).json({
      success: true,
      data: {
        deleted,
        message: deleted ? 'Cache removido com sucesso' : 'Chave não encontrada'
      }
    });
  } catch (error) {
    console.error('Error deleting cache key:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Limpa cache por padrão
 */
router.delete('/pattern', async (req, res) => {
  try {
    const { pattern } = req.body;
    const companyUserId = req.companyUserId || req.user.id;

    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Padrão é obrigatório'
      });
    }

    // Verificar se o padrão pertence ao usuário ou se é admin
    if (req.user.role !== 'admin' && !pattern.includes(companyUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const deletedCount = await cacheService.deletePattern(pattern);

    return res.status(200).json({
      success: true,
      data: {
        deletedCount,
        message: `${deletedCount} chaves removidas`
      }
    });
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Invalida cache da empresa
 */
router.delete('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const requestingUserId = req.companyUserId || req.user.id;

    // Verificar se é a própria empresa ou admin
    if (req.user.role !== 'admin' && requestingUserId !== companyId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const deletedCount = await cacheService.invalidateCompanyCache(companyId);

    return res.status(200).json({
      success: true,
      data: {
        deletedCount,
        message: `Cache da empresa invalidado (${deletedCount} chaves removidas)`
      }
    });
  } catch (error) {
    console.error('Error invalidating company cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Invalida cache de uma vaga específica
 */
router.delete('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyUserId = req.companyUserId || req.user.id;

    const deletedCount = await cacheService.invalidateJobCache(companyUserId, jobId);

    return res.status(200).json({
      success: true,
      data: {
        deletedCount,
        message: `Cache da vaga invalidado (${deletedCount} chaves removidas)`
      }
    });
  } catch (error) {
    console.error('Error invalidating job cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Limpa todo o cache (admin only)
 */
router.delete('/flush-all', async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const flushed = await cacheService.flushAll();

    return res.status(200).json({
      success: true,
      data: {
        flushed,
        message: flushed ? 'Todo o cache foi limpo' : 'Erro ao limpar cache'
      }
    });
  } catch (error) {
    console.error('Error flushing cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Obtém valor de uma chave específica
 */
router.get('/key/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const companyUserId = req.companyUserId || req.user.id;

    // Verificar se a chave pertence ao usuário ou se é admin
    if (req.user.role !== 'admin' && !key.includes(companyUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const value = await cacheService.get(key);

    return res.status(200).json({
      success: true,
      data: {
        key,
        value,
        exists: value !== null
      }
    });
  } catch (error) {
    console.error('Error getting cache key:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Define valor para uma chave específica
 */
router.put('/key/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, ttl = 3600 } = req.body;
    const companyUserId = req.companyUserId || req.user.id;

    // Verificar se a chave pertence ao usuário ou se é admin
    if (req.user.role !== 'admin' && !key.includes(companyUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Valor é obrigatório'
      });
    }

    const set = await cacheService.set(key, value, ttl);

    return res.status(200).json({
      success: true,
      data: {
        set,
        key,
        ttl,
        message: set ? 'Valor definido com sucesso' : 'Erro ao definir valor'
      }
    });
  } catch (error) {
    console.error('Error setting cache key:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * Verifica se uma chave existe
 */
router.head('/key/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const companyUserId = req.companyUserId || req.user.id;

    // Verificar se a chave pertence ao usuário ou se é admin
    if (req.user.role !== 'admin' && !key.includes(companyUserId)) {
      return res.status(403).end();
    }

    const exists = await cacheService.exists(key);

    return res.status(exists ? 200 : 404).end();
  } catch (error) {
    console.error('Error checking cache key:', error);
    return res.status(500).end();
  }
});

/**
 * Obtém informações de saúde do cache
 */
router.get('/health', async (req, res) => {
  try {
    const stats = cacheService.getStats();

    const health = {
      status: 'healthy',
      redis: {
        connected: redisService.isRedisConnected(),
        status: stats.redis.connected ? 'connected' : 'disconnected'
      },
      memory: {
        size: stats.memory.size,
        maxSize: stats.memory.maxSize,
        usage: `${((stats.memory.size / stats.memory.maxSize) * 100).toFixed(2)}%`
      },
      uptime: process.uptime()
    };

    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting cache health:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
