import express from 'express';
import { CartManagerMongo } from '../../dao/mongoManagers/CartManagerMongo.js';
import CartModel from '../../dao/models/cart.model.js';

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

// POST /api/carts/:cid/product/:pid → adiciona produto ao carrinho (com quantity opcional)
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;

    try {
        const result = await manager.addProductToCart(cid, pid, quantity);

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Erro ao adicionar produto ao carrinho:', err);
        res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' });
    }
});


// DELETE /api/carts/:cid → remove todos os produtos do carrinho
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });
        res.json({ message: 'Todos os produtos foram removidos do carrinho', cart });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao remover produtos do carrinho' });
    }
});

// PUT /api/carts/:cid → atualiza o carrinho com uma matriz de produtos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'O corpo da requisição deve ser um array de produtos' });
    }

    try {
        const cart = await CartModel.findByIdAndUpdate(
            cid,
            { products: products },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        res.json({ message: 'Carrinho atualizado com sucesso', cart });
    } catch (error) {
        console.error('Erro ao atualizar o carrinho:', error);
        res.status(500).json({ error: 'Erro ao atualizar o carrinho' });
    }
});

// PUT /api/carts/:cid/products/:pid → atualiza a quantidade de um produto no carrinho
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'A quantidade deve ser um número maior que zero' });
    }

    try {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado no carrinho' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.json({ message: 'Quantidade do produto atualizada', cart });
    } catch (error) {
        console.error('Erro ao atualizar a quantidade do produto no carrinho:', error);
        res.status(500).json({ error: 'Erro ao atualizar a quantidade do produto no carrinho' });
    }
});
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado no carrinho' });
        }

        cart.products.splice(productIndex, 1); // Remove o produto do array
        await cart.save();

        res.json({ message: 'Produto removido do carrinho', cart });
    } catch (error) {
        console.error('Erro ao remover produto do carrinho:', error);
        res.status(500).json({ error: 'Erro ao remover produto do carrinho' });
    }
});

export default router;