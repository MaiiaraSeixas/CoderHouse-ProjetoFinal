// Arquivo Corrigido: src/routes/products.view.js
// Esta rota agora usa o 'productService' e mantém a sua lógica de paginação e detalhes.

import { Router } from 'express';
// CORREÇÃO: Usamos o productService, que é a camada de serviço correta e unificada.
import  productService  from '../services/products.service.js';

const router = Router();

// Rota para renderizar a lista de produtos com paginação
router.get('/', async (req, res) => {
    try {
        // Passamos os parâmetros da query (limit, page, etc.) diretamente para o serviço.
        // O serviço e o repositório já sabem como lidar com eles.
        const result = await productService.getProducts(req.query);

        // Prepara os dados do utilizador para a view
        const cartId = req.user?.cartId || null;
        const user = req.user ? {
            first_name: req.user.first_name,
            role: req.user.role,
            cartId: cartId
        } : null;

        // Prepara os links de paginação com todos os parâmetros
        const { limit, sort, query } = req.query;
        const prevLink = result.hasPrevPage
            ? `/products?page=${result.prevPage}&limit=${limit || 5}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
            : null;
        const nextLink = result.hasNextPage
            ? `/products?page=${result.nextPage}&limit=${limit || 5}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
            : null;

        // Prepara o objeto completo de dados para renderização no Handlebars
        const viewData = {
            title: 'Lista de Produtos',
            user: user,
            products: result.docs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
            totalPages: result.totalPages,
            currentPage: result.page,
            limit: limit || 5,
            cartId: cartId
        };

        res.render('pages/products', viewData);

    } catch (error) {
        console.error("Erro ao obter produtos para a view:", error);
        res.status(500).render('pages/error', { message: 'Erro ao carregar os produtos.' });
    }
});

// Rota para a view de detalhes do produto
router.get('/:pid/view', async (req, res) => {
    try {
        // CORREÇÃO: Usamos o productService para buscar o produto
        const product = await productService.getProductById(req.params.pid);
        
        if (!product) {
            // Retorna uma página de erro 404 se o produto não for encontrado
            return res.status(404).render('pages/error', { message: 'Produto não encontrado' });
        }

        // Passa o cartId para a view de detalhes também
        const cartId = req.user?.cartId || null;

        res.render('pages/productDetails', { 
            product,
            cartId
        });
    } catch (error) {
        console.error('[ERROR] Erro ao carregar detalhes:', error);
        res.status(500).render('pages/error', { message: 'Erro ao carregar os detalhes do produto' });
    }
});

export default router;


























// import { Router } from 'express';
// import { productService } from '../services/products.service.js';

// const router = Router();
// const manager = new ProductManager();

// router.get('/', async (req, res) => {
//   const limit = parseInt(req.query.limit) || 5;
//   const page = parseInt(req.query.page) || 1;
//   const sort = req.query.sort;
//   const query = req.query.query;

//   const options = {
//     limit: parseInt(limit),
//     page: parseInt(page),
//     sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
//     lean: true
//   };

//   const filter = query ? { category: { $regex: query, $options: 'i' } } : {};

//   // --- CORREÇÃO PRINCIPAL AQUI ---
//   // Obtém o cartId diretamente do objeto req.user, que é populado pelo Passport.
//   const cartId = req.user?.cartId || null;
//   const user = req.user ? {
//     first_name: req.user.first_name,
//     role: req.user.role,
//     cartId: cartId // Garante que o cartId também está no objeto user que o template recebe
//   } : null;

//   try {
//     const result = await manager.paginateProducts(filter, options);

//     res.render('pages/products', {
//       title: 'Lista de Produtos',
//       user: user, // Passa o objeto user formatado
//       products: result.docs,
//       hasPrevPage: result.hasPrevPage,
//       hasNextPage: result.hasNextPage,
//       prevLink: result.hasPrevPage
//         ? `/products?page=${result.prevPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
//         : null,
//       nextLink: result.hasNextPage
//         ? `/products?page=${result.nextPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
//         : null,
//       totalPages: result.totalPages,
//       currentPage: result.page,
//       limit,
//       cartId // Passa o cartId diretamente para o template
//     });
//   } catch (err) {
//     console.error('[ERROR] Erro ao carregar produtos:', err);
//     res.status(500).send('Erro ao carregar produtos');
//   }
// });

// router.get('/:pid/view', async (req, res) => {
//   try {
//     const product = await manager.getProductById(req.params.pid);
//     if (!product) {
//       return res.status(404).send('Produto não encontrado');
//     }

//     // Passa o cartId para a view de detalhes também
//     const cartId = req.user?.cartId || null;

//     res.render('pages/productDetails', { 
//       product,
//       cartId
//     });
//   } catch (error) {
//     console.error('[ERROR] Erro ao carregar detalhes:', error);
//     res.status(500).send('Erro ao carregar os detalhes do produto');
//   }
// });

// export default router;




// routes/views/productsView.js (exemplo de nome de arquivo, ajuste conforme necessário)
// import { Router } from 'express';
// import ProductManager from '../dao/fsManagers/product.dao.js'; // ✅ CORRETO
// // import { use } from 'passport';

// const router = Router();
// const manager = new ProductManager();

// // Rota para listar produtos com paginação, ordenação e filtro
// router.get('/', async (req, res) => {
//   const limit = parseInt(req.query.limit) || 5;
//   const page = parseInt(req.query.page) || 1;
//   const sort = req.query.sort;
//   const query = req.query.query;

//   const options = {
//     limit: parseInt(limit),
//     page: parseInt(page),
//     sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
//     lean: true // ✅ Adicionando 'lean' para otimizar a consulta
//   };

//   const filter = query ? { category: { $regex: query, $options: 'i' } } : {};

//   const cartId = req.session.cartId; // ✅ cartId da sessão


//   try {
//     const result = await manager.paginateProducts(filter, options);

//     res.render('pages/products', {
//       title: 'Lista de Produtos',
//       user: req.user || null, // ✅ Enviando usuário autenticado
//       products: result.docs,
//       hasPrevPage: result.hasPrevPage,
//       hasNextPage: result.hasNextPage,
//       prevLink: result.hasPrevPage
//         ? `/products?page=${result.prevPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
//         : null,
//       nextLink: result.hasNextPage
//         ? `/products?page=${result.nextPage}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
//         : null,
//       totalPages: result.totalPages,
//       currentPage: result.page,
//       limit,
//       cartId // ✅ Enviando cartId para a view
//     });
//   } catch (err) {
//     console.error('[ERROR] Erro ao carregar produtos:', err);
//     res.status(500).send('Erro ao carregar produtos');
//   }
// });

// // ✅ Nova rota para exibir os detalhes de um produto em uma view
// router.get('/:pid/view', async (req, res) => {
//   try {


//     const product = await manager.getProductById(req.params.pid);
//     if (!product) {
//       console.warn('[WARN] Produto não encontrado:', req.params.pid);
//       return res.status(404).send('Produto não encontrado');
//     }

//     const cartId = req.session.cartId;


//     res.render('pages/productDetails', { // 👈 ajuste aqui
//       product,
//       cartId
//     });
//   } catch (error) {
//     console.error('[ERROR] Erro ao carregar detalhes:', error);
//     res.status(500).send('Erro ao carregar os detalhes do produto');
//   }
// });


// export default router;
