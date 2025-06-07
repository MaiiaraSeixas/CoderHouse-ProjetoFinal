import ProductModel from '../../models/product.model.js';
import mongoosePaginate from 'mongoose-paginate-v2';


export default class ProductManager {
  // Adiciona um novo produto com validações
  async addProduct(productData) {
    const { title, description, code, price, stock, category, thumbnails } = productData;

    // Validação de campos obrigatórios
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      throw new Error("Campos obrigatórios ausentes");
    }

    // Verifica unicidade do código
    const existing = await ProductModel.findOne({ code });
    if (existing) {
      throw new Error("Código do produto já existe");
    }

    // Criação do produto com tratamento de thumbnails
    const product = await ProductModel.create({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [], // Garante array válido
      status: true // Status ativo por padrão
    });

    return product;
  }

  // Obtém todos os produtos (pode ser melhorado com paginação)
  async getProducts() {
    return await ProductModel.find(); // Retorna todos os documentos
  }

  // Obtém produto por ID
  async getProductById(id) {
    return await ProductModel.findById(id); // Retorna null se não encontrar
  }

  // Atualiza produto com segurança
  async updateProduct(id, updatedFields) {
    if ('id' in updatedFields) delete updatedFields.id; // Previne atualização do ID

    // Atualização otimista com retorno do novo documento
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true } // Retorna o documento atualizado
    );

    if (!updated) throw new Error("Produto não encontrado");
    return updated;
  }

  // Remove produto permanentemente
  async deleteProduct(id) {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Produto não encontrado");
    return deleted;
  }

  // Paginação de produtos com filtros e ordenação
    async paginateProducts(filter = {}, options = {}) {
      return await ProductModel.paginate(filter, options);

  
  }
}

