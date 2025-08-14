import productDAO from '../daos/mongo/product.dao.js';
import ProductDTO from '../dtos/ProductDTO.js';

export default class ProductRepository {
  constructor() {
    // Inicializa o DAO para operações de banco de dados com produtos
    this.productDAO = productDAO;
  }

  /**
   * Busca produtos com paginação e filtros
   * @param {Object} query - Filtros de consulta (ex: { category: 'eletrônicos' })
   * @param {Object} options - Opções de paginação (page, limit, sort, etc.)
   * @returns {Object} - Resultado paginado com produtos convertidos para DTO
   */
  async get(query, options) {
    // Executa a consulta paginada usando o DAO
    const result = await this.productDAO.find(query, options);

    // Converte cada produto na lista de resultados para DTO
    // Mantém os metadados de paginação (total, limite, página, etc.)
    result.docs = result.docs.map(product => new ProductDTO(product));

    return result;
  }

  /**
   * Busca um produto específico pelo ID
   * @param {string} id - ID do produto
   * @returns {ProductDTO|null} - Produto em DTO ou null se não encontrado
   */
  async getById(id) {
    const product = await this.productDAO.findById(id);
    // Retorna DTO se encontrado, caso contrário null
    return product ? new ProductDTO(product) : null;
  }

  /**
   * Cria um novo produto no sistema
   * @param {Object} data - Dados do novo produto
   * @returns {ProductDTO} - Produto criado convertido para DTO
   */
  async create(data) {
    const newProduct = await this.productDAO.create(data);
    return new ProductDTO(newProduct);
  }

  /**
   * Atualiza um produto existente
   * @param {string} id - ID do produto
   * @param {Object} data - Novos dados do produto
   * @returns {ProductDTO|null} - Produto atualizado em DTO ou null se não existir
   */
  async update(id, data) {
    const updatedProduct = await this.productDAO.update(id, data);
    return updatedProduct ? new ProductDTO(updatedProduct) : null;
  }

  /**
   * Exclui permanentemente um produto
   * @param {string} id - ID do produto
   * @returns {Object} - Resultado da operação de exclusão
   */
  async delete(id) {
    return await this.productDAO.delete(id);
  }
}