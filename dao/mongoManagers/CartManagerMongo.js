// Importa os modelos de Carrinho e Produto
import CartModel from '../models/cart.model.js';
import ProductModel from '../models/product.model.js';

export class CartManagerMongo {

  // Novo método: cria um novo carrinho vazio // Cria um novo carrinho vazio
  async createCart() {
    return await CartModel.create({ products: [] });
  }

  // Novo método: busca um carrinho pelo ID
  async getCartById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  // Novo método: agora com verificação de produto e quantity personalizada
  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return { error: 'Carrinho não encontrado' };

    const product = await ProductModel.findById(productId);
    if (!product) return { error: 'Produto não encontrado' };

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save(); // Salva alterações no MongoDB
    return cart;
  }
}
