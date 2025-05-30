// services/session.service.js

import UserModel from '../models/User.js';
import { createHash, isValidPassword } from '../utils/bcrypt.js';

class SessionService {
  // Realiza autenticação de usuário
  async login(email, password) {
    // Busca usuário pelo email
    const user = await UserModel.findOne({ email });
    
    // Verifica se usuário existe e se a senha é válida
    if (!user || !isValidPassword(user, password)) return null;
    
    // Retorna objeto do usuário se autenticação for bem-sucedida
    return user;
  }

  // Registra um novo usuário no sistema
  async register(userData) {
    // Verifica se já existe usuário com o mesmo email
    const existing = await UserModel.findOne({ email: userData.email });
    if (existing) return null; // Email já cadastrado
    
    // Criptografa a senha antes de armazenar
    userData.password = createHash(userData.password);
    
    // Cria novo usuário no banco de dados
    return await UserModel.create(userData);
  }

  // Obtém usuário pelo email
  async getUserByEmail(email) {
    // Busca simples por email
    // .lean() retorna objeto simples (sem métodos Mongoose)
    return await UserModel.findOne({ email }).lean();
  }

  // Obtém usuário pelo ID
  async getUserById(uid) {
    // Busca por ID
    // .lean() para melhor performance
    return await UserModel.findById(uid).lean();
  }
}

// Exporta instância única do serviço
export default new SessionService();