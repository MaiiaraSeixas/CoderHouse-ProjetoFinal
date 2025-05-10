// ====== carts.mongo.js (Corrigido) ======
import express from 'express'; // Importa o framework Express para criar rotas.
import mongoose from 'mongoose'; // Importa a biblioteca Mongoose para interagir com MongoDB.
import { CartManagerMongo } from '../../dao/mongoManagers/CartManagerMongo.js'; // Importa a classe para gerenciar operações de carrinho no MongoDB.
import CartModel from '../../dao/models/cart.model.js'; // Importa o modelo de dados do carrinho.

const router = express.Router(); // Cria uma instância do roteador do Express.
const manager = new CartManagerMongo(); // Cria uma instância do gerenciador de carrinhos.

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id); // Função para validar se um ID é um ObjectId do MongoDB.

// POST /api/carts → cria novo carrinho
router.post('/', async (req, res) => {
  try {
    const newCart = await manager.createCart(); // Chama a função para criar um novo carrinho.
    res.status(201).json(newCart); // Responde com o carrinho criado e status 201 (Criado).
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar carrinho' }); // Responde com erro 500 em caso de falha.
  }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  const { cid } = req.params; // Obtém o ID do carrinho dos parâmetros da rota.
  if (!isValidId(cid)) return res.status(400).json({ error: 'ID de carrinho inválido' }); // Valida o ID.
  try {
    const cart = await manager.getCartById(cid); // Busca o carrinho pelo ID.
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json(cart); // Responde com o carrinho encontrado.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar carrinho' }); // Responde com erro 500 em caso de falha.
  }
});

// Corrigido: POST /api/carts/:cid/products/:pid
router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params; // Obtém IDs do carrinho e do produto.
  const quantity = parseInt(req.body.quantity) || 1; // Obtém a quantidade do corpo da requisição, padrão para 1.

  if (!isValidId(cid) || !isValidId(pid)) { // Valida os IDs.
    return res.status(400).json({ error: 'ID inválido' }); // Responde com erro 400 se inválidos.
  }

  try {
    const result = await manager.addProductToCart(cid, pid, quantity); // Adiciona o produto ao carrinho.
    if (result.error) return res.status(400).json({ error: result.error }); // Responde com erro 400 se houver um erro na operação.
    res.status(200).json(result); // Responde com sucesso e o resultado.
  } catch (err) {
    console.error('Erro ao adicionar produto ao carrinho:', err);
    res.status(500).json({ error: 'Erro ao adicionar produto ao carrinho' }); // Responde com erro 500 em caso de falha.
  }
});

// DELETE /api/carts/:cid
router.delete('/:cid', async (req, res) => {
  const { cid } = req.params; // Obtém o ID do carrinho.
  if (!isValidId(cid)) return res.status(400).json({ error: 'ID inválido' }); // Valida o ID.
  try {
    const cart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true }); // Remove todos os produtos do carrinho.
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json({ message: 'Todos os produtos foram removidos do carrinho', cart }); // Responde com sucesso.
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover produtos do carrinho' }); // Responde com erro 500 em caso de falha.
  }
});

// PUT /api/carts/:cid
router.put('/:cid', async (req, res) => {
  const { cid } = req.params; // Obtém o ID do carrinho.
  const { products } = req.body; // Obtém a lista de produtos do corpo da requisição.
  if (!isValidId(cid)) return res.status(400).json({ error: 'ID inválido' }); // Valida o ID.

  if (!Array.isArray(products)) { // Valida se o corpo é um array.
    return res.status(400).json({ error: 'O corpo da requisição deve ser um array de produtos' });
  }

  try {
    const cart = await CartModel.findByIdAndUpdate(cid, { products }, { new: true }); // Atualiza os produtos do carrinho.
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' }); // Responde com erro 404 se não encontrar.
    res.json({ message: 'Carrinho atualizado com sucesso', cart }); // Responde com sucesso.
  } catch (error) {
    console.error('Erro ao atualizar o carrinho:', error);
    res.status(500).json({ error: 'Erro ao atualizar o carrinho' }); // Responde com erro 500 em caso de falha.
  }
});

// PUT /api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params; // Obtém IDs do carrinho e do produto.
  const { quantity } = req.body; // Obtém a nova quantidade do produto.

  if (!isValidId(cid) || !isValidId(pid)) { // Valida os IDs.
    return res.status(400).json({ error: 'ID inválido' });
  }

  if (typeof quantity !== 'number' || quantity < 1) { // Valida a quantidade.
    return res.status(400).json({ error: 'A quantidade deve ser um número maior que zero' });
  }

  try {
    const cart = await CartModel.findById(cid); // Busca o carrinho.
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });

    const index = cart.products.findIndex(p => p.product.toString() === pid); // Encontra o índice do produto no carrinho.
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado no carrinho' });

    cart.products[index].quantity = quantity; // Atualiza a quantidade.
    await cart.save(); // Salva as alterações no carrinho.
    res.json({ message: 'Quantidade atualizada', cart }); // Responde com sucesso.
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' }); // Responde com erro 500 em caso de falha.
  }
});

// DELETE /api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params; // Obtém IDs do carrinho e do produto.
  if (!isValidId(cid) || !isValidId(pid)) return res.status(400).json({ error: 'ID inválido' }); // Valida os IDs.

  try {
    const cart = await CartModel.findById(cid); // Busca o carrinho.
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });

    const index = cart.products.findIndex(p => p.product.toString() === pid); // Encontra o índice do produto.
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado no carrinho' });

    cart.products.splice(index, 1); // Remove o produto do array.
    await cart.save(); // Salva as alterações.
    res.json({ message: 'Produto removido', cart }); // Responde com sucesso.
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({ error: 'Erro ao remover produto' }); // Responde com erro 500 em caso de falha.
  }
});

export default router; // Exporta o roteador configurado.