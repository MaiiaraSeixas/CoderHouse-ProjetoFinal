import { expect } from 'chai';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import UserModel from '../models/user.model.js'; // 1. Importar o modelo de usuário
import { createHash } from '../utils/cryptography.js'; // 2. Importar o utilitário de hash

const requester = supertest(app);

describe('Teste de Integração da Rota de Produtos', () => {
    // ... (contexto do GET /api/products permanece o mesmo) ...
    context('Quando tento obter a lista de produtos (GET /api/products)', () => {
        it('Deve retornar status 200 e uma lista de produtos', async () => {
            const response = await requester.get('/api/products');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('payload');
            expect(response.body.payload.docs).to.be.an('array');
        });
    });

    context('Quando tento criar um novo produto (POST /api/products)', () => {
        let authTokenCookie;

        // 3. Mock do usuário administrador que vamos criar e usar
        const adminUserMock = {
            first_name: 'Admin',
            last_name: 'Tester',
            email: `admin-tester-${Date.now()}@test.com`, // Email único para cada execução
            password: 'admin-password123',
            role: 'admin' // Permissão necessária
        };

        before(async function() {
            this.timeout(10000); // Aumenta o timeout para criação e login

            // 4. Criar o usuário ADMIN diretamente no banco de dados de teste
            const hashedPassword = createHash(adminUserMock.password);
            await UserModel.create({ ...adminUserMock, password: hashedPassword });

            // 5. Agora, fazer login com o usuário que acabamos de criar
            const loginResponse = await requester.post('/api/sessions/login').send({
                email: adminUserMock.email,
                password: adminUserMock.password
            });
            
            // Se o login falhar, o teste vai quebrar aqui com uma mensagem clara
            expect(loginResponse.status).to.equal(200, 'O login do usuário de teste falhou');
            expect(loginResponse.headers).to.have.property('set-cookie');

            // Extrai e armazena o cookie de autenticação
            const cookies = loginResponse.headers['set-cookie'];
            authTokenCookie = cookies.find(cookie => cookie.startsWith('jwtCookieToken='));
            
            expect(authTokenCookie).to.exist;
        });

        // Hook "after" para limpar o usuário de teste após a execução
        after(async function() {
            this.timeout(5000);
            await mongoose.connection.collection('users').deleteOne({ email: adminUserMock.email });
        });

        it('Deve criar um produto com sucesso e retornar status 201', async function () {
            this.timeout(7000);
            const newProductMock = {
                title: "Produto de Teste Autorizado",
                description: "Descrição do produto de teste com token",
                code: `TEST-AUTH-${Math.random()}`,
                price: 150,
                stock: 30,
                category: "Teste Auth"
            };

            const response = await requester.post('/api/products')
                .set('Cookie', authTokenCookie)
                .send(newProductMock);

            expect(response.status).to.equal(201);
            expect(response.body.payload).to.have.property('_id');
        });

        it('Deve retornar erro de validação (status 400) se faltarem campos obrigatórios', async function () {
            this.timeout(5000);
            const invalidProductMock = {
                description: "Produto sem título",
                price: 150
            };
            
            const response = await requester.post('/api/products')
                .set('Cookie', authTokenCookie)
                .send(invalidProductMock);
            
            expect(response.status).to.equal(400);
        });
    });
});