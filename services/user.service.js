// services/user.service.js

import UserModel from '../models/user.model.js';
import CartModel from '../models/cart.model.js'; 

class UserService {
  // Busca usuário por e-mail (retorna objeto puro para melhor performance)
  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  // Busca usuário por ID
  async getUserById(id) {
    return await UserModel.findById(id).lean();
  }

  // Cria um novo usuário
  async createUser(userData) {
    return await UserModel.create(userData);
  }

  // Lista todos os usuários
  async getAllUsers() {
    return await UserModel.find({}).lean();
  }

  // Remove usuário por ID
  async deleteUser(id) {
    const result = await UserModel.findByIdAndDelete(id);
    return Boolean(result);
  }

  // Alterna entre roles "user" e "premium"
  async changeRole(uid) {
    const user = await UserModel.findById(uid);
    if (!user) return null;
    user.role = user.role === 'user' ? 'premium' : 'user';
    await user.save();
    return user;
  }
  // Novo método para garantir que o usuário tenha um carrinho
  async createEmptyCartForUser(userId) {
    const newCart = await CartModel.create({ user: userId, products: [] });
    await UserModel.findByIdAndUpdate(userId, { cartId: newCart._id });
    return newCart;
  }
}

export default new UserService();
