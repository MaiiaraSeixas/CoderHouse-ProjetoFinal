// src/tests/carts.router.test.js - VERSÃO FINAL E MAIS ROBUSTA

// Importações das ferramentas de teste
import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';

// Importações da aplicação e modelos
import app from '../app.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import CartModel from '../models/cart.model.js';

import { createHash } from '../utils/cryptography.js';   // Função para hashear senha
import { generateToken } from '../utils/jwt.js';         // Função que gera o JWT

// Cria o cliente para enviar requisições HTTP ao app
const requester = supertest(app);

/**
 * Bloco responsável por testar TODA a rota de Carrinho (/api/carts)
 */
describe('Teste de Integração da Rota de Carrinhos', () => {
	let userCookie;     // Cookie JWT que será utilizado nas requisições autenticadas
	let testProduct;    // Produto de teste
	let userCartId;     // ID do carrinho de teste

	/**
	 * BEFORE → executa uma ÚNICA vez antes de todos os testes deste bloco:
	 * - cria usuário fake
	 * - associa um carrinho
	 * - cria produto
	 * - gera o cookie de login
	 */
	before(async function () {
		this.timeout(10000);

		// Mock de usuário
		const userMock = {
			first_name: 'Cart', last_name: 'Tester',
			email: `cart-tester-${Date.now()}@test.com`,
			password: 'cart-password123', role: 'user'
		};

		// Cria o usuário com senha criptografada
		const testUser = await UserModel.create({ ...userMock, password: createHash(userMock.password) });

		// Cria um carrinho vazio e associa ao usuário criado
		const newCart = await CartModel.create({ products: [] });
		testUser.cartId = newCart._id;
		await testUser.save();

		userCartId = newCart._id.toString(); // Guarda o ID do carrinho

		// Cria um produto no banco para usar nos testes de compra
		const productMock = {
			title: "Produto para Teste de Carrinho",
			description: "Descrição",
			code: `CART-TEST-${Date.now()}`,
			price: 100,
			stock: 10,
			category: "Testes"
		};
		testProduct = await ProductModel.create(productMock);

		// Gera o token JWT manualmente para simular o login
		const token = generateToken({
			_id: testUser._id.toString(),
			email: testUser.email,
			role: testUser.role,
			cartId: userCartId
		});
		// Salva o cookie com o token dentro
		userCookie = `jwtCookieToken=${token}`;
	});

	/**
	 * AFTER → executa uma ÚNICA vez após todos os testes:
	 * Limpa usuários, carrinhos, produtos e tickets gerados no banco.
	 */
	after(async function () {
		this.timeout(10000);
		await mongoose.connection.collection('users').deleteMany({ email: { $regex: /cart-tester/ } });
		await mongoose.connection.collection('products').deleteMany({ code: { $regex: /CART-TEST/ } });
		await mongoose.connection.collection('carts').deleteMany({});
		await mongoose.connection.collection('tickets').deleteMany({});
	});

	/**
	 * BEFORE EACH → executa antes de CADA teste individual:
	 * - zera o carrinho usado
	 * - reseta o estoque do produto
	 */
	beforeEach(async function () {
		this.timeout(5000);
		await CartModel.findByIdAndUpdate(userCartId, { $set: { products: [] } });
		await ProductModel.findByIdAndUpdate(testProduct._id, { $set: { stock: 10 } });
	});

	/**
	 * TESTE 1 - Inserção de produto no carrinho
	 */
	it('Deve adicionar um produto ao carrinho com sucesso', async function () {
		this.timeout(5000);

		// Faz a requisição para adicionar o produto
		await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie);

		// Busca o carrinho direto no banco
		const cartInDb = await CartModel.findById(userCartId).lean();

		// Verifica se o produto foi adicionado
		expect(cartInDb.products).to.have.lengthOf(1);
		expect(cartInDb.products[0].product.toString()).to.equal(testProduct._id.toString());
	});

	/**
	 * TESTE 2 - Finalização de compra com quantidade válida
	 */
	it('Deve finalizar a compra com sucesso (purchase)', async function () {
		this.timeout(5000);

		// Adiciona 2 unidades do produto ao carrinho via rota
		await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie)
			.send({ quantity: 2 });

		// Faz o checkout
		const response = await requester.post(`/api/carts/${userCartId}/purchase`)
			.set('Cookie', userCookie);

		// Verificações
		expect(response.status).to.equal(200, 'A API deveria retornar status 200');
		expect(response.body.payload).to.have.property('code');
		expect(response.body.payload.amount).to.equal(200); // Espera 2 * 100
	});

	/**
	 * TESTE 3 - Erro ao tentar comprar mais do que o estoque
	 */
	it('Deve falhar ao tentar comprar um produto sem estoque', async function () {
		this.timeout(5000);

		// Adiciona 15 unidades ao carrinho (maior que o stock)
		await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie)
			.send({ quantity: 15 });

		// Tenta comprar
		const response = await requester.post(`/api/carts/${userCartId}/purchase`)
			.set('Cookie', userCookie);

		// Espera que a compra falhe
		expect(response.status).to.equal(400, 'A API deveria retornar status 400');
		expect(response.body).to.have.property('productsNotPurchased');
		expect(response.body.productsNotPurchased)
			.to.be.an('array')
			.that.includes(testProduct._id.toString());
	});
});
