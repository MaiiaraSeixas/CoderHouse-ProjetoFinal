import express from 'express'; // Importa o Express.
import { ProductManagerMongo } from '../../dao/mongoManagers/ProductManagerMongo.js'; // Importa o gerenciador de produtos do MongoDB.

const router = express.Router(); // Cria um roteador do Express.
const manager = new ProductManagerMongo(); // Cria uma instância do gerenciador de produtos.

// GET /api/products - com paginação MongoDB
router.get('/', async (req, res) => { // Rota para obter produtos com paginação, ordenação e filtro.
  try {
    const { page = 1, limit = 10, sort, query } = req.query; // Obtém os parâmetros da consulta.

    const options = { // Define as opções de paginação.
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {} // Define a ordenação por preço, se especificado.
    };

    const filter = query ? { category: { $regex: query, $options: 'i' } } : {}; // Define o filtro por categoria, se especificado.

    const result = await manager.paginateProducts(filter, options); // Chama a função para obter produtos paginados.
    res.json(result); // Responde com os resultados da paginação.
  } catch (err) {
    console.error('🔥 Erro detalhado ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' }); // Responde com erro 500 em caso de falha.
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => { // Rota para obter um produto pelo ID.
  try {
    const product = await manager.getById(req.params.pid); // Busca o produto pelo ID.
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json(product); // Responde com o produto encontrado.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto' }); // Responde com erro 500 em caso de falha.
  }
});

// POST /api/products
router.post('/', async (req, res) => { // Rota para criar um novo produto.
  try {
    const { title, description, code, price, stock, category, thumbnails = [], status = true } = req.body; // Obtém os dados do produto.

    if (!title || !description || !code || price == null || stock == null || !category) { // Valida os campos obrigatórios.
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const newProduct = { // Cria o objeto do novo produto.
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
      status,
    };

    const createdProduct = await manager.createProduct(newProduct); // Chama a função para criar o produto.
    res.status(201).json(createdProduct); // Responde com o produto criado e status 201.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' }); // Responde com erro 500 em caso de falha.
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => { // Rota para atualizar um produto pelo ID.
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body); // Chama a função para atualizar o produto.
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json(updated); // Responde com o produto atualizado.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto' }); // Responde com erro 500 em caso de falha.
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => { // Rota para deletar um produto pelo ID.
  try {
    const deleted = await manager.deleteProduct(req.params.pid); // Chama a função para deletar o produto.
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json({ message: 'Produto deletado com sucesso' }); // Responde com mensagem de sucesso.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto' }); // Responde com erro 500 em caso de falha.
  }
});

export default router; // Exporta o roteador configurado.