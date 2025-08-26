//src/services/payment.service.js

import Stripe from 'stripe';
import config from '../config/config.js';

/**
 * Serviço para interagir com a API de pagamentos da Stripe.
 * Responsável por criar PaymentIntents e gerenciar transações.
 */
export class PaymentService {
  /**
   * Inicializa o cliente Stripe com a chave secreta.
   * 🔒 A chave secreta deve estar armazenada no arquivo de configuração.
   */
  constructor() {
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY);
  }

  /**
   * Cria um PaymentIntent na Stripe para processar um pagamento.
   * @param {number} amount - O valor total a ser cobrado, em centavos.
   * @param {string} currency - O código da moeda (ex: 'brl', 'usd').
   * @param {string} description - Descrição da transação.
   * @returns {Promise<object>} O objeto PaymentIntent criado.
   */
  async createPaymentIntent({amount, currency, description}) {
    // 🔹 Validações básicas dos parâmetros de entrada
    if (!amount || amount <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.');
    }
    if (!currency) {
      throw new Error('A moeda é obrigatória.');
    }

    try {
      // Cria o PaymentIntent na Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,                // valor em centavos
        currency,              // moeda (ex: 'brl')
        description,           // descrição da transação
        automatic_payment_methods: {
          enabled: true,       // habilita métodos de pagamento automáticos
        },
      });

      // Retorna o PaymentIntent criado, incluindo client_secret
      return paymentIntent;
    } catch (error) {
      // Log detalhado do erro no console
      console.error('Erro ao criar PaymentIntent na Stripe:', error);
      // Relança um erro genérico para o frontend/serviço chamar
      throw new Error('Falha ao iniciar o processo de pagamento.');
    }
  }
};



// 🔑 CORREÇÃO: Exportamos uma instância única (Singleton) da classe.
// Isso garante que toda a aplicação use o mesmo objeto PaymentService
// e corrige o erro do Sinon no teste de integração.
export const paymentService = new PaymentService();
