import ProductRepository from '../repositories/product.repository.js';

// Exportamos a CLASSE para que possa ser usada em testes
export class ProductService {
	constructor() {
		// Inicializa o repositório de produtos para operações de dados
		this.productRepository = new ProductRepository();
	}

	/**
	 * Obtém produtos paginados e filtrados
	 * @param {Object} params - Parâmetros de consulta
	 */
	async getProducts(params) {
		const { limit = 10, page = 1, sort, query } = params;
		const filter = query ? { category: query } : {};
		const options = {
			page: Number(page),
			limit: Number(limit),
			lean: true
		};
		if (sort) {
			options.sort = { price: sort === 'asc' ? 1 : -1 };
		}
		return await this.productRepository.get(filter, options);
	}

	/**
	 * Obtém um produto específico pelo ID
	 * @param {string} id - ID do produto
	 */
	async getProductById(id) {
		return await this.productRepository.getById(id);
	}

	/**
	 * Adiciona um novo produto ao sistema
	 * @param {Object} productData - Dados do novo produto
	 */
	async addProduct(productData) {
		if (!productData.title || !productData.price) {
			throw new Error("Título e preço são campos obrigatórios.");
		}
		return await this.productRepository.create(productData);
	}

	/**
	 * Atualiza um produto existente
	 * @param {string} id - ID do produto
	 * @param {Object} productData - Novos dados do produto
	 */
	async updateProduct(id, productData) {
		return await this.productRepository.update(id, productData);
	}

	/**
	 * Remove permanentemente um produto
	 * @param {string} id - ID do produto
	 */
	async deleteProduct(id) {
		return await this.productRepository.delete(id);
	}
}

// Exportamos a INSTÂNCIA como default para a aplicação usar
export default new ProductService();
