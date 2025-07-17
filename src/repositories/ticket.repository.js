import ticketDAO from '../daos/mongo/ticket.dao.js';
import TicketDTO from '../dtos/TicketDTO.js';

export default class TicketRepository {
  async create(ticketData) {
    const ticket = await ticketDAO.create(ticketData);
    return new TicketDTO(ticket);
  }

  async getByCode(code) {
    return await ticketDAO.getByCode(code);
  }
}
