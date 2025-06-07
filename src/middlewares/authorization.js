export const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const user = req.user;

    console.log('[POLICY DEBUG] Policies exigidas:', rolesPermitidos);
    console.log('[POLICY DEBUG] Usuário recebido do Passport:', user);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!rolesPermitidos.includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente' });
    }

    console.log('[POLICY DEBUG] Acesso autorizado para role:', user.role);
    next();
  };
};
