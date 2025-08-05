// src/tests/carts.router.test.js - VERSÃO COMENTADA DIDATICAMENTE

// -----------------------------------------------------------------------------
// Importações essenciais para execução dos testes de integração.
// - chai: biblioteca de asserções utilizada para validar os resultados.
// - supertest: permite simular chamadas HTTP diretamente na aplicação Express.
// - mongoose: utilizado para interagir com o banco de testes MongoDB.
// -----------------------------------------------------------------------------
import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';

// -----------------------------------------------------------------------------
// Importação da aplicação (Express) e dos modelos do banco de dados.
// Isso permite interagir com as rotas e verificar diretamente documentos no banco.
// -----------------------------------------------------------------------------
import app from '../app.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import CartModel from '../models/cart.model.js';

// -----------------------------------------------------------------------------
// Funções auxiliares:
// - createHash: gera senha criptografada (como ocorre com usuários reais).
// - generateToken: cria um JWT válido para simular autenticação.
// -----------------------------------------------------------------------------
import { createHash } from '../utils/cryptography.js';
import { generateToken } from '../utils/jwt.js';

// Instância do supertest que será utilizada para simular requisições HTTP.
const requester = supertest(app);

/**
 * Testes de integração da rota /api/carts.
 * Estes testes simulam o comportamento real das rotas, testando desde a
 * camada HTTP até a manipulação no banco de dados, validando o fluxo completo.
 */
