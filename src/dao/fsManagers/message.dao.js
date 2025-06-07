// dao/message.dao.js

import MessageModel from '../../models/Message.js';

class MessageDAO {
  // Obtém todas as mensagens do banco de dados
  async getMessages() {
    try {
      // Busca todas as mensagens sem filtros
      // .lean() retorna objetos JavaScript simples (mais leve)
      return await MessageModel.find().lean();
    } catch (error) {
      // Captura erros e lança exceção com mensagem contextualizada
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }
  }

  // Obtém uma mensagem específica pelo ID
  async getMessageById(id) {
    try {
      // Busca mensagem pelo ID usando método do Mongoose
      return await MessageModel.findById(id).lean();
    } catch (error) {
      // Trata possíveis erros na busca (ex: ID inválido)
      throw new Error(`Erro ao buscar mensagem por ID: ${error.message}`);
    }
  }

  // Cria uma nova mensagem no banco de dados
  async createMessage(messageData) {
    try {
      // Insere nova mensagem usando os dados fornecidos
      return await MessageModel.create(messageData);
    } catch (error) {
      // Captura erros de validação ou conexão
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }
  }

  // Exclui uma mensagem pelo ID
  async deleteMessageById(id) {
    try {
      // Remove a mensagem usando operação atômica
      return await MessageModel.findByIdAndDelete(id);
    } catch (error) {
      // Trata erros durante exclusão
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }
  }
}

// Exporta instância única do DAO (Singleton)
export default new MessageDAO();
