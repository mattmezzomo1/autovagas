const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

let supabase = null;

// Only initialize Supabase if properly configured
if (config.supabase.url && config.supabase.key &&
    config.supabase.url !== 'your_supabase_url' &&
    config.supabase.key !== 'your_supabase_key') {
  try {
    supabase = createClient(
      config.supabase.url,
      config.supabase.key
    );
  } catch (error) {
    console.warn('Failed to initialize Supabase in auth middleware:', error.message);
  }
}

/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado através do token JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (supabase) {
      // Verificar token com Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Adicionar dados do usuário ao request
      req.user = {
        id: user.id,
        email: user.email,
        ...userData
      };
    } else {
      // Fallback para JWT simples se Supabase não estiver disponível
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role || 'user'
        };
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Primeiro, verificar autenticação básica
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Privilégios de administrador necessários.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia a requisição se não houver token, mas adiciona dados do usuário se houver
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Continuar sem autenticação
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Continuar sem autenticação
      req.user = null;
      return next();
    }

    // Buscar dados completos do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      req.user = null;
      return next();
    }

    // Adicionar dados do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar plano do usuário
 */
const planMiddleware = (requiredPlans = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }

    const userPlan = req.user.subscriptionPlan;

    if (!requiredPlans.includes(userPlan)) {
      return res.status(403).json({
        success: false,
        message: 'Plano insuficiente para acessar este recurso',
        requiredPlans,
        currentPlan: userPlan
      });
    }

    next();
  };
};

/**
 * Middleware para rate limiting por usuário
 */
const userRateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpar requisições antigas
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId);
      const validRequests = requests.filter(time => time > windowStart);
      userRequests.set(userId, validRequests);
    }

    // Verificar limite
    const currentRequests = userRequests.get(userId) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Adicionar requisição atual
    currentRequests.push(now);
    userRequests.set(userId, currentRequests);

    next();
  };
};

module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  optionalAuthMiddleware,
  planMiddleware,
  userRateLimitMiddleware
};
