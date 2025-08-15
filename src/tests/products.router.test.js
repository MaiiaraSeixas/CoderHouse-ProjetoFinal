// Arquivo 3: src/tests/products.router.test.js
// Correção para o Erro 2: "createdProduct is not defined"
// O que foi alterado: A variável `createdProduct` foi movida para o escopo correto
// e a asserção foi corrigida de `_id` para `id`.
// Porquê: Isto garante que a variável que guarda o produto criado esteja
// acessível para os testes seguintes e que a propriedade correta (`id`) seja verificada.
// --------------------------------------------------------------------
// Testes de integração para as rotas de produtos
// Verifica o funcionamento completo da API de produtos

import { expect } from 'chai';          // Biblioteca de asserções
import mongoose from 'mongoose';        // ORM para MongoDB
import supertest from 'supertest';      // Cliente HTTP para testes de integração
import app from '../app.js';            // Aplicação Express (ponto de entrada)
import UserModel from '../models/user.model.js'; // Modelo de usuário
import { createHash } from '../utils/cryptography.js'; // Utilitário de criptografia

// Cria cliente de testes para a aplicação
const requester = supertest(app);

// Suite de testes para rotas de produtos
describe('Teste de Integração da Rota de Produtos', () => {
	let adminTokenCookie;    // Armazenará token JWT do admin
	let userTokenCookie;     // Armazenará token JWT do usuário comum

	// Hook executado ANTES de todos os testes
	before(async function () {
		this.timeout(15000); // Aumenta timeout para operações de inicialização

		// Limpa bancos de dados antes de iniciar os testes
		await UserModel.deleteMany({});
		await mongoose.connection.collection('products').deleteMany({});

		// Cria e autentica usuário ADMINISTRADOR
		const adminUserMock = {
			first_name: 'Admin',
			last_name: 'Tester',
			email: `admin-products-${Date.now()}@test.com`, // Email único
			password: 'admin-password123',
			role: 'admin'
		};
		// Registra admin
		await requester.post('/api/sessions/register').send(adminUserMock);
		// Faz login e obtém cookie de autenticação
		const adminLoginRes = await requester.post('/api/sessions/login').send({
			email: adminUserMock.email,
			password: adminUserMock.password
		});
		// Extrai cookie JWT do header de resposta
		adminTokenCookie = adminLoginRes.headers['set-cookie'].find(c => c.startsWith('jwtCookieToken='));

		// Cria e autentica usuário COMUM
		const userMock = {
			first_name: 'User',
			last_name: 'Tester',
			email: `user-products-${Date.now()}@test.com`, // Email único
			password: 'user-password123',
			role: 'user'
		};
		await requester.post('/api/sessions/register').send(userMock);
		const userLoginRes = await requester.post('/api/sessions/login').send({
			email: userMock.email,
			password: userMock.password
		});
		userTokenCookie = userLoginRes.headers['set-cookie'].find(c => c.startsWith('jwtCookieToken='));
	});

	// Hook executado APÓS todos os testes
	after(async function () {
		this.timeout(10000); // Aumenta timeout para limpeza
		// Remove todos os dados de teste dos bancos
		await mongoose.connection.collection('users').deleteMany({});
		await mongoose.connection.collection('products').deleteMany({});
	});

	// Contexto: Testes de criação de produtos
	context('Operações de Criação (POST /api/products)', () => {
		/**
		 * Teste: Criação bem-sucedida de produto
		 * - Verifica se admin pode criar novo produto
		 * - Confirma status 201 (Created)
		 * - Valida se resposta contém ID do novo produto
		 */
		it('Deve criar um produto com sucesso e retornar status 201', async function () {
			this.timeout(5000); // Aumenta timeout para operação

			// Dados do novo produto com código único
			const newProductMock = {
				title: "Produto de Teste",
				description: "Descrição",
				code: `PROD-${Date.now()}`,
				price: 150,
				stock: 30,
				category: "Teste"
			};

			// Envia requisição com token de admin
			const response = await requester.post('/api/products')
				.set('Cookie', adminTokenCookie)
				.send(newProductMock);

			// Verificações:
			expect(response.status).to.equal(201); // Status HTTP Created
			expect(response.body.payload).to.have.property('id'); // Confirma criação
		});
	});

	// Contexto: Testes para operações em produtos existentes
	context('Operações em um produto existente', () => {
		let createdProduct; // Armazenará produto criado para os testes

		// Hook executado ANTES de CADA teste neste contexto
		beforeEach(async function () {
			this.timeout(5000); // Aumenta timeout

			// Cria novo produto para cada teste
			const newProductMock = {
				title: "Produto para Testes Individuais",
				description: "Descrição",
				code: `INDIVIDUAL-${Date.now()}`, // Código único
				price: 100,
				stock: 20,
				category: "Individual"
			};

			// Cria produto usando conta admin
			const response = await requester.post('/api/products')
				.set('Cookie', adminTokenCookie)
				.send(newProductMock);

			// Armazena produto criado para uso nos testes
			createdProduct = response.body.payload;
		});

		/**
		 * Teste: Obtenção de produto por ID
		 * - Acessa rota GET /api/products/:id
		 * - Verifica resposta contém produto correto
		 */
		it('GET /:pid - Deve retornar detalhes de um produto específico por ID', async () => {
			// Busca produto pelo ID
			const response = await requester.get(`/api/products/${createdProduct.id}`);

			// Verificações:
			expect(response.status).to.equal(200); // Status HTTP OK
			// Confirma que o ID do produto retornado é o mesmo criado
			expect(response.body.payload).to.have.property('id', createdProduct.id);
		});

		/**
		 * Teste: Atualização de produto
		 * - Atualiza preço do produto
		 * - Verifica se atualização foi bem-sucedida
		 * 
		 * CORREÇÃO: Usa 'id' em vez de '_id' conforme mudança no código
		 */
		it('PUT /:pid - Deve atualizar um produto com sucesso e retornar status 200', async () => {
			// Dados para atualização
			const updatedData = { price: 199.99 };

			// Envia requisição de atualização
			const response = await requester.put(`/api/products/${createdProduct.id}`)
				.set('Cookie', adminTokenCookie)
				.send(updatedData);

			// Verificações:
			expect(response.status).to.equal(200); // Status HTTP OK
			// Confirma que o preço foi atualizado
			expect(response.body.payload.price).to.equal(199.99);
		});

		/**
		 * Teste: Exclusão de produto
		 * - Remove produto criado
		 * - Verifica mensagem de sucesso
		 * 
		 * CORREÇÃO: Usa 'id' em vez de '_id' conforme mudança no código
		 */
		it('DELETE /:pid - Deve excluir um produto com sucesso e retornar status 200', async () => {
			// Envia requisição de exclusão
			const response = await requester.delete(`/api/products/${createdProduct.id}`)
				.set('Cookie', adminTokenCookie);

			// Verificações:
			expect(response.status).to.equal(200); // Status HTTP OK
			expect(response.body.message).to.equal('Produto deletado com sucesso.');
		});

		/**
		 * Teste: Exclusão de produto inexistente
		 * - Tenta excluir com ID inválido
		 * - Verifica tratamento de erro (404 Not Found)
		 */
		it('DELETE /:pid - Deve retornar erro 404 ao tentar excluir produto inexistente', async () => {
			// Gera ID válido mas inexistente
			const nonExistentId = new mongoose.Types.ObjectId().toHexString();

			// Tenta excluir produto inexistente
			const response = await requester.delete(`/api/products/${nonExistentId}`)
				.set('Cookie', adminTokenCookie);

			expect(response.status).to.equal(404); // Status HTTP Not Found
		});
	});
});