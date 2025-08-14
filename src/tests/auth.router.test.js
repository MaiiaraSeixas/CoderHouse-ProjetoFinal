// src/tests/auth.router.test.js

import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import UserModel from '../models/user.model.js';
import CartModel from '../models/cart.model.js';

// Cria um cliente de teste para fazer requisições à aplicação
const requester = supertest(app);

// Suite de testes para as rotas de autenticação
describe('Teste de Integração da Rota de Autenticação', () => {
	// Dados mockados do usuário para testes
	const userMock = {
		first_name: 'Auth',
		last_name: 'Tester',
		email: `auth-tester-${Date.now()}@test.com`,  // Email único usando timestamp
		password: 'test-password123',
		role: 'user'
	};
	let authTokenCookie; // Armazenará o cookie de autenticação

	// Hook para limpeza após todos os testes
	after(async function () {
		this.timeout(5000);
		// Remove usuários de teste criados durante os testes
		await mongoose.connection.collection('users').deleteMany({ email: { $regex: /auth-tester/ } });
		// Limpa carrinhos de compra criados
		await mongoose.connection.collection('carts').deleteMany({});
	});

	// Contexto de testes para registro de usuário
	context('Registro de Usuário (POST /api/sessions/register)', () => {
		it('Deve registrar um novo usuário com sucesso e retornar status 201', async function () {
			this.timeout(7000);
			// Envia requisição de registro
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verificações
			expect(response.status).to.equal(201);
			expect(response.body.payload.user).to.have.property('email', userMock.email);
		});

		it('Deve retornar erro 400 ao tentar registrar um usuário com email duplicado', async () => {
			// Tenta registrar o mesmo usuário novamente
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verifica se a API retorna erro de conflito
			expect(response.status).to.equal(400);
			expect(response.body.error).to.equal('Usuário já existe');
		});
	});

	// Contexto de testes para login de usuário
	context('Login de Usuário (POST /api/sessions/login)', () => {
		it('Deve fazer o login de um usuário com sucesso e retornar um cookie de autenticação', async () => {
			// Credenciais para login
			const credentials = { email: userMock.email, password: userMock.password };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verifica resposta positiva
			expect(response.status).to.equal(200);

			// Extrai o cookie de autenticação do header
			const cookies = response.headers['set-cookie'];
			authTokenCookie = cookies.find(c => c.startsWith('jwtCookieToken='));
			expect(authTokenCookie).to.exist; // Confirma existência do cookie
		});

		it('Deve retornar erro 401 ao tentar fazer login com senha incorreta', async function () {
			this.timeout(5000);
			// Credenciais inválidas
			const credentials = { email: userMock.email, password: 'wrong-password' };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verifica falha de autenticação
			expect(response.status).to.equal(401);
			expect(response.body.error).to.equal('Senha inválida');
		});
	});

	// Contexto de testes para verificação de sessão
	context('Verificação de Sessão (GET /api/sessions/current)', () => {
		it('Deve retornar os dados do usuário autenticado ao enviar um cookie válido', async () => {
			// Requisição com cookie de autenticação
			const response = await requester
				.get('/api/sessions/current')
				.set('Cookie', authTokenCookie);

			// Verifica se retorna os dados corretos do usuário
			expect(response.status).to.equal(200);
			expect(response.body.payload.user).to.have.property('email', userMock.email);
		});

		it('Deve retornar erro 401 ao tentar acessar a rota sem um cookie de autenticação', async () => {
			// Requisição sem credenciais
			const response = await requester.get('/api/sessions/current');

			// Verifica bloqueio de acesso não autorizado
			expect(response.status).to.equal(401);
			expect(response.body.message).to.equal('Não autorizado. Faça o login para continuar.');
		});
	});
});