// ===== ARQUIVO ATUALIZADO: services/cart.service.js =====
// Lógica de compra implementada no serviço de carrinho.

import  CartModel  from "../models/cart.model.js";         // Modelo de carrinho
import { productService } from "./products.service.js";      // Serviço de produtos
import { ticketService } from "./ticket.service.js";         // Serviço de tickets
import MailService from './mail.service.js';                 // Serviço de envio de e-mails

class CartService {
    // Cria um novo carrinho vazio
    async createCart() {
        return await CartModel.create({ products: [] });
    }

    // Busca um carrinho pelo ID e carrega os dados completos dos produtos com populate
    async getCartById(id) {
        return await CartModel.findById(id).populate('products.product').lean();
    }
    
    // Lógica principal de finalização da compra
    async purchaseCart(cartId, user) {
        const mailService = new MailService(); // Instancia o serviço de email
        const cart = await this.getCartById(cartId); // Recupera o carrinho completo

        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        // Inicializa variáveis para controle da compra
        const productsToPurchase = [];            // Produtos com estoque suficiente
        const productsNotPurchasedIds = [];       // Produtos sem estoque suficiente
        let totalAmount = 0;                      // Valor total da compra

        // Itera sobre os produtos do carrinho
        for (const item of cart.products) {
            if (item.product && item.quantity) {
                const productFromDB = await productService.getProductById(item.product._id);
                
                if (productFromDB.stock >= item.quantity) {
                    // Produto disponível em estoque
                    productsToPurchase.push(item);
                    totalAmount += item.quantity * productFromDB.price;
                    
                    // Atualiza o estoque
                    const newStock = productFromDB.stock - item.quantity;
                    await productService.updateProductStock(productFromDB._id, newStock);
                } else {
                    // Produto fora de estoque
                    productsNotPurchasedIds.push(item.product._id.toString());
                }
            }
        }

        let ticket = null;

        // Se houver produtos comprados com sucesso, gera o ticket
        if (productsToPurchase.length > 0) {
            const ticketData = {
                amount: totalAmount,
                purchaser: user.email,
            };
            ticket = await ticketService.createTicket(ticketData); // Cria o ticket de compra
            
            // Remove do carrinho os produtos comprados com sucesso
            await CartModel.updateOne(
                { _id: cartId },
                {
                    $set: {
                        products: cart.products.filter(item =>
                            productsNotPurchasedIds.includes(item.product._id.toString())
                        )
                    }
                }
            );

            // Envia email de confirmação da compra
            await mailService.sendPurchaseConfirmation(user.email, ticket);
        }

        // Retorna o ticket gerado e os produtos que não foram comprados
        return { ticket, productsNotPurchased: productsNotPurchasedIds };
    }

    // ... Outros métodos do serviço de carrinho (addProductToCart, removeProduct, etc.)
    // Adiciona um produto ao carrinho
    async addProductToCart(cartId, productId, quantity) {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error('Carrinho não encontrado');
        }

        // Procura o índice do produto no array do carrinho
        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

        if (productIndex > -1) {
            // Se o produto já existe, incrementa a quantidade
            await CartModel.updateOne(
                { _id: cartId, 'products.product': productId },
                { $inc: { 'products.$.quantity': quantity } }
            );
        } else {
            // Se o produto não existe, adiciona ao carrinho
            await CartModel.updateOne(
                { _id: cartId },
                { $push: { products: { product: productId, quantity: quantity } } }
            );
        }

        // Retorna o carrinho atualizado para a resposta da API
        return await this.getCartById(cartId);
    }
    // Atualiza a quantidade de um produto no carrinho
    async updateQuantity(cartId, productId, quantity) {
        return await CartModel.updateOne(
            { _id: cartId, "products.product": productId },
            { $set: { "products.$.quantity": quantity } }
        );
    }
    // Remove um produto do carrinho
    async removeProductFromCart(cartId, productId) {
        return await CartModel.updateOne(
            { _id: cartId },
            { $pull: { products: { product: productId } } }
        );
    }
    // Limpa todos os produtos do carrinho
    async clearCart(cartId) {
        return await CartModel.updateOne(
            { _id: cartId },
            { $set: { products: [] } }
        );
    }
    // Deleta o carrinho pelo ID
    async deleteCart(cartId) {
        return await CartModel.deleteOne({ _id: cartId });
    }
    // Busca todos os carrinhos (opcional, dependendo da necessidade)
    async getAllCarts() {
        return await CartModel.find({}).populate('products.product').lean();
    } 
}

export const cartService = new CartService(); // Exporta uma instância única do serviço
