// Importa os modelos de Carrinho e Produto e a biblioteca Mongoose
import mongoose from 'mongoose';
import CartModel from '../models/cart.model.js';
import ProductModel from '../models/product.model.js';

export class CartManagerMongo {

  // Cria um novo carrinho vazio
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  // Busca um carrinho pelo ID com população de produtos
  async getCartById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null; // Valida formato do ID
    return await CartModel.findById(id).populate('products.product'); // Popula dados do produto
  }

  // Adiciona produto ao carrinho com validações
  async addProductToCart(cartId, productId, quantity = 1) {
    // Validação de IDs formatos
    if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return { error: 'ID inválido' };
    }

    // Validação de quantidade numérica positiva
    if (quantity <= 0 || isNaN(quantity)) {
      return { error: 'Quantidade inválida' };
    }

    // Busca o carrinho e verifica existência
    const cart = await CartModel.findById(cartId);
    if (!cart) return { error: 'Carrinho não encontrado' };

    // Busca o produto e verifica existência
    const product = await ProductModel.findById(productId);
    if (!product) return { error: 'Produto não encontrado' };

    // Verifica estoque disponível
    if (product.stock < quantity) {
      return { error: 'Estoque insuficiente para a quantidade solicitada' };
    }

    // Localiza o produto no carrinho
    const index = cart.products.findIndex(p => p.product.toString() === productId);

    // Atualiza quantidade ou adiciona novo
    if (index !== -1) {
      cart.products[index].quantity += quantity; // Incrementa quantidade existente
    } else {
      cart.products.push({ product: productId, quantity }); // Adiciona novo produto
    }

    await cart.save(); // Persiste alterações no banco
    return cart; // Retorna carrinho atualizado
  }
}