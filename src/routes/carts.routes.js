// ===== ARQUIVO ATUALIZADO: routes/carts.routes.js =====
// Adiciona o endpoint POST /:cid/purchase para acionar a compra.

import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js'; // Controlador de carrinho
import handlePolicies from '../middlewares/handlePolicies.js';      // Middleware de controle de acesso por função
import { passportCall } from '../config/passport.js';               // Autenticação com Passport (estratégia JWT)

const router = Router();

// ==== ROTA PARA FINALIZAR COMPRA DO CARRINHO ====
// Requer autenticação com JWT e permite apenas usuários com roles 'USER' ou 'PREMIUM'
router.post('/:cid/purchase',
    passportCall('jwt'),
    handlePolicies(['USER', 'PREMIUM']), // Apenas usuários logados e autorizados podem comprar
    cartController.purchaseCart // Controlador que lida com a lógica da compra
);

// ==== ROTA PARA OBTER UM CARRINHO POR ID ====
// Acesso permitido a USER, ADMIN ou PREMIUM
router.get('/:cid',
    passportCall('jwt'),
    handlePolicies(['USER', 'ADMIN', 'PREMIUM']),
    cartController.getCart
);

// ==== ROTA PARA CRIAR UM NOVO CARRINHO ====
// Apenas usuários autenticados podem criar
router.post('/',
    passportCall('jwt'),
    handlePolicies(['USER', 'ADMIN', 'PREMIUM']),
    cartController.createCart
);

// ==== ROTA PARA ADICIONAR UM PRODUTO AO CARRINHO ====
// Apenas USER ou PREMIUM podem adicionar produtos
router.post('/:cid/product/:pid',
    passportCall('jwt'),
    handlePolicies(['USER', 'PREMIUM']),
    cartController.addProductToCart
);

export default router; // Exporta as rotas de carrinho


























// // routes/carts.routes.js
// import { Router } from 'express';
// import passport from 'passport';
// import {
//   createCart,
//   getAllCarts,
//   getCartById,
//   addProductToCart,
//   updateProductQuantity,
//   removeProductFromCart,
//   clearCart,
//   deleteCart
// } from '../controllers/cart.controller.js';

// import handlePolicies from '../middlewares/handlePolicies.js';

// const router = Router();

// /**************************************/
// /*           ROTAS DE CARRINHO        */
// /**************************************/

// // 🔍 Buscar todos os carrinhos - ADMIN apenas
// router.get(
//   '/',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN']),
//   getAllCarts
// );

// // 🔍 Buscar carrinho por ID - logado (ADMIN, USER, PREMIUM)
// router.get(
//   '/:cid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN', 'USER', 'PREMIUM']),
//   getCartById
// );

// // ➕ Criar novo carrinho
// router.post(
//   '/',
//   passport.authenticate('jwt', { session: false }),
//   (req, res, next) => {
//     console.log('\n[ROUTE DEBUG] POST /api/carts acionada');
//     console.log('[ROUTE DEBUG] req.user recebido do Passport:', req.user);
//     console.log('[ROUTE DEBUG] Cookies recebidos:', req.cookies);
//     next();
//   },
//   handlePolicies(['USER', 'PREMIUM']),
//   createCart
// );

// // 🛒 Adicionar produto ao carrinho
// router.post(
//   '/:cid/products/:pid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['USER', 'PREMIUM']),
//   addProductToCart
// );

// // ✏️ Atualizar quantidade de produto
// router.put(
//   '/:cid/products/:pid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['USER', 'PREMIUM']),
//   updateProductQuantity
// );

// // ❌ Remover produto do carrinho
// router.delete(
//   '/:cid/products/:pid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['USER', 'PREMIUM']),
//   removeProductFromCart
// );

// // 🧹 Limpar carrinho inteiro
// router.delete(
//   '/:cid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['USER', 'PREMIUM']),
//   clearCart
// );

// // 🗑️ Deletar carrinho (ADMIN)
// router.delete(
//   '/admin/:cid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN']),
//   deleteCart
// );

// export default router;
