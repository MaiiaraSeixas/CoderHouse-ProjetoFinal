import { expect } from 'chai';
import sinon from 'sinon';
// 🔧 CORREÇÃO: Importa a classe `PaymentService` em vez da instância singleton.
// Isso permite criar uma nova instância isolada para cada teste.
import { PaymentService } from '../services/payment.service.js';
import Stripe from 'stripe';

describe('Teste Unitário do PaymentService', () => {
  let paymentServiceInstance;
  let stripeStub;

  // Hook executado antes de cada teste
  beforeEach(() => {
    // Cria uma nova instância do serviço de pagamento para garantir o isolamento.
    paymentServiceInstance = new PaymentService();

    // Cria um mock (stub) para o método `paymentIntents.create` da Stripe.
    // Isso evita chamadas reais à API da Stripe durante os testes.
    // 🔧 CORREÇÃO: O stub agora é criado na instância de teste.
    stripeStub = sinon.stub(paymentServiceInstance.stripe.paymentIntents, 'create');
  });

  // Hook executado depois de cada teste para limpar os mocks
  afterEach(() => {
    stripeStub.restore(); // Restaura o método original
  });

  // -----------------------------------------------------------------------------
  // Testes seguindo a nomenclatura "verbo + entidade + ação"
  // -----------------------------------------------------------------------------

  it('deve criar PaymentIntent com os parâmetros corretos', async () => {
    const paymentData = {
      amount: 2500, // R$ 25,00 (em centavos)
      currency: 'brl',
      description: 'Teste de compra bem-sucedida'
    };
    const mockPaymentIntent = {
      id: 'pi_123_test',
      ...paymentData,
      client_secret: 'pi_123_secret_abc'
    };
    stripeStub.resolves(mockPaymentIntent); // Configura o stub para retornar o mock

    // Chama o método que está sendo testado
    const result = await paymentServiceInstance.createPaymentIntent(paymentData);
    // Verificação 1: O método da Stripe foi chamado uma vez?
    expect(stripeStub.calledOnce).to.be.true;

    // Validação 2: O método foi chamado com os argumentos corretos?
    // 🔧 CORREÇÃO: O método espera um único objeto como argumento.
    expect(stripeStub.firstCall.args[0]).to.deep.equal({
      ...paymentData,
      automatic_payment_methods: { enabled: true }
    });
    // Verificação 3: O resultado retornado é o esperado?
    expect(result).to.deep.equal(mockPaymentIntent);
  });

  // Teste 2: Deve lançar um erro se o valor for inválido
  it('deve lançar erro ao processar pagamento com valor inválido', async () => {
    try {
      await paymentServiceInstance.createPaymentIntent({ amount: 0, currency: 'brl' });
      // Se a linha acima não lançar erro, o teste deve falhar
      expect.fail('A função deveria ter lançado um erro para valor inválido.');
    } catch (error) {
      // Validação: A mensagem de erro é a esperada?
      expect(error.message).to.equal('O valor do pagamento deve ser maior que zero.');
    }
  });

  // Teste 3: Deve lançar um erro se a moeda for nula
  it('deve lançar erro ao processar pagamento sem moeda definida', async () => {

    try {
      await paymentServiceInstance.createPaymentIntent({ amount: 1000, currency: null });

      expect.fail('A função deveria ter lançado um erro para moeda nula.');
    } catch (error) {
      expect(error.message).to.equal('A moeda é obrigatória.');
    }
  });

  // Teste 4: Deve lidar com erros da API da Stripe
  it('deve lançar erro genérico se a chamada à API da Stripe falhar', async () => {

    // Configura o stub para simular uma falha na API
    const stripeError = new Error('Falha na conexão com a API');
    stripeStub.rejects(stripeError);

    try {
      await paymentServiceInstance.createPaymentIntent({ amount: 1000, currency: 'brl' });
      expect.fail('A função deveria ter lançado um erro em caso de falha da API.');
    } catch (error) {
      // Verificação: O erro lançado é o erro genérico esperado?
      expect(error.message).to.equal('Falha ao iniciar o processo de pagamento.');
    }
  });
});