describe('Teste de Integração da Rota de Carrinhos', () => {
	let userCookie;     // Armazena o cookie com JWT, usado para autenticar o usuário durante os testes.
	let testProduct;    // Produto criado especificamente para os testes.
	let userCartId;     // Identificador do carrinho associado ao usuário de testes.

	/**
	 * HOOK "before":
	 * Executado *uma única vez* antes de todos os testes.
	 * Objetivos:
	 * - Criar um usuário fictício (com senha hasheada).
	 * - Criar um carrinho vazio e associá-lo ao usuário.
	 * - Gerar manualmente um token JWT e montar o cookie de autenticação.
	 */
	before(async function () {
		this.timeout(10000); // Em cenários com acesso ao banco, aumentamos o timeout.

		const userMock = {
			first_name: 'Cart',
			last_name: 'Tester',
			email: `cart-tester-${Date.now()}@test.com`,
			password: 'cart-password123',
			role: 'user'
		};

		// Criação do usuário com senha criptografada
		const testUser = await UserModel.create({
			...userMock,
			password: createHash(userMock.password)
		});

		// Criação de um carrinho vazio e associação ao usuário criado
		const newCart = await CartModel.create({ products: [] });
		testUser.cartId = newCart._id;
		await testUser.save();

		userCartId = newCart._id.toString();

		// Geração manual do token JWT com as informações essenciais
		const token = generateToken({
			_id: testUser._id.toString(),
			email: testUser.email,
			role: testUser.role,
			cartId: userCartId
		});

		// Monta o cookie que será enviado na maioria das rotas para autenticação
		userCookie = `jwtCookieToken=${token}`;
	});

	/**
	 * HOOK "after":
	 * Executado *uma única vez* após todos os testes.
	 * Responsável por remover do banco TODOS os registros gerados para os testes,
	 * garantindo que o banco permaneça limpo.
	 */
	after(async function () {
		this.timeout(10000);
		await mongoose.connection.collection('users').deleteMany({ email: { $regex: /cart-tester/ } });
		await mongoose.connection.collection('products').deleteMany({ code: { $regex: /CART-TEST/ } });
		await mongoose.connection.collection('carts').deleteMany({});
		await mongoose.connection.collection('tickets').deleteMany({});
	});

	/**
	 * HOOK "beforeEach":
	 * Executado ANTES de cada teste individual.
	 * Finalidade:
	 * - Garantir que o carrinho esteja vazio (estado inicial "limpo").
	 * - Criar um novo produto com estoque específico, para que cada teste
	 *   comece com as mesmas condições.
	 */
	beforeEach(async function () {
		this.timeout(10000);

		// Removendo todos os produtos do carrinho testado
		await CartModel.findByIdAndUpdate(userCartId, { $set: { products: [] } });

		// Produto fictício para ser adicionado no carrinho durante o teste
		const productMock = {
			title: 'Produto para Teste de Carrinho',
			description: 'Descrição',
			code: `CART-TEST-${Date.now()}`,
			price: 100,
			stock: 10,
			category: 'Testes'
		};
		testProduct = await ProductModel.create(productMock);
	});

	// =====================================================================
	// CONJUNTO 1 DE TESTES — Fluxo de compra
	// =====================================================================
	context('Quando realizo a adição de produtos e finalizo a compra', () => {
		/**
		 * Verifica se é possível adicionar um produto ao carrinho corretamente.
		 */
		it('Deve adicionar um produto ao carrinho com sucesso', async function () {
			this.timeout(10000);

			// 1) Simula chamada POST para adicionar produto ao carrinho
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie);

			// 2) Busca o carrinho diretamente no banco para validar o estado
			const cartInDb = await CartModel.findById(userCartId).lean();

			// 3) Validações
			expect(cartInDb.products).to.have.lengthOf(1);
			expect(cartInDb.products[0].product.toString()).to.equal(testProduct._id.toString());
		});

		/**
		 * Verifica se uma compra válida (quantidade dentro do estoque) finaliza com sucesso.
		 */
		it('Deve finalizar a compra com sucesso (purchase)', async function () {
			this.timeout(10000);

			// Adiciona 2 unidades ao carrinho
			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 2 });

			// Realiza o checkout
			const response = await requester
				.post(`/api/carts/${userCartId}/purchase`)
				.set('Cookie', userCookie);

			// Validação da resposta
			expect(response.status).to.equal(200);
			expect(response.body.payload).to.have.property('code');
			expect(response.body.payload.amount).to.equal(2 * 100);
		});

		/**
		 * Garante que a aplicação respeita o controle de estoque e retorna erro
		 * ao tentar comprar uma quantidade maior que a disponível.
		 */
		it('Deve falhar ao tentar comprar um produto sem estoque', async function () {
			this.timeout(10000);

			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 15 }); // acima do estoque

			const response = await requester
				.post(`/api/carts/${userCartId}/purchase`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(400);
			expect(response.body).to.have.property('productsNotPurchased');
			expect(response.body.productsNotPurchased)
				.to.be.an('array')
				.that.includes(testProduct._id.toString());
		});
	});

	// =====================================================================
	// CONJUNTO 2 DE TESTES — Operações GET, PUT e DELETE no carrinho
	// =====================================================================
	context('Quando manipulo produtos no carrinho com GET, PUT e DELETE', () => {

		/**
		 * Cada teste dentro deste contexto começará com 1 produto no carrinho,
		 * permitindo validar operações de alteração e remoção.
		 */
		beforeEach(async function () {
			this.timeout(10000);

			await requester
				.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: 1 });
		});

		/**
		 * Recupera os detalhes do carrinho usando GET.
		 * Valida se a resposta contém o produto previamente adicionado.
		 */
		it('Deve obter os detalhes do carrinho com sucesso (GET)', async function () {
			this.timeout(10000);

			const response = await requester
				.get(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(200);
			expect(response.body.payload).to.have.property('_id');
			expect(response.body.payload.products).to.be.an('array').that.has.lengthOf(1);
			expect(response.body.payload.products[0].product._id.toString())
				.to.equal(testProduct._id.toString());
		});

		/**
		 * Atualiza a quantidade de um produto já inserido no carrinho utilizando PUT.
		 */
		it('Deve atualizar a quantidade de um produto no carrinho (PUT /:cid/products/:pid)', async function () {
			this.timeout(10000);

			const newQuantity = 5;
			const response = await requester
				.put(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie)
				.send({ quantity: newQuantity });

			expect(response.status).to.equal(200);
			expect(response.body.status).to.equal('success');
			expect(response.body.message).to.equal('Quantidade atualizada');

			// Consulta novamente para verificar se o valor foi de fato alterado
			const updatedCartResponse = await requester
				.get(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);

			expect(updatedCartResponse.status).to.equal(200);
			const updatedProductInCart = updatedCartResponse.body.payload.products.find(
				item => item.product._id.toString() === testProduct._id.toString()
			);
			expect(updatedProductInCart).to.exist;
			expect(updatedProductInCart.quantity).to.equal(newQuantity);
		});

		/**
		 * Remove especificamente UM produto do carrinho usando DELETE.
		 */
		it('Deve remover um produto específico do carrinho (DELETE /:cid/products/:pid)', async function () {
			this.timeout(10000);

			const response = await requester
				.delete(`/api/carts/${userCartId}/product/${testProduct._id}`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(200);
			const cartInDb = await CartModel.findById(userCartId).lean();
			expect(cartInDb.products).to.have.lengthOf(0);
		});

		/**
		 * Remove TODOS os produtos do carrinho (esvaziá-lo completamente).
		 */
		it('Deve esvaziar o carrinho completamente (DELETE /:cid)', async function () {
			this.timeout(10000);

			const response = await requester
				.delete(`/api/carts/${userCartId}`)
				.set('Cookie', userCookie);

			expect(response.status).to.equal(200);
			const cartInDb = await CartModel.findById(userCartId).lean();
			expect(cartInDb.products).to.have.lengthOf(0);
		});
	});
});
