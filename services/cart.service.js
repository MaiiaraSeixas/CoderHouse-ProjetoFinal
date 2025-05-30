// services/cart.service.js
import CartModel from '../models/cart.model.js';

class CartService {
  // Obtém todos os carrinhos do sistema com produtos populados
  async getAllCarts() {
    // Busca todos os carrinhos e popula os detalhes dos produtos
    // .populate('products.product') substitui IDs por objetos de produto completos
    // .lean() retorna objetos JavaScript simples para melhor performance
    return await CartModel.find().populate('products.product').lean();
  }

  // Obtém um carrinho específico pelo ID com produtos populados
  async getCartById(cid) {
    // Busca carrinho pelo ID e popula os produtos associados
    return await CartModel.findById(cid).populate('products.product').lean();
  }

  // Cria um novo carrinho
  async createCart(cartData = {}) {
    // Cria carrinho com dados fornecidos ou vazio se nenhum dado for passado
    return await CartModel.create(cartData);
  }

  // Atualiza todo o carrinho (substituição completa)
  async updateCart(cid, update) {
    // Atualiza o carrinho com novos dados
    // { new: true } retorna o documento atualizado em vez do original
    return await CartModel.findByIdAndUpdate(cid, update, { new: true });
  }

  // Exclui permanentemente um carrinho
  async deleteCart(cid) {
    // Remove o carrinho do banco de dados
    return await CartModel.findByIdAndDelete(cid);
  }

  // Adiciona um produto ao carrinho ou incrementa a quantidade
  async addProductToCart(cid, pid, quantity = 1) {
    quantity = Number(quantity); // Garante que a quantidade seja um número
    // Busca o carrinho (documento completo para modificação)
    const cart = await CartModel.findById(cid);
    if (!cart) return null; // Carrinho não existe

    // Verifica se o produto já está no carrinho
    const index = cart.products.findIndex(p => p.product.toString() === pid);
    
    if (index !== -1) {
      // Produto existe: incrementa a quantidade
      cart.products[index].quantity += quantity;
    } else {
      // Produto novo: adiciona ao array com quantidade inicial
      cart.products.push({ product: pid, quantity });
    }

    // Salva as alterações e retorna carrinho atualizado
    return await cart.save();
  }

  // Atualiza a quantidade específica de um produto no carrinho
  async updateQuantity(cid, pid, quantity) {
    // Busca o carrinho
    const cart = await CartModel.findById(cid);
    if (!cart) return null; // Carrinho não existe

    // Encontra o produto específico
    const product = cart.products.find(p => p.product.toString() === pid);
    if (!product) return null; // Produto não encontrado no carrinho

    // Atualiza a quantidade
    product.quantity = quantity;
    
    // Salva e retorna carrinho atualizado
    return await cart.save();
  }

  // Remove um produto específico do carrinho
  async removeProductFromCart(cid, pid) {
    // Busca o carrinho
    const cart = await CartModel.findById(cid);
    if (!cart) return null; // Carrinho não existe

    // Filtra o array removendo o produto especificado
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    
    // Salva e retorna carrinho atualizado
    return await cart.save();
  }

  // Remove todos os produtos do carrinho (esvazia)
  async clearCart(cid) {
    // Busca o carrinho
    const cart = await CartModel.findById(cid);
    if (!cart) return null; // Carrinho não existe
    
    // Define array de produtos como vazio
    cart.products = [];
    
    // Salva e retorna carrinho vazio
    return await cart.save();
  }
}

// Exporta instância única do serviço (Singleton)
export default new CartService();