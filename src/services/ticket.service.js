// ===== ARQUIVO ATUALIZADO: services/ticket.service.js =====
// Serviço para gerenciar a criação de tickets.

import { TicketModel } from '../models/ticket.model.js'; // Importa o modelo de ticket para interação com o banco

class TicketService {
    // Método responsável por criar um novo ticket
    async createTicket(ticketData) {
        try {
            // Cria o ticket no banco de dados com os dados recebidos
            const ticket = await TicketModel.create(ticketData);
            return ticket; // Retorna o ticket criado
        } catch (error) {
            // Em caso de erro, exibe a mensagem no console e lança uma exceção
            console.error("Erro ao criar o ticket:", error);
            throw new Error("Não foi possível criar o ticket.");
        }
    }
}

// Exporta uma instância única do serviço para ser usada em outras partes da aplicação
export const ticketService = new TicketService();
// O código acima define um serviço para gerenciar tickets, permitindo a criação de novos tickets no banco de dados.
// Ele captura erros durante a criação e os exibe no console, além de lançar uma exceção personalizada.