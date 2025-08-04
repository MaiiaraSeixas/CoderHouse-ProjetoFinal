// src/tests/carts.router.test.js

// Importa bibliotecas e arquivos necessários
import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import { createHash } from '../utils/cryptography.js';

const requester = supertest(app); // Cria uma instância de requisições HTTP para os testes

// Descreve o conjunto de testes para a rota de carrinhos
describe('Teste de Integração da Rota de Carrinhos', () => {
	let userCookie; // Cookie JWT para autenticar as requisições
	let testUser; // Usuário de teste
	let testProduct; // Produto de teste
	let userCartId; // ID do carrinho do usuário de teste

	// Antes de todos os testes, cria um usuário e um produto, e faz login para capturar o cookie
	before(async function () {
		this.timeout(10000);
		const userMock = {
			first_name: 'Cart', last_name: 'Tester',
			email: `cart-tester-${Date.now()}@test.com`,
			password: 'cart-password123', role: 'user'
		};

		// Cria o usuário com senha criptografada
		testUser = await UserModel.create({ ...userMock, password: createHash(userMock.password) });

		// Cria um produto de teste
		const productMock = {
			title: "Produto para Teste de Carrinho", description: "Descrição",
			code: `CART-TEST-${Date.now()}`, price: 100,
			stock: 10, category: "Testes"
		};
		testProduct = await ProductModel.create(productMock);

		// Realiza login com o usuário de teste
		const loginResponse = await requester.post('/api/sessions/login').send({
			email: userMock.email, password: userMock.password
		});

		// Captura o cookie JWT retornado no login
		const cookies = loginResponse.headers['set-cookie'];
		userCookie = cookies.find(cookie => cookie.startsWith('jwtCookieToken='));

		// Extrai o cartId do payload do token
		const tokenPayload = JSON.parse(Buffer.from(userCookie.split('.')[1], 'base64').toString());
		userCartId = tokenPayload.user.cartId;
	});

	// Depois de todos os testes, limpa os dados criados
	after(async function () {
		this.timeout(10000);
		await mongoose.connection.collection('users').deleteMany({ email: { $regex: /cart-tester/ } });
		await mongoose.connection.collection('products').deleteMany({ code: { $regex: /CART-TEST/ } });
		if (userCartId) {
			await mongoose.connection.collection('carts').deleteOne({ _id: new mongoose.Types.ObjectId(userCartId) });
		}
		await mongoose.connection.collection('tickets').deleteMany({});
	});

	// Testa se um produto pode ser adicionado ao carrinho com sucesso
	it('Deve adicionar um produto ao carrinho com sucesso', async function () {
		this.timeout(5000);

		// Faz a requisição para adicionar o produto ao carrinho
		const response = await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie);

		expect(response.status).to.equal(200); // Verifica status HTTP
		expect(response.body).to.have.property('payload'); // Verifica se payload existe

		const cart = response.body.payload;
		expect(cart).to.have.property('products'); // Verifica se o carrinho tem produtos

		// Verifica se o produto está no carrinho com quantidade correta
		const productInCart = cart.products.find(p => p.product && p.product._id.toString() === testProduct._id.toString());
		expect(productInCart).to.exist;
		expect(productInCart.quantity).to.equal(1);
	});

	// Testa se uma compra é finalizada com sucesso quando há estoque
	it('Deve finalizar a compra com sucesso (purchase)', async function () {
		this.timeout(5000);

		// Adiciona o produto ao carrinho com quantidade 2
		await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie)
			.send({ quantity: 2 });

		// Realiza a compra
		const response = await requester.post(`/api/carts/${userCartId}/purchase`).set('Cookie', userCookie);

		expect(response.status).to.equal(200); // Status de sucesso
		expect(response.body.payload).to.have.property('code'); // Verifica se foi gerado um ticket
		expect(response.body.payload.amount).to.equal(200); // Valor total da compra
	});

	// Testa o comportamento quando tenta-se comprar mais do que o estoque permite
	it('Deve falhar ao tentar comprar um produto sem estoque', async function () {
		this.timeout(5000);

		// Reduz o estoque do produto para 1
		await ProductModel.findByIdAndUpdate(testProduct._id, { stock: 1 });

		// Tenta adicionar 2 unidades ao carrinho
		await requester.post(`/api/carts/${userCartId}/product/${testProduct._id}`)
			.set('Cookie', userCookie)
			.send({ quantity: 2 });

		// Tenta finalizar a compra (deve falhar)
		const response = await requester.post(`/api/carts/${userCartId}/purchase`).set('Cookie', userCookie);

		expect(response.status).to.equal(400); // Compra deve falhar
		expect(response.body).to.have.property('productsNotPurchased'); // Deve listar os produtos não comprados
		expect(response.body.productsNotPurchased)
			.to.be.an('array')
			.that.includes(testProduct._id.toString()); // O produto deve estar na lista de falhas
	});
});
