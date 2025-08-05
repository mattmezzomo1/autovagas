const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// Inicializa o cliente Supabase apenas se configurado corretamente
let supabase = null;

if (config.supabase.url && config.supabase.serviceKey &&
    config.supabase.url !== 'your_supabase_url' &&
    config.supabase.serviceKey !== 'your_supabase_service_key') {
  try {
    supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey || config.supabase.key
    );
  } catch (error) {
    console.warn('Failed to initialize Supabase in adminAuth middleware:', error.message);
  }
}

/**
 * Middleware para verificar se o usuário é administrador
 * Verifica o token JWT e consulta o banco de dados para confirmar a role do usuário
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token está presente no cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }

    // Extrai o token do cabeçalho
    const token = authHeader.split(' ')[1];

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verifica se o ID do usuário está presente no token decodificado
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    // Se Supabase não estiver configurado, usar dados do token
    let user;

    if (supabase) {
      // Consulta o usuário no banco de dados
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', decoded.userId)
        .single();

      // Verifica se houve erro na consulta ou se o usuário não foi encontrado
      if (error || !userData) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado.'
        });
      }

      user = userData;
    } else {
      // Usar dados do token se Supabase não estiver disponível
      user = {
        id: decoded.userId,
        role: decoded.role || 'user'
      };
    }

    // Verifica se o usuário é administrador
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão de administrador necessária.'
      });
    }

    // Adiciona o usuário à requisição para uso posterior
    req.user = {
      id: user.id,
      role: user.role
    };

    // Continua para o próximo middleware ou controlador
    next();
  } catch (error) {
    // Verifica se o erro é de token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    // Verifica se o erro é de token inválido
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    // Erro genérico
    console.error('Erro no middleware de autenticação de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
};

module.exports = adminAuthMiddleware;
