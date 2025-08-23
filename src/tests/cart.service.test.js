// src/tests/cart.service.test.js

import { expect } from 'chai';
import sinon from 'sinon';
import cartService from '../services/cart.service.js';
import productService from '../services/products.service.js';
import ticketService from '../services/ticket.service.js';
import CartModel from '../models/cart.model.js';
import MailService from '../services/mail.service.js';

describe('Teste de Unidade para CartService - Finalização de Compra', () => {
  // Declaração dos stubs para serem acessíveis em todos os testes do bloco
  let getProductByIdStub, updateProductStub, createTicketStub, findByIdStub, findByIdAndUpdateStub, sendMailStub;

  beforeEach(() => {
    // ANTES de cada teste, criamos stubs para simular o comportamento de dependências externas.
    // Isso isola o CartService, garantindo que estamos testando apenas sua lógica.
    getProductByIdStub = sinon.stub(productService, 'getProductById');
    updateProductStub = sinon.stub(productService, 'updateProduct');
    createTicketStub = sinon.stub(ticketService, 'createTicket');
    findByIdStub = sinon.stub(CartModel, 'findById');
    findByIdAndUpdateStub = sinon.stub(CartModel, 'findByIdAndUpdate');
    sendMailStub = sinon.stub(MailService.prototype, 'sendPurchaseConfirmation');
  });

  afterEach(() => {
    // DEPOIS de cada teste, restauramos os métodos originais para não afetar outros testes.
    sinon.restore();
  });

  it('Deve finalizar uma compra com sucesso quando há estoque suficiente', async () => {
    const cartId = 'cart123';
    const user = { email: 'test@example.com', first_name: 'Test User' };

    // Mocks de produtos que simulariam o estado do banco de dados
    const mockProduct1 = { _id: 'prod1', title: 'Produto 1', price: 10, stock: 5 };
    const mockProduct2 = { _id: 'prod2', title: 'Produto 2', price: 20, stock: 1 };

    // Mock do carrinho "populado", como se viesse do banco
    const mockCart = {
      _id: cartId,
      products: [
        { product: mockProduct1, quantity: 2 }, // 2 * 10 = 20
        { product: mockProduct2, quantity: 1 }, // 1 * 20 = 20
      ],
    };

    // Mock do ticket que esperamos que seja criado. O valor total é 40.
    const mockTicket = { code: 'ticket123', amount: 40, purchaser: user.email };

    // Configuração dos stubs para retornarem os dados mockados quando chamados
    findByIdStub.withArgs(cartId).returns({
      populate: sinon.stub().resolves(mockCart) // Simula o .populate() do Mongoose
    });

    // O service verifica o estoque de cada produto individualmente, então simulamos o retorno
    getProductByIdStub.withArgs('prod1').resolves(mockProduct1);
    getProductByIdStub.withArgs('prod2').resolves(mockProduct2);

    // 🔑 CORREÇÃO PRINCIPAL:
    // O erro original acontecia porque o resultado de `purchaseCart` não continha o ticket.
    // Garantimos que o stub de `createTicket` retorna o objeto `mockTicket` que criamos.
    createTicketStub.resolves(mockTicket);

    // Executa a função que está sendo testada
    const result = await cartService.purchaseCart(cartId, user);

    // Validações
    // Verificamos se o ticket retornado é exatamente o objeto que o nosso stub forneceu.
    // Isso garante que o service está repassando o resultado corretamente.
    expect(result.ticket).to.deep.equal(mockTicket);
    expect(result.productsNotPurchased).to.be.an('array').that.is.empty;
    // Verifica se a função de envio de e-mail foi chamada
    expect(sendMailStub.calledOnce).to.be.true;
  });

  it('Deve finalizar a compra parcialmente quando um produto não tem estoque', async () => {
    const cartId = 'cart123';
    const user = { email: 'test@example.com', first_name: 'Test User' };

    // Produto 1 tem estoque; Produto 2 NÃO tem estoque suficiente.
    const mockProduct1 = { _id: 'prod1', title: 'Produto 1', price: 10, stock: 5 };
    const mockProduct2 = { _id: 'prod2', title: 'Produto 2', price: 20, stock: 3 }; // Quer 5, mas só tem 3

    const mockCart = {
      _id: cartId,
      products: [
        { product: mockProduct1, quantity: 2 }, // Compra bem-sucedida
        { product: mockProduct2, quantity: 5 }, // Compra falhará
      ],
    };

    // O ticket deve ser gerado apenas com o valor do produto 1 (2 * 10 = 20)
    const mockTicket = { code: 'ticketPartial', amount: 20, purchaser: user.email };

    // Configuração dos stubs
    findByIdStub.withArgs(cartId).returns({
      populate: sinon.stub().resolves(mockCart)
    });
    getProductByIdStub.withArgs('prod1').resolves(mockProduct1);
    getProductByIdStub.withArgs('prod2').resolves(mockProduct2);
    createTicketStub.resolves(mockTicket); // Stub retorna o ticket parcial

    // Execução
    const result = await cartService.purchaseCart(cartId, user);

    // Validações
    // O ticket retornado deve ser o parcial
    expect(result.ticket).to.deep.equal(mockTicket);
    // A lista de produtos não comprados deve conter o ID do produto sem estoque
    expect(result.productsNotPurchased).to.have.lengthOf(1);
    expect(result.productsNotPurchased[0]).to.equal('prod2');
  });
});
