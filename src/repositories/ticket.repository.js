import ticketDAO from '../daos/mongo/ticket.dao.js';
import TicketDTO from '../dtos/TicketDTO.js';

export default class TicketRepository {
  constructor() {
    // Inicializa o DAO para operações com tickets
    this.ticketDAO = ticketDAO;
  }

  /**
   * Busca um ticket pelo ID
   * @param {string} id - ID do ticket
   * @returns {TicketDTO|null} - Ticket convertido para DTO ou null se não encontrado
   */
  async getById(id) {
    const ticket = await this.ticketDAO.findById(id);
    // Retorna DTO se encontrado, caso contrário null
    return ticket ? new TicketDTO(ticket) : null;
  }

  /**
   * Busca um ticket pelo código único
   * @param {string} code - Código do ticket
   * @returns {TicketDTO|null} - Ticket convertido para DTO ou null se não encontrado
   */
  async getByCode(code) {
    const ticket = await this.ticketDAO.findByCode(code);
    return ticket ? new TicketDTO(ticket) : null;
  }

  /**
   * Cria um novo ticket
   * @param {Object} data - Dados do ticket (ex: amount, purchaser, products)
   * @returns {TicketDTO} - Novo ticket convertido para DTO
   */
  async create(data) {
    /**
     * O DAO já gera automaticamente:
     * - _id: Identificador único
     * - code: Código único gerado automaticamente
     * - purchase_datetime: Data/hora atual da compra
     */
    const newTicket = await this.ticketDAO.create(data);
    return new TicketDTO(newTicket);
  }
}