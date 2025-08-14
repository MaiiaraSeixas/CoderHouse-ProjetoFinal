import TicketRepository from '../repositories/ticket.repository.js';

class TicketService {
    constructor() {
        // Inicializa o repositório de tickets para operações de dados
        this.ticketRepository = new TicketRepository();
    }

    /**
     * Cria um novo ticket de compra
     * @param {string} purchaser - Email do comprador
     * @param {number} amount - Valor total da compra
     * @returns {Object} - Ticket criado
     * 
     * Nota: O código único e data/hora são gerados automaticamente pelo modelo
     */
    async createTicket(purchaser, amount) {
        // Prepara os dados essenciais do ticket
        const ticketData = {
            purchaser: purchaser,
            amount: amount,
        };

        // Delega a criação ao repositório
        return await this.ticketRepository.create(ticketData);
    }

    /**
     * Obtém um ticket pelo ID
     * @param {string} id - ID do ticket
     * @returns {Object|null} - Ticket encontrado ou null
     */
    async getTicketById(id) {
        return await this.ticketRepository.getById(id);
    }

    /**
     * Obtém um ticket pelo código único
     * @param {string} code - Código do ticket
     * @returns {Object|null} - Ticket encontrado ou null
     */
    async getTicketByCode(code) {
        return await this.ticketRepository.getByCode(code);
    }
}

export default new TicketService();