// src/services/cart.service.js

import CartModel from "../models/cart.model.js";
import productService from "./products.service.js";
import ticketService from "./ticket.service.js";
import MailService from './mail.service.js';

/**
 * Serviço de Gerenciamento de Carrinhos
 * 
 * Responsável por todas as operações relacionadas a carrinhos de compras:
 * - Criação e manipulação de carrinhos
 * - Adição/remoção de produtos
 * - Finalização de compras (checkout)
 * - Integração com outros serviços (produtos, tickets, email)
 */
class CartService {

  /**
   * Cria um novo carrinho vazio
   * @returns {Promise<Object>} Novo carrinho criado
   */
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  /**
   * Busca carrinho por ID com produtos populados
   * @param {string} id - ID do carrinho
   * @returns {Promise<Object>} Carrinho com detalhes dos produtos
   */
  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  /**
   * Adiciona/atualiza produto no carrinho
   * @param {string} cartId - ID do carrinho
   * @param {string} productId - ID do produto
   * @param {number} quantity - Quantidade desejada
   * @returns {Promise<Object>} Carrinho atualizado
   */
  async addProductToCart(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    // Verifica se produto já está no carrinho
    const productIndex = cart.products.findIndex(
      p => p.product.toString() === productId.toString()
    );

    if (productIndex > -1) {
      // Atualiza quantidade existente
      cart.products[productIndex].quantity = quantity;
    } else {
      // Adiciona novo produto
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return this.getCartById(cartId); // Retorna carrinho atualizado com produtos populados
  }

  /**
   * Finaliza a compra do carrinho (processo de checkout)
   * @param {string} cartId - ID do carrinho
   * @param {Object} user - Usuário realizando a compra
   * @returns {Promise<Object>} Resultado com ticket e produtos não comprados
   */
  async purchaseCart(cartId, user) {
    const mailService = new MailService();
    const cart = await CartModel.findById(cartId);
    if (!cart) {
      throw new Error('Carrinho não encontrado');
    }

    const productsToPurchase = []; // Produtos com estoque suficiente
    const productsNotPurchased = []; // Produtos sem estoque suficiente
    let totalAmount = 0; // Valor total da compra

    // Processa cada item do carrinho
    for (const item of cart.products) {
      const productData = await productService.getProductById(item.product);

      // Verifica disponibilidade de estoque
      if (productData && productData.stock >= item.quantity) {
        // Adiciona ao total e lista de compra
        totalAmount += item.quantity * productData.price;
        productsToPurchase.push({ productData, quantity: item.quantity });
      } else {
        // Adiciona à lista de não comprados
        productsNotPurchased.push(item);
      }
    }

    let ticket = null;
    // Se houver produtos para comprar
    if (productsToPurchase.length > 0) {
      // Cria ticket de compra
      ticket = await ticketService.createTicket(user.email, totalAmount);

      // Atualiza estoque dos produtos comprados
      for (const item of productsToPurchase) {
        const newStock = item.productData.stock - item.quantity;
        await productService.updateProduct(item.productData.id, { stock: newStock });
      }

      // Envia email de confirmação
      await mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    // Atualiza carrinho mantendo apenas produtos não comprados
    await CartModel.findByIdAndUpdate(
      cartId,
      { products: productsNotPurchased }
    );

    // Retorna IDs dos produtos não comprados
    const notPurchasedIds = productsNotPurchased.map(item => item.product.toString());

    return {
      ticket,
      productsNotPurchased: notPurchasedIds
    };
  }

  /**
   * Remove produto do carrinho
   * @param {string} cartId - ID do carrinho
   * @param {string} productId - ID do produto
   * @returns {Promise<Object>} Resultado da operação
   */
  async removeProductFromCart(cartId, productId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $pull: { products: { product: productId } } }
    );
  }

  /**
   * Limpa todos os produtos do carrinho
   * @param {string} cartId - ID do carrinho
   * @returns {Promise<Object>} Resultado da operação
   */
  async clearCart(cartId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $set: { products: [] } }
    );
  }

  /**
   * Atualiza quantidade de um produto no carrinho
   * @param {string} cartId - ID do carrinho
   * @param {string} productId - ID do produto
   * @param {number} quantity - Nova quantidade
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateProductQuantityInCart(cartId, productId, quantity) {
    return await CartModel.updateOne(
      {
        _id: cartId,
        'products.product': productId
      },
      {
        $set: {
          'products.$.quantity': quantity
        }
      }
    );
  }
}

// Exporta instância singleton do serviço
export default new CartService();
