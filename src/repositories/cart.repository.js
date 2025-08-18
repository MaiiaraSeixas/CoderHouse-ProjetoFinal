// src/repositories/cart.repository.js
import { CartDAO } from '../daos/mongo/cart.dao.js';  // Importa o DAO de carrinhos
import CartDTO from '../dtos/cart.dto.js';            // Importa o DTO (Data Transfer Object) para carrinhos

// Classe que implementa o padrão Repository para carrinhos
export default class CartRepository {
  constructor() {
    // Instancia o DAO de carrinhos para interagir com o banco de dados
    this.cartDAO = new CartDAO();
  }

  // Obtém um carrinho pelo ID e retorna como DTO
  async getCartById(id) {
    // Busca o carrinho no banco usando o DAO
    const cart = await this.cartDAO.findCartById(id);
    // Se encontrado, converte para DTO; caso contrário retorna null
    return cart ? new CartDTO(cart) : null;
  }

  // Cria um novo carrinho
  async createCart(data) {
    // Usa o DAO para criar o carrinho no banco
    const newCart = await this.cartDAO.createCart(data);
    // Converte o resultado para DTO antes de retornar
    return new CartDTO(newCart);
  }

  // Adiciona um produto ao carrinho
  async addProductToCart(cartId, productId, quantity) {
    // Chama o método do DAO para adicionar o produto
    const updatedCart = await this.cartDAO.addProductToCart(cartId, productId, quantity);
    // Retorna o carrinho atualizado como DTO
    return new CartDTO(updatedCart);
  }

  // Remove um produto do carrinho
  async removeProductFromCart(cartId, productId) {
    // Usa o DAO para remover o produto do carrinho
    const updatedCart = await this.cartDAO.removeProductFromCart(cartId, productId);
    // Retorna o carrinho atualizado como DTO
    return new CartDTO(updatedCart);
  }

  // Atualiza um carrinho existente
  async updateCart(id, data) {
    // Chama o método do DAO para atualização
    const updatedCart = await this.cartDAO.updateCart(id, data);
    // Se encontrado, retorna como DTO; caso contrário null
    return updatedCart ? new CartDTO(updatedCart) : null;
  }

  // Limpa todos os produtos do carrinho
  async clearProductsFromCart(cartId) {
    // Usa o DAO para esvaziar o carrinho
    const updatedCart = await this.cartDAO.clearProductsFromCart(cartId);
    // Retorna o carrinho vazio como DTO
    return new CartDTO(updatedCart);
  }

  // Exclui um carrinho permanentemente
  async deleteCart(id) {
    // Delega a operação de exclusão ao DAO
    return await this.cartDAO.deleteCart(id);
  }
}
