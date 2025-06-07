// controllers/tickets.controller.js

import ticketService from '../../services/ticket.service.js';

// Controlador para criar um novo ticket
export const createTicket = async (req, res) => {
  try {
    // Extrai dados do corpo da requisição
    const { code, purchase_datetime, amount, purchaser } = req.body;
    
    // Chama o serviço para criar o ticket com os dados fornecidos
    const ticket = await ticketService.createTicket({ 
      code, 
      purchase_datetime, 
      amount, 
      purchaser 
    });
    
    // Retorna o ticket criado com status 201 (Created)
    res.sendSuccess({ ticket });
  } catch (error) {
    // Log do erro e resposta de erro genérico
    req.logger.error(error);
    res.sendError('Erro ao criar ticket', 500);
  }
};

// Controlador para obter um ticket específico por ID
export const getTicketById = async (req, res) => {
  try {
    // Extrai o ID do ticket (tid) dos parâmetros da URL
    const { tid } = req.params;
    
    // Busca o ticket pelo ID usando o serviço
    const ticket = await ticketService.getTicketById(tid);
    
    // Verifica se o ticket foi encontrado
    if (!ticket) return res.sendError('Ticket não encontrado', 404);
    
    // Retorna o ticket encontrado
    res.sendSuccess({ ticket });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao buscar ticket', 500);
  }
};