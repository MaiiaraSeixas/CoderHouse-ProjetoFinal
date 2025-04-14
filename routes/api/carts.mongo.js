import express from 'express';
import { CartManagerMongo } from '../../dao/mongoManagers/CartManagerMongo.js';

const router = express.Router();
const manager = new CartManagerMongo();

// POST /api/carts → cria um novo carrinho
router.post('/', async (req, res) => {
  try {
    const newCart = await manager.createCart();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar carrinho' });
  }
});

// GET /api/carts/:cid → lista produtos do carrinho
router.get('/:cid', async (req, res) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
});

// POST /api/carts/:cid/product/:pid → adiciona produto ao carrinho
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await manager.addProductToCart(req.params.cid, req.params.pid);
    if (!cart) return res.status(404).json({ error: 'Carrinho ou produto não encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' });
  }
});

export default router;
