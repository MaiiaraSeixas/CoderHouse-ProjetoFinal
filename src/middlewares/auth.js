// /middlewares/auth.js

// Define uma função middleware chamada isAuthenticated
// Middlewares são funções que interceptam as requisições HTTP antes de chegarem
// ao seu destino final (as rotas/controladores). Eles podem realizar várias ações,
// como autenticação, autorização, logging, etc.
export function isAuthenticated(req, res, next) {
  // Verifica se existe uma propriedade 'user' no objeto 'session' da requisição.
  // A sessão geralmente é utilizada para manter informações sobre o usuário logado
  // entre diferentes requisições. Se 'req.session.user' existir, significa que
  // o usuário está autenticado.
  if (req.session.user) {
    // Se o usuário estiver autenticado, a função 'next()' é chamada.
    // 'next()' passa o controle para o próximo middleware na cadeia ou para
    // o handler da rota.
    return next();
  }
  // Se 'req.session.user' não existir (o usuário não está autenticado),
  // a resposta é um redirecionamento para a rota '/login'.
  // Isso força o usuário a ir para a página de login para se autenticar.
  res.redirect('/login');
}

// Define uma função middleware chamada isAdmin
// Esta middleware é responsável por verificar se o usuário autenticado possui
// a role de 'admin'.
export function isAdmin(req, res, next) {
  // Verifica se existe a propriedade 'user' na sessão e se a propriedade 'role'
  // desse usuário é estritamente igual a 'admin'.
  // O operador '?' (optional chaining) garante que se 'req.session.user' for
  // null ou undefined, a tentativa de acessar 'role' não causará um erro.
  if (req.session.user?.role === 'admin') {
    // Se o usuário tiver a role de 'admin', a função 'next()' é chamada,
    // permitindo que a requisição siga para o próximo middleware ou handler da rota.
    return next();
  }
  // Se o usuário não tiver a role de 'admin', uma resposta com status de erro
  // 403 (Forbidden) é enviada, juntamente com uma mensagem informando que
  // o acesso é restrito a administradores.
  res.status(403).send('Acesso restrito a administradores.');
}