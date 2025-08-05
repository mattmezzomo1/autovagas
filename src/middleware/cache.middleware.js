const cacheService = require('../services/cache.service');

/**
 * Middleware de cache para rotas
 */
class CacheMiddleware {
  /**
   * Cache genérico baseado na URL e query parameters
   */
  static cache(ttlSeconds = 300) {
    return async (req, res, next) => {
      try {
        // Gerar chave de cache baseada na URL e parâmetros
        const cacheKey = CacheMiddleware.generateCacheKey(req);
        
        // Tentar obter do cache
        const cachedData = await cacheService.get(cacheKey);
        
        if (cachedData) {
          return res.status(200).json({
            ...cachedData,
            cached: true,
            cacheKey
          });
        }

        // Interceptar res.json para cachear a resposta
        const originalJson = res.json;
        res.json = function(data) {
          // Cachear apenas respostas de sucesso
          if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
            cacheService.set(cacheKey, data, ttlSeconds).catch(err => {
              console.error('Error caching response:', err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache específico para dashboard
   */
  static dashboardCache(ttlSeconds = 300) {
    return async (req, res, next) => {
      try {
        const companyUserId = req.companyUserId || req.user?.id;
        
        if (!companyUserId) {
          return next();
        }

        const cacheKey = `dashboard:${companyUserId}`;
        const cachedData = await cacheService.get(cacheKey);
        
        if (cachedData) {
          return res.status(200).json({
            success: true,
            data: cachedData,
            cached: true
          });
        }

        // Interceptar resposta para cache
        const originalJson = res.json;
        res.json = function(data) {
          if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
            cacheService.set(cacheKey, data.data, ttlSeconds).catch(err => {
              console.error('Error caching dashboard:', err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Dashboard cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache para listas com filtros
   */
  static listCache(prefix, ttlSeconds = 600) {
    return async (req, res, next) => {
      try {
        const companyUserId = req.companyUserId || req.user?.id;
        
        if (!companyUserId) {
          return next();
        }

        const filterKey = CacheMiddleware.generateFilterKey(req.query);
        const cacheKey = `${prefix}:${companyUserId}:${filterKey}`;
        
        const cachedData = await cacheService.get(cacheKey);
        
        if (cachedData) {
          return res.status(200).json({
            ...cachedData,
            cached: true
          });
        }

        // Interceptar resposta para cache
        const originalJson = res.json;
        res.json = function(data) {
          if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
            cacheService.set(cacheKey, data, ttlSeconds).catch(err => {
              console.error(`Error caching ${prefix}:`, err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error(`${prefix} cache middleware error:`, error);
        next();
      }
    };
  }

  /**
   * Cache para analytics
   */
  static analyticsCache(ttlSeconds = 1800) {
    return async (req, res, next) => {
      try {
        const companyUserId = req.companyUserId || req.user?.id;
        const { timeRange = '30d', type = 'general' } = req.query;
        
        if (!companyUserId) {
          return next();
        }

        const cacheKey = `analytics:${companyUserId}:${type}:${timeRange}`;
        const cachedData = await cacheService.get(cacheKey);
        
        if (cachedData) {
          return res.status(200).json({
            success: true,
            data: cachedData,
            cached: true
          });
        }

        // Interceptar resposta para cache
        const originalJson = res.json;
        res.json = function(data) {
          if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
            cacheService.set(cacheKey, data.data, ttlSeconds).catch(err => {
              console.error('Error caching analytics:', err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Analytics cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Middleware para invalidar cache
   */
  static invalidateCache(patterns) {
    return async (req, res, next) => {
      try {
        const companyUserId = req.companyUserId || req.user?.id;
        
        if (!companyUserId) {
          return next();
        }

        // Interceptar resposta para invalidar cache após operações de escrita
        const originalJson = res.json;
        res.json = function(data) {
          // Invalidar cache apenas em operações de sucesso
          if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
            const invalidationPromises = patterns.map(pattern => {
              const fullPattern = pattern.replace('{companyUserId}', companyUserId);
              return cacheService.deletePattern(fullPattern);
            });
            
            Promise.all(invalidationPromises).catch(err => {
              console.error('Error invalidating cache:', err);
            });
          }
          
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache invalidation middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache condicional baseado no role do usuário
   */
  static conditionalCache(conditions, ttlSeconds = 300) {
    return async (req, res, next) => {
      try {
        const user = req.user;
        
        // Verificar condições
        const shouldCache = conditions.every(condition => {
          switch (condition.type) {
            case 'role':
              return condition.values.includes(user?.role);
            case 'plan':
              return condition.values.includes(user?.plan);
            case 'method':
              return condition.values.includes(req.method);
            default:
              return true;
          }
        });

        if (!shouldCache) {
          return next();
        }

        // Aplicar cache normal
        return CacheMiddleware.cache(ttlSeconds)(req, res, next);
      } catch (error) {
        console.error('Conditional cache middleware error:', error);
        next();
      }
    };
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  /**
   * Gera chave de cache baseada na requisição
   */
  static generateCacheKey(req) {
    const { method, path, query, params } = req;
    const userId = req.companyUserId || req.user?.id || 'anonymous';
    
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    
    const paramsString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${method}:${path}:${userId}:${queryString}:${paramsString}`;
  }

  /**
   * Gera chave de filtro baseada nos query parameters
   */
  static generateFilterKey(query) {
    if (!query || typeof query !== 'object') {
      return 'default';
    }

    const sortedKeys = Object.keys(query).sort();
    const keyParts = sortedKeys.map(key => `${key}=${query[key]}`);
    return keyParts.join('&') || 'default';
  }

  /**
   * Middleware para limpar cache em operações específicas
   */
  static clearCacheOnMutation(cachePatterns) {
    return async (req, res, next) => {
      // Executar após a resposta
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const companyUserId = req.companyUserId || req.user?.id;
            
            if (companyUserId && cachePatterns) {
              for (const pattern of cachePatterns) {
                const fullPattern = pattern.replace('{companyUserId}', companyUserId);
                await cacheService.deletePattern(fullPattern);
              }
            }
          } catch (error) {
            console.error('Error clearing cache on mutation:', error);
          }
        }
      });

      next();
    };
  }

  /**
   * Middleware para estatísticas de cache
   */
  static cacheStats() {
    return async (req, res, next) => {
      try {
        const stats = cacheService.getStats();
        
        res.locals.cacheStats = stats;
        
        // Adicionar header com informações de cache
        res.setHeader('X-Cache-Stats', JSON.stringify(stats));
        
        next();
      } catch (error) {
        console.error('Cache stats middleware error:', error);
        next();
      }
    };
  }
}

module.exports = CacheMiddleware;
