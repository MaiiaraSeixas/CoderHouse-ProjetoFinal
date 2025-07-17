// src/controllers/products.controller.js

import { productService } from '../services/products.service.js';
import CustomError from '../utils/errors/CustomError.js';
import  EErrors  from '../utils/errors/errorDictionary.js';
import { generateProductErrorInfo } from '../utils/errors/info.js';

class ProductsController {
    // Controlador para obter todos os produtos com paginação e query
    async getProducts(req, res, next) {
        try {
            const result = await productService.getProducts(req.query);
            res.status(200).json({
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.prevLink,
                nextLink: result.nextLink
            });
        } catch (error) {
            req.logger.error(`Erro ao buscar produtos: ${error.message}`);
            next(error);
        }
    }

    // Controlador para obter um produto específico por ID
    async getProductById(req, res, next) {
        try {
            const { pid } = req.params;
            const product = await productService.getProductById(pid);

            if (!product) {
                return res.status(404).json({ status: 'error', error: 'Produto não encontrado' });
            }
            res.status(200).json({ status: 'success', payload: product });
        } catch (error) {
            req.logger.error(`Erro ao buscar produto por ID: ${error.message}`);
            next(error);
        }
    }

    // Controlador para criar um novo produto
    async createProduct(req, res, next) {
        try {
            const { title, description, code, price, stock, category } = req.body;

            if (!title || !description || !code || !price || !stock || !category) {
                CustomError.createError({
                    name: 'Product Creation Error',
                    cause: generateProductErrorInfo({ title, description, code, price, stock, category }),
                    message: 'Erro ao tentar criar um produto. Dados incompletos.',
                    code: EErrors.PRODUCT_CREATION_ERROR
                });
            }

            const newProductData = {
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails: req.body.thumbnails || []
            };

            const newProduct = await productService.addProduct(newProductData);
            res.status(201).json({ status: 'success', payload: newProduct });
        } catch (error) {
            next(error);
        }
    }

    // Controlador para atualizar um produto existente
    async updateProduct(req, res, next) {
        try {
            const { pid } = req.params;
            const updatedProduct = await productService.updateProduct(pid, req.body);

            if (!updatedProduct) {
                return res.status(404).json({ status: 'error', error: 'Produto não encontrado para atualizar' });
            }
            res.status(200).json({ status: 'success', payload: updatedProduct });
        } catch (error) {
            req.logger.error(`Erro ao atualizar produto: ${error.message}`);
            next(error);
        }
    }

    // Controlador para excluir um produto
    async deleteProduct(req, res, next) {
        try {
            const { pid } = req.params;
            const result = await productService.deleteProduct(pid);

            if (!result) {
                return res.status(404).json({ status: 'error', error: 'Produto não encontrado para deletar' });
            }
            res.status(200).json({ status: 'success', message: 'Produto deletado com sucesso' });
        } catch (error) {
            req.logger.error(`Erro ao deletar produto: ${error.message}`);
            next(error);
        }
    }
}

export const productsController = new ProductsController();





// // controllers/products.controller.js

// import {productService} from '../services/products.service.js';
// import CustomError from '../utils/errors/CustomError.js';
// import EErrors from '../utils/errors/errorDictionary.js';
// import { generateProductErrorInfo } from '../utils/errors/info.js';



// // Controlador para obter todos os produtos
// export const getAllProducts = async (req, res) => {
//   try {
//     // Chama o serviço para buscar todos os produtos
//     const products = await productService.getProducts();
    
//     // Retorna os produtos com status 200 (OK)
//     res.sendSuccess({ products });
//   } catch (error) {
//     // Log do erro e resposta de erro genérico
//     req.logger.error(error);
//     res.sendError('Erro ao buscar produtos', 500);
//   }
// };

// // Controlador para obter um produto específico por ID
// export const getProductById = async (req, res) => {
//   try {
//     // Extrai o ID dos parâmetros da URL
//     const { id } = req.params;
    
//     // Chama o serviço para buscar o produto pelo ID
//     const product = await productService.getProductById(id);
    
//     // Verifica se o produto foi encontrado
//     if (!product) return res.sendError('Produto não encontrado', 404);
    
//     // Retorna o produto encontrado
//     res.sendSuccess({ product });
//   } catch (error) {
//     // Log do erro e resposta de erro
//     req.logger.error(error);
//     res.sendError('Erro ao buscar produto', 500);
//   }
// };

// // Controlador `createProduct` modificado
// // A assinatura da função agora inclui `next`, que é usado para passar
// // o controle para o próximo middleware na cadeia (neste caso, o nosso errorHandler).
// export const createProduct = async (req, res, next) => {
//   try {
//     const { title, description, code, price, stock, category } = req.body;

//     // 2.1: Bloco de Validação
//     // Verificamos se algum dos campos obrigatórios está faltando.
//     if (!title || !description || !code || !price || !stock || !category) {
//         // 2.2: Lançando o Erro Personalizado
//         // Se a validação falhar, em vez de um `res.send()`, nós usamos
//         // `CustomError.createError()` para construir e lançar um erro estruturado.
//         // O `throw` irá parar a execução aqui e o `catch` abaixo irá capturá-lo.
//         CustomError.createError({
//             name: "Product Creation Error",
//             cause: generateProductErrorInfo({ title, description, code, price, stock, category }),
//             message: "Erro ao tentar criar um produto. Dados incompletos.",
//             code: EErrors.PRODUCT_CREATION_ERROR
//         });
//     }

//     // Se a validação passar, o código continua normalmente.
//     const newProductData = { title, description, code, price, stock, category, thumbnails: req.body.thumbnails || [] };
//     const newProduct = await productService.addProduct(newProductData);
    
//     res.status(201).send({ status: 'success', payload: { product: newProduct } });
//   } catch (error) {
//     // 2.3: Captura e Encaminhamento do Erro
//     // Qualquer erro lançado no bloco `try` (seja o nosso erro personalizado ou um
//     // erro do banco de dados) será capturado aqui. `next(error)` então passa
//     // esse objeto de erro diretamente para o nosso `errorHandler`.
//     next(error);
//   }
// };

// // Controlador para atualizar um produto existente
// export const updateProduct = async (req, res) => {
//   try {
//     // Extrai o ID dos parâmetros da URL
//     const { id } = req.params;
    
//     // Chama o serviço para atualizar o produto com os dados do corpo
//     const updatedProduct = await productService.updateProduct(id, req.body);
    
//     // Verifica se o produto foi encontrado e atualizado
//     if (!updatedProduct) return res.sendError('Produto não encontrado', 404);
    
//     // Retorna o produto atualizado
//     res.sendSuccess({ product: updatedProduct });
//   } catch (error) {
//     // Log do erro e resposta de erro
//     req.logger.error(error);
//     res.sendError('Erro ao atualizar produto', 500);
//   }
// };

// // Controlador para excluir um produto
// export const deleteProduct = async (req, res) => {
//   try {
//     // Extrai o ID dos parâmetros da URL
//     const { id } = req.params;
    
//     // Chama o serviço para excluir o produto
//     const deleted = await productService.deleteProduct(id);
    
//     // Verifica se o produto foi encontrado e excluído
//     if (!deleted) return res.sendError('Produto não encontrado', 404);
    
//     // Retorna mensagem de sucesso
//     res.sendSuccess({ message: 'Produto deletado com sucesso' });
//   } catch (error) {
//     // Log do erro e resposta de erro
//     req.logger.error(error);
//     res.sendError('Erro ao deletar produto', 500);
//   }
// };