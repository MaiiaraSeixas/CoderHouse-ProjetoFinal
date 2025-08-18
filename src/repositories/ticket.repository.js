// src/repositories/ticket.repository.js
import { TicketDAO } from '../daos/mongo/ticket.dao.js';  // Importa o DAO de tickets
import TicketDTO from '../dtos/TicketDTO.js';             // Importa o DTO (Data Transfer Object) para tickets

// Classe que implementa o padrão Repository para tickets
export default class TicketRepository {
  constructor() {
    // Instancia o DAO de tickets para interação com o banco de dados
    this.ticketDAO = new TicketDAO();
  }

  // Obtém um ticket pelo ID
  async getTicketById(id) {
    // Busca o ticket usando o método do DAO
    const ticket = await this.ticketDAO.findTicketById(id);
    // Se encontrado, converte para DTO; caso contrário retorna null
    return ticket ? new TicketDTO(ticket) : null;
  }

  // Obtém um ticket pelo código único
  async getTicketByCode(code) {
    // Usa o método especializado do DAO para buscar por código
    const ticket = await this.ticketDAO.findTicketByCode(code);
    // Converte para DTO se encontrado, senão retorna null
    return ticket ? new TicketDTO(ticket) : null;
  }

  // Cria um novo ticket
  async createTicket(data) {
    // Persiste o novo ticket no banco usando o DAO
    const newTicket = await this.ticketDAO.createTicket(data);
    // Retorna o ticket criado convertido para DTO
    return new TicketDTO(newTicket);
  }
}