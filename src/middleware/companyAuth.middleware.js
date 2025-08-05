/**
 * Middleware para verificar se o usuário é uma empresa
 */
const companyAuthMiddleware = (req, res, next) => {
  try {
    // O middleware de autenticação já deve ter verificado o token e definido req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não encontrado'
      });
    }

    // Verificar se o usuário tem role de empresa
    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas empresas podem acessar este recurso.'
      });
    }

    // Adicionar informações da empresa ao request
    req.companyUserId = req.user.id;
    
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação da empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = companyAuthMiddleware;
