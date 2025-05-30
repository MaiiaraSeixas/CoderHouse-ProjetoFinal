// middlewares/errorHandler.js

/**
 * Middleware global para captura e tratamento de erros
 */
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    status: 'error',
    message: isProd ? 'Erro inesperado. Contate o suporte.' : message
  });
}
