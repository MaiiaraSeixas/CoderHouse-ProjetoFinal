// services/products.service.js

// Importa o repositório de produtos, que contém os métodos para acessar e manipular os dados do banco de dados
import { productRepository } from "../repositories/product.repository.js";

// Define a classe ProductService, que atua como uma camada de serviço entre os controladores e o repositório
class ProductService {
    // Construtor da classe: inicializa o atributo `repository` com o repositório de produtos
    constructor() {
        this.repository = productRepository;
    }

    // Método assíncrono para obter a lista de produtos, possivelmente com filtros e paginação (definidos em `params`)
    async getProducts(params) {
        return await this.repository.getProducts(params);
    }

    // Método assíncrono para obter um único produto pelo seu ID
    async getProductById(id) {
        return await this.repository.getProductById(id);
    }

    // Método assíncrono para adicionar um novo produto ao banco de dados
    async addProduct(product) {
        return await this.repository.addProduct(product);
    }

    // Método assíncrono para atualizar um produto existente, identificado por `id`, com os dados novos `productData`
    async updateProduct(id, productData) {
        return await this.repository.updateProduct(id, productData);
    }

    // Método assíncrono para remover um produto do banco de dados com base no seu ID
    async deleteProduct(id) {
        return await this.repository.deleteProduct(id);
    }
}

// Cria uma instância única da classe ProductService e a exporta para ser usada em outras partes da aplicação
export const productService = new ProductService();
// O código acima define um serviço de produtos que permite buscar, adicionar, atualizar e deletar produtos no banco de dados usando o repositório de produtos.
// Isso encapsula a lógica de negócios relacionada aos produtos, mantendo o código organizado e modular.



