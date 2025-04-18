import ProductModel from '../models/product.model.js';
import mongoosePaginate from 'mongoose-paginate-v2';

// Ativa o plugin de paginação no schema do Mongoose

export class ProductManagerMongo {
  async paginateProducts(filter, options) {
    const result = await ProductModel.paginate(filter, options);

    if (options.page > result.totalPages && result.totalPages !== 0) {
      return {
        ...result,
        docs: [],
        page: options.page,
        hasPrevPage: true,
        hasNextPage: false,
        prevPage: result.totalPages,
        nextPage: null,
        prevLink: `/api/products?page=${result.totalPages}&limit=${options.limit}`,
        nextLink: null
      };
    }

    return result;
  }

// Buscar por ID
async getById(id) {
    return await ProductModel.findById(id);
  }

  // Criar novo produto
  async createProduct(product) {
    return await ProductModel.create(product);
  }

  // Atualizar produto por ID
  async updateProduct(id, data) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Deletar produto por ID
  async deleteProduct(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
