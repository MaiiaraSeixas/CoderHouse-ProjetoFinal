// src/services/cart.service.js - VERSÃO FINAL E CORRIGIDA

// Importando os modelos e serviços necessários para manipulação de carrinho
import CartModel from "../models/cart.model.js";  // Modelo de carrinho
import { productService } from "./products.service.js";  // Serviço de produtos (atualiza estoque)
import { ticketService } from "./ticket.service.js";  // Serviço de emissão de tickets
import MailService from './mail.service.js';  // Serviço para envio de emails

// Definição da classe CartService que gerencia as operações relacionadas ao carrinho
class CartService {

  // Método para criar um novo carrinho vazio
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  // Método para buscar um carrinho pelo ID, populando os dados do produto dentro do carrinho
  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  /**
   * Adiciona um produto ao carrinho.
   * - Se o produto já existe no carrinho, ele define a nova quantidade.
   * - Se o produto não existir, ele é adicionado ao carrinho.
   * Usamos o método `.save()` para garantir que o documento seja atualizado com todas as alterações.
   */
  async addProductToCart(cartId, productId, quantity) {
    // Busca o carrinho
    const cart = await CartModel.findById(cartId);

    // Se o carrinho não existir, lança erro
    if (!cart) throw new Error('Carrinho não encontrado');

    // Busca o índice do produto no carrinho
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId.toString());

    if (productIndex > -1) {
      // Se o produto já existe no carrinho, atualiza a quantidade
      cart.products[productIndex].quantity = quantity;
    } else {
      // Se o produto não existe no carrinho, adiciona-o
      cart.products.push({ product: productId, quantity: quantity });
    }

    // Salva o carrinho atualizado
    await cart.save();

    // Retorna o carrinho atualizado após a adição ou modificação do produto
    return this.getCartById(cartId);
  }

  /**
   * Finaliza a compra (checkout).
   * - Verifica se há estoque suficiente dos produtos no carrinho.
   * - Atualiza o estoque dos produtos.
   * - Cria um ticket de compra e envia a confirmação por email.
   */

  async purchaseCart(cartId, user) {
    console.log('\n=== [purchaseCart] Iniciando compra ===');

    const mailService = new MailService();
    // A busca do carrinho está correta, mas vamos verificar seu conteúdo
    const cart = await CartModel.findById(cartId);
    if (!cart) {
      console.log('ERRO: Carrinho não encontrado com o ID:', cartId);
      throw new Error('Carrinho não encontrado');
    }

    console.log('Carrinho encontrado:', JSON.stringify(cart, null, 2));

    const productsToPurchase = [];
    const productsNotPurchased = [];
    let totalAmount = 0;

    // Verificação de estoque
    for (const item of cart.products) {
      console.log(`\nProcessando item do carrinho: product ID = ${item.product}, quantity = ${item.quantity}`);

      // Vamos usar o ProductModel diretamente para garantir que não haja interferência de camadas
      const productData = await ProductModel.findById(item.product);

      // Este é o log mais importante: ele nos dirá se o produto foi encontrado no banco
      console.log(`Produto ${item.product} buscado no banco:`, productData ? 'Encontrado' : 'null');

      if (productData && productData.stock >= item.quantity) {
        console.log(`--> ESTOQUE OK: ${productData.stock} >= ${item.quantity}. Adicionando para compra.`);
        totalAmount += item.quantity * productData.price;
        productsToPurchase.push({
          ...item.toObject(),
          product: productData
        });
      } else {
        console.log(`--> FALHA: Estoque insuficiente ou produto não encontrado.`);
        productsNotPurchased.push(item);
      }
    }

    console.log('\nResumo da verificação:');
    console.log('Total de produtos a comprar:', productsToPurchase.length);
    console.log('Total de produtos não comprados:', productsNotPurchased.length);

    let ticket = null;

    if (productsToPurchase.length > 0) {
      // ... (lógica de criação do ticket, que já sabemos que está correta)
      const ticketData = { amount: totalAmount, purchaser: user.email };
      ticket = await ticketService.createTicket(ticketData);

      for (const item of productsToPurchase) {
        const newStock = item.product.stock - item.quantity;
        await productService.updateProductStock(item.product._id, newStock);
      }

      cart.products = productsNotPurchased;
      await cart.save();
      await mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    const notPurchasedIds = productsNotPurchased.map(item => item.product.toString());

    console.log('\n=== [purchaseCart] Final ===');
    console.log('Retorno da função:', { ticket, productsNotPurchased: notPurchasedIds });

    return { ticket, productsNotPurchased: notPurchasedIds };
  }

  // async purchaseCart(cartId, user) {
  //   const mailService = new MailService();
  //   // 1. Busca o carrinho sem .populate()
  //   const cart = await CartModel.findById(cartId);
  //   if (!cart) throw new Error('Carrinho não encontrado');

  //   const productsToPurchase = [];
  //   const productsNotPurchased = [];
  //   let totalAmount = 0;

  //   // 2. Itera sobre os itens do carrinho
  //   for (const item of cart.products) {
  //     // 3. Busca os dados completos do produto manualmente para cada item
  //     const productData = await productService.getProductById(item.product);

  //     // 4. Lógica de verificação com os dados frescos do produto
  //     if (productData && productData.stock >= item.quantity) {
  //       totalAmount += item.quantity * productData.price;
  //       productsToPurchase.push({
  //         ...item.toObject(), // Converte o subdocumento para um objeto simples
  //         product: productData // Anexa os dados completos do produto
  //       });
  //     } else {
  //       productsNotPurchased.push(item);
  //     }
  //   }

  //   let ticket = null;

  //   if (productsToPurchase.length > 0) {
  //     // Desconta do estoque
  //     for (const item of productsToPurchase) {
  //       const newStock = item.product.stock - item.quantity;
  //       await productService.updateProductStock(item.product._id, newStock);
  //     }

  //     // Cria o ticket
  //     const ticketData = { amount: totalAmount, purchaser: user.email };
  //     ticket = await ticketService.createTicket(ticketData);

  //     // Atualiza o carrinho com os produtos que não foram comprados
  //     cart.products = productsNotPurchased;
  //     await cart.save();

  //     // Envia email de confirmação
  //     await mailService.sendPurchaseConfirmation(user.email, ticket);
  //   }

  //   // Prepara a lista final de IDs não comprados
  //   const notPurchasedIds = productsNotPurchased.map(item => item.product.toString());

  //   return {
  //     ticket,
  //     productsNotPurchased: notPurchasedIds
  //   };
  // }

  // Método auxiliar para remover um produto do carrinho
  async removeProductFromCart(cartId, productId) {
    return await CartModel.updateOne({ _id: cartId }, { $pull: { products: { product: productId } } });
  }

  // Método auxiliar para limpar todos os produtos de um carrinho
  async clearCart(cartId) {
    return await CartModel.updateOne({ _id: cartId }, { $set: { products: [] } });
  }

  // Método auxiliar para atualizar a quantidade de um produto no carrinho
  async updateQuantity(cartId, productId, quantity) {
    return await CartModel.updateOne({ _id: cartId, 'products.product': productId }, { $set: { 'products.$.quantity': quantity } });
  }
}

// Instancia a classe CartService para exportar
export const cartService = new CartService();
