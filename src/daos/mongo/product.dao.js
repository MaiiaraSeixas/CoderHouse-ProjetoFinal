import ProductModel from '../../models/product.model.js';

class ProductDAO {
  // Busca produtos com paginação, filtros e opções
  async find(query, options) {
    // Utiliza o plugin mongoose-paginate-v2 para paginação avançada
    return await ProductModel.paginate(query, options);
  }

  // Busca um produto específico pelo ID
  async findById(id) {
    // Retorna objeto JavaScript simples (sem métodos Mongoose)
    return await ProductModel.findById(id).lean();
  }

  // Cria um novo produto no banco de dados
  async create(productData) {
    // Cria instância do modelo com os dados recebidos
    const newProduct = new ProductModel(productData);
    // Persiste o novo produto no banco
    return await newProduct.save();
  }

  // Atualiza um produto existente
  async update(id, productData) {
    // Encontra e atualiza o produto, retornando a versão atualizada
    return await ProductModel.findByIdAndUpdate(
      id,
      productData,
      { new: true }  // Retorna o documento atualizado
    ).lean();  // Retorna como objeto simples
  }

  // Remove um produto do sistema
  async delete(id) {
    // Encontra e exclui o documento pelo ID
    return await ProductModel.findByIdAndDelete(id);
  }
}

export default new ProductDAO();