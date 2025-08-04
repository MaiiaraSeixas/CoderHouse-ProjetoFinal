// src/tests/auth.router.test.js

import { expect } from 'chai';            // Biblioteca de assertions usada para validar os resultados dos testes
import supertest from 'supertest';       // Biblioteca para simular requisições HTTP ao servidor
import mongoose from 'mongoose';         // ODM para conexão com o banco de dados MongoDB
import app from '../app.js';             // Importa a aplicação Express
import UserModel from '../models/user.model.js';  // Importa o model de usuário para manipular dados no banco

const requester = supertest(app); // Instância do supertest com a aplicação carregada

// Testes agrupados usando "describe"
describe('Teste de Integração da Rota de Autenticação', () => {
    // Mock de usuário que será usado nos testes
    const userMock = {
        first_name: 'Auth',
        last_name: 'Tester',
        email: `auth-tester-${Date.now()}@test.com`,   // Email único (timestamp) para evitar colisão
        password: 'test-password123',
        role: 'user'
    };
    let authTokenCookie;  // Variável para guardar o cookie de autenticação entre os testes

    // Após os testes, remove o usuário criado do banco (limpeza)
    after(async function() {
        this.timeout(5000);
        await mongoose.connection.collection('users').deleteOne({ email: userMock.email });
    });

    // Grupo de testes relacionados ao registro
    context('Registro de Usuário (POST /api/sessions/register)', () => {
        // Caso de teste: deve registrar com sucesso
        it('Deve registrar um novo usuário com sucesso e retornar status 201', async function() {
            this.timeout(5000); 
            const response = await requester.post('/api/sessions/register').send(userMock);
            expect(response.status).to.equal(201); // Verifica se o status HTTP está correto
            expect(response.body.payload.user).to.have.property('email', userMock.email); // Confere se o usuário retornado é o mesmo
        });

        // Caso de teste: deve impedir registro duplicado
        it('Deve retornar erro 401 ao tentar registrar um usuário com email duplicado', async () => {
            const response = await requester.post('/api/sessions/register').send(userMock);
            expect(response.status).to.equal(401);
        });
    });

    // Grupo de testes relacionados ao login
    context('Login de Usuário (POST /api/sessions/login)', () => {
        it('Deve fazer o login de um usuário com sucesso e retornar um cookie de autenticação', async () => {
            const credentials = {
                email: userMock.email,
                password: userMock.password
            };
            const response = await requester.post('/api/sessions/login').send(credentials);
            expect(response.status).to.equal(200); // Espera sucesso no login
            const cookies = response.headers['set-cookie'];  // Captura os cookies retornados
            authTokenCookie = cookies.find(cookie => cookie.startsWith('jwtCookieToken=')); // Armazena o cookie JWT
            expect(authTokenCookie).to.exist; // Verifica se o cookie existe
        });

        // Caso negativo: senha incorreta
        it('Deve retornar erro 401 ao tentar fazer login com senha incorreta', async function() {
            this.timeout(5000);
            const credentials = {
                email: userMock.email,
                password: 'wrong-password'
            };
            const response = await requester.post('/api/sessions/login').send(credentials);
            expect(response.status).to.equal(401);
        });
    });

    // Grupo de testes relacionados à rota de verificação de sessão atual
    context('Verificação de Sessão (GET /api/sessions/current)', () => {
        // Teste com cookie válido
        it('Deve retornar os dados do usuário autenticado ao enviar um cookie válido', async () => {
            const response = await requester.get('/api/sessions/current').set('Cookie', authTokenCookie);
            expect(response.status).to.equal(200); // Deve permitir o acesso
            expect(response.body.payload.user).to.have.property('email', userMock.email);
        });

        // Teste sem o cookie
        it('Deve retornar erro 401 ao tentar acessar a rota sem um cookie de autenticação', async () => {
            const response = await requester.get('/api/sessions/current');
            expect(response.status).to.equal(401); // Deve barrar o acesso
        });
    });
});
