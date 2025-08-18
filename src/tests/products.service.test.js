// src/tests/products.service.test.js

import { expect } from 'chai';
import sinon from 'sinon';
import ProductRepository from '../repositories/product.repository.js';
import { ProductService } from '../services/products.service.js'

/**
 * Conjunto de testes de unidade para o ProductService
 * 
 * Testa a camada de serviço de produtos, focando em:
 * 1. Integração com o repositório
 * 2. Validação de regras de negócio
 * 3. Tratamento de erros
 */
describe('Teste de Unidade para ProductService', () => {
  let productService;
  let productRepositoryStub;

  // Configuração antes de cada teste
  beforeEach(() => {
    // Cria um stub (mock) para o ProductRepository
    productRepositoryStub = sinon.createStubInstance(ProductRepository);

    // Instancia o serviço real que será testado
    productService = new ProductService();

    // Injeta o repositório mockado no serviço
    productService.productRepository = productRepositoryStub;
  });

  // Limpeza após cada teste
  afterEach(() => {
    sinon.restore();
  });

  /**
   * Teste: Obtenção de produtos com parâmetros
   * 
   * Verifica se o serviço:
   * 1. Converte corretamente os parâmetros de consulta
   * 2. Chama o repositório com os filtros e opções corretas
   */
  it('Deve chamar o repositório para obter produtos com os parâmetros corretos', async () => {
    // Parâmetros de entrada para a consulta
    const params = {
      limit: 5,
      page: 2,
      sort: 'asc',
      query: 'Eletrônicos'
    };

    // Filtro esperado que será passado ao repositório
    const expectedFilter = { category: 'Eletrônicos' };

    // Opções esperadas para paginação e ordenação
    const expectedOptions = {
      page: 2,
      limit: 5,
      lean: true,
      sort: { price: 1 }, // 1 = asc (ascendente)
    };

    // Configura o stub para retornar uma resposta simulada
    productRepositoryStub.getProducts.resolves({
      docs: [],
      totalPages: 1
    });

    // Chama o método do serviço
    await productService.getProducts(params);

    // Verifica se o repositório foi chamado com os parâmetros corretos
    expect(productRepositoryStub.getProducts.calledOnceWith(expectedFilter, expectedOptions)).to.be.true;
  });

  /**
   * Teste: Tentativa de adicionar produto inválido
   * 
   * Verifica se o serviço:
   * 1. Rejeita produtos sem título
   * 2. Lança erro com mensagem adequada
   * 3. Não chama o repositório para criação
   */
  it('Deve lançar um erro ao tentar adicionar um produto sem título', async () => {
    // Produto inválido (faltando título)
    const invalidProduct = { price: 150 };

    try {
      // Tenta adicionar o produto inválido
      await productService.addProduct(invalidProduct);

      // Se passar, força falha no teste
      expect.fail('O serviço deveria ter lançado um erro');
    } catch (error) {
      // Verificações:
      expect(error.message).to.equal('Título e preço são campos obrigatórios.');
      expect(productRepositoryStub.createProduct.called).to.be.false;
    }
  });

  /**
   * Teste: Criação de produto válido
   * 
   * Verifica se o serviço:
   * 1. Aceita produtos com dados obrigatórios
   * 2. Chama o repositório com os dados corretos
   * 3. Retorna o produto criado
   */
  it('Deve chamar o repositório para criar um produto com dados válidos', async () => {
    // Produto válido com todos os campos necessários
    const validProduct = {
      title: 'Produto Válido',
      price: 100,
      category: 'Teste'
    };

    // Configura o stub para retornar o produto criado
    productRepositoryStub.createProduct.resolves(validProduct);

    // Chama o método de criação
    const result = await productService.addProduct(validProduct);

    // Verificações:
    expect(productRepositoryStub.createProduct.calledOnceWith(validProduct)).to.be.true;
    expect(result).to.deep.equal(validProduct);
  });
});