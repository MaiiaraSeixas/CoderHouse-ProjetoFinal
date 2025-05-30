// controllers/products.controller.js

import productService from '../services/products.service.js';

// Controlador para obter todos os produtos
export const getAllProducts = async (req, res) => {
  try {
    // Chama o serviço para buscar todos os produtos
    const products = await productService.getAllProducts();
    
    // Retorna os produtos com status 200 (OK)
    res.sendSuccess({ products });
  } catch (error) {
    // Log do erro e resposta de erro genérico
    req.logger.error(error);
    res.sendError('Erro ao buscar produtos', 500);
  }
};

// Controlador para obter um produto específico por ID
export const getProductById = async (req, res) => {
  try {
    // Extrai o ID dos parâmetros da URL
    const { id } = req.params;
    
    // Chama o serviço para buscar o produto pelo ID
    const product = await productService.getProductById(id);
    
    // Verifica se o produto foi encontrado
    if (!product) return res.sendError('Produto não encontrado', 404);
    
    // Retorna o produto encontrado
    res.sendSuccess({ product });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao buscar produto', 500);
  }
};

// Controlador para criar um novo produto
export const createProduct = async (req, res) => {
  try {
    // Chama o serviço para criar um novo produto com os dados do corpo da requisição
    const newProduct = await productService.createProduct(req.body);
    
    // Retorna o novo produto criado com status 201 (Created)
    res.sendSuccess({ product: newProduct });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao criar produto', 500);
  }
};

// Controlador para atualizar um produto existente
export const updateProduct = async (req, res) => {
  try {
    // Extrai o ID dos parâmetros da URL
    const { id } = req.params;
    
    // Chama o serviço para atualizar o produto com os dados do corpo
    const updatedProduct = await productService.updateProduct(id, req.body);
    
    // Verifica se o produto foi encontrado e atualizado
    if (!updatedProduct) return res.sendError('Produto não encontrado', 404);
    
    // Retorna o produto atualizado
    res.sendSuccess({ product: updatedProduct });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao atualizar produto', 500);
  }
};

// Controlador para excluir um produto
export const deleteProduct = async (req, res) => {
  try {
    // Extrai o ID dos parâmetros da URL
    const { id } = req.params;
    
    // Chama o serviço para excluir o produto
    const deleted = await productService.deleteProduct(id);
    
    // Verifica se o produto foi encontrado e excluído
    if (!deleted) return res.sendError('Produto não encontrado', 404);
    
    // Retorna mensagem de sucesso
    res.sendSuccess({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    // Log do erro e resposta de erro
    req.logger.error(error);
    res.sendError('Erro ao deletar produto', 500);
  }
};