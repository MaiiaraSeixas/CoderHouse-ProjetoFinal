// // routes/productsView.js

// import { Router } from 'express';
// import ProductModel from '../models/product.model.js'; // Importando o modelo de Produto

// const router = Router();

// // Rota para exibir todos os produtos - com paginação e renderização
// router.get('/', async (req, res) => {
//   const { limit = 10, page = 1 } = req.query;
//   const numLimit = parseInt(limit);
//   const numPage = parseInt(page);

//   if (isNaN(numLimit) || numLimit <= 0 || isNaN(numPage) || numPage <= 0) {
//     return res.status(400).send('Parâmetros inválidos.');
//   }

//   const result = await ProductModel.paginate({}, {
//     page: numPage,
//     limit: numLimit,
//     lean: true
//   });

//   res.render('pages/products', {
//     products: result.docs,
//     // user: req.session.user,
//     user: req.session.user || null, // Verifica se o usuário está logado
//     cartId: req.session.cartId || null, // Verifica se o carrinho está disponível
//     // cartId: req.user?.cartId?.toString() || null, // <-- RESOLVIDO AQUI
//     totalPages: result.totalPages,
//     currentPage: result.page,
//     hasPrevPage: result.hasPrevPage,
//     hasNextPage: result.hasNextPage,
//     prevPage: result.prevPage,
//     nextPage: result.nextPage,
//     limit: numLimit
//   });
// });

// // Rota para exibir detalhes de um produto específico
// router.get('/:pid', async (req, res) => {
//   const product = await ProductModel.findById(req.params.pid).lean();
//   if (!product) return res.status(404).send('Produto não encontrado');
  
//   res.render('pages/productDetails', {
//     product,
//     cartId: req.session.cartId || null,
//     user: req.session.user
//   });
// });

// export default router;
