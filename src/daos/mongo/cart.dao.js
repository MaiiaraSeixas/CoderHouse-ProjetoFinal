// src/daos/mongo/cart.dao.js
import CartModel from '../../models/cart.model.js';

// Classe Data Access Object (DAO) para operações com carrinhos
export class CartDAO {

  // Busca um carrinho por ID e popula os detalhes dos produtos
  async findCartById(id) {
    return await CartModel.findById(id)
      .populate('products.product')  // Substitui IDs de produtos por objetos completos
      .lean();  // Converte documento Mongoose para objeto JavaScript puro
  }

  // Cria um novo carrinho no banco de dados
  async createCart(cartData) {
    const newCart = new CartModel(cartData);  // Cria instância do modelo
    return await newCart.save();  // Persiste no banco e retorna o carrinho criado
  }

  // Atualiza um carrinho existente
  async updateCart(id, cartData) {
    return await CartModel.findByIdAndUpdate(
      id,
      cartData,
      { new: true }  // Retorna o documento ATUALIZADO (não o original)
    ).lean();  // Retorna como objeto simples
  }

  // Exclui um carrinho do banco de dados
  async deleteCart(id) {
    return await CartModel.findByIdAndDelete(id);  // Remove permanentemente
  }

  // Adiciona um produto ao carrinho ou atualiza sua quantidade
  async addProduct(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);  // Busca o carrinho

    // Verifica se o produto já existe no carrinho
    const productIndex = cart.products.findIndex(
      p => p.product.toString() === productId  // Converte ObjectId para string para comparação
    );

    if (productIndex > -1) {
      // Produto existe: incrementa a quantidade
      cart.products[productIndex].quantity += quantity;
    } else {
      // Produto novo: adiciona ao array de produtos
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save();  // Salva as alterações e retorna o carrinho atualizado
  }

  // Remove um produto específico do carrinho
  async removeProduct(cartId, productId) {
    return await CartModel.findByIdAndUpdate(
      cartId,
      {
        $pull: {  // Operador MongoDB para remover elemento de array
          products: { product: productId }  // Remove objetos onde product === productId
        }
      },
      { new: true }  // Retorna o documento atualizado
    );
  }

  // Remove todos os produtos do carrinho (esvazia o carrinho)
  async clearCart(cartId) {
    return await CartModel.findByIdAndUpdate(
      cartId,
      { products: [] },  // Substitui array de produtos por array vazio
      { new: true }  // Retorna o carrinho atualizado
    );
  }
}