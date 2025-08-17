// src/daos/mongo/ticket.dao.js
import { TicketModel } from '../../models/ticket.model.js';

// Classe Data Access Object (DAO) para operações com tickets
export class TicketDAO {

  // Busca um ticket pelo ID
  async findTicketById(id) {
    // Retorna o ticket como objeto JavaScript puro (sem métodos do Mongoose)
    return await TicketModel.findById(id).lean();
  }

  // Busca um ticket pelo código (campo único)
  async findTicketByCode(code) {
    // Encontra o primeiro ticket com o código especificado
    return await TicketModel.findOne({ code }).lean();
  }

  // Cria um novo ticket
  async createTicket(ticketData) {
    // Cria uma nova instância do modelo com os dados recebidos
    const newTicket = new TicketModel(ticketData);
    // Persiste o novo ticket no banco e retorna o resultado
    return await newTicket.save();
  }

  // Atualiza um ticket existente
  async updateTicket(id, ticketData) {
    // Atualiza o ticket e retorna a versão atualizada
    return await TicketModel.findByIdAndUpdate(
      id,           // ID do ticket a ser atualizado
      ticketData,   // Novos dados do ticket
      { new: true } // Opção para retornar o documento ATUALIZADO
    ).lean();       // Retorna como objeto simples
  }

  // Exclui um ticket
  async deleteTicket(id) {
    // Remove permanentemente o ticket do banco
    return await TicketModel.findByIdAndDelete(id);
  }
}