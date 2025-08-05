// src/services/cart.service.js - VERSÃO FINAL E CORRIGIDA

// Importando os modelos e serviços necessários para manipulação de carrinho
import CartModel from "../models/cart.model.js";  // Modelo de 
import ProductModel from "../models/product.model.js";
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

    const mailService = new MailService(); // Serviço de envio de e-mails

    // 1. Busca o carrinho no banco (sem popular os dados dos produtos)
    const cart = await CartModel.findById(cartId);
    if (!cart) {

      throw new Error('Carrinho não encontrado');
    }

    const productsToPurchase = [];     // Produtos que podem ser comprados
    const productsNotPurchased = [];   // Produtos SEM estoque ou inválidos
    let totalAmount = 0;               // Soma total a pagar

    // 2. Para cada item do carrinho...
    for (const item of cart.products) {


      // 3. Busca as informações completas do produto no banco
      const productData = await productService.getProductById(item.product);


      // 4. Se o produto existir e tiver estoque suficiente:
      if (productData && productData.stock >= item.quantity) {

        totalAmount += item.quantity * productData.price;  // Soma ao valor final
        productsToPurchase.push({ productData, quantity: item.quantity }); // Separa para compra
      } else {

        productsNotPurchased.push(item); // Separa como NÃO comprado
      }
    }



    let ticket = null; // Ticket de compra (nota fiscal)

    // 5. Se houver produtos válidos para comprar...
    if (productsToPurchase.length > 0) {

      const ticketData = { amount: totalAmount, purchaser: user.email };
      ticket = await ticketService.createTicket(ticketData); // Cria ticket


      // 6. Atualiza o estoque de cada produto comprado
      for (const item of productsToPurchase) {
        const newStock = item.productData.stock - item.quantity;

        await productService.updateProductStock(item.productData._id, newStock);
      }

      // 7. Envia e-mail de confirmação da compra

      await mailService.sendPurchaseConfirmation(user.email, ticket);
    }

    /**
     * 8. ✅ Atualiza o carrinho de forma ATÔMICA,
     *     mantendo apenas os produtos **não comprados**.
     *     (Esta linha evita o VersionError do Mongoose)
     */

    await CartModel.findByIdAndUpdate(cartId, { products: productsNotPurchased });


    // (Opcional) Recarrega o carrinho para debug
    const cartAfter = await CartModel.findById(cartId).lean();


    // 9. Prepara retorno com os IDs dos produtos que ficaram pendentes
    const notPurchasedIds = productsNotPurchased.map(item => item.product.toString());


    return { ticket, productsNotPurchased: notPurchasedIds };
  }


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
