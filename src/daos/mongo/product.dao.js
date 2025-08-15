// src/daos/mongo/product.dao.js
import ProductModel from '../../models/product.model.js';

// Classe Data Access Object (DAO) para operações com produtos
export class ProductDAO {

  // Busca produtos com paginação e filtros
  async find(query, options) {
    // Utiliza o método paginate do plugin mongoose-paginate-v2
    // query: filtros de busca (ex: { category: 'eletrônicos' })
    // options: opções de paginação (ex: { page: 1, limit: 10, sort: { price: -1 } })
    return await ProductModel.paginate(query, options);
  }

  // Busca um único produto pelo ID
  async findById(id) {
    // Retorna o produto como objeto JavaScript puro (sem métodos do Mongoose)
    return await ProductModel.findById(id).lean();
  }

  // Cria um novo produto no banco de dados
  async create(productData) {
    // Cria uma nova instância do modelo com os dados recebidos
    const newProduct = new ProductModel(productData);
    // Persiste o novo produto no banco e retorna o resultado
    return await newProduct.save();
  }

  // Atualiza um produto existente
  async update(id, productData) {
    // Busca e atualiza o produto em uma única operação atômica
    return await ProductModel.findByIdAndUpdate(
      id,         // ID do produto a ser atualizado
      productData,// Novos dados do produto
      { new: true } // Opção para retornar o documento ATUALIZADO
    ).lean();     // Retorna como objeto simples
  }

  // Exclui um produto do banco de dados
  async delete(id) {
    // Remove o documento correspondente ao ID
    return await ProductModel.findByIdAndDelete(id);
  }
}