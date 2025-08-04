// src/tests/products.repository.test.js

import mongoose from 'mongoose';
import { expect } from 'chai';
import { productRepository } from '../repositories/product.repository.js';
import config from '../config/config.js';

// Conecta-se a um banco de dados de teste antes de iniciar os testes
before(async function() {
    // Aumentamos o timeout para a conexão inicial para 10 segundos (10000ms)
    this.timeout(10000); 
    if (!config.MONGO_URL_TEST) {
        throw new Error("MONGO_URL_TEST não está definida no arquivo .env");
    }
    await mongoose.connect(config.MONGO_URL_TEST);
});

// Limpa a coleção de produtos antes de cada teste
beforeEach(async function () {
    // Aumentamos o timeout para a limpeza da coleção para 10 segundos
    this.timeout(10000);
    await mongoose.connection.collection('products').deleteMany({});
});

// Desconecta do banco de dados após todos os testes
after(async () => {
    await mongoose.connection.close();
});

describe('Teste de Unidade do Repositório de Produtos', () => {
    
    it('Deve retornar uma lista de produtos paginada', async () => {
        const result = await productRepository.getProducts({ page: 1, limit: 10 });
        
        expect(result).to.be.an('object');
        expect(result).to.have.property('docs');
        expect(result.docs).to.be.an('array');
    });

    it('Deve adicionar um produto ao banco de dados com sucesso', async () => {
        const productMock = {
            title: "Produto Repo Test",
            description: "Descrição do teste de repositório",
            code: "REPO-TEST-01",
            price: 200,
            stock: 10,
            category: "Repo Test"
        };

        const newProduct = await productRepository.addProduct(productMock);

        expect(newProduct).to.be.an('object');
        expect(newProduct).to.have.property('_id');
        expect(newProduct.title).to.equal(productMock.title);
    });

    it('Deve encontrar um produto pelo seu ID', async () => {
        const productMock = {
            title: "Produto para Busca",
            description: "Descrição",
            code: "REPO-FIND-01",
            price: 250,
            stock: 5,
            category: "Repo Test"
        };
        const createdProduct = await productRepository.addProduct(productMock);
        const productId = createdProduct._id;

        const foundProduct = await productRepository.getProductById(productId);

        expect(foundProduct._id.toString()).to.equal(productId.toString());
    });
});
