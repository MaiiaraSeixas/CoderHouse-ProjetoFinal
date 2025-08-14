// src/tests/cart.service.test.js

import { expect } from 'chai';
import sinon from 'sinon';
// Importa o serviço de carrinho que será testado
import { cartService } from '../services/cart.service.js';

// Importa serviços que serão mockados (substituídos por versões de teste)
import productService from '../services/products.service.js';
import ticketService from '../services/ticket.service.js';

// Importa o modelo de carrinho para mockar métodos estáticos
import CartModel from '../models/cart.model.js';

// Importa o serviço de e-mail para mockar o envio
import MailService from '../services/mail.service.js';

/**
 * Conjunto de testes para o método purchaseCart do CartService
 * 
 * Objetivo: Validar o comportamento do serviço ao finalizar compras em dois cenários:
 * 1. Quando todos os produtos têm estoque suficiente
 * 2. Quando um produto não tem estoque suficiente
 */
describe('Teste de Unidade para CartService - Finalização de Compra', () => {
  // Variáveis para armazenar os "stubs" (mocks) das dependências
  let getProductByIdStub, updateProductStub, createTicketStub, findByIdStub, findByIdAndUpdateStub, sendMailStub;

  // Executado antes de cada teste
  beforeEach(() => {
    // Cria stubs (versões mockadas) para todas as dependências externas
    getProductByIdStub = sinon.stub(productService, 'getProductById'); // Mock de busca de produto
    updateProductStub = sinon.stub(productService, 'updateProduct');  // Mock de atualização de produto
    createTicketStub = sinon.stub(ticketService, 'createTicket');     // Mock de criação de ticket
    findByIdStub = sinon.stub(CartModel, 'findById');                 // Mock de busca de carrinho
    findByIdAndUpdateStub = sinon.stub(CartModel, 'findByIdAndUpdate'); // Mock de atualização de carrinho
    sendMailStub = sinon.stub(MailService.prototype, 'sendPurchaseConfirmation'); // Mock de envio de e-mail
  });

  // Executado após cada teste
  afterEach(() => {
    // Restaura todos os mocks ao estado original
    sinon.restore();
  });

  /**
   * Teste 1: Compra completa com estoque suficiente
   * 
   * Cenário: Todos os produtos no carrinho têm estoque suficiente
   * Resultado esperado:
   * - Ticket gerado com valor total correto
   * - Estoque atualizado para todos os produtos
   * - Carrinho esvaziado
   * - E-mail de confirmação enviado
   */
  it('Deve finalizar uma compra com sucesso quando há estoque suficiente', async () => {
    // Dados de teste
    const cartId = 'cart123';
    const user = { email: 'test@example.com' };

    // Carrinho mockado com dois produtos
    const mockCart = {
      _id: cartId,
      products: [
        { product: 'prod1', quantity: 2 }, // 2 unidades do produto 1
        { product: 'prod2', quantity: 1 }, // 1 unidade do produto 2
      ],
    };

    // Produtos mockados com estoque suficiente
    const mockProduct1 = { id: 'prod1', title: 'Produto 1', price: 10, stock: 5 };
    const mockProduct2 = { id: 'prod2', title: 'Produto 2', price: 20, stock: 1 };

    // Configura os retornos dos mocks
    findByIdStub.withArgs(cartId).resolves(mockCart); // Sempre retorna o carrinho mockado
    getProductByIdStub.withArgs('prod1').resolves(mockProduct1); // Retorna produto 1
    getProductByIdStub.withArgs('prod2').resolves(mockProduct2); // Retorna produto 2
    createTicketStub.resolves({ code: 'ticket123', amount: 40, purchaser: user.email }); // Retorna ticket mockado
    sendMailStub.resolves(); // Simula envio de e-mail

    // Executa o método sendo testado
    const result = await cartService.purchaseCart(cartId, user);

    // Verificações (assertions)
    expect(result.ticket).to.not.be.null; // Ticket deve existir
    expect(result.ticket.amount).to.equal(40); // Valor total: (2*10 + 1*20) = 40
    expect(result.productsNotPurchased).to.be.an('array').that.is.empty; // Nenhum produto deixado para trás
    expect(createTicketStub.calledOnce).to.be.true; // Deve ter criado 1 ticket

    // Verifica se o estoque foi atualizado corretamente:
    // Produto1: 5 (estoque) - 2 (comprados) = 3
    expect(updateProductStub.calledWith('prod1', { stock: 3 })).to.be.true;
    // Produto2: 1 (estoque) - 1 (comprado) = 0
    expect(updateProductStub.calledWith('prod2', { stock: 0 })).to.be.true;

    // Verifica se o carrinho foi atualizado (deve estar vazio)
    expect(findByIdAndUpdateStub.calledWith(cartId, { products: [] })).to.be.true;

    // Verifica se o e-mail foi enviado
    expect(sendMailStub.calledOnce).to.be.true;
  });

  /**
   * Teste 2: Compra parcial por falta de estoque
   * 
   * Cenário: Um produto não tem estoque suficiente
   * Resultado esperado:
   * - Ticket gerado apenas para produtos disponíveis
   * - Estoque atualizado apenas para produtos comprados
   * - Carrinho mantém produtos não comprados
   * - E-mail de confirmação enviado
   */
  it('Deve finalizar a compra parcialmente quando um produto não tem estoque', async () => {
    // Dados de teste
    const cartId = 'cart123';
    const user = { email: 'test@example.com' };

    // Carrinho mockado com dois produtos
    const mockCart = {
      _id: cartId,
      products: [
        { product: 'prod1', quantity: 2 }, // Tem estoque suficiente
        { product: 'prod2', quantity: 5 }, // Estoque insuficiente (só tem 3)
      ],
    };

    // Produtos mockados
    const mockProduct1 = { id: 'prod1', title: 'Produto 1', price: 10, stock: 5 };
    const mockProduct2 = { id: 'prod2', title: 'Produto 2', price: 20, stock: 3 };

    // Configura os retornos dos mocks
    findByIdStub.withArgs(cartId).resolves(mockCart);
    getProductByIdStub.withArgs('prod1').resolves(mockProduct1);
    getProductByIdStub.withArgs('prod2').resolves(mockProduct2);
    // Ticket criado apenas para o produto disponível: 2 * 10 = 20
    createTicketStub.resolves({ code: 'ticket123', amount: 20, purchaser: user.email });
    sendMailStub.resolves();

    // Executa o método sendo testado
    const result = await cartService.purchaseCart(cartId, user);

    // Verificações (assertions)
    expect(result.ticket).to.not.be.null; // Ticket deve existir
    expect(result.ticket.amount).to.equal(20); // Apenas valor dos produtos comprados
    expect(result.productsNotPurchased).to.have.lengthOf(1); // 1 produto não comprado
    expect(result.productsNotPurchased[0]).to.equal('prod2'); // ID do produto não comprado

    // Verifica atualizações de estoque:
    // Apenas o produto1 deve ter estoque atualizado
    expect(updateProductStub.calledOnceWith('prod1', { stock: 3 })).to.be.true;
    // O produto2 NÃO deve ter estoque atualizado
    expect(updateProductStub.withArgs('prod2').notCalled).to.be.true;

    // Verifica atualização do carrinho:
    // Deve manter apenas o produto não comprado
    const updatedProducts = findByIdAndUpdateStub.firstCall.args[1].products;
    expect(updatedProducts).to.have.lengthOf(1); // Apenas 1 produto no carrinho
    expect(updatedProducts[0].product).to.equal('prod2'); // O produto não comprado
  });
});