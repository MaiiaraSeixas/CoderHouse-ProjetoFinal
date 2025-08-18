// src/services/ticket.service.js

import TicketRepository from '../repositories/ticket.repository.js';

/**
 * Serviço de Gerenciamento de Tickets
 * 
 * Responsável por operações relacionadas a tickets de compra:
 * - Criação de novos tickets
 * - Recuperação de tickets por ID ou código
 * - Integração com o repositório de tickets
 */
class TicketService {
	constructor() {
		// Inicializa o repositório de tickets
		this.ticketRepository = new TicketRepository();
	}

	/**
	 * Cria um novo ticket de compra
	 * @param {string} purchaser - Email do comprador
	 * @param {number} amount - Valor total da compra
	 * @returns {Promise<Object>} Ticket criado
	 */
	async createTicket(purchaser, amount) {
		// Monta objeto com dados do ticket
		const ticketData = {
			purchaser: purchaser,
			amount: amount,
			// O código será gerado automaticamente pelo repositório
		};

		// Delega criação ao repositório
		return await this.ticketRepository.createTicket(ticketData);
	}

	/**
	 * Busca um ticket pelo seu ID
	 * @param {string} id - ID do ticket
	 * @returns {Promise<Object|null>} Ticket encontrado ou null
	 */
	async getTicketById(id) {
		return await this.ticketRepository.getTicketById(id);
	}

	/**
	 * Busca um ticket pelo código único
	 * @param {string} code - Código do ticket
	 * @returns {Promise<Object|null>} Ticket encontrado ou null
	 */
	async getTicketByCode(code) {
		return await this.ticketRepository.getTicketByCode(code);
	}
}

// Exporta instância singleton do serviço
export default new TicketService();