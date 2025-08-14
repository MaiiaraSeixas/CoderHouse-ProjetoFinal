// src/tests/products.router.test.js

import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import UserModel from '../models/user.model.js';
import { createHash } from '../utils/cryptography.js';

// Cria cliente HTTP para testar a aplicação Express
const requester = supertest(app);

/**
 * Conjunto de testes de integração para rotas de produtos
 * 
 * Testa operações CRUD protegidas por autenticação e autorização:
 * 1. Criação de produtos (apenas admin)
 * 2. Listagem de produtos
 * 3. Atualização de produtos
 * 4. Exclusão de produtos
 * 
 * Utiliza um usuário administrador para operações privilegiadas
 */
describe('Teste de Integração da Rota de Produtos', () => {
	let adminTokenCookie; // Armazena o token de autenticação do admin
	const adminUserMock = {
		first_name: 'Admin',
		last_name: 'Tester',
		email: `admin-tester-${Date.now()}@test.com`, // Email único com timestamp
		password: 'admin-password123',
		role: 'admin'
	};
	let createdProductId; // Armazena ID do produto criado para uso em outros testes

	/**
	 * Configuração inicial antes de todos os testes:
	 * 1. Cria usuário admin
	 * 2. Realiza login para obter token
	 */
	before(async function () {
		this.timeout(10000); // Timeout maior para criação de usuário e login

		// Cria usuário admin no banco
		await UserModel.create({
			...adminUserMock,
			password: createHash(adminUserMock.password)
		});

		// Realiza login para obter token
		const loginResponse = await requester
			.post('/api/sessions/login')
			.send({
				email: adminUserMock.email,
				password: adminUserMock.password
			});

		// Extrai cookie de autenticação
		const cookies = loginResponse.headers['set-cookie'];
		adminTokenCookie = cookies.find(cookie =>
			cookie.startsWith('jwtCookieToken=')
		);
	});

	/**
	 * Limpeza após todos os testes:
	 * 1. Remove usuários de teste
	 * 2. Remove produtos criados nos testes
	 */
	after(async function () {
		this.timeout(5000);
		// Remove usuários com email de teste
		await mongoose.connection.collection('users').deleteMany({
			email: { $regex: /admin-tester/ }
		});

		// Remove todos os produtos criados nos testes
		await mongoose.connection.collection('products').deleteMany({});
	});

	// ===========================================================
	// CONTEXTO 1: CRIAÇÃO DE PRODUTOS (ACESSO ADMIN)
	// ===========================================================
	context('Operações de Criação (POST /api/products)', () => {
		/**
		 * Teste: Criação bem-sucedida de produto por admin
		 */
		it('Deve criar um produto com sucesso e retornar status 201', async function () {
			this.timeout(7000);
			const newProductMock = {
				title: "Produto de Teste Autorizado",
				description: "Descrição do produto de teste com token",
				code: `TEST-AUTH-${Date.now()}`, // Código único
				price: 150,
				stock: 30,
				category: "Teste Auth",
				status: true
			};

			const response = await requester
				.post('/api/products')
				.set('Cookie', adminTokenCookie) // Autenticação como admin
				.send(newProductMock);

			// Armazena ID para uso em testes posteriores
			createdProductId = response.body.payload.id;

			// Verificações:
			expect(response.status).to.equal(201); // 1. Status de criação
			expect(response.body.payload).to.have.property('id'); // 2. ID gerado
			expect(response.body.payload.title).to.equal(newProductMock.title); // 3. Título corresponde
		});

		/**
		 * Teste: Tentativa de criação sem autenticação
		 */
		it('Deve retornar erro 401 ao tentar criar produto sem autenticação', async () => {
			const newProductMock = {
				title: "Produto Não Autorizado",
				description: "Tentativa sem token",
				code: `TEST-UNAUTH-${Date.now()}`,
				price: 100,
				stock: 10,
				category: "Teste Unauthorized"
			};

			const response = await requester
				.post('/api/products')
				.send(newProductMock); // Sem cookie de autenticação

			expect(response.status).to.equal(401); // Não autorizado
			expect(response.body.error).to.equal('Não autenticado'); // Mensagem específica
		});
	});

	// ===========================================================
	// CONTEXTO 2: CONSULTA DE PRODUTOS (ACESSO PÚBLICO)
	// ===========================================================
	context('Operações de Consulta (GET /api/products)', () => {
		/**
		 * Teste: Listagem de produtos paginada
		 */
		it('Deve retornar uma lista paginada de produtos com status 200', async () => {
			const response = await requester
				.get('/api/products')
				.query({ limit: 5, page: 1 }); // Parâmetros de paginação

			expect(response.status).to.equal(200);
			expect(response.body).to.have.property('docs');
			expect(response.body.docs).to.be.an('array');
		});

		/**
		 * Teste: Busca de produto por ID
		 */
		it('Deve retornar detalhes de um produto específico por ID', async () => {
			const response = await requester
				.get(`/api/products/${createdProductId}`); // Usa ID criado anteriormente

			expect(response.status).to.equal(200);
			expect(response.body.payload).to.have.property('_id', createdProductId);
		});
	});

	// ===========================================================
	// CONTEXTO 3: ATUALIZAÇÃO DE PRODUTOS (ACESSO ADMIN)
	// ===========================================================
	context('Operações de Atualização (PUT /api/products/:pid)', () => {
		/**
		 * Teste: Atualização bem-sucedida por admin
		 */
		it('Deve atualizar um produto com sucesso e retornar status 200', async () => {
			const updates = {
				price: 200,
				stock: 25
			};

			const response = await requester
				.put(`/api/products/${createdProductId}`)
				.set('Cookie', adminTokenCookie)
				.send(updates);

			expect(response.status).to.equal(200);
			expect(response.body.payload.price).to.equal(updates.price);
			expect(response.body.payload.stock).to.equal(updates.stock);
		});

		/**
		 * Teste: Tentativa de atualização sem permissões
		 */
		it('Deve retornar erro 403 ao tentar atualizar sem ser admin', async () => {
			// Simula token de usuário comum (não admin)
			const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOiJ1c2VyIn0sImlhdCI6MTY5MTY4NjI0NH0.XY7pFZ7lZqj1k6Y3v6n5q7w8z9a0b1c2d3e4f5g6h7i";

			const updates = { price: 300 };
			const response = await requester
				.put(`/api/products/${createdProductId}`)
				.set('Cookie', `jwtCookieToken=${userToken}`)
				.send(updates);

			expect(response.status).to.equal(403); // Proibido
			expect(response.body.error).to.equal('Acesso negado'); // Mensagem específica
		});
	});

	// ===========================================================
	// CONTEXTO 4: EXCLUSÃO DE PRODUTOS (ACESSO ADMIN)
	// ===========================================================
	context('Operações de Exclusão (DELETE /api/products/:pid)', () => {
		/**
		 * Teste: Exclusão bem-sucedida por admin
		 */
		it('Deve excluir um produto com sucesso e retornar status 200', async () => {
			const response = await requester
				.delete(`/api/products/${createdProductId}`)
				.set('Cookie', adminTokenCookie);

			expect(response.status).to.equal(200);
			expect(response.body.message).to.equal('Produto excluído com sucesso');
		});

		/**
		 * Teste: Tentativa de exclusão de produto inexistente
		 */
		it('Deve retornar erro 404 ao tentar excluir produto inexistente', async () => {
			const invalidId = '64d1d9b0f3a7d00000000000'; // ID inválido formatado
			const response = await requester
				.delete(`/api/products/${invalidId}`)
				.set('Cookie', adminTokenCookie);

			expect(response.status).to.equal(404);
			expect(response.body.error).to.equal('Produto não encontrado');
		});
	});
});

