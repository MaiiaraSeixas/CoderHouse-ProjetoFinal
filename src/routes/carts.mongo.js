// routes/carts.mongo.js

import { Router } from 'express';
import passport from 'passport';
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
  (req, res, next) => {
    req.params.cid = req.user.cartId;
    next();
  },
  cartController.getCartById
);

/**************************************/
/* TODAS AS ROTAS PROTEGIDAS     */
/**************************************/

// 2. Chama as funções como métodos do objeto 'cartController'
router.get(
  '/:cid',
  handlePolicies(['USER', 'PREMIUM']),
  cartController.getCartById // Ajustado para o método correto no controller
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
