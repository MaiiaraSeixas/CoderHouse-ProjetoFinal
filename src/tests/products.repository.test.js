// src/tests/products.repository.test.js

import mongoose from 'mongoose';
import { expect } from 'chai';
import ProductRepository from '../repositories/product.repository.js';

// Cria uma instância do repositório para testes
const productRepository = new ProductRepository();

// Hook executado antes de cada teste
beforeEach(async function () {
	this.timeout(10000); // Timeout aumentado para operações de banco
	// Limpa a coleção de produtos antes de cada teste
	await mongoose.connection.collection('products').deleteMany({});
});

/**
 * Conjunto de testes de unidade para o ProductRepository
 * 
 * Testa as operações básicas de CRUD no banco de dados:
 * 1. Paginação de produtos
 * 2. Criação de novos produtos
 * 3. Busca de produtos por ID
 */
describe('Teste de Unidade do Repositório de Produtos', () => {

	/**
	 * Teste: Paginação de produtos
	 * 
	 * Verifica se o repositório retorna uma estrutura paginada
	 * mesmo quando não há produtos no banco
	 */
	it('Deve retornar uma lista de produtos paginada', async function () {
		this.timeout(5000); // Timeout específico para este teste

		// Chama o método de paginação com parâmetros básicos
		const result = await productRepository.getProducts(
			{}, // Filtro vazio (todos os produtos)
			{
				page: 1,
				limit: 10,
				lean: true // Retorna objetos simples em vez de documentos Mongoose
			}
		);

		// Verificações da estrutura de retorno:
		expect(result).to.be.an('object'); // 1. Retorna um objeto
		expect(result).to.have.property('docs'); // 2. Possui propriedade 'docs'
		expect(result.docs).to.be.an('array'); // 3. 'docs' é um array
		expect(result.docs).to.be.empty; // 4. Array vazio após limpeza
	});

	/**
	 * Teste: Criação de produto
	 * 
	 * Valida o fluxo completo de persistência de um novo produto
	 * no banco de dados através do repositório
	 */
	it('Deve adicionar um produto ao banco de dados com sucesso', async function () {
		this.timeout(5000);

		// Mock de dados do produto
		const productMock = {
			title: "Produto Repo Test",
			description: "Descrição do teste de repositório",
			code: `REPO-TEST-${Date.now()}`, // Código único com timestamp
			price: 200,
			stock: 10,
			category: "Repo Test"
		};

		// Cria o produto usando o repositório
		const newProduct = await productRepository.createProduct(productMock);

		// Verificações:
		expect(newProduct).to.be.an('object'); // 1. Retorna um objeto
		expect(newProduct).to.have.property('id'); // 2. Possui ID gerado
		expect(newProduct.title).to.equal(productMock.title); // 3. Título corresponde
		expect(newProduct.code).to.equal(productMock.code); // 4. Código corresponde
	});

	/**
	 * Teste: Busca de produto por ID
	 * 
	 * Valida a recuperação de um produto previamente persistido
	 * usando seu identificador único
	 */
	it('Deve encontrar um produto pelo seu ID', async function () {
		this.timeout(10000); // Timeout maior para operação sequencial

		// Mock de dados do produto
		const productMock = {
			title: "Produto para Busca",
			description: "Descrição",
			code: `REPO-FIND-${Date.now()}`, // Código único
			price: 250,
			stock: 5,
			category: "Repo Test"
		};

		// Cria o produto e depois busca pelo mesmo ID
		const createdProduct = await productRepository.createProduct(productMock);
		const foundProduct = await productRepository.getProductById(createdProduct.id);

		// Verificações:
		expect(foundProduct).to.be.an('object'); // 1. Retorna um objeto
		expect(foundProduct.id.toString()).to.equal(createdProduct.id.toString()); // 2. IDs correspondem
		expect(foundProduct.title).to.equal(productMock.title); // 3. Título preservado
	});
});