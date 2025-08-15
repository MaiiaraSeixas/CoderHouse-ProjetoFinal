// src/services/user.service.js

import UserModel from '../models/user.model.js';
import CartModel from '../models/cart.model.js';
import { createHash } from '../utils/cryptography.js';
import {userDAO} from '../daos/mongo/user.dao.js';

// Cria instância do DAO
const userDAO = new userDAO();

// Lista de documentos obrigatórios para se tornar usuário premium
const REQUIRED_DOCUMENTS = [
  'Identificacion',
  'Comprobante de domicilio',
  'Comprobante de estado de cuenta'
];

class UserService {
  /**
   * Busca usuário por email (retorna objeto lean)
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Usuário encontrado
   */
  async getUserByEmail(email) {
    return await userdao.findByEmail(email);
  }

  /**
   * Busca usuário por email para autenticação (retorna documento completo)
   * @param {string} email - Email do usuário
   * @returns {Promise<Document>} Documento Mongoose completo
   */
  async getUserByEmailForAuth(email) {
    return await userdao.findByEmailForAuth(email);
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Usuário encontrado
   */
  async getUserById(id) {
    return await userdao.findById(id);
  }

  /**
   * Cria um novo usuário com carrinho associado (transação ACID)
   * @param {Object} userData - Dados do novo usuário
   * @returns {Promise<Object>} Usuário criado com cartId
   * @throws {Error} Em caso de falha na transação
   */
  async createUser(userData) {
    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      // Cria versão hash da senha
      const hashedUserData = {
        ...userData,
        password: createHash(userData.password)
      };

      // Cria usuário na transação
      const newUser = await UserModel.create([hashedUserData], { session });

      // Cria carrinho associado ao usuário
      const newCart = await CartModel.create(
        [{ user: newUser[0]._id, products: [] }],
        { session }
      );

      // Atualiza usuário com ID do carrinho
      const updatedUser = await UserModel.findByIdAndUpdate(
        newUser[0]._id,
        { $set: { cartId: newCart[0]._id } },
        { new: true, session }
      ).lean();

      // Confirma transação
      await session.commitTransaction();
      return updatedUser;
    } catch (error) {
      // Reverte transação em caso de erro
      await session.abortTransaction();
      throw new Error('Falha ao criar usuário: ' + error.message);
    } finally {
      // Finaliza sessão independente do resultado
      session.endSession();
    }
  }

  /**
   * Retorna todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  async getAllUsers() {
    return await userdao.findAll();
  }

  /**
   * Exclui um usuário e seu carrinho (transação ACID)
   * @param {string} id - ID do usuário
   * @returns {Promise<boolean>} True se excluído com sucesso
   */
  async deleteUser(id) {
    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      // Busca usuário na sessão
      const user = await UserModel.findById(id).session(session);
      if (!user) return false;

      // Exclui carrinho associado
      await CartModel.deleteOne({ _id: user.cartId }).session(session);

      // Exclui usuário
      await UserModel.deleteOne({ _id: id }).session(session);

      // Confirma transação
      await session.commitTransaction();
      return true;
    } catch (error) {
      // Reverte transação
      await session.abortTransaction();
      throw error;
    } finally {
      // Finaliza sessão
      session.endSession();
    }
  }

  /**
   * Altera o role do usuário (user ↔ premium)
   * @param {string} uid - ID do usuário
   * @returns {Promise<Object>} Usuário atualizado
   * @throws {Error} Se documentos obrigatórios faltarem
   */
  async changeRole(uid) {
    // Busca usuário completo
    const user = await UserModel.findById(uid);
    if (!user) throw new Error('Usuário não encontrado');

    // Admins não podem mudar de role
    if (user.role === 'admin') return user;

    // Verifica documentos obrigatórios
    const userDocNames = user.documents.map(doc => doc.name);
    const hasAllDocuments = REQUIRED_DOCUMENTS.every(doc =>
      userDocNames.includes(doc)
    );

    // Valida documentos faltantes
    if (!hasAllDocuments) {
      throw new Error(
        `Documentos obrigatórios faltando: ${REQUIRED_DOCUMENTS.join(', ')}`
      );
    }

    // Atualiza apenas de user para premium
    if (user.role === 'user') {
      user.role = 'premium';
      await user.save();
    }

    return user;
  }

  /**
   * Atualiza documentos do usuário
   * @param {string} uid - ID do usuário
   * @param {Array} files - Arquivos enviados
   * @returns {Promise<Object>} Usuário atualizado
   */
  async updateUserDocuments(uid, files) {
    // Valida existência de arquivos
    if (!files?.length) {
      throw new Error('Nenhum arquivo fornecido');
    }

    // Busca usuário
    const user = await UserModel.findById(uid);
    if (!user) throw new Error('Usuário não encontrado');

    // Processa documentos válidos
    const validDocuments = files.map(file => ({
      name: file.originalname,
      reference: `/assets/documents/${file.filename}`, // Caminho seguro
      type: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    }));

    // Adiciona documentos ao usuário
    user.documents.push(...validDocuments);
    await user.save();
    return user;
  }

  /**
   * Garante que usuário tenha um carrinho associado
   * @param {string} userId - ID do usuário
   * @returns {Promise<string>} ID do carrinho
   */
  async ensureCartForUser(userId) {
    // Busca usuário
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    // Retorna carrinho existente
    if (user.cartId) {
      return user.cartId;
    }

    // Cria novo carrinho se não existir
    const newCart = await CartModel.create({ user: userId, products: [] });

    // Associa ao usuário
    user.cartId = newCart._id;
    await user.save();

    return newCart._id;
  }
}

// Exporta instância singleton
export default new UserService();