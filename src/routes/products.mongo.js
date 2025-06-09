import { Router } from 'express';
import passport from 'passport'; // 1. ADICIONE A IMPORTAÇÃO
import handlePolicies  from '../middlewares/handlePolicies.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller.js';

const router = Router();

// Rotas públicas (não precisam de alteração)
router.get('/', handlePolicies(['PUBLIC']), getAllProducts);
router.get('/:pid', handlePolicies(['PUBLIC']), getProductById);

// Rotas protegidas
router.post('/',
  passport.authenticate('jwt', { session: false }), // 2. ADICIONE O MIDDLEWARE
  handlePolicies(['ADMIN', 'PREMIUM']),
  createProduct
);

router.put('/:pid',
  passport.authenticate('jwt', { session: false }), // 2. ADICIONE O MIDDLEWARE
  handlePolicies(['ADMIN', 'PREMIUM']),
  updateProduct
);

router.delete('/:pid',
  passport.authenticate('jwt', { session: false }), // 2. ADICIONE O MIDDLEWARE
  handlePolicies(['ADMIN', 'PREMIUM']),
  deleteProduct
);

export default router;