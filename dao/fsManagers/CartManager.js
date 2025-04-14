import CartModel from '../models/Cart.js';

export default class CartManager {
  async createCart() {
    const newCart = await CartModel.create({ products: [] });
    return newCart;
  }

  async getCartById(id) {
    const cart = await CartModel.findById(id).populate('products.product');
    if (!cart) return null;
    return { id: cart._id, products: cart.products };
  }

  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    const index = cart.products.findIndex(p => p.product.toString() === productId);

    if (index !== -1) {
      cart.products[index].quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return cart;
  }
}
