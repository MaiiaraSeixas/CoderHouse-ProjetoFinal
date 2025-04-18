import express from 'express';
import { ProductManagerMongo } from '../../dao/mongoManagers/ProductManagerMongo.js';

const router = express.Router();
const manager = new ProductManagerMongo();

// GET /api/products - com paginação MongoDB
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, query } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
    };

    const filter = query ? { category: { $regex: query, $options: 'i' } } : {};

    const result = await manager.paginateProducts(filter, options);
    res.json(result);
  } catch (err) {
    console.error('🔥 Erro detalhado ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  try {
    const product = await manager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails = [], status = true } = req.body;

    if (!title || !description || !code || price == null || stock == null || !category) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const newProduct = {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
      status,
    };

    const createdProduct = await manager.createProduct(newProduct);
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const updated = await manager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
