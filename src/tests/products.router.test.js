// src/tests/products.router.test.js

// CORREÇÃO: Importamos 'expect' diretamente como um export nomeado do chai.
import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js'; // Importa a aplicação Express configurada

// O supertest nos permite fazer requisições HTTP para a nossa aplicação.
const requester = supertest(app);

describe('Teste de Integração da Rota de Produtos', () => {
    // Contexto para os testes de GET
    context('Quando tento obter a lista de produtos (GET /api/products)', () => {
        it('Deve retornar status 200 e uma lista de produtos', async () => {
            // Faz a requisição GET para o endpoint
            const response = await requester.get('/api/products');

            // Verifica o status code da resposta
            expect(response.status).to.equal(200);
            // Verifica se o corpo da resposta tem a propriedade 'payload'
            expect(response.body).to.have.property('payload');
            // Verifica se o payload é um array (lista de produtos)
            expect(response.body.payload.docs).to.be.an('array');
        });
    });

    // Contexto para os testes de POST
    context('Quando tento criar um novo produto (POST /api/products)', () => {
        it('Deve criar um produto com sucesso e retornar status 201', async () => {
            // Mock de um novo produto para ser enviado no corpo da requisição
            const newProductMock = {
                title: "Produto de Teste de Rota",
                description: "Descrição do produto de teste de rota",
                code: `TEST-ROUTE-${Math.random()}`, // Código único para evitar duplicatas
                price: 100,
                stock: 50,
                category: "Teste Rota"
            };

            // Faz a requisição POST com o mock
            const response = await requester.post('/api/products').send(newProductMock);

            // Verifica o status code de criação
            expect(response.status).to.equal(201);
            // Verifica se o corpo da resposta contém o payload com o produto criado
            expect(response.body).to.have.property('payload');
            // Verifica se o produto criado no payload tem um _id, indicando que foi salvo no DB
            expect(response.body.payload).to.have.property('_id');
            // Verifica se o título do produto criado corresponde ao do mock
            expect(response.body.payload.title).to.equal(newProductMock.title);
        });

        it('Deve retornar erro de validação (status 400) se faltarem campos obrigatórios', async () => {
            // Mock de um produto inválido (sem o campo 'title')
            const invalidProductMock = {
                description: "Produto sem título",
                price: 150
            };

            // Faz a requisição POST com o mock inválido
            const response = await requester.post('/api/products').send(invalidProductMock);

            // Verifica se o status code é 400 (Bad Request)
            expect(response.status).to.equal(400);
        });
    });
});
