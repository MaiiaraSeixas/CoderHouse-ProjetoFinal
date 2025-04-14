import express from 'express';
import { ProductManagerMongo } from '../../dao/mongoManagers/ProductManagerMongo.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const manager = new ProductManagerMongo();

// Config para manter o FileSystem funcionando
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFile = path.join(__dirname, '../../data/productos.json');

// --- FileSystem Helpers (não excluir) ---
const readProductsFS = async () => {
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeProductsFS = async (products) => {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

// --- Mongo + FS em paralelo ---

// GET /api/products?limit=N
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const products = await manager.getAll(limit);
    res.json(products);
  } catch (err) {
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
