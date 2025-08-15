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

// Cria uma instância do roteador do Express
const router = Router();

/**
 * Rota: GET /api/users
 * Descrição: Obtém todos os usuários cadastrados no sistema
 * Acesso: Exclusivo para administradores
 * 
 * Middlewares:
 * 1. passport.authenticate('jwt'): Verifica se o usuário está autenticado via JWT
 * 2. handlePolicies(['ADMIN']): Verifica se o usuário tem permissão de ADMIN
 * 3. getAllUsers: Controller que executa a lógica de negócio
 */
router.get('/',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	getAllUsers
);

/**
 * Rota: GET /api/users/:uid
 * Descrição: Obtém um usuário específico pelo seu ID
 * Acesso: Exclusivo para administradores
 * 
 * Parâmetros:
 * - uid: ID do usuário a ser recuperado
 */
router.get('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	getUserById
);

/**
 * Rota: DELETE /api/users/:uid
 * Descrição: Exclui permanentemente um usuário do sistema
 * Acesso: Exclusivo para administradores
 * 
 * Parâmetros:
 * - uid: ID do usuário a ser excluído
 */
router.delete('/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	deleteUser
);

/**
 * Rota: POST /api/users/:uid/documents
 * Descrição: Faz upload de documentos para um usuário específico
 * Acesso: Usuário autenticado (pode enviar documentos para seu próprio perfil)
 * 
 * Middlewares importantes:
 * 1. Autenticação JWT: Verifica identidade do usuário
 * 2. uploader.array(): Middleware do Multer para processar uploads
 *    - 'document': Nome do campo no formulário
 *    - 5: Número máximo de arquivos permitidos
 * 3. uploadDocuments: Controller que processa os metadados dos arquivos
 * 
 * Parâmetros:
 * - uid: ID do usuário que receberá os documentos
 */
router.post('/:uid/documents',
	passport.authenticate('jwt', { session: false }),
	uploader.array('document', 5),
	uploadDocuments
);

/**
 * Rota: PUT /api/users/premium/:uid
 * Descrição: Atualiza o role de um usuário para premium
 * Acesso: Exclusivo para administradores
 * 
 * Parâmetros:
 * - uid: ID do usuário a ser atualizado
 */
router.put('/premium/:uid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	changeUserRole
);

// Exporta o roteador configurado para uso na aplicação
export default router;