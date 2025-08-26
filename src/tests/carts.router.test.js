// src/tests/carts.router.test.js - VERSÃO FINAL CORRIGIDA

// Importação de módulos necessários para os testes
import { expect } from 'chai'; // Biblioteca de asserções
import supertest from 'supertest'; // Cliente HTTP para testes
import mongoose from 'mongoose'; // ORM para MongoDB
import sinon from 'sinon'; // Biblioteca para mocks e stubs

// Importação da aplicação Express e modelos de dados
import app from '../app.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import CartModel from '../models/cart.model.js';

// Utilitários para criptografia e autenticação JWT
import { createHash } from '../utils/cryptography.js';
import { generateToken } from '../utils/jwt.js';

// Serviço de pagamento que será mockado
import { paymentService } from '../services/payment.service.js';
// 🔧 CORREÇÃO FINAL: Importa a classe MailService para poder stubbar seu protótipo.
import MailService from '../services/mail.service.js';

// Configuração do cliente de testes HTTP
const requester = supertest(app);

// Suite de testes de integração para a rota de carrinhos
describe('Teste de Integração da Rota de Carrinhos', () => {
	let userCookie; // Cookie de autenticação do usuário
	let testProduct; // Produto de teste
	let userCartId; // ID do carrinho do usuário
	let testUser; // Usuário de teste

	/**
	 * HOOK "before": Executado uma única vez antes de todos os testes.
	 * Responsável por stubbar todos os serviços externos para evitar dependências externas.
	 */
	before(async function () {
		this.timeout(10000); // Aumenta timeout para operações assíncronas

		// Mock do serviço de pagamento para evitar chamadas reais à API da Stripe
		sinon.stub(paymentService, 'createPaymentIntent').callsFake(async (paymentData) => {
			return { client_secret: 'pi_test_secret_123', ...paymentData };
		});

		// 🔧 CORREÇÃO FINAL: Stub do serviço de e-mail para evitar envio real de e-mails
		// Isso é feito no protótipo para afetar todas as instâncias da classe.
		sinon.stub(MailService.prototype, 'sendPurchaseConfirmation').resolves();
	});

	/**
	 * HOOK "after": Executado uma única vez após todos os testes.
	 * Restaura os stubs do Sinon e limpa o ambiente de teste.
	 * A limpeza do DB é feita pelo script test-setup.js global.
	 */
	after(async function () {
		this.timeout(10000);
		sinon.restore(); // Restaura todos os stubs
	});

	/**
	 * HOOK "beforeEach": Executado antes de cada teste individual.
	 * Cria um ambiente isolado para cada teste com dados frescos.
	 */
	beforeEach(async function () {
		this.timeout(10000); // Aumenta timeout para setup

		// 1. Cria um usuário novo para isolamento do teste
		const userMock = {
			first_name: 'Cart',
			last_name: 'Tester',
			email: `cart-tester-${Date.now()}@test.com`, // Email único com timestamp
			password: 'cart-password123',
			role: 'user'
		};
		// Cria usuário com senha hasheada
		testUser = await UserModel.create({
			...userMock,
			password: createHash(userMock.password)
		});

		// 2. Cria um carrinho vazio e associa ao usuário
		const newCart = await CartModel.create({ products: [] });
		testUser.cartId = newCart._id; // Associa carrinho ao usuário
		await testUser.save();
		userCartId = newCart._id.toString(); // Guarda ID para uso nos testes

		// 3. Gera token JWT atualizado com informações do usuário
		const token = generateToken({
			user: {
				_id: testUser._id.toString(),
				email: testUser.email,
				role: testUser.role,
				cartId: userCartId // Inclui ID do carrinho no token
			}
		});
		// Formata cookie de autenticação
		userCookie = `jwtCookieToken=${token}`;

		// 4. Cria um produto de teste para operações do carrinho
		const productMock = {
			title: 'Produto para Teste de Carrinho',
			description: 'Descrição',
			code: `CART-TEST-${Date.now()}`, // Código único com timestamp
			price: 100,
			stock: 10,
			category: 'Testes'
		};
		testProduct = await ProductModel.create(productMock);
	});

	// Contexto para testes do fluxo completo de compra
	context('Quando realizo o fluxo de compra', () => {

		it('deve adicionar produto ao carrinho com sucesso', async function () {
			this.timeout(10000);

			// Adiciona produto ao carrinho via API
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie); // Envia cookie de autenticação

			// Verifica se o produto foi adicionado corretamente
			const cartInDb = await CartModel.findById(userCartId).populate('products.product');
			expect(cartInDb.products).to.have.lengthOf(1);
			expect(cartInDb.products[0].product._id.toString()).to.equal(testProduct._id.toString());
		});

		it('deve finalizar compra e retornar um client_secret', async function () {
			this.timeout(10000);

			// Adiciona produto com quantidade específica
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 2 });

			// Finaliza a compra
			const response = await requester
				.post(`/api/carts/${userCartId}/purchase`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(200);
			// 🔧 CORREÇÃO FINAL: O payload está aninhado duas vezes devido ao middleware de resposta.
			expect(response.body.payload.payload).to.have.property('client_secret');
		});

		it('deve retornar erro ao tentar comprar produto sem estoque', async function () {
			this.timeout(10000);

			// Adiciona quantidade maior que o estoque disponível
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 15 }); // Tenta comprar mais que o estoque (10)

			const response = await requester
				.post(`/api/carts/${userCartId}/purchase`)
				.set('Cookie', userCookie);

			// 🔧 CORREÇÃO: A lógica do controller agora retorna um erro 400.
			// O teste foi ajustado para validar essa resposta.
			expect(response.status).to.equal(400);
			expect(response.body.status).to.equal('error');
			expect(response.body.message).to.include('Não há produtos com estoque suficiente');
		});
	});

	// Contexto para testes de manipulação do carrinho
	context('Quando manipulo produtos no carrinho', () => {
		// Hook específico para preparar o carrinho com produtos antes de cada teste
		beforeEach(async function () {
			this.timeout(10000);
			// Pré-popula o carrinho com um produto antes de cada teste
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 1 });
		});

		it('deve obter detalhes do carrinho com sucesso', async function () {
			this.timeout(10000);

			const response = await requester
				.get(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(200);
			expect(response.body.payload.products).to.be.an('array').that.has.lengthOf(1);
		});

		it('deve atualizar quantidade de produto no carrinho', async function () {
			this.timeout(10000);

			const newQuantity = 5;
			// Atualiza a quantidade do produto
			await requester
				.put(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: newQuantity });

			// Verifica se a quantidade foi atualizada
			const updatedCartResponse = await requester
				.get(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);
			const updatedProductInCart = updatedCartResponse.body.payload.products.find(
				item => (item.product?._id ?? item.product).toString() === testProduct._id.toString()
			);
			expect(updatedProductInCart.quantity).to.equal(newQuantity);
		});

		it('deve remover produto específico do carrinho', async function () {
			this.timeout(10000);

			// Remove produto específico
			await requester
				.delete(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie);

			// Verifica se o carrinho ficou vazio
			const cartInDb = await CartModel.findById(userCartId).lean();
			expect(cartInDb.products).to.have.lengthOf(0);
		});

		it('deve limpar todos os produtos do carrinho', async function () {
			this.timeout(10000);

			// Limpa todo o carrinho
			await requester
				.delete(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);

			const cartInDb = await CartModel.findById(userCartId).lean();
			expect(cartInDb.products).to.have.lengthOf(0);
		});
	});
});