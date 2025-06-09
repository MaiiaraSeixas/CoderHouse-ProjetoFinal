// ===== ARQUIVO ATUALIZADO: services/products.service.js =====
// Serviço de produtos refatorado para usar o modelo Mongoose diretamente.

import  ProductModel  from "../models/product.model.js"; // Importa o modelo de Produto

class ProductService {
    // Método para buscar todos os produtos
    async getProducts(params) {
        // Aqui pode ser adicionada lógica de paginação e filtros com base em 'params'
        return await ProductModel.find({});
    }

    // Método para buscar um único produto pelo ID
    async getProductById(id) {
        return await ProductModel.findById(id);
    }

    // Método para adicionar um novo produto
    async addProduct(product) {
        return await ProductModel.create(product);
    }

    // Método para atualizar um produto existente com novos dados
    async updateProduct(id, productData) {
        return await ProductModel.findByIdAndUpdate(id, productData, { new: true });
        // { new: true } garante que o documento retornado seja o atualizado
    }

    // Método para deletar um produto pelo ID
    async deleteProduct(id) {
        return await ProductModel.findByIdAndDelete(id);
    }

    // Novo método para atualizar apenas o estoque do produto
    async updateProductStock(id, newStock) {
        // Reutiliza o método updateProduct passando apenas o campo 'stock'
        return await this.updateProduct(id, { stock: newStock });
    }
}

// Exporta uma instância única da classe ProductService
export const productService = new ProductService();
// O código acima define um serviço de produtos que permite buscar, adicionar, atualizar e deletar produtos no banco de dados usando o modelo Mongoose.
    // Remove o carrinho do banco de dados  