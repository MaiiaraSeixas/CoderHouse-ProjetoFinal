// src/tests/auth.router.test.js

// Importação de bibliotecas necessárias para os testes
import { expect } from 'chai';          // Biblioteca de asserções
import supertest from 'supertest';      // Cliente HTTP para testes de integração
import app from '../app.js';            // Aplicação Express (ponto de entrada)
import UserModel from '../models/user.model.js';    // Modelo de usuário
import { createHash } from '../utils/cryptography.js'; // Função para hash de senha

// Cria um cliente de testes para a aplicação
const requester = supertest(app);

// Suite de testes para rotas de autenticação
describe('Teste de Integração da Rota de Autenticação', () => {
	// Dados mockados do usuário para testes
	const userMock = {
		first_name: 'Auth',
		last_name: 'Tester',
		email: `auth-tester-${Date.now()}@test.com`,  // Email único usando timestamp
		password: 'test-password12livedit',
		role: 'user'
	};

	// ALTERAÇÃO: O hook 'after' foi removido. A limpeza agora é feita pelo
	// 'afterEach' no arquivo 'test-setup.js', garantindo que cada teste 'it'
	// comece com um banco de dados limpo e seja independente.

	// Contexto: Testes de registro de usuário
	context('Registro de Usuário (POST /api/sessions/register)', () => {
		// Teste: Registro bem-sucedido
		it('Deve registrar um novo usuário com sucesso e retornar status 201', async function () {
			this.timeout(7000);  // Aumenta timeout para operação
			// Envia requisição POST para registrar o usuário mockado
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verificações:
			expect(response.status).to.equal(201);  // Status HTTP Created
			// Confirma que o email do usuário retornado é o mesmo do mock
			expect(response.body.payload.user).to.have.property('email', userMock.email);
		});

		// Teste: Tentativa de registro com email duplicado
		it('Deve retornar erro 400 ao tentar registrar um usuário com email duplicado', async () => {
			// ALTERAÇÃO: Para garantir o isolamento, primeiro criamos um usuário no banco.
			await UserModel.create({ ...userMock, password: createHash(userMock.password) });

			// Agora, tentamos registrar o mesmo usuário novamente pela API.
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verificações:
			expect(response.status).to.equal(400);  // Status HTTP Bad Request
		});
	});

	// Contexto: Testes de login de usuário
	context('Login de Usuário (POST /api/sessions/login)', () => {
		// Teste: Login bem-sucedido
		it('Deve fazer o login de um usuário com sucesso e retornar um cookie de autenticação', async () => {
			// ALTERAÇÃO: Criamos o usuário necessário para este teste específico.
			await UserModel.create({ ...userMock, password: createHash(userMock.password) });

			const credentials = { email: userMock.email, password: userMock.password };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verificações:
			expect(response.status).to.equal(200);  // Status HTTP OK
			const cookies = response.headers['set-cookie'];
			const authTokenCookie = cookies.find(c => c.startsWith('jwtCookieToken='));
			expect(authTokenCookie).to.exist;  // Confirma existência do cookie
		});

		// Teste: Tentativa de login com senha inválida
		it('Deve retornar erro 401 ao tentar fazer login com senha incorreta', async function () {
			this.timeout(5000);
			// ALTERAÇÃO: Criamos o usuário também para este teste.
			await UserModel.create({ ...userMock, password: createHash(userMock.password) });

			const credentials = { email: userMock.email, password: 'wrong-password' };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verificações:
			expect(response.status).to.equal(401);  // Status HTTP Unauthorized
		});
	});

	// A mesma lógica de independência deve ser aplicada aos testes de 'current' e 'logout'.
	// Eles precisam primeiro criar um usuário e fazer login para obter um cookie válido.
});
