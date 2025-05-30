// controllers/cart.controller.js
import CartService from '../services/cart.service.js';

// Controlador para criar um novo carrinho
export const createCart = async (req, res) => {
  try {

    // Chama o serviço para criar um carrinho vazio
    const cart = await CartService.createCart();
    
    // Retorna resposta 201 (Created) com o carrinho criado
    res.sendCreated(cart);
  } catch (error) {
    console.error('[CREATE CART ERROR]', error);
    // Em caso de erro, retorna resposta de erro genérico
    res.sendError('Erro ao criar o carrinho', 500);
  }
};

// Controlador para obter um carrinho específico pelo ID
export const getCartById = async (req, res) => {
  try {
    // Extrai o ID do carrinho dos parâmetros da URL
    const { cid } = req.params;

    
    // Busca o carrinho usando o serviço
    const cart = await CartService.getCartById(cid);

    
    // Verifica se o carrinho foi encontrado

// Retorna o carrinho encontrado

if (!cart) {
  console.log('[DEBUG] Carrinho não encontrado no Mongo');
  return res.sendError('Carrinho não encontrado', 404);
}

console.log('[DEBUG] Carrinho encontrado:', cart);
res.status(200).json({ status: 'success', payload: cart }); // <- Esse comando precisa estar executando

  } catch (error) {
    // Trata erros na busca
    res.sendError('Erro ao buscar carrinho', 500);
  }
};

// Controlador para obter todos os carrinhos (acesso administrativo)
export const getAllCarts = async (req, res) => {
  try {
    // Busca todos os carrinhos existentes
    const carts = await CartService.getAllCarts();
    
    // Retorna a lista de carrinhos
    res.sendSuccessWithPayload(carts);
  } catch (error) {
    // Loga o erro e retorna resposta de erro
    req.logger?.error(error);
    res.sendError('Erro ao buscar todos os carrinhos', 500);
  }
};

// Controlador para adicionar um produto ao carrinho
export const addProductToCart = async (req, res) => {
  try {
    // Extrai IDs do carrinho e produto dos parâmetros
    const { cid, pid } = req.params;
    const { quantity } = req.body; // <- importante para capturar corretamente
    // Chama o serviço para adicionar o produto
    // const result = await CartService.addProductToCart(cid, pid);
    

    const result = await CartService.addProductToCart(cid, pid, Number(quantity || 1));
    // Retorna o carrinho atualizado
    res.sendSuccessWithPayload(result);
  } catch (error) {
    // Retorna erro específico ou genérico
    res.sendError(error.message || 'Erro ao adicionar produto ao carrinho', 400);
  }
};

// Controlador para atualizar a quantidade de um produto no carrinho
export const updateProductQuantity = async (req, res) => {
  try {
    // Extrai IDs e quantidade do corpo da requisição
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    // Atualiza a quantidade no serviço
    const updated = await CartService.updateQuantity(cid, pid, quantity);
    
    // Retorna o carrinho atualizado
    res.sendSuccessWithPayload(updated);
  } catch (error) {
    // Trata erros na atualização
    res.sendError('Erro ao atualizar quantidade', 500);
  }
};

// Controlador para remover um produto do carrinho
export const removeProductFromCart = async (req, res) => {
  try {
    // Extrai IDs do carrinho e produto
    const { cid, pid } = req.params;
    
    // Remove o produto usando o serviço
    const result = await CartService.removeProductFromCart(cid, pid);
    
    // Retorna o carrinho atualizado
    res.sendSuccessWithPayload(result);
  } catch (error) {
    // Trata erros na remoção
    res.sendError('Erro ao remover produto do carrinho', 500);
  }
};

// Controlador para esvaziar o carrinho
export const clearCart = async (req, res) => {
  try {
    // Extrai ID do carrinho
    const { cid } = req.params;
    
    // Chama serviço para limpar todos os produtos
    await CartService.clearCart(cid);
    
    // Retorna mensagem de sucesso
    res.sendSuccess('Carrinho esvaziado com sucesso');
  } catch (error) {
    // Trata erros na limpeza
    res.sendError('Erro ao limpar carrinho', 500);
  }
};

// Controlador para excluir permanentemente um carrinho
export const deleteCart = async (req, res) => {
  try {
    // Extrai ID do carrinho
    const { cid } = req.params;
    
    // Deleta o carrinho usando o serviço
    await CartService.deleteCart(cid);
    
    // Retorna mensagem de confirmação
    res.sendSuccess('Carrinho deletado com sucesso');
  } catch (error) {
    // Trata erros na exclusão
    res.sendError('Erro ao deletar carrinho', 500);
  }
};