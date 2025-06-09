import { Router } from 'express';
import passport from 'passport';
import { getAllUsers, getUserById, deleteUser } from '../controllers/users.controller.js';
import handlePolicies from '../middlewares/handlePolicies.js';

const router = Router();

// Rota para obter todos os usuários (apenas Admin)
router.get('/',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    getAllUsers
);

// Rota para obter um usuário por ID (apenas Admin)
router.get('/:uid',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    getUserById
);

// Rota para deletar um usuário (apenas Admin)
router.delete('/:uid',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    deleteUser
);

export default router;