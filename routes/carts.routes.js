// routes/carts.routes.js
import express from 'express';
import { Router } from 'express';
import passport from 'passport';
import {
  createCart,
  getAllCarts,
  getCartById,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCart,
  deleteCart
} from '../controllers/cart.controller.js';

import handlePolicies from '../middlewares/handlePolicies.js';

const router = Router();

/**************************************/
/*           ROTAS DE CARRINHO        */
/**************************************/

// 🔍 Buscar todos os carrinhos - ADMIN apenas
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['ADMIN']),
  getAllCarts
);

// 🔍 Buscar carrinho por ID - logado (ADMIN, USER, PREMIUM)
router.get(
  '/:cid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['ADMIN', 'USER', 'PREMIUM']),
  getCartById
);

// ➕ Criar novo carrinho
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    console.log('\n[ROUTE DEBUG] POST /api/carts acionada');
    console.log('[ROUTE DEBUG] req.user recebido do Passport:', req.user);
    console.log('[ROUTE DEBUG] Cookies recebidos:', req.cookies);
    next();
  },
  handlePolicies(['USER', 'PREMIUM']),
  createCart
);

// 🛒 Adicionar produto ao carrinho
router.post(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['USER', 'PREMIUM']),
  addProductToCart
);

// ✏️ Atualizar quantidade de produto
router.put(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['USER', 'PREMIUM']),
  updateProductQuantity
);

// ❌ Remover produto do carrinho
router.delete(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['USER', 'PREMIUM']),
  removeProductFromCart
);

// 🧹 Limpar carrinho inteiro
router.delete(
  '/:cid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['USER', 'PREMIUM']),
  clearCart
);

// 🗑️ Deletar carrinho (ADMIN)
router.delete(
  '/admin/:cid',
  passport.authenticate('jwt', { session: false }),
  handlePolicies(['ADMIN']),
  deleteCart
);

export default router;
