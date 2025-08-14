import CartModel from '../../models/cart.model.js';

class CartDAO {
  // Busca um carrinho pelo ID e popula os dados dos produtos
  async findById(id) {
    return await CartModel.findById(id).populate('products.product').lean();
  }

  // Cria um novo carrinho
  async create(cartData) {
    const newCart = new CartModel(cartData);
    return await newCart.save();
  }

  // Atualiza um carrinho existente
  async update(id, cartData) {
    return await CartModel.findByIdAndUpdate(id, cartData, { new: true }).lean();
  }

  // Exclui um carrinho
  async delete(id) {
    return await CartModel.findByIdAndDelete(id);
  }

  // Adiciona um produto ao carrinho ou atualiza a quantidade
  async addProduct(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    // Verifica se o produto já está no carrinho
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

    if (productIndex > -1) {
      // Produto existe: incrementa a quantidade
      cart.products[productIndex].quantity += quantity;
    } else {
      // Produto novo: adiciona ao array
      cart.products.push({ product: productId, quantity });
    }
    return await cart.save();
  }

  // Remove um produto específico do carrinho
  async removeProduct(cartId, productId) {
    return await CartModel.findByIdAndUpdate(
      cartId,
      { $pull: { products: { product: productId } } }, // Remove o item pelo productId
      { new: true } // Retorna o documento atualizado
    );
  }

  // Remove todos os produtos do carrinho (esvazia)
  async clearCart(cartId) {
    return await CartModel.findByIdAndUpdate(cartId, { products: [] }, { new: true });
  }
}

export default new CartDAO();