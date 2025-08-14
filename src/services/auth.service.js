import UserService from './user.service.js';
import { validatePassword } from '../utils/cryptography.js';

class AuthService {
  constructor() {
    // Inicializa o serviço de usuários para operações relacionadas
    this.userService = new UserService();
  }

  /**
   * Registra um novo usuário no sistema
   * @param {Object} userData - Dados do usuário para registro
   * @returns {Object} - Usuário registrado
   * @throws {Error} - Se o usuário já estiver registrado
   */
  async register(userData) {
    const { email } = userData;
    // Verifica se o email já está cadastrado
    const existingUser = await this.userService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Usuário já cadastrado');
    }

    // O serviço de usuário cuida da criptografia da senha e criação do carrinho
    return await this.userService.createUser(userData);
  }

  /**
   * Autentica um usuário existente
   * @param {string} email - Email do usuário
   * @param {string} password - Senha não criptografada
   * @returns {Object} - Dados do usuário autenticado (sem senha)
   * @throws {Error} - Se as credenciais forem inválidas
   */
  async login(email, password) {
    /**
     * IMPORTANTE: Para autenticação, precisamos do objeto completo do usuário,
     * incluindo a senha criptografada. O serviço de usuário deve ter um método
     * específico que retorne o usuário com o campo de senha para fins de login.
     */
    const user = await this.userService.getUserByEmailForAuth(email);

    // Valida se o usuário existe
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Valida se a senha está correta
    const isValid = validatePassword(password, user.password);
    if (!isValid) {
      throw new Error('Senha inválida');
    }

    // Remove a senha antes de retornar os dados do usuário
    const { password: _, ...safeUser } = user;

    return safeUser;
  }
}

export default new AuthService();