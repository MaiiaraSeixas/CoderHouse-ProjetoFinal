// src/services/auth.service.js

import userService from './user.service.js';
import { isValidPassword } from '../utils/cryptography.js';

/**
 * Serviço de Autenticação
 *
 * Responsável por gerenciar:
 * - Registro de novos usuários
 * - Autenticação de usuários existentes (login)
 * - Atualização de informações de conexão
 */
class AuthService {
  constructor() {
    // Injeção de dependência do serviço de usuários
    this.userService = userService;
  }

  /**
   * Registra um novo usuário no sistema
   * @param {Object} userData - Dados do usuário para cadastro
   * @returns {Promise<Object>} Usuário criado
   * @throws {Error} Se o email já estiver cadastrado
   */
  async registerUser(userData) {
    const { email } = userData;

    // Verifica se já existe usuário com o mesmo email
    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      throw new Error('Usuário já cadastrado');
    }

    // Cria novo usuário se o email for único
    return await this.userService.createUser(userData);
  }

  /**
   * Autentica um usuário existente
   * @param {string} email - Email do usuário
   * @param {string} password - Senha fornecida
   * @returns {Promise<Object>} Objeto do usuário autenticado (sem métodos Mongoose)
   * @throws {Error} Se usuário não existir ou senha for inválida
   */
  async loginUser(email, password) {
    // Busca usuário como documento Mongoose completo (para operações de atualização)
    const user = await this.userService.getUserByEmailForAuth(email);

    // Valida existência do usuário
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Atualiza timestamp da última conexão
    user.last_connection = new Date();
    await user.save();  // Persiste a data de conexão no banco

    // Verifica correspondência da senha com o hash armazenado
    const isValid = isValidPassword(password, user.password);
    if (!isValid) {
      throw new Error('Senha inválida');
    }

    // Converte para objeto JavaScript puro (remove métodos e metadados do Mongoose)
    return user.toObject();
  }
}

// Exporta instância singleton do serviço
export default new AuthService();
