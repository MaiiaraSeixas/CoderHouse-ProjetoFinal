// /middlewares/auth.js
export function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

export function isAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.status(403).send('Acesso restrito a administradores.');
}
