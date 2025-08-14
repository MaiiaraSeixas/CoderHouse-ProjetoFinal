// src/routes/users.routes.js

import { Router } from 'express';
import passport from 'passport';
import {
	getAllUsers,
	getUserById,
	deleteUser,
	uploadDocuments,
	changeUserRole
} from '../controllers/users.controller.js';
import handlePolicies from '../middlewares/handlePolicies.js';
import uploader from '../utils/multer.js';

// Cria o roteador para as rotas de usuários
const router = Router();

// Rota para obter todos os usuários (apenas ADMIN)
router.get('/',
	// Autenticação via JWT
	passport.authenticate('jwt', { session: false }),
	// Verificação de política de acesso (somente ADMIN)
	handlePolicies(['ADMIN']),
	// Controller que busca todos os usuários
	getAllUsers
);

// Rota para obter um usuário específico por ID (apenas ADMIN)
router.get('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que busca um usuário pelo ID
	getUserById
);

// Rota para deletar um usuário (apenas ADMIN)
router.delete('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que remove um usuário
	deleteUser
);

// Rota para upload de documentos do usuário
// IMPORTANTE: A ordem dos middlewares é crucial
router.post('/:uid/documents',
	// 1. Primeiro autentica o usuário (para ter req.user disponível)
	passport.authenticate('jwt', { session: false }),

	// 2. Depois processa o upload de arquivos
	// Permite até 5 arquivos com o campo name="document"
	uploader.array('document', 5),

	// 3. Controller que salva os metadados dos documentos
	uploadDocuments
);

// Rota para alterar o role do usuário (apenas ADMIN)
router.put('/premium/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	// Controller que atualiza o role do usuário
	changeUserRole
);

// Exporta o roteador configurado
export default router;