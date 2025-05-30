// routes/message.router.js

import { Router } from 'express';
import {
  getAllMessages,
  getMessageById,
  createMessage,
  deleteMessage
} from '../controllers/message.controller.js';
import handlePolicies from '../middlewares/handlePolicies.js';

// Cria uma instância do roteador Express
const router = Router();

/**
 * Rota: GET /api/messages
 * Descrição: Obtém todas as mensagens
 * Política de acesso: Requer autenticação (qualquer usuário logado)
 */
router.get('/', 
  handlePolicies(['AUTHENTICATED']), // Middleware de autorização
  getAllMessages // Controller que lida com a requisição
);

/**
 * Rota: GET /api/messages/:id
 * Descrição: Obtém uma mensagem específica pelo ID
 * Política de acesso: Requer autenticação (qualquer usuário logado)
 */
router.get('/:id', 
  handlePolicies(['AUTHENTICATED']), 
  getMessageById
);

/**
 * Rota: POST /api/messages
 * Descrição: Cria uma nova mensagem
 * Política de acesso: Requer autenticação (qualquer usuário logado)
 */
router.post('/', 
  handlePolicies(['AUTHENTICATED']), 
  createMessage
);

/**
 * Rota: DELETE /api/messages/:id
 * Descrição: Exclui uma mensagem pelo ID
 * Política de acesso: Acesso restrito a administradores
 */
router.delete('/:id', 
  handlePolicies(['ADMIN']), // Apenas usuários com papel 'ADMIN'
  deleteMessage
);

// Exporta o roteador configurado
export default router;