// Adicionar este novo contexto dentro do describe de 'products.router.test.js'

context('Quando um usuário sem permissão tenta criar um produto', () => {
	let userTokenCookie;

	// Usamos o before para criar e logar um usuário com role 'user'
	before(async function () {
		this.timeout(10000);
		const userMock = {
			first_name: 'Simple',
			last_name: 'User',
			email: `simple-user-${Date.now()}@test.com`,
			password: 'password123',
			role: 'user' // << Papel sem permissão
		};

		await requester.post('/api/sessions/register').send(userMock);

		const loginResponse = await requester.post('/api/sessions/login').send({
			email: userMock.email,
			password: userMock.password
		});

		const cookies = loginResponse.headers['set-cookie'];
		userTokenCookie = cookies.find(cookie => cookie.startsWith('jwtCookieToken='));
	});

	it('Deve retornar erro 403 (Forbidden) ao tentar criar um produto', async function () {
		this.timeout(5000);
		const newProductMock = { title: 'Produto Proibido', price: 100, code: `FORBIDDEN-${Date.now()}`, stock: 10, category: 'Test' };

		const response = await requester.post('/api/products')
			.set('Cookie', userTokenCookie)
			.send(newProductMock);

		// Validamos que a política de acesso bloqueou a requisição
		expect(response.status).to.equal(403);
		expect(response.body.message).to.equal('Acesso proibido. Você não tem permissão para acessar este recurso.');
	});
});

context('Quando tento criar um produto com dados inválidos', () => {
	// Reutilize o cookie de admin já criado no seu teste
	it('Deve retornar erro 400 e a causa do erro, acionando o errorHandler', async function () {
		this.timeout(5000);
		const invalidProduct = { description: 'Produto sem título', price: 150 };

		const response = await requester.post('/api/products')
			.set('Cookie', authTokenCookie) // Supondo que authTokenCookie seja de um admin
			.send(invalidProduct);

		// Validamos que o errorHandler customizado foi acionado
		expect(response.status).to.equal(400);
		expect(response.body.error).to.equal('Erro de Criação de Produto');
		expect(response.body.cause).to.include('* title: precisa ser uma String, recebido: undefined');
	});
});
