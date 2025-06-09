// ===== ARQUIVO ATUALIZADO: controllers/cart.controller.js =====
// Controlador com a nova rota de compra.

import { cartService } from "../services/cart.service.js"; // Importa o serviço de carrinho

class CartController {
    // Controlador para finalizar a compra de um carrinho
    async purchaseCart(req, res, next) {
        try {
            const { cid } = req.params; // Obtém o ID do carrinho da URL
            const { user } = req;       // Obtém o usuário autenticado da requisição

            // Validação básica: verifica se há um usuário e se tem e-mail
            if (!user || !user.email) {
                return res.status(400).send({
                    status: 'error',
                    message: 'Usuário inválido para realizar a compra.'
                });
            }

            // Chama o serviço que processa a compra
            const result = await cartService.purchaseCart(cid, user);

            // Se um ticket foi gerado, a compra foi bem-sucedida
            if (result.ticket) {
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra finalizada com sucesso!',
                    payload: result.ticket, // Dados do ticket gerado
                    productsNotPurchased: result.productsNotPurchased // Lista de produtos não comprados
                });
            } else {
                // Nenhum produto pôde ser comprado
                return res.status(400).send({
                    status: 'error',
                    message: 'Não foi possível processar a compra. Estoque insuficiente para todos os produtos.',
                    productsNotPurchased: result.productsNotPurchased
                });
            }
        } catch (error) {
            console.error("Purchase cart controller error:", error);
            next(error); // Encaminha o erro para o middleware de tratamento de erros
        }
    }

