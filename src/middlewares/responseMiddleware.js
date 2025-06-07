// middlewares/responseMiddleware.js

/**
 * Middleware para padronizar as respostas HTTP
 * Define métodos auxiliares em res para facilitar retorno consistente da API
 */
export const responseMiddleware = (req, res, next) => {
  /**
   * Retorna sucesso com dados
   * @param {*} payload - dados de retorno
   */
  console.log('[RESPONSE MIDDLEWARE] Ativado');
  res.sendSuccess = (payload) => {
    res.status(200).json({ status: 'success', payload });
  };

  /**
   * Compatível com nomenclatura alternativa usada em outros arquivos
   */
  res.sendSuccessWithPayload = (payload) => {
    res.status(200).json({ status: 'success', payload });
  };

  /**
   * Retorna erro com mensagem e status customizável
   * @param {string} message - mensagem de erro
   * @param {number} [status=500] - código de status HTTP
   */
  res.sendError = (message, status = 500) => {
    res.status(status).json({ status: 'error', error: message });
  };

  /**
   * Retorna recurso criado
   * @param {*} payload - dados do novo recurso
   */
  res.sendCreated = (payload) => {
    res.status(201).json({ status: 'success', payload });
  };

  next(); // Continua a cadeia de middlewares
};

export default responseMiddleware;