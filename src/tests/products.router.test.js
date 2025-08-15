// Importando bibliotecas necessárias para os testes
import { expect } from 'chai';          // Biblioteca de asserções
import mongoose from 'mongoose';        // ORM para MongoDB
import supertest from 'supertest';      // Cliente HTTP para testes de integração
import app from '../app.js';            // Aplicação Express (ponto de entrada)
import UserModel from '../models/user.model.js';    // Modelo de usuário
import ProductModel from '../models/product.model.js';  // Modelo de produto
import { createHash } from '../utils/cryptography.js';  // Utilitário para criptografia

// Cria um cliente de testes para a aplicação
const requester = supertest(app);

// Suite de testes para rotas de produtos
describe('Teste de Integração da Rota de Produtos', () => {
	let adminTokenCookie;    // Armazenará o cookie de autenticação do admin
	let userTokenCookie;     // Armazenará o cookie de autenticação do usuário comum
	let createdProduct;      // Armazenará o produto criado durante os testes

	// Hook executado ANTES de todos os testes deste describe
	before(async function () {
		this.timeout(15000);  // Aumenta timeout para operações de inicialização

		// Limpa os bancos de dados antes de iniciar os testes
		await UserModel.deleteMany({});
		await ProductModel.deleteMany({});

		// Cria e autentica um usuário ADMINISTRADOR
		const adminUserMock = {
			first_name: 'Admin',
			last_name: 'Tester',
			email: `admin-products-${Date.now()}@test.com`,  // Email único
			password: 'admin-password123',
			role: 'admin'
		};
		// Registra o admin
		await requester.post('/api/sessions/register').send(adminUserMock);
		// Faz login e obtém o cookie de autenticação
		const adminLoginRes = await requester.post('/api/sessions/login').send({
			email: adminUserMock.email,
			password: adminUserMock.password
		});
		// Extrai o cookie JWT do header de resposta
		adminTokenCookie = adminLoginRes.headers['set-cookie'].find(c => c.startsWith('jwtCookieToken='));

		// Cria e autentica um usuário COMUM
		const userMock = {
			first_name: 'User',
			last_name: 'Tester',
			email: `user-products-${Date.now()}@test.com`,  // Email único
			password: 'user-password123',
			role: 'user'
		};
		// Registra o usuário comum
		await requester.post('/api/sessions/register').send(userMock);
		// Faz login e obtém o cookie de autenticação
		const userLoginRes = await requester.post('/api/sessions/login').send({
			email: userMock.email,
			password: userMock.password
		});
		// Extrai o cookie JWT do header de resposta
		userTokenCookie = userLoginRes.headers['set-cookie'].find(c => c.startsWith('jwtCookieToken='));
	});

	// Contexto: Testes de criação de produtos
	context('Operações de Criação (POST /api/products)', () => {
		// Teste: Criação de produto por administrador
		it('Deve criar um produto com sucesso e retornar status 201', async function () {
			const newProductMock = {
				title: "Produto de Teste",
				description: "Descrição",
				code: `PROD-${Date.now()}`,  // Código único usando timestamp
				price: 150,
				stock: 30,
				category: "Teste"
			};
			// Envia requisição com token de admin
			const response = await requester.post('/api/products')
				.set('Cookie', adminTokenCookie)
				.send(newProductMock);

			// Verificações:
			expect(response.status).to.equal(201);  // Status HTTP Created
			expect(response.body.payload).to.have.property('id');  // Confirma criação
			createdProduct = response.body.payload;  // Salva produto para testes posteriores
		});

		// Teste: Tentativa de criação sem autenticação
		it('Deve retornar erro 401 ao tentar criar produto sem autenticação', async () => {
			const newProductMock = {
				title: "Produto Não Autenticado",
				price: 10,
				code: `NOAUTH-${Date.now()}`,
				stock: 1,
				category: 'Test'
			};
			const response = await requester.post('/api/products').send(newProductMock);
			expect(response.status).to.equal(401);  // Status HTTP Unauthorized
		});
	});

	// Contexto: Testes de consulta de produtos
	context('Operações de Consulta (GET /api/products)', () => {
		// Teste: Listagem paginada de produtos
		it('Deve retornar uma lista paginada de produtos com status 200', async () => {
			const response = await requester.get('/api/products?limit=5&page=1');
			expect(response.status).to.equal(200);  // Status HTTP OK
			expect(response.body.payload).to.have.property('docs');  // Confirma estrutura paginada
		});

		// Teste: Obtenção de produto por ID
		it('Deve retornar detalhes de um produto específico por ID', async () => {
			const response = await requester.get(`/api/products/${createdProduct.id}`);
			expect(response.status).to.equal(200);  // Status HTTP OK
			// Confirma que o ID do produto retornado é o mesmo criado anteriormente
			expect(response.body.payload).to.have.property('id', createdProduct.id);
		});
	});

	// Contexto: Testes de atualização de produtos
	context('Operações de Atualização (PUT /api/products/:pid)', () => {
		// Teste: Atualização de produto por administrador
		it('Deve atualizar um produto com sucesso e retornar status 200', async () => {
			const updatedData = { price: 199.99 };  // Novo preço
			const response = await requester.put(`/api/products/${createdProduct.id}`)
				.set('Cookie', adminTokenCookie)
				.send(updatedData);

			// Verificações:
			expect(response.status).to.equal(200);  // Status HTTP OK
			expect(response.body.payload.price).to.equal(199.99);  // Confirma atualização
		});

		// Teste: Tentativa de atualização por usuário não-admin
		it('Deve retornar erro 403 ao tentar atualizar sem ser admin', async () => {
			const updatedData = { price: 250 };
			const response = await requester.put(`/api/products/${createdProduct.id}`)
				.set('Cookie', userTokenCookie)  // Usa token de usuário comum
				.send(updatedData);
			expect(response.status).to.equal(403);  // Status HTTP Forbidden (proibido)
		});
	});

	// Contexto: Testes de exclusão de produtos
	context('Operações de Exclusão (DELETE /api/products/:pid)', () => {
		// Teste: Exclusão de produto por administrador
		it('Deve excluir um produto com sucesso e retornar status 200', async () => {
			const response = await requester.delete(`/api/products/${createdProduct.id}`)
				.set('Cookie', adminTokenCookie);

			// Verificações:
			expect(response.status).to.equal(200);  // Status HTTP OK
			expect(response.body.message).to.equal('Produto deletado com sucesso.');  // Mensagem de confirmação
		});

		// Teste: Tentativa de excluir produto inexistente
		it('Deve retornar erro 404 ao tentar excluir produto inexistente', async () => {
			// Gera um ID válido porém inexistente no banco
			const nonExistentId = new mongoose.Types.ObjectId().toHexString();
			const response = await requester.delete(`/api/products/${nonExistentId}`)
				.set('Cookie', adminTokenCookie);
			expect(response.status).to.equal(404);  // Status HTTP Not Found
		});
	});
});