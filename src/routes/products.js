// Arquivo 1: src/routes/products.js (VERSÃO FINAL CORRETA)

import { Router } from 'express';
import passport from 'passport';
import handlePolicies from '../middlewares/handlePolicies.js';
import { productsController } from '../controllers/products.controller.js';

const router = Router();

// 📦 Lista todos os produtos - acesso público
router.get('/', handlePolicies(['PUBLIC']), productsController.getProducts);

// 🔍 Detalhes de um produto - acesso público
router.get('/:pid', handlePolicies(['PUBLIC']), productsController.getProductById);

// ➕ Criar produto - acesso exclusivo para ADMIN
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    productsController.createProduct
);

// ✏️ Atualizar produto - acesso exclusivo para ADMIN
router.put(
    '/:pid',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    productsController.updateProduct
);

// ❌ Deletar produto - acesso exclusivo para ADMIN
router.delete(
    '/:pid',
    passport.authenticate('jwt', { session: false }),
    handlePolicies(['ADMIN']),
    productsController.deleteProduct
);

export default router;




















// // routes/products.js
// // Rotas para manipulação de produtos

// import { Router } from 'express';
// import passport from 'passport';
// import {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct
// } from '../controllers/products.controller.js'; // ✅ Caminho corrigido
// import handlePolicies from '../middlewares/handlePolicies.js'; // ✅ Caminho também ajustado se estiver em mesma estrutura

// const router = Router();

// // 📦 Lista todos os produtos - acesso público
// router.get('/', handlePolicies(['PUBLIC']), getAllProducts);

// // 🔍 Detalhes de um produto - acesso público
// router.get('/:pid', handlePolicies(['PUBLIC']), getProductById);

// // ➕ Criar produto - acesso exclusivo para ADMIN
// router.post(
//   '/',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN']),
//   createProduct
// );

// // ✏️ Atualizar produto - acesso exclusivo para ADMIN
// router.put(
//   '/:pid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN']),
//   updateProduct
// );

// // ❌ Deletar produto - acesso exclusivo para ADMIN
// router.delete(
//   '/:pid',
//   passport.authenticate('jwt', { session: false }),
//   handlePolicies(['ADMIN']),
//   deleteProduct
// );

// export default router;
