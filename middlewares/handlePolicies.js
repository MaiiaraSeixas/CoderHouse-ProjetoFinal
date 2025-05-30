// middlewares/handlePolicies.js

const handlePolicies = (policies) => {
  return async (req, res, next) => {
    console.log('[POLICY DEBUG] Policies exigidas:', policies);

    const user = req.user;
    console.log('[POLICY DEBUG] Usuário recebido do Passport:', user);

    // Permitir acesso público
    if (policies.includes('PUBLIC')) {
      console.log('[POLICY DEBUG] Acesso liberado por política PUBLIC');
      return next();
    }

    // Verificar se usuário está autenticado e tem uma role
    if (!user || !user.role) {
      console.warn('[POLICY DEBUG] Acesso negado: usuário não autenticado ou sem role');
      return res.status(401).send({ status: 'error', message: 'Unauthorized' });
    }

    // Normalizar a role do usuário e as policies para letras maiúsculas
    const userRole = user.role.toUpperCase();
    const normalizedPolicies = policies.map(p => p.toUpperCase());

    // Verificar se a role do usuário é permitida
    if (!normalizedPolicies.includes(userRole)) {
      console.warn(`[POLICY DEBUG] Acesso negado: role ${userRole} não incluída nas policies`);
      return res.status(403).send({ 
        status: 'error', 
        message: 'Forbidden: insufficient role' 
      });
    }

    console.log('[POLICY DEBUG] Acesso autorizado para role:', userRole);
    next();
  };
};




// // middlewares/handlePolicies.js
// // Middleware para controle de acesso baseado em políticas (roles)
// const handlePolicies = (policies) => {
//   // Retorna um middleware do Express que será executado nas rotas
//   return async (req, res, next) => {
//     // Se a política incluir 'PUBLIC', permite acesso sem autenticação
//     if (policies.includes('PUBLIC')) return next();

//     // Obtém o usuário da requisição (deve ter sido colocado por middleware anterior)
//     const user = req.user;

//     // Se não há usuário autenticado ou não tem role, retorna erro 401 (Unauthorized)
//     if (!user || !user.role) return res.status(401).send({ status: 'error', message: 'Unauthorized' });

//     // Verifica se o papel (role) do usuário está na lista de políticas permitidas
//     if (!policies.includes(user.role)) {
//       // Se o papel não está permitido, retorna erro 403 (Forbidden)
//       return res.status(403).send({ 
//         status: 'error', 
//         message: 'Forbidden: insufficient role' 
//       });
//     }

//     // Se todas as verificações passaram, continua para o próximo middleware/controller
//     next();
//   };
// };

export default handlePolicies;




