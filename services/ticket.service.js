// services/ticket.service.js

import TicketModel from '../models/Ticket.js';

class TicketService {
  // Cria um novo ticket no sistema
  async createTicket(data) {
    // Aceita um objeto com dados do ticket e cria novo documento
    // Exemplo de dados: { code, purchase_datetime, amount, purchaser }
    return await TicketModel.create(data);
  }

  // Obtém um ticket específico pelo ID
  async getTicketById(tid) {
    // Busca ticket pelo ID no banco de dados
    // .lean() retorna objeto JavaScript simples (sem métodos Mongoose)
    return await TicketModel.findById(tid).lean();
  }

  // Obtém todos os tickets do sistema
  async getAllTickets() {
    // Retorna todos os tickets sem filtros
    // .lean() para melhor performance em operações de leitura
    return await TicketModel.find({}).lean();
  }

  // Exclui um ticket pelo ID
  async deleteTicket(tid) {
    // Remove permanentemente o ticket do banco de dados
    // Retorna o ticket excluído ou null se não encontrado
    return await TicketModel.findByIdAndDelete(tid);
  }
}

// Exporta instância única do serviço (Singleton)
export default new TicketService();