import cartDAO from '../daos/mongo/cart.dao.js';
import CartDTO from '../dtos/cart.dto.js';

export default class CartRepository {
  constructor() {
    // Inicializa o DAO para acesso aos dados do carrinho
    this.cartDAO = cartDAO;
  }

  /**
   * Obtém um carrinho pelo ID
   * @param {string} id - ID do carrinho
   * @returns {CartDTO|null} - Carrinho convertido para DTO ou null se não encontrado
   */
  async getById(id) {
    const cart = await this.cartDAO.findById(id);
    // Converte para DTO antes de retornar à camada de negócios
    return cart ? new CartDTO(cart) : null;
  }

  /**
   * Cria um novo carrinho
   * @param {Object} data - Dados do carrinho
   * @returns {CartDTO} - Novo carrinho convertido para DTO
   */
  async create(data) {
    const newCart = await this.cartDAO.create(data);
    return new CartDTO(newCart);
  }

  /**
   * Adiciona um produto ao carrinho
   * @param {string} cartId - ID do carrinho
   * @param {string} productId - ID do produto
   * @param {number} quantity - Quantidade a adicionar
   * @returns {CartDTO} - Carrinho atualizado em DTO
   */
  async addProduct(cartId, productId, quantity) {
    const updatedCart = await this.cartDAO.addProduct(cartId, productId, quantity);
    return new CartDTO(updatedCart);
  }

  /**
   * Remove um produto do carrinho
   * @param {string} cartId - ID do carrinho
   * @param {string} productId - ID do produto
   * @returns {CartDTO} - Carrinho atualizado em DTO
   */
  async removeProduct(cartId, productId) {
    const updatedCart = await this.cartDAO.removeProduct(cartId, productId);
    return new CartDTO(updatedCart);
  }

  /**
   * Atualiza o carrinho (genérico)
   * @param {string} id - ID do carrinho
   * @param {Object} data - Novos dados do carrinho
   * @returns {CartDTO|null} - Carrinho atualizado em DTO ou null se não existir
   * 
   * Nota: Para operações específicas, prefira os métodos addProduct/removeProduct
   */
  async update(id, data) {
    const updatedCart = await this.cartDAO.update(id, data);
    return updatedCart ? new CartDTO(updatedCart) : null;
  }

  /**
   * Esvazia o carrinho (remove todos os produtos)
   * @param {string} cartId - ID do carrinho
   * @returns {CartDTO} - Carrinho vazio em DTO
   */
  async clear(cartId) {
    const updatedCart = await this.cartDAO.clearCart(cartId);
    return new CartDTO(updatedCart);
  }

  /**
   * Exclui permanentemente um carrinho
   * @param {string} id - ID do carrinho
   * @returns {Object} - Resultado da operação de exclusão
   */
  async delete(id) {
    return await this.cartDAO.delete(id);
  }
}