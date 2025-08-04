// src/controllers/products.controller.js

// CORREÇÃO: Removemos as chaves {} do import para usar o export default do service.
import { productService } from '../services/products.service.js';
import CustomError from '../utils/errors/CustomError.js';
import EErrors from '../utils/errors/errorDictionary.js';
import { generateProductErrorInfo } from '../utils/errors/info.js';

/**
 * Classe controladora para gerenciar as requisições relacionadas a produtos.
 */
class ProductsController {
	/**
	 * Manipula a requisição para obter a lista de produtos.
	 * Extrai os parâmetros de consulta e chama o serviço correspondente.
	 * @param {Object} req - O objeto de requisição do Express.
	 * @param {Object} res - O objeto de resposta do Express.
	 * @param {Function} next - A função para chamar o próximo middleware (de erro).
	 */


  // CORREÇÃO: Renomeado de 'addProduct' para 'createProduct' para corresponder às rotas.
  async createProduct(req, res, next) {
    try {
      // 2. Adicionar bloco de validação
      const { title, description, code, price, stock, category } = req.body;
      if (!title || !description || !code || !price || !stock || !category) {
        // Se algum campo estiver faltando, lança nosso erro customizado
        CustomError.createError({
          name: 'Erro de Criação de Produto',
          cause: generateProductErrorInfo(req.body),
          message: 'Erro ao tentar criar o produto. Dados incompletos.',
          code: EErrors.PRODUCT_CREATION_ERROR
        });
      }

      const newProduct = await productService.addProduct(req.body);
      res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
      // 3. Passa o erro (seja o nosso customizado ou outro) para o errorHandler
      next(error);
    }
  }

	async getProducts(req, res, next) {
		try {
			// Extrai os parâmetros de consulta da requisição
			const { limit = 10, page = 1, sort, query } = req.query;
			const filter = query ? { category: query } : {};
			const options = {
				limit: parseInt(limit),
				page: parseInt(page),
				sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
				lean: true
			};

			// Chama o serviço para obter os produtos
			const products = await productService.getProducts(filter, options);

			// Envia a resposta com sucesso
			res.status(200).json({ status: 'success', payload: products });
		} catch (error) {
			// Em caso de erro, passa para o middleware de erro
			next(error);
		}
	}

	/**
	 * Manipula a requisição para adicionar um novo produto.
	 * @param {Object} req - O objeto de requisição do Express.
	 * @param {Object} res - O objeto de resposta do Express.
	 * @param {Function} next - A função para chamar o próximo middleware.
	 */
	async addProduct(req, res, next) {
		try {
			// O corpo da requisição contém os dados do novo produto
			const newProduct = await productService.addProduct(req.body);
			res.status(201).json({ status: 'success', payload: newProduct });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Manipula a requisição para obter um produto pelo seu ID.
	 * @param {Object} req - O objeto de requisição do Express.
	 * @param {Object} res - O objeto de resposta do Express.
	 * @param {Function} next - A função para chamar o próximo middleware.
	 */
	async getProductById(req, res, next) {
		try {
			const { pid } = req.params;
			const product = await productService.getProductById(pid);
			res.status(200).json({ status: 'success', payload: product });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Manipula a requisição para atualizar um produto.
	 * @param {Object} req - O objeto de requisição do Express.
	 * @param {Object} res - O objeto de resposta do Express.
	 * @param {Function} next - A função para chamar o próximo middleware.
	 */
	async updateProduct(req, res, next) {
		try {
			const { pid } = req.params;
			const productData = req.body;
			const updatedProduct = await productService.updateProduct(pid, productData);
			res.status(200).json({ status: 'success', payload: updatedProduct });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Manipula a requisição para deletar um produto.
	 * @param {Object} req - O objeto de requisição do Express.
	 * @param {Object} res - O objeto de resposta do Express.
	 * @param {Function} next - A função para chamar o próximo middleware.
	 */
	async deleteProduct(req, res, next) {
		try {
			const { pid } = req.params;
			await productService.deleteProduct(pid);
			res.status(200).json({ status: 'success', message: 'Produto deletado com sucesso.' });
		} catch (error) {
			next(error);
		}
	}
}

// Exporta uma instância da classe para ser usada pelas rotas
export default new ProductsController();
