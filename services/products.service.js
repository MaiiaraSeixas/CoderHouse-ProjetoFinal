// services/product.service.js

import ProductModel from '../models/product.model.js';

class ProductService {
  // Obtém todos os produtos com paginação e filtros
  async getAllProducts(limit = 10, page = 1, query = {}, sort = {}) {
    // Usa paginação do Mongoose para resultados escaláveis
    // Parâmetros:
    // - limit: Quantidade de resultados por página (default: 10)
    // - page: Página atual (default: 1)
    // - query: Filtros de busca (ex: { category: 'eletrônicos' })
    // - sort: Ordenação (ex: { price: 1 } para ascendente)
    // - lean: true retorna objetos JavaScript simples
    return await ProductModel.paginate(query, { limit, page, sort, lean: true });
  }

  // Obtém um produto específico pelo ID
  async getProductById(pid) {
    // Busca produto pelo ID no banco de dados
    // .lean() para melhor performance (objeto simples)
    return await ProductModel.findById(pid).lean();
  }

  // Cria um novo produto
  async createProduct(productData) {
    // Insere novo documento no banco com os dados fornecidos
    return await ProductModel.create(productData);
  }

  // Atualiza um produto existente
  async updateProduct(pid, productData) {
    // Atualiza o produto pelo ID com novos dados
    // { new: true } retorna o documento atualizado
    return await ProductModel.findByIdAndUpdate(pid, productData, { new: true });
  }

  // Exclui um produto
  async deleteProduct(pid) {
    // Remove permanentemente o produto do banco
    return await ProductModel.findByIdAndDelete(pid);
  }
}

// Exporta instância única do serviço (Singleton)
export default new ProductService();