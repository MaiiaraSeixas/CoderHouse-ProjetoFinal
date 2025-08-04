// Arquivo 2: src/routes/products.mongo.js (VERSÃO FINAL CORRETA)

import { Router } from 'express';
import passport from 'passport';
import handlePolicies from '../middlewares/handlePolicies.js';
import productsController from '../controllers/products.controller.js';

const router = Router();

// Rotas públicas
router.get('/', handlePolicies(['PUBLIC']), productsController.getProducts);
router.get('/:pid', handlePolicies(['PUBLIC']), productsController.getProductById);

// Rotas protegidas (JWT + políticas)
router.post(
	'/',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN', 'PREMIUM']),
	productsController.createProduct
);

router.put(
	'/:pid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN', 'PREMIUM']),
	productsController.updateProduct
);

router.delete(
	'/:pid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN', 'PREMIUM']),
	productsController.deleteProduct
);

export default router;

