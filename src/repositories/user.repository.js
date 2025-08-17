import userDAO from '../daos/mongo/user.dao.js';
import UserDTO from '../dtos/UserDTO.js';

export default class UserRepository {
  constructor() {
    // Inicializa o DAO para operações com usuários
    this.userDAO = userDAO;
  }

  /**
   * Busca um usuário pelo ID retornando DTO seguro
   * @param {string} id - ID do usuário
   * @returns {UserDTO|null} - Usuário convertido para DTO ou null
   */
  async getUserById(id) {
    const user = await this.userDAO.findUserById(id);
    // Retorna versão segura do usuário (sem senha, etc.)
    return user ? new UserDTO(user) : null;
  }

  /**
   * Busca um usuário pelo email (retorna objeto completo)
   * @param {string} email - Email do usuário
   * @returns {Object|null} - Usuário completo (incluindo campos sensíveis) ou null
   * 
   * Nota: Usado para autenticação onde a senha é necessária
   * Não aplica DTO para manter campos necessários para login
   */
  async getUserByEmail(email) {
    // Retorna o objeto completo do banco (incluindo senha)
    return await this.userDAO.findUserByEmail(email);
  }

  /**
   * Cria um novo usuário
   * @param {Object} data - Dados do novo usuário
   * @returns {UserDTO} - Novo usuário convertido para DTO (versão segura)
   */
  async createUser(data) {
    const newUser = await this.userDAO.createUser(data);
    // Retorna versão segura após criação
    return new UserDTO(newUser);
  }

  /**
   * Atualiza um usuário existente
   * @param {string} id - ID do usuário
   * @param {Object} data - Novos dados do usuário
   * @returns {UserDTO|null} - Usuário atualizado em DTO ou null
   */
  async updateUser(id, data) {
    const updatedUser = await this.userDAO.updateUser(id, data);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  /**
   * Exclui permanentemente um usuário
   * @param {string} id - ID do usuário
   * @returns {Object} - Resultado da operação de exclusão
   */
  async deleteUser(id) {
    return await this.userDAO.deleteUser(id);
  }

  /**
   * Lista todos os usuários (retorna versões seguras)
   * @returns {UserDTO[]} - Array de usuários convertidos para DTO
   */
  async getAllUsers() {
    const users = await this.userDAO.findAllUsers();
    // Converte cada usuário para DTO seguro
    return users.map(user => new UserDTO(user));
  }
}