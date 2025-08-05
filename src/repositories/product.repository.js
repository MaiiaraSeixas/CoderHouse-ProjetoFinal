// src/repositories/product.repository.js

import ProductModel from '../models/product.model.js';
import mongoose from 'mongoose';

class ProductRepository {
  constructor() {
    // O repositório agora depende diretamente do Model.
    this.model = ProductModel;
  }

  // Método para buscar produtos com suporte a paginação, ordenação e filtro por categoria
  async getProducts(params) {
    const { limit = 10, page = 1, sort, query } = params;
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true
    };

    if (sort) {
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    const filter = query ? { category: query } : {};

    // A chamada ao 'paginate' do Mongoose irá funcionar corretamente.
    return await this.model.paginate(filter, options);
  }

  // Método para buscar um produto específico pelo ID
  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID de produto inválido');
    }
    return await this.model.findById(id);
  }

  // Método para adicionar um novo produto ao banco
  async addProduct(productData) {
    return await this.model.create(productData);
  }

  // Método para atualizar um produto existente com base no ID
  async updateProduct(id, productData) {
    return await this.model.findByIdAndUpdate(id, productData, { new: true });
  }

  // Método para deletar um produto com base no ID
  async deleteProduct(id) {
    return await this.model.findByIdAndDelete(id);
  }

  // NOVO MÉTODO ADICIONADO AQUI
  // Método para atualizar o estoque de um produto específico
  // identificado por `id`, com o novo valor `newStock`
  async updateProductStock(id, newStock) {
    return await this.model.findByIdAndUpdate(id, { $set: { stock: newStock } }, { new: true });
  }
}

export const productRepository = new ProductRepository();

