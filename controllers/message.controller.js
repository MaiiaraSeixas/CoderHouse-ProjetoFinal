// controllers/message.controller.js

import MessageService from '../services/message.service.js';

// Controlador para obter todas as mensagens
export const getAllMessages = async (req, res) => {
  try {
    // Chama o serviço para buscar todas as mensagens
    const messages = await MessageService.getAllMessages();
    
    // Retorna as mensagens com formato padronizado de sucesso
    res.sendSuccessPayload(messages);
  } catch (error) {
    // Em caso de erro, retorna resposta de erro com mensagem detalhada
    res.sendError(`Erro ao buscar mensagens: ${error.message}`, 500);
  }
};

// Controlador para obter uma mensagem específica por ID
export const getMessageById = async (req, res) => {
  try {
    // Extrai o ID dos parâmetros da URL
    const messageId = req.params.id;
    
    // Chama o serviço para buscar a mensagem pelo ID
    const message = await MessageService.getMessageById(messageId);
    
    // Verifica se a mensagem foi encontrada
    if (!message) {
      return res.sendError('Mensagem não encontrada', 404);
    }
    
    // Retorna a mensagem encontrada
    res.sendSuccessPayload(message);
  } catch (error) {
    // Trata erros na busca
    res.sendError(`Erro ao buscar mensagem: ${error.message}`, 500);
  }
};

// Controlador para criar uma nova mensagem
export const createMessage = async (req, res) => {
  try {
    // Cria nova mensagem usando dados do corpo da requisição
    const newMessage = await MessageService.createMessage(req.body);
    
    // Retorna a mensagem criada com status 201 (Created)
    res.sendSuccessPayload(newMessage);
  } catch (error) {
    // Trata erros na criação
    res.sendError(`Erro ao criar mensagem: ${error.message}`, 500);
  }
};

// Controlador para excluir uma mensagem
export const deleteMessage = async (req, res) => {
  try {
    // Extrai o ID dos parâmetros da URL
    const messageId = req.params.id;
    
    // Chama o serviço para excluir a mensagem
    const result = await MessageService.deleteMessage(messageId);
    
    // Verifica se a mensagem foi encontrada e excluída
    if (!result) {
      return res.sendError('Mensagem não encontrada para exclusão', 404);
    }
    
    // Retorna mensagem de sucesso sem conteúdo adicional
    res.sendSuccess({ message: 'Mensagem deletada com sucesso' });
  } catch (error) {
    // Trata erros na exclusão
    res.sendError(`Erro ao deletar mensagem: ${error.message}`, 500);
  }
};