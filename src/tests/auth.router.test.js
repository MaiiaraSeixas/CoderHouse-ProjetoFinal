// src/tests/auth.router.test.js

// --- IMPORTAÇÕES DE DEPENDÊNCIAS E MODELS ---
import { expect } from 'chai';               // Framework de asserções para validar o comportamento dos testes
import supertest from 'supertest';           // Biblioteca que simula requisições HTTP ao servidor
import mongoose from 'mongoose';             // ODM responsável por conectar e manipular o MongoDB
import app from '../app.js';                 // Importação da aplicação Express que será testada
import UserModel from '../models/user.model.js';   // Model responsável pela collection de usuários
import CartModel from '../models/cart.model.js';   // Model responsável pela collection de carrinhos

// Cria um "requester" do supertest utilizando a aplicação Express para enviar requisições de teste
const requester = supertest(app);

// --- BLOCO PRINCIPAL DE TESTES ---
describe('Teste de Integração da Rota de Autenticação', () => {

	// Mock de usuário criado para ser usado nos testes
	const userMock = {
		first_name: 'Auth',                                   // Nome fictício
		last_name: 'Tester',                                  // Sobrenome fictício
		email: `auth-tester-${Date.now()}@test.com`,          // Email único usando timestamp
		password: 'test-password123',                         // Senha fictícia
		role: 'user'                                          // Papel padrão de usuário
	};

	// Essa variável guardará o cookie JWT retornado no login com sucesso
	let authTokenCookie;

	/**
	 * HOOK "after":
	 * Executa automaticamente **após todos os testes deste bloco**.
	 * Serve para limpar o que foi criado no banco (boa prática).
	 */
	after(async function () {
		this.timeout(5000); // Aumenta o tempo limite para evitar timeouts

		// Busca o usuário pelo email mockado
		const user = await UserModel.findOne({ email: userMock.email });

		if (user) {
			// Se existir carrinho associado ao usuário -> removê-lo também
			if (user.cartId) {
				await CartModel.findByIdAndDelete(user.cartId);
			}
			// Por fim, remove o usuário de teste
			await UserModel.findByIdAndDelete(user._id);
		}
	});

	// --- 1) TESTES DE REGISTRO (Rota: POST /api/sessions/register) ---
	context('Registro de Usuário (POST /api/sessions/register)', () => {

		it('Deve registrar um novo usuário com sucesso e retornar status 201', async function () {
			this.timeout(7000); // Evita timeout

			// Envia requisição POST de cadastro com o usuário fictício
			const response = await requester.post('/api/sessions/register').send(userMock);

			// Espera que o status seja 201 (Created)
			expect(response.status).to.equal(201);
			// Verifica se o usuário retornado no payload tem o mesmo email do mock
			expect(response.body.payload.user).to.have.property('email', userMock.email);
		});

		it('Deve retornar erro 401 ao tentar registrar um usuário com email duplicado', async () => {
			// Tenta registrar o mesmo usuário novamente
			// Esperado: erro 401 (já existe usuário com esse email)
			const response = await requester.post('/api/sessions/register').send(userMock);
			expect(response.status).to.equal(401);
		});
	});

	// --- 2) TESTES DE LOGIN (Rota: POST /api/sessions/login) ---
	context('Login de Usuário (POST /api/sessions/login)', () => {

		it('Deve fazer o login de um usuário com sucesso e retornar um cookie de autenticação', async () => {
			// Monta o corpo da requisição com email + senha corretos
			const credentials = { email: userMock.email, password: userMock.password };

			// Faz login
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Espera status 200 (OK)
			expect(response.status).to.equal(200);

			// Captura cookies retornados na resposta (header Set-Cookie)
			const cookies = response.headers['set-cookie'];

			// Procura especificamente pelo cookie chamado "jwtCookieToken"
			authTokenCookie = cookies.find(c => c.startsWith('jwtCookieToken='));

			// O token deve existir se o login estiver correto
			expect(authTokenCookie).to.exist;
		});

		it('Deve retornar erro 401 ao tentar fazer login com senha incorreta', async function () {
			this.timeout(5000);

			// Usa uma senha errada
			const credentials = { email: userMock.email, password: 'wrong-password' };
			const response = await requester.post('/api/sessions/login').send(credentials);

			// Esperado: erro 401 (Unauthorized)
			expect(response.status).to.equal(401);
		});
	});

	// --- 3) TESTES DE VERIFICAÇÃO DE SESSÃO (Rota: GET /api/sessions/current) ---
	context('Verificação de Sessão (GET /api/sessions/current)', () => {

		it('Deve retornar os dados do usuário autenticado ao enviar um cookie válido', async () => {
			// Envia requisição GET com o cookie de autenticação obtido no login
			const response = await requester
				.get('/api/sessions/current')
				.set('Cookie', authTokenCookie); // Seta o cookie no header

			expect(response.status).to.equal(200);
			// Deve retornar o usuário autenticado correspondente ao cookie
			expect(response.body.payload.user).to.have.property('email', userMock.email);
		});

		it('Deve retornar erro 401 ao tentar acessar a rota sem um cookie de autenticação', async () => {
			// Faz a requisição sem enviar o cookie
			const response = await requester.get('/api/sessions/current');
			// A API deve bloquear o acesso
			expect(response.status).to.equal(401);
		});
	});

});
