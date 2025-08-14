import { TicketModel } from '../../models/ticket.model.js';

class TicketDAO {
  // Busca um ticket pelo ID, retornando um objeto simples (lean)
  async findById(id) {
    return await TicketModel.findById(id).lean();
  }

  // Busca um ticket pelo seu código único
  async findByCode(code) {
    return await TicketModel.findOne({ code }).lean();
  }

  // Cria um novo ticket de compra
  async create(ticketData) {
    /**
     * O modelo de Ticket já define automaticamente:
     * - _id: Identificador único (ObjectId)
     * - code: Código único gerado automaticamente
     * - purchase_datetime: Data/hora atual da compra
     */
    const newTicket = new TicketModel(ticketData);
    return await newTicket.save();
  }

  /**
   * Atualiza um ticket existente
   * NOTA: Tickets normalmente são imutáveis após criação
   * (Mantido para completar a interface DAO)
   */
  async update(id, ticketData) {
    return await TicketModel.findByIdAndUpdate(
      id,
      ticketData,
      { new: true }  // Retorna a versão atualizada do documento
    ).lean();
  }

  /**
   * Exclui um ticket do sistema
   * NOTA: Normalmente tickets não são deletados (para manter histórico)
   * (Mantido para completar a interface DAO)
   */
  async delete(id) {
    return await TicketModel.findByIdAndDelete(id);
  }
}

export default new TicketDAO();