// Cria um novo carrinho
    async createCart(req, res, next) {
        try {
            const newCart = await cartService.createCart();
            res.status(201).send({ status: 'success', payload: newCart });
        } catch (error) {
            next(error);
        }
    }

    // Busca um carrinho pelo ID
    async getCart(req, res, next) {
        try {
            const { cid } = req.params;
            const cart = await cartService.getCartById(cid);
            if (!cart) {
                return res.status(404).send({ status: 'error', message: 'Carrinho não encontrado' });
            }
            res.status(200).send({ status: 'success', payload: cart });
        } catch (error) {
            next(error);
        }
    }

    // Adiciona um produto ao carrinho
    async addProductToCart(req, res, next) {
        try {
            const { cid, pid } = req.params;
            const { quantity = 1 } = req.body;
            const updatedCart = await cartService.addProductToCart(cid, pid, quantity);
            res.status(200).send({ status: 'success', payload: updatedCart });
        } catch (error) {
            next(error);
        }
    }
    
    // ... Implementação dos outros métodos para referência ...

    async removeProductFromCart(req, res, next) {
        try {
            const { cid, pid } = req.params;
            await cartService.removeProductFromCart(cid, pid);
            res.status(200).send({ status: 'success', message: 'Produto removido do carrinho' });
        } catch (error) {
            next(error);
        }
    }

    async clearCart(req, res, next) {
        try {
            const { cid } = req.params;
            await cartService.clearCart(cid);
            res.status(200).send({ status: 'success', message: 'Carrinho esvaziado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    async updateProductQuantity(req, res, next) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;
            await cartService.updateQuantity(cid, pid, quantity);
            res.status(200).send({ status: 'success', message: 'Quantidade atualizada' });
        } catch (error) {
            next(error);
        }
    }

    async deleteCart(req, res, next) {
        try {
            const { cid } = req.params;
            await cartService.deleteCart(cid);
            res.status(200).send({ status: 'success', message: 'Carrinho deletado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    async getAllCarts(req, res, next) {
        try {
            const carts = await cartService.getAllCarts();
            res.status(200).send({ status: 'success', payload: carts });
        } catch (error) {
            next(error);
        }
    }
    // Outros métodos do controlador podem ser adicionados aqui

    // Exemplo de método adicional para obter todos os produtos de um carrinho
    async getProductsInCart(req, res, next) {
        try {
            const { cid } = req.params; // Obtém o ID do carrinho da URL
            const cart = await cartService.getCartById(cid); // Busca o carrinho pelo ID
            
            if (!cart) {
                return res.status(404).send({ status: 'error', message: 'Carrinho não encontrado' });
            }

            // Retorna os produtos contidos no carrinho
            res.status(200).send({ status: 'success', payload: cart.products });
        } catch (error) {
            next(error); // Encaminha o erro para o middleware de tratamento de erros
        }
    

    }
}
// Exporta uma instância única do controlador
export const cartController = new CartController();



















































































// // controllers/cart.controller.js
// import CartService from '../../services/cart.service.js';

// // Controlador para criar um novo carrinho
// export const createCart = async (req, res) => {
//   try {

//     // Chama o serviço para criar um carrinho vazio
//     const cart = await CartService.createCart();
    
//     // Retorna resposta 201 (Created) com o carrinho criado
//     res.sendCreated(cart);
//   } catch (error) {
//     console.error('[CREATE CART ERROR]', error);
//     // Em caso de erro, retorna resposta de erro genérico
//     res.sendError('Erro ao criar o carrinho', 500);
//   }
// };

// // Controlador para obter um carrinho específico pelo ID
// export const getCartById = async (req, res) => {
//   try {
//     // Extrai o ID do carrinho dos parâmetros da URL
//     const { cid } = req.params;

    
//     // Busca o carrinho usando o serviço
//     const cart = await CartService.getCartById(cid);

    
//     // Verifica se o carrinho foi encontrado

// // Retorna o carrinho encontrado

// if (!cart) {
//   console.log('[DEBUG] Carrinho não encontrado no Mongo');
//   return res.sendError('Carrinho não encontrado', 404);
// }

// console.log('[DEBUG] Carrinho encontrado:', cart);
// res.status(200).json({ status: 'success', payload: cart }); // <- Esse comando precisa estar executando

//   } catch (error) {
//     // Trata erros na busca
//     res.sendError('Erro ao buscar carrinho', 500);
//   }
// };

// // Controlador para obter todos os carrinhos (acesso administrativo)
// export const getAllCarts = async (req, res) => {
//   try {
//     // Busca todos os carrinhos existentes
//     const carts = await CartService.getAllCarts();
    
//     // Retorna a lista de carrinhos
//     res.sendSuccessWithPayload(carts);
//   } catch (error) {
//     // Loga o erro e retorna resposta de erro
//     req.logger?.error(error);
//     res.sendError('Erro ao buscar todos os carrinhos', 500);
//   }
// };

// // Controlador para adicionar um produto ao carrinho
// export const addProductToCart = async (req, res) => {
//   try {
//     // Extrai IDs do carrinho e produto dos parâmetros
//     const { cid, pid } = req.params;
//     const { quantity } = req.body; // <- importante para capturar corretamente
//     // Chama o serviço para adicionar o produto
//     // const result = await CartService.addProductToCart(cid, pid);
    

//     const result = await CartService.addProductToCart(cid, pid, Number(quantity || 1));
//     // Retorna o carrinho atualizado
//     res.sendSuccessWithPayload(result);
//   } catch (error) {
//     // Retorna erro específico ou genérico
//     res.sendError(error.message || 'Erro ao adicionar produto ao carrinho', 400);
//   }
// };

// // Controlador para atualizar a quantidade de um produto no carrinho
// export const updateProductQuantity = async (req, res) => {
//   try {
//     // Extrai IDs e quantidade do corpo da requisição
//     const { cid, pid } = req.params;
//     const { quantity } = req.body;
    
//     // Atualiza a quantidade no serviço
//     const updated = await CartService.updateQuantity(cid, pid, quantity);
    
//     // Retorna o carrinho atualizado
//     res.sendSuccessWithPayload(updated);
//   } catch (error) {
//     // Trata erros na atualização
//     res.sendError('Erro ao atualizar quantidade', 500);
//   }
// };

// // Controlador para remover um produto do carrinho
// export const removeProductFromCart = async (req, res) => {
//   try {
//     // Extrai IDs do carrinho e produto
//     const { cid, pid } = req.params;
    
//     // Remove o produto usando o serviço
//     const result = await CartService.removeProductFromCart(cid, pid);
    
//     // Retorna o carrinho atualizado
//     res.sendSuccessWithPayload(result);
//   } catch (error) {
//     // Trata erros na remoção
//     res.sendError('Erro ao remover produto do carrinho', 500);
//   }
// };

// // Controlador para esvaziar o carrinho
// export const clearCart = async (req, res) => {
//   try {
//     // Extrai ID do carrinho
//     const { cid } = req.params;
    
//     // Chama serviço para limpar todos os produtos
//     await CartService.clearCart(cid);
    
//     // Retorna mensagem de sucesso
//     res.sendSuccess('Carrinho esvaziado com sucesso');
//   } catch (error) {
//     // Trata erros na limpeza
//     res.sendError('Erro ao limpar carrinho', 500);
//   }
// };

// // Controlador para excluir permanentemente um carrinho
// export const deleteCart = async (req, res) => {
//   try {
//     // Extrai ID do carrinho
//     const { cid } = req.params;
    
//     // Deleta o carrinho usando o serviço
//     await CartService.deleteCart(cid);
    
//     // Retorna mensagem de confirmação
//     res.sendSuccess('Carrinho deletado com sucesso');
//   } catch (error) {
//     // Trata erros na exclusão
//     res.sendError('Erro ao deletar carrinho', 500);
//   }

  
// };