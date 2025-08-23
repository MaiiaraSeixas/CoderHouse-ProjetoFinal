// ===== ARQUIVO ATUALIZADO: controllers/cart.controller.js =====
// Controlador com a nova rota de compra.

import cartService from "../services/cart.service.js"; // Importa o serviço de carrinho

class CartController {
	// Controlador para iniciar a compra de um carrinho, gerando um PaymentIntent
	async purchaseCart(req, res, next) {
		try {

			const { cid } = req.params; // Obtém o ID do carrinho da URL
			const { user } = req; // Obtém o usuário autenticado do objeto req

			// Validação básica: verifica se há um usuário e se tem e-mail
			if (!user || !user.email) {
				return res.status(400).send({
					status: 'error',
					message: 'Usuário inválido para realizar a compra.'
				});
			}

			// 🔧 Correção: garante que o serviço lance erro quando carrinho não existe
			const cart = await cartService.getCartById(cid);
			if (!cart) {
				return res.status(404).send({ status: 'error', message: 'Carrinho não encontrado' });
			}

			// O serviço agora retorna os dados do PaymentIntent, incluindo client_secret
			const paymentIntent = await cartService.purchaseCart(cid, user);

			// 🔧 Retorno compatível com o teste de integração
			res.sendSuccess({
				message: 'Intenção de pagamento criada com sucesso.',
				payload: { client_secret: paymentIntent.client_secret }
			});

		} catch (error) {
			console.error("Purchase cart controller error:", error);

			// Personaliza a mensagem de erro para o cliente
			if (error.message.includes('Não há produtos com estoque')) {
				return res.status(400).send({ status: 'error', message: error.message });
			}

			// Erros inesperados são repassados para o middleware de tratamento de erros
			next(error);
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
	async getCartById(req, res, next) {
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
			// ✅ CORREÇÃO: Certifique-se de que a quantidade seja um número.
			const quantity = req.body.quantity ? Number(req.body.quantity) : 1;

			if (isNaN(quantity) || quantity < 1) {
				return res.status(400).send({ status: 'error', message: 'Quantidade inválida.' });
			}

			const updatedCart = await cartService.addProductToCart(cid, pid, quantity);
			res.status(200).send({ status: 'success', payload: updatedCart });
		} catch (error) {
			next(error);
		}
	}

	async removeProductFromCart(req, res, next) {
		try {
			const { cid, pid } = req.params;
			await cartService.removeProductFromCart(cid, pid);
			res.status(200).send({ status: 'success', message: 'Produto removido do carrinho' });
		} catch (error) {
			next(error);
		}
	}

	async clearProductsFromCart(req, res, next) {
		try {
			const { cid } = req.params;
			await cartService.clearProductsFromCart(cid);
			res.status(200).send({ status: 'success', message: 'Carrinho esvaziado com sucesso' });
		} catch (error) {
			next(error);
		}
	}

	async updateProductQuantityInCart(req, res, next) {
		try {
			const { cid, pid } = req.params;
			const { quantity } = req.body;

			// 🔧 Validação: impede valores inválidos
			if (isNaN(quantity) || quantity < 1) {
				return res.status(400).send({ status: 'error', message: 'Quantidade inválida.' });
			}

			await cartService.updateProductQuantityInCart(cid, pid, quantity);
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
