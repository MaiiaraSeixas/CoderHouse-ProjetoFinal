// src/repositories/product.repository.js
import { ProductDAO } from '../daos/mongo/product.dao.js';  // Importa o DAO de produtos
import ProductDTO from '../dtos/ProductDTO.js';             // Importa o DTO (Data Transfer Object) para produtos

// Classe que implementa o padrão Repository para produtos
export default class ProductRepository {
  constructor() {
    // Instancia o DAO de produtos para interação direta com o banco de dados
    this.productDAO = new ProductDAO();
  }

  // Obtém produtos paginados com filtros e opções
  async get(query, options) {
    // Usa o DAO para buscar produtos com paginação
    const result = await this.productDAO.find(query, options);
    
    // Converte cada documento de produto para DTO
    result.docs = result.docs.map(product => new ProductDTO(product));
    
    return result;  // Retorna o objeto paginado com docs convertidos
  }

  // Obtém um único produto pelo ID
  async getById(id) {
    // Busca o produto usando o DAO
    const product = await this.productDAO.findById(id);
    // Se encontrado, retorna como DTO; caso contrário null
    return product ? new ProductDTO(product) : null;
  }

  // Cria um novo produto
  async create(data) {
    // Usa o DAO para persistir o novo produto
    const newProduct = await this.productDAO.create(data);
    // Retorna o produto criado convertido para DTO
    return new ProductDTO(newProduct);
  }

  // Atualiza um produto existente
  async update(id, data) {
    // Chama o método de atualização do DAO
    const updatedProduct = await this.productDAO.update(id, data);
    // Se encontrado, retorna como DTO; caso contrário null
    return updatedProduct ? new ProductDTO(updatedProduct) : null;
  }

  // Exclui um produto permanentemente
  async delete(id) {
    // Delega a operação de exclusão ao DAO
    return await this.productDAO.delete(id);
  }
}