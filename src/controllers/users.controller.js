// controllers/users.controller.js

import userService from '../services/user.service.js';

// Controlador para obter todos os usuários
export const getAllUsers = async (req, res) => {
  try {
    // Chama o serviço para buscar todos os usuários cadastrados
    const users = await userService.getAllUsers();

    // Retorna a lista de usuários
    res.sendSuccess({ users });
  } catch (error) {
    // Log do erro e resposta de erro genérico
    req.logger.error(error);
    res.sendError('Erro ao buscar usuários', 500);
  }
};

// Controlador para obter um usuário específico por ID
export const getUserById = async (req, res) => {
  try {
    // Extrai o ID do usuário dos parâmetros da URL
    const { id } = req.params;

    // Busca o usuário pelo ID usando o serviço
    const user = await userService.getUserById(id);

    // Verifica se o usuário foi encontrado
    if (!user) return res.sendError('Usuário não encontrado', 404);

    // Retorna os dados do usuário
    res.sendSuccess({ user });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao buscar usuário', 500);
  }
};

// Controlador para excluir um usuário
export const deleteUser = async (req, res) => {
  try {
    // Extrai o ID do usuário dos parâmetros da URL
    const { id } = req.params;

    // Chama o serviço para excluir o usuário
    const deleted = await userService.deleteUser(id);

    // Verifica se o usuário foi encontrado e excluído
    if (!deleted) return res.sendError('Usuário não encontrado', 404);

    // Retorna mensagem de sucesso
    res.sendSuccess({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao deletar usuário', 500);
  }
};

// Controlador para upload de documentos
export const uploadDocuments = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userService.updateUserDocuments(uid, req.files);

    res.sendSuccess({ message: 'Documentos enviados com sucesso!', payload: user });
  } catch (error) {
    req.logger.error(error);
    if (error.message === 'Usuário não encontrado' || error.message === 'Nenhum arquivo fornecido') {
      return res.status(400).send({ status: 'error', error: error.message });
    }
    res.sendError('Erro ao fazer upload de documentos', 500);
  }
};

// Controlador para alterar a role do usuário
export const changeUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userService.changeUserRole(uid);
    res.sendSuccess({ message: 'Role do usuário atualizada com sucesso!', payload: { user } });
  } catch (error) {
    req.logger.error(error.message);
    if (error.message.includes('Documentos obrigatórios faltando')) {
      return res.status(400).send({ status: 'error', error: error.message });
    }
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).send({ status: 'error', error: error.message });
    }
    res.sendError('Erro ao alterar a role do usuário', 500);
  }
};