import CartModel from '../models/cart.model.js';

export class CartManagerMongo {
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return cart;
  }
}
