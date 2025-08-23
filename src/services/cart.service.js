// src/services/cart.service.js

import CartModel from "../models/cart.model.js";
import productService from "./products.service.js";
import ticketService from "./ticket.service.js";
import MailService from './mail.service.js';
import { paymentService } from './payment.service.js';

/**
 * Serviço de Gerenciamento de Carrinhos
 * Responsável por toda a lógica de manipulação de carrinhos,
 * checkout e integração com pagamento e e-mail.
 */
class CartService {
  constructor() {

    // Instância do serviço de e-mail
    this.mailService = new MailService();
  }

  /**
   * Cria um novo carrinho vazio
   */
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  /**
   * Busca carrinho por ID com produtos populados
   */
  async getCartById(cartId) {
    return await CartModel.findById(cartId).populate('products.product');
  }

  /**
   * Adiciona ou atualiza produto no carrinho
   */
  async addProductToCart(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    // Verifica se o produto já está no carrinho
    const existingProductIndex = cart.products.findIndex(
      p => p.product.toString() === productId.toString()
    );

    if (existingProductIndex > -1) {
      // Atualiza quantidade do produto já existente
      cart.products[existingProductIndex].quantity = quantity;
    } else {
      // Adiciona novo produto ao carrinho
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    // Retorna carrinho atualizado com produtos populados
    return this.getCartById(cartId);
  }

  /**
   * 🔑 LÓGICA CORRIGIDA (antiga finalizePurchase)
   * Finaliza uma compra, gera o ticket, atualiza o estoque e envia e-mail.
   * Esta é a função que o teste de unidade `cart.service.test.js` deve testar.
   * @returns {{ticket: object, productsNotPurchased: string[]}}
   */
  async purchaseCart(cartId, user) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    let totalAmount = 0;
    const productsToPurchase = [];
    const productsNotPurchasedIds = [];

    // Separa produtos com e sem estoque
    for (const item of cart.products) {
      const productDetails = await productService.getProductById(item.product._id);
      if (productDetails.stock >= item.quantity) {
        totalAmount += item.quantity * productDetails.price;
        productsToPurchase.push(item);
      } else {
        productsNotPurchasedIds.push(item.product._id.toString());
      }
    }

    let ticket = null;

    if (productsToPurchase.length > 0) {
      // Gera o ticket da compra
      ticket = await ticketService.createTicket(user.email, totalAmount);

      // Atualiza o estoque dos produtos comprados
      for (const item of productsToPurchase) {
        const productDetails = await productService.getProductById(item.product._id);
        const newStock = productDetails.stock - item.quantity;
        await productService.updateProduct(item.product._id, { stock: newStock });
      }

      // Envia e-mail de confirmação
      await this.mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    // Atualiza o carrinho, mantendo apenas os produtos que não foram comprados
    const remainingProducts = cart.products.filter(item => productsNotPurchasedIds.includes(item.product._id.toString()));
    await CartModel.findByIdAndUpdate(cartId, { products: remainingProducts });

    return {
      ticket,
      productsNotPurchased: productsNotPurchasedIds
    };
  }

  /**
   * Finaliza compra após confirmação de pagamento
   * (executado após webhook Stripe ou confirmação no frontend)
   */
  async finalizePurchase(cartId, user) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    let totalAmount = 0;
    const productsToPurchase = [];
    const productsNotPurchased = [];

    // Verifica estoque de cada item
    for (const item of cart.products) {
      if (item.product.stock >= item.quantity) {
        totalAmount += item.quantity * item.product.price;
        productsToPurchase.push(item);
      } else {
        productsNotPurchased.push(item);
      }
    }

    let ticket = null;

    if (productsToPurchase.length > 0) {
      // Gera ticket da compra
      ticket = await ticketService.createTicket(user.email, totalAmount);

      // Atualiza estoque dos produtos comprados
      for (const item of productsToPurchase) {
        const newStock = item.product.stock - item.quantity;
        await productService.updateProduct(item.product._id, { stock: newStock });
      }

      // Envia e-mail de confirmação da compra
      await this.mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    // Atualiza carrinho, deixando apenas produtos não comprados
    await CartModel.findByIdAndUpdate(cartId, { products: productsNotPurchased });

    // Retorna IDs dos produtos não comprados
    const notPurchasedIds = productsNotPurchased.map(item => item.product._id.toString());

    return {
      ticket,
      productsNotPurchased: notPurchasedIds
    };
  }

  /**
   * Inicia o processo de pagamento criando um PaymentIntent na Stripe.
   * Esta função deve ser chamada pela rota antes de finalizar a compra.
   * @returns {Promise<Object>} O PaymentIntent criado.
   */
  async createPaymentIntentForCart(cartId, user) {
    const cart = await this.getCartById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    let totalAmount = 0;
    // Calcula o valor total apenas dos produtos com estoque
    for (const item of cart.products) {
      if (item.product.stock >= item.quantity) {
        totalAmount += item.quantity * item.product.price;
      }
    }

    if (totalAmount === 0) {
      throw new Error('Não há produtos com estoque suficiente para a compra.');
    }

    const amountInCents = Math.round(totalAmount * 100);

    // Usa a instância importada do paymentService
    return await paymentService.createPaymentIntent(
      amountInCents,
      'brl',
      `Compra no E-commerce por ${user.email}`
    );
  }

  /**
   * Remove produto específico do carrinho
   */
  async removeProductFromCart(cartId, productId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $pull: { products: { product: productId } } }
    );
  }

  /**
   * Limpa todos os produtos do carrinho
   */
  async clearProductsFromCart(cartId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $set: { products: [] } }
    );
  }

  /**
   * Atualiza quantidade de um produto já presente no carrinho
   */
  async updateProductQuantityInCart(cartId, productId, quantity) {
    return await CartModel.updateOne(
      { _id: cartId, 'products.product': productId },
      { $set: { 'products.$.quantity': quantity } }
    );
  }

  /**
   * Deleta um carrinho pelo ID
   */
  async deleteCart(cartId) {
    return await CartModel.findByIdAndDelete(cartId);
  }

  /**
   * Retorna todos os carrinhos existentes
   */
  async getAllCarts() {
    return await CartModel.find().lean();
  }
}

// Exporta uma instância única do serviço
export default new CartService();
