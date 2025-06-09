// routes/carts.mongo.js

import { Router } from 'express';
import passport from 'passport';
import CartModel from '../models/cart.model.js';
import handlePolicies from '../middlewares/handlePolicies.js';
// 1. Importa o objeto 'cartController'
import { cartController } from '../controllers/cart.controller.js';

const router = Router();

/**************************************/
/* ROTA PARA CARRINHO DO USUÁRIO       */
/**************************************/
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
/* TODAS AS ROTAS PROTEGIDAS     */
/**************************************/

// 2. Chama as funções como métodos do objeto 'cartController'
router.get(
  '/:cid',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.getCart // Ajustado para o método correto no controller
);

router.post(
  '/',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.createCart
);

router.post(
  '/:cid/products/:pid',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.addProductToCart
);

router.delete(
  '/:cid',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.clearCart
);

router.delete(
  '/:cid/product/:pid',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.removeProductFromCart
);

export default router;