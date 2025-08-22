// src/routes/carts.routes.js
import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import handlePolicies from '../middlewares/handlePolicies.js';
import passport from 'passport';

const router = Router();

// Rota para finalizar a compra
router.post('/:cid/purchase',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'PREMIUM']),
	cartController.purchaseCart
);

// Rota para obter todos os carrinhos (Admin)
router.get('/',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['ADMIN']),
	cartController.getAllCarts
);

// Rota para obter um carrinho por ID
router.get('/:cid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'ADMIN', 'PREMIUM']),
	cartController.getCartById
);

// Rota para criar um novo carrinho
router.post('/',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'ADMIN', 'PREMIUM']),
	cartController.createCart
);

// Rota para adicionar um produto ao carrinho
router.post('/:cid/product/:pid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'PREMIUM']),
	cartController.addProductToCart
);

// Rota para atualizar a quantidade de um produto
router.put('/:cid/product/:pid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'PREMIUM']),
	cartController.updateProductQuantityInCart
);

// Rota para remover um produto específico do carrinho
router.delete('/:cid/product/:pid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'PREMIUM']),
	cartController.removeProductFromCart
);

// Rota para LIMPAR (esvaziar) todos os produtos do carrinho
router.delete('/:cid',
	passport.authenticate('jwt', { session: false }),
	handlePolicies(['USER', 'PREMIUM']),
	cartController.clearProductsFromCart // Corrigido para usar clearCart, que é mais seguro
);

export default router;
