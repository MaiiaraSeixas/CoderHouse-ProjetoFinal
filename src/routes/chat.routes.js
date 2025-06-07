// Importa o módulo Router do Express para criar rotas
import { Router } from 'express';

// Importa o middleware de controle de acesso/autorização
import { handlePolicies } from '../middlewares/handlePolicies.js';

// Cria uma instância do router do Express
const router = Router();

/**
 * Rota GET para o chat
 * Path: /
 * 
 * Configurações:
 * 1. Middleware de autorização: 
 *    - handlePolicies(['AUTHENTICATED']) → Exige que usuário esteja autenticado
 * 2. Handler da rota: 
 *    - Renderiza o template 'chat' usando o mecanismo de views configurado
 */
router.get('/', 
  // Verifica se usuário está autenticado (não permite acesso público)
  handlePolicies(['AUTHENTICATED']), 
  
  // Handler que processa a requisição
  (req, res) => {
    // Renderiza a view 'chat' (provavelmente um arquivo chat.hbs, chat.ejs ou similar)
    res.render('chat');
  }
);

// Exporta o router configurado para uso na aplicação
export default router;