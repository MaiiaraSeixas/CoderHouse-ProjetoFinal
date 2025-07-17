// src/repositories/product.repository.js

import ProductModel from '../models/product.model.js';

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
    return await this.model.findById(id).lean();
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
}

export const productRepository = new ProductRepository();



// import productDAO from '../daos/mongo/product.dao.js';

// // src/repositories/product.repository.js
// export default class ProductRepository {
//   constructor(dao) {
//     this.dao = dao;
//   }

//   async paginate(query, options) {
//     return await this.dao.paginate(query, options);
//   }

//   async getById(id) {
//     return await this.dao.getById(id);
//   }

//   async create(data) {
//     return await this.dao.create(data);
//   }

//   async update(id, data) {
//     return await this.dao.update(id, data);
//   }

//   async delete(id) {
//     return await this.dao.delete(id);
//   }

//   async getAll() {
//     return await this.dao.getAll(); // opcional: mantém compatibilidade com DAOs que oferecem isso
//   }
// }

