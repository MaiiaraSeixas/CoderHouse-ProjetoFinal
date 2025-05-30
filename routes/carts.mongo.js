// routes/cart.routes.js

import { Router } from 'express';
import passport from 'passport';
import CartModel from '../models/cart.model.js';
import handlePolicies from '../middlewares/handlePolicies.js';
import {
  getCartById,
  createCart,
  addProductToCart,
  clearCart,
  removeProductFromCart
} from '../controllers/cart.controller.js';

const router = Router();

/**************************************/
/*       ROTA PARA CARRINHO DO USUÁRIO       */
/**************************************/
// Retorna o carrinho do usuário autenticado (baseado no cartId do JWT)
router.get(
  '/my-cart',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const cartId = req.user.cartId;
      const cart = await CartModel.findById(cartId)
        .populate('products.product')
        .lean();

      if (!cart) {
        return res.sendError('Carrinho não encontrado', 404);
      }

      res.sendSuccess('Carrinho carregado com sucesso', cart);
    } catch (err) {
      console.error('Erro ao buscar carrinho:', err);
      res.sendError('Erro interno ao buscar carrinho');
    }
  }
);

/**************************************/
/*       TODAS AS ROTAS PROTEGIDAS     */
/*   Requerem autenticação de usuário  */
/**************************************/

// Rota GET para obter um carrinho específico por ID
router.get(
  '/:cid', // :cid = ID do carrinho
  handlePolicies(['USER', 'PREMIUM']),
  getCartById
);

// Rota POST para criar novo carrinho
router.post(
  '/',
  handlePolicies(['USER', 'PREMIUM']),
  createCart
);

// Rota POST para adicionar produto ao carrinho
router.post(
  '/:cid/products/:pid',
  handlePolicies(['USER', 'PREMIUM']),
  addProductToCart
);

// Rota DELETE para remover carrinho completamente
router.delete(
  '/:cid',
  handlePolicies(['USER', 'PREMIUM']),
  clearCart
);

// Rota DELETE para remover item específico do carrinho
router.delete(
  '/:cid/product/:pid',
  handlePolicies(['USER', 'PREMIUM']),
  removeProductFromCart
);

export default router;
