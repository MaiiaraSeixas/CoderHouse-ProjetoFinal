import CartModel from '../models/Cart.js';

export default class CartManager {
  // Cria um novo carrinho vazio
  async createCart() {
    const newCart = await CartModel.create({ products: [] });
    return newCart; // Retorna o documento completo do MongoDB
  }

  // Obtém carrinho por ID com população de produtos
  async getCartById(id) {
    const cart = await CartModel.findById(id).populate('products.product');
    if (!cart) return null; // Retorna null se não encontrar
    return { 
      id: cart._id,        // Extrai somente o ID string
      products: cart.products // Retorna array de produtos formatados
    };
  }

  // Adiciona produto ao carrinho (incrementa quantidade se existir)
  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error('Carrinho não encontrado');

    // Busca o índice do produto no array
    const index = cart.products.findIndex(
      p => p.product.toString() === productId
    );

    if (index !== -1) {
      cart.products[index].quantity += 1; // Incrementa quantidade
    } else {
      cart.products.push({ product: productId, quantity: 1 }); // Novo item
    }

    await cart.save(); // Salva as alterações
    return cart; // Retorna o carrinho atualizado
  }
}