// Importando bibliotecas necessárias para os testes
import { expect } from 'chai';          // Biblioteca de asserções
import supertest from 'supertest';      // Cliente HTTP para testes de integração
import mongoose from 'mongoose';        // ORM para MongoDB
import app from '../app.js';            // Aplicação Express (ponto de entrada)
import UserModel from '../models/user.model.js';    // Modelo de usuário
import CartModel from '../models/cart.model.js';    // Modelo de carrinho

// Cria um cliente de testes para a aplicação
const requester = supertest(app);

// Suite de testes para rotas de autenticação
describe('Teste de Integração da Rota de Autenticação', () => {
	// Dados mockados do usuário para testes
	const userMock = {
		first_name: 'Auth',
		last_name: 'Tester',
		email: `auth-tester-${Date.now()}@test.com`,  // Email único usando timestamp
		password: 'test-password123',
		role: 'user'
	};
	let authTokenCookie;  // Armazenará o cookie de autenticação

	// Hook executado APÓS todos os testes deste describe
	after(async function () {
		this.timeout(5000);  // Aumenta timeout para operações de limpeza
		// Remove usuários criados nos testes (com email contendo 'auth-tester')
		await mongoose.connection.collection('users').deleteMany({ email: { $regex: /auth-tester/ } });
		// Limpa todos os carrinhos criados durante os testes
		await mongoose.connection.collection('carts').deleteMany({});
	});

	// Contexto: Testes de registro de usuário
	context('Registro de Usuário (POST /api/sessions/register)', () => {
		// Teste: Registro bem-sucedido
		it('Deve registrar um novo usuário com sucesso e retornar status 201', async function () {
			this.timeout(7000);  // Aumenta timeout para operação
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verificações:
			expect(response.status).to.equal(201);  // Status HTTP Created
			expect(response.body.payload.user).to.have.property('email', userMock.email);  // Confirma email
		});

		// Teste: Tentativa de registro com email duplicado
		it('Deve retornar erro 400 ao tentar registrar um usuário com email duplicado', async () => {
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Verificações:
			expect(response.status).to.equal(400);  // Status HTTP Bad Request
			expect(response.body.error).to.equal('Usuário já cadastrado');  // Mensagem de erro
		});
	});

	// Contexto: Testes de login de usuário
	context('Login de Usuário (POST /api/sessions/login)', () => {
		// Teste: Login bem-sucedido
		it('Deve fazer o login de um usuário com sucesso e retornar um cookie de autenticação', async () => {
			const credentials = { email: userMock.email, password: userMock.password };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verificações:
			expect(response.status).to.equal(200);  // Status HTTP OK
			const cookies = response.headers['set-cookie'];  // Extrai cookies da resposta
			// Encontra o cookie de autenticação JWT
			authTokenCookie = cookies.find(c => c.startsWith('jwtCookieToken='));
			expect(authTokenCookie).to.exist;  // Confirma existência do cookie
		});

		// Teste: Tentativa de login com senha inválida
		it('Deve retornar erro 401 ao tentar fazer login com senha incorreta', async function () {
			this.timeout(5000);  // Aumenta timeout
			const credentials = { email: userMock.email, password: 'wrong-password' };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Verificações:
			expect(response.status).to.equal(401);  // Status HTTP Unauthorized
			expect(response.body.error).to.equal('Senha inválida');  // Mensagem de erro
		});
	});

	// Contexto: Testes de verificação de sessão
	context('Verificação de Sessão (GET /api/sessions/current)', () => {
		// Teste: Recuperação de dados do usuário autenticado
		it('Deve retornar os dados do usuário autenticado ao enviar um cookie válido', async () => {
			// Faz requisição enviando o cookie de autenticação salvo
			const response = await requester.get('/api/sessions/current').set('Cookie', authTokenCookie);

			// Verificações:
			expect(response.status).to.equal(200);  // Status HTTP OK
			expect(response.body.payload.user).to.have.property('email', userMock.email);  // Email confere
		});

		// Teste: Acesso não autorizado sem cookie
		it('Deve retornar erro 401 ao tentar acessar a rota sem um cookie de autenticação', async () => {
			const response = await requester.get('/api/sessions/current');  // Sem cookie

			// Verificações:
			expect(response.status).to.equal(401);  // Status HTTP Unauthorized
			expect(response.body.message).to.equal('Não autorizado. Faça o login para continuar.');  // Mensagem
		});
	});
});