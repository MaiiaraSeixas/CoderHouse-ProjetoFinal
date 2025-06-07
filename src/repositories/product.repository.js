import productDAO from '../daos/mongo/product.dao.js';

// src/repositories/product.repository.js
export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async paginate(query, options) {
    return await this.dao.paginate(query, options);
  }

  async getById(id) {
    return await this.dao.getById(id);
  }

  async create(data) {
    return await this.dao.create(data);
  }

  async update(id, data) {
    return await this.dao.update(id, data);
  }

  async delete(id) {
    return await this.dao.delete(id);
  }

  async getAll() {
    return await this.dao.getAll(); // opcional: mantém compatibilidade com DAOs que oferecem isso
  }
}

