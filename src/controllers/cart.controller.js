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
















































