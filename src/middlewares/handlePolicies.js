// Middleware de autorização que agora trata 'AUTHENTICATED' corretamente.

const handlePolicies = policies => {
  return (req, res, next) => {
    // Se a rota for pública, permite o acesso sem verificação
    if (policies.includes('PUBLIC')) {
      return next();
    }

    // Se o usuário não estiver autenticado (não há req.user), bloqueia com erro 401
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autorizado. Faça o login para continuar.'
      });
    }

    // Se a política permitir qualquer usuário autenticado, permite o acesso
    if (policies.includes('AUTHENTICATED')) {
      return next();
    }

    // Obtém o papel do usuário e converte para maiúsculo para comparação
    const userRole = req.user.role.toUpperCase();

    // Se o papel do usuário não estiver incluído nas políticas exigidas, bloqueia com erro 403
    if (!policies.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso proibido. Você não tem permissão para acessar este recurso.'
      });
    }

    // Se todas as verificações passarem, permite o acesso à próxima função
    next();
  };
};

// Exporta o middleware para uso em rotas protegidas
export default handlePolicies;
