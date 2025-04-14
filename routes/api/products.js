import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFile = path.join(__dirname, '../../data/productos.json');


// Helpers
const readProducts = async () => {
  try {
    const data = await fs.readFile(productsFile, 'utf-8');
    const parsed = JSON.parse(data);
    console.log(' Produtos carregados:', parsed);
    return parsed;
  } catch (err) {
    console.error(' Erro ao ler o JSON:', err.message);
    return [];
  }
};

const writeProducts = async (products) => {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

// GET /api/products
router.get('/', async (req, res) => {
  console.log(' Entrou na rota GET /api/products');
  try {
    const products = await readProducts();

    // Captura e valida o parâmetro ?limit=N
    const limit = parseInt(req.query.limit);
    if (!isNaN(limit) && limit > 0) {
      console.log(` Retornando apenas os primeiros ${limit} produtos`);
      return res.json(products.slice(0, limit));
    }

    // Se não houver limit, ou for inválido, retorna todos
    return res.json(products);
  } catch (err) {
    console.error('Erro ao ler produtos:', err.message);
    return res.status(500).json({ error: 'Erro ao carregar os produtos' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      console.warn('Requisição inválida. Campos obrigatórios faltando.');
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const products = await readProducts();

    const newProduct = {
      id: uuidv4(),
      title,
      description,
      code,
      price,
      stock,
      category
    };

    products.push(newProduct);
    await writeProducts(products);

    console.log('Produto criado com sucesso:', newProduct);
    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Erro interno ao criar produto:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === req.params.pid);

    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualiza os campos com o que vier no body
    products[index] = { ...products[index], ...req.body };

    await writeProducts(products);

    console.log(`Produto ${req.params.pid} atualizado`);
    return res.json(products[index]);
  } catch (err) {
    console.error('Erro interno ao atualizar produto:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  let products = await readProducts();
  const index = products.findIndex(p => p.id === req.params.pid);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
  const deleted = products.splice(index, 1);
  await writeProducts(products);
  return res.json({ status: 'deletado', product: deleted });
});


export default router;