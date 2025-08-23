import { expect } from 'chai';
import sinon from 'sinon';
import { paymentService } from '../services/payment.service.js';
import Stripe from 'stripe';

describe('Teste Unitário do PaymentService', () => {
  let paymentService;
  let stripeStub;

  // Hook executado antes de cada teste
  beforeEach(() => {
    // Cria uma instância do serviço de pagamento
    paymentService = new PaymentService();

    // Cria um mock (stub) para o método `paymentIntents.create` da Stripe
    // Isso evita chamadas reais à API da Stripe durante os testes
    stripeStub = sinon.stub(paymentService.stripe.paymentIntents, 'create');
  });

  // Hook executado depois de cada teste para limpar os mocks
  afterEach(() => {
    stripeStub.restore(); // Restaura o método original
  });

  // Teste 1: Deve criar um PaymentIntent com sucesso
  it('Deve criar um PaymentIntent com os parâmetros corretos', async () => {
    // Dados de entrada para o teste
    const amount = 2500; // R$ 25,00 (em centavos)
    const currency = 'brl';
    const description = 'Teste de compra';

    // Mock do retorno da API da Stripe
    const mockPaymentIntent = {
      id: 'pi_123',
      amount: amount,
      currency: currency,
      description: description,
      client_secret: 'pi_123_secret_abc'
    };
    stripeStub.resolves(mockPaymentIntent); // Configura o stub para retornar o mock

    // Chama o método que está sendo testado
    const result = await paymentService.createPaymentIntent(amount, currency, description);

    // Verificação 1: O método da Stripe foi chamado uma vez?
    expect(stripeStub.calledOnce).to.be.true;

    // Verificação 2: O método foi chamado com os argumentos corretos?
    expect(stripeStub.firstCall.args[0]).to.deep.equal({
      amount,
      currency,
      description,
      automatic_payment_methods: { enabled: true }
    });

    // Verificação 3: O resultado retornado é o esperado?
    expect(result).to.deep.equal(mockPaymentIntent);
  });

  // Teste 2: Deve lançar um erro se o valor for inválido
  it('Deve lançar um erro se o valor do pagamento for zero ou nulo', async () => {
    try {
      await paymentService.createPaymentIntent(0, 'brl', 'Teste de erro');
      // Se a linha acima não lançar erro, o teste deve falhar
      expect.fail('A função deveria ter lançado um erro para valor inválido.');
    } catch (error) {
      // Verificação: A mensagem de erro é a esperada?
      expect(error.message).to.equal('O valor do pagamento deve ser maior que zero.');
    }
  });

  // Teste 3: Deve lançar um erro se a moeda for nula
  it('Deve lançar um erro se a moeda não for fornecida', async () => {
    try {
      await paymentService.createPaymentIntent(1000, null, 'Teste de erro');
      expect.fail('A função deveria ter lançado um erro para moeda nula.');
    } catch (error) {
      expect(error.message).to.equal('A moeda é obrigatória.');
    }
  });

  // Teste 4: Deve lidar com erros da API da Stripe
  it('Deve lançar um erro genérico se a chamada à API da Stripe falhar', async () => {
    // Configura o stub para simular uma falha na API
    const stripeError = new Error('Falha na conexão com a API');
    stripeStub.rejects(stripeError);

    try {
      await paymentService.createPaymentIntent(1000, 'brl', 'Teste de falha na API');
      expect.fail('A função deveria ter lançado um erro em caso de falha da API.');
    } catch (error) {
      // Verificação: O erro lançado é o erro genérico esperado?
      expect(error.message).to.equal('Falha ao iniciar o processo de pagamento.');
    }
  });
});
