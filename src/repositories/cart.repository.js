import cartDAO from '../daos/mongo/cart.dao.js';
import CartDTO from '../dtos/cart.dto.js';

export default class CartRepository {
  async getCartWithDetails(id) {
    const cart = await cartDAO.getCartByIdPopulated(id);
    return cart ? new CartDTO(cart) : null;
  }

  async addProduct(cid, pid, qty) {
    return await cartDAO.addProduct(cid, pid, qty);
  }

  async updateCart(id, newData) {
    return await cartDAO.update(id, newData);
  }
}
