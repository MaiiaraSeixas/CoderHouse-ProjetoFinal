import ProductRepository from '../repositories/product.repository.js';

class ProductService {
    constructor() {
        // Inicializa o repositório de produtos para operações de dados
        this.productRepository = new ProductRepository();
    }

    /**
     * Obtém produtos paginados e filtrados
     * @param {Object} params - Parâmetros de consulta
     * @param {number} params.limit - Limite de produtos por página (padrão: 10)
     * @param {number} params.page - Página atual (padrão: 1)
     * @param {string} params.sort - Ordenação ('asc' para crescente, 'desc' para decrescente)
     * @param {string} params.query - Categoria para filtrar
     * @returns {Object} - Resultado paginado de produtos
     */
    async getProducts(params) {
        // Extrai parâmetros com valores padrão
        const { limit = 10, page = 1, sort, query } = params;

        // Cria filtro baseado na categoria (se informada)
        const filter = query ? { category: query } : {};

        // Configura opções de paginação e ordenação
        const options = {
            page: Number(page),
            limit: Number(limit),
            lean: true  // Retorna objetos JavaScript simples (melhor performance)
        };

        // Aplica ordenação se solicitado
        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        // Delegar a consulta paginada ao repositório
        return await this.productRepository.get(filter, options);
    }

    /**
     * Obtém um produto específico pelo ID
     * @param {string} id - ID do produto
     * @returns {Object} - Produto encontrado
     */
    async getProductById(id) {
        return await this.productRepository.getById(id);
    }

    /**
     * Adiciona um novo produto ao sistema
     * @param {Object} productData - Dados do novo produto
     * @returns {Object} - Produto criado
     * @throws {Error} - Se campos obrigatórios estiverem faltando
     */
    async addProduct(productData) {
        // Validação de campos obrigatórios
        if (!productData.title || !productData.price) {
            throw new Error("Título e preço são campos obrigatórios.");
        }

        // Lógica adicional pode ser adicionada aqui (ex: validação de categoria)
        return await this.productRepository.create(productData);
    }

    /**
     * Atualiza um produto existente
     * @param {string} id - ID do produto
     * @param {Object} productData - Novos dados do produto
     * @returns {Object} - Produto atualizado
     */
    async updateProduct(id, productData) {
        return await this.productRepository.update(id, productData);
    }

    /**
     * Remove permanentemente um produto
     * @param {string} id - ID do produto
     * @returns {Object} - Resultado da operação
     */
    async deleteProduct(id) {
        return await this.productRepository.delete(id);
    }
}

export default new ProductService();