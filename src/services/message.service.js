// services/message.service.js

import MessageDAO from '../../dao/message.dao.js';

class MessageService {
  // Obtém todas as mensagens
  async getAllMessages() {
    // Delega a operação para o DAO (Data Access Object)
    // Retorna todas as mensagens do sistema
    return await MessageDAO.getMessages();
  }

  // Obtém uma mensagem específica pelo ID
  async getMessageById(id) {
    // Busca uma mensagem pelo seu ID único
    // Encaminha a requisição para a camada de acesso a dados
    return await MessageDAO.getMessageById(id);
  }

  // Cria uma nova mensagem
  async createMessage(data) {
    // Recebe dados da mensagem e repassa para o DAO
    // Exemplo de dados: { user: 'userId', message: 'texto' }
    return await MessageDAO.createMessage(data);
  }

  // Exclui uma mensagem
  async deleteMessage(id) {
    // Remove uma mensagem pelo seu ID
    // Delega a operação de exclusão para o DAO
    return await MessageDAO.deleteMessageById(id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export default new MessageService();