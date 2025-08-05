// src/tests/products.repository.test.js

// Importa o Mongoose para manipular conexão com MongoDB
import mongoose from 'mongoose';
// Importa o Chai para realizar asserções nos testes
import { expect } from 'chai';
// Importa o repositório que será testado
import { productRepository } from '../repositories/product.repository.js';
// Importa as configurações, incluindo a URL de teste do MongoDB
import config from '../config/config.js';

// // Hook que roda antes de todos os testes
// before(async function () {
// 	this.timeout(10000); // Tempo maior para conectar ao banco
// 	// Verifica se a URL de teste foi definida
// 	if (!config.MONGO_URL_TEST) {
// 		throw new Error("MONGO_URL_TEST não está definida no arquivo .env");
// 	}
// 	// Conecta ao banco de dados de teste
// 	await mongoose.connect(config.MONGO_URL_TEST);
// });

// Hook que roda antes de cada teste
beforeEach(async function () {
	this.timeout(10000); // Tempo maior para evitar timeout em ambientes lentos
	// Limpa a coleção de produtos antes de cada teste
	await mongoose.connection.collection('products').deleteMany({});
});

// // Hook que roda após todos os testes
// after(async () => {
// 	// Fecha a conexão com o banco após a execução dos testes
// 	await mongoose.connection.close();
// });

// Bloco principal que descreve os testes do repositório de produtos
describe('Teste de Unidade do Repositório de Produtos', () => {

	// Teste: retornar lista de produtos paginada
	it('Deve retornar uma lista de produtos paginada', async function () {
		this.timeout(5000);
		const result = await productRepository.getProducts({ page: 1, limit: 10 });

		// Verifica se o resultado é um objeto e possui o campo 'docs' com um array
		expect(result).to.be.an('object');
		expect(result).to.have.property('docs');
		expect(result.docs).to.be.an('array');
	});

	// Teste: adicionar um novo produto no banco
	it('Deve adicionar um produto ao banco de dados com sucesso', async function () {
		this.timeout(5000);
		// Define um objeto simulado de produto
		const productMock = {
			title: "Produto Repo Test",
			description: "Descrição do teste de repositório",
			code: `REPO-TEST-${Date.now()}`, // Gera um código único com timestamp
			price: 200,
			stock: 10,
			category: "Repo Test"
		};
		// Adiciona o produto usando o repositório
		const newProduct = await productRepository.addProduct(productMock);

		// Verifica se o produto foi criado corretamente
		expect(newProduct).to.be.an('object');
		expect(newProduct).to.have.property('_id'); // Deve ter um ID gerado pelo MongoDB
		expect(newProduct.title).to.equal(productMock.title);
	});

	// Teste: buscar um produto pelo seu ID
	it('Deve encontrar um produto pelo seu ID', async function () {
		this.timeout(5000);
		// Cria um novo produto para realizar a busca
		const productMock = {
			title: "Produto para Busca",
			description: "Descrição",
			code: `REPO-FIND-${Date.now()}`,
			price: 250,
			stock: 5,
			category: "Repo Test"
		};
		// Adiciona o produto ao banco
		const createdProduct = await productRepository.addProduct(productMock);
		// Busca o produto usando o ID retornado
		const foundProduct = await productRepository.getProductById(createdProduct._id);

		// Verifica se o produto encontrado tem o mesmo ID do criado
		expect(foundProduct._id.toString()).to.equal(createdProduct._id.toString());
	});
});
