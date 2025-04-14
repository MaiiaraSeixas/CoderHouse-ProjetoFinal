import ProductModel from '../models/Product.js';

export default class ProductManager {
  async addProduct(productData) {
    const { title, description, code, price, stock, category, thumbnails } = productData;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      throw new Error("Campos obrigatórios ausentes");
    }

    const existing = await ProductModel.findOne({ code });
    if (existing) {
      throw new Error("Código do produto já existe");
    }

    const product = await ProductModel.create({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
      status: true
    });

    return product;
  }

  async getProducts() {
    return await ProductModel.find();
  }

  async getProductById(id) {
    return await ProductModel.findById(id);
  }

  async updateProduct(id, updatedFields) {
    if ('id' in updatedFields) delete updatedFields.id;
    const updated = await ProductModel.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!updated) throw new Error("Produto não encontrado");
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Produto não encontrado");
    return deleted;
  }
}
