// src/tests/cryptography.test.js - Testes Unitários para Funções de Criptografia

// Importa a biblioteca de asserções 'chai' para validar os resultados dos testes.
import { expect } from 'chai';

// Importa as funções que serão testadas do nosso módulo de criptografia.
import { createHash, isValidPassword } from '../utils/cryptography.js';

// 'describe' agrupa uma coleção de testes relacionados.
// Aqui, estamos agrupando todos os testes para o 'cryptography.js'.
describe('Teste Unitário de Funções de Criptografia', () => {

  // 'context' é usado para agrupar testes para uma função ou cenário específico.
  context('Função createHash', () => {

    // 'it' define um caso de teste individual.
    // A descrição deve explicar o que o teste está verificando.
    it('deve retornar um hash como uma string', () => {
      const password = 'mySecretPassword';
      const hashedPassword = createHash(password);

      // 'expect' é a asserção do Chai.
      // Aqui, verificamos se o resultado é do tipo 'string'.
      expect(hashedPassword).to.be.a('string');
    });

    it('deve retornar um hash diferente da senha original', () => {
      const password = 'mySecretPassword';
      const hashedPassword = createHash(password);

      // Verifica se a função de hash não está simplesmente retornando a senha original.
      expect(hashedPassword).to.not.equal(password);
    });
  });

  context('Função isValidPassword', () => {
    it('deve retornar true para uma senha e hash correspondentes', () => {
      const password = 'mySecretPassword';
      // Primeiro, criamos um hash para a senha.
      const hashedPassword = createHash(password);

      // Em seguida, usamos a função isValidPassword para verificar se a senha original corresponde ao hash.
      const result = isValidPassword(password, hashedPassword);

      // O resultado esperado é 'true'.
      expect(result).to.be.true;
    });

    it('deve retornar false para uma senha incorreta', () => {
      const correctPassword = 'mySecretPassword';
      const wrongPassword = 'anotherPassword';
      const hashedPassword = createHash(correctPassword);

      // Verificamos uma senha incorreta contra o hash da senha correta.
      const result = isValidPassword(wrongPassword, hashedPassword);

      // O resultado esperado é 'false'.
      expect(result).to.be.false;
    });

    it('deve retornar false para um hash nulo ou inválido', () => {
      const password = 'mySecretPassword';

      // Verificamos a senha contra um valor nulo, simulando um hash ausente ou corrompido.
      const resultWithNull = isValidPassword(password, null);
      // Verificamos a senha contra uma string qualquer, que não é um hash bcrypt válido.
      const resultWithInvalidString = isValidPassword(password, "not-a-real-hash");

      // Ambos os resultados devem ser 'false'.
      expect(resultWithNull).to.be.false;
      expect(resultWithInvalidString).to.be.false;
    });
  });
});
