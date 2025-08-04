// src/services/cart.service.js
// Importa o model do carrinho, os serviços de produtos, ticket e email.
import CartModel from "../models/cart.model.js";
import { productService } from "./products.service.js";
import { ticketService } from "./ticket.service.js";
import MailService from './mail.service.js';

class CartService {
  // Cria um carrinho vazio no banco de dados
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  // Busca um carrinho pelo ID e popula os dados completos dos produtos
  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product').lean();
  }

  // ===============================
  // LÓGICA DE FINALIZAÇÃO DE COMPRA (CORRIGIDA)
  // ===============================
  async purchaseCart(cartId, user) {
    const mailService = new MailService();  // Instancia o serviço de e-mail
    const cart = await this.getCartById(cartId); // Busca o carrinho com os produtos populados
    if (!cart) throw new Error('Carrinho não encontrado');

    const productsToPurchase = [];       // Produtos que podem ser comprados (estoque suficiente)
    const productsNotPurchased = [];     // Produtos que não têm estoque
    let totalAmount = 0;                 // Valor total da compra

    // Itera sobre os produtos do carrinho
    for (const item of cart.products) {
      // Se o produto existe e o estoque é suficiente
      if (item.product && item.product.stock >= item.quantity) {
        totalAmount += item.quantity * item.product.price;
        productsToPurchase.push(item);
      } else {
        productsNotPurchased.push(item);
      }
    }

    let ticket = null;

    // Se há produtos compráveis, gera o ticket
    if (productsToPurchase.length > 0) {
      // Atualiza o estoque dos produtos comprados
      for (const item of productsToPurchase) {
        const newStock = item.product.stock - item.quantity;
        await productService.updateProductStock(item.product._id, newStock);
      }

      // Cria o ticket da compra
      const ticketData = { amount: totalAmount, purchaser: user.email };
      ticket = await ticketService.createTicket(ticketData);

      // Atualiza o carrinho removendo os produtos que foram comprados
      await CartModel.updateOne({ _id: cartId }, { $set: { products: productsNotPurchased } });

      // Envia e-mail de confirmação de compra
      await mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    // Garante que a lista de produtos não comprados contenha apenas IDs válidos
    const notPurchasedIds = productsNotPurchased
      .filter(item => item.product)
      .map(item => item.product._id.toString());

    // Retorna o ticket gerado (se houver) e os produtos não comprados
    return {
      ticket,
      productsNotPurchased: notPurchasedIds
    };
  }

  // Adiciona um produto ao carrinho (ou incrementa a quantidade se já existir)
  async addProductToCart(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    // Converte o ID para string para evitar falhas de comparação
    const productIdStr = productId.toString();

    // Procura o produto no carrinho
    const productIndex = cart.products.findIndex(p => p.product.toString() === productIdStr);

    if (productIndex > -1) {
      // Se já existe, apenas incrementa a quantidade
      await CartModel.updateOne(
        { _id: cartId, 'products.product': productIdStr },
        { $inc: { 'products.$.quantity': quantity } }
      );
    } else {
      // Caso contrário, adiciona o novo produto
      await CartModel.updateOne(
        { _id: cartId },
        { $push: { products: { product: productIdStr, quantity: quantity } } }
      );
    }

    // Retorna o carrinho atualizado
    return await this.getCartById(cartId);
  }

  // Atualiza diretamente a quantidade de um produto no carrinho
  async updateQuantity(cartId, productId, quantity) {
    return await CartModel.updateOne(
      { _id: cartId, "products.product": productId },
      { $set: { "products.$.quantity": quantity } }
    );
  }

  // Remove um produto específico do carrinho
  async removeProductFromCart(cartId, productId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $pull: { products: { product: productId } } }
    );
  }

  // Remove todos os produtos do carrinho
  async clearCart(cartId) {
    return await CartModel.updateOne(
      { _id: cartId },
      { $set: { products: [] } }
    );
  }
}

// Exporta uma instância única do serviço para ser usada no app
export const cartService = new CartService();
