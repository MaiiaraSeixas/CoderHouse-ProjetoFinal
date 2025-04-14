import ProductModel from '../models/product.model.js';

export class ProductManagerMongo {
  async getAll(limit) {
    const products = await ProductModel.find().limit(limit || 0);
    return products;
  }

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async createProduct(data) {
    return await ProductModel.create(data);
  }

  async updateProduct(id, updateData) {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProduct(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
