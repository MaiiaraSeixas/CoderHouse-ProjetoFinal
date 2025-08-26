// src/tests/jwt.test.js - Testes Unitários para Funções de JWT

import { expect } from 'chai';
import jwt from 'jsonwebtoken'; // Importa a biblioteca original para comparar e criar tokens de teste
import { generateToken, verifyToken } from '../utils/jwt.js';
import config from '../config/config.js'; // Importa a configuração para acessar a chave secreta

describe('Teste Unitário de Funções de JWT', () => {

  // Define um payload de exemplo que será usado em todos os testes
  const testPayload = { userId: '12345', role: 'user' };

  context('Função generateToken', () => {
    it('deve gerar um token JWT válido como uma string', () => {
      const token = generateToken(testPayload);

      // Verifica se o token é uma string e não está vazio
      expect(token).to.be.a('string').and.to.not.be.empty;
    });

    it('deve conter o payload correto após a decodificação', () => {
      const token = generateToken(testPayload);
      // Decodifica o token usando a mesma chave secreta para verificar o conteúdo
      const decoded = jwt.verify(token, config.SECRET_KEY);

      // Verifica se o payload decodificado contém as mesmas informações do original
      // Usamos 'include' em vez de 'deep.equal' porque o JWT adiciona campos próprios ('iat', 'exp')
      expect(decoded).to.include(testPayload);
    });
  });

  context('Função verifyToken', () => {
    it('deve verificar um token válido e retornar o payload', () => {
      // Gera um token com a nossa função
      const token = generateToken(testPayload);
      // Verifica o token usando a nossa função de verificação
      const decoded = verifyToken(token);

      // Confirma que o payload retornado é o correto
      expect(decoded).to.include(testPayload);
    });

    it('deve lançar um erro para um token inválido (malformado)', () => {
      const invalidToken = 'isto-nao-e-um-token-valido';

      // A função 'verifyToken' deve lançar um erro para um token malformado.
      // Usamos uma função anônima dentro de expect().to.throw() para capturar o erro.
      expect(() => verifyToken(invalidToken)).to.throw(jwt.JsonWebTokenError, 'jwt malformed');
    });

    it('deve lançar um erro para um token com assinatura inválida', () => {
      // Gera um token usando uma chave secreta diferente
      const anotherSecret = 'uma-chave-diferente';
      const tokenWithWrongSignature = jwt.sign(testPayload, anotherSecret, { expiresIn: '1h' });

      // Tenta verificar o token com a chave secreta da nossa aplicação
      expect(() => verifyToken(tokenWithWrongSignature)).to.throw(jwt.JsonWebTokenError, 'invalid signature');
    });

    it('deve lançar um erro para um token expirado', () => {
      // Para testar a expiração, criamos o token manualmente com `jwt.sign`
      // em vez de usar nosso `generateToken`, que sempre adiciona uma nova expiração.
      // Aqui, definimos a expiração para ter ocorrido 1 segundo no passado.
      const expiredPayload = { ...testPayload, exp: Math.floor(Date.now() / 1000) - 1 };
      const expiredToken = jwt.sign(expiredPayload, config.SECRET_KEY);

      // A asserção é feita dentro de um try-catch para garantir que o erro esperado (TokenExpiredError) ocorra.
      try {
        verifyToken(expiredToken);
        // Se a linha acima não lançar um erro, o teste deve falhar.
        expect.fail('A verificação deveria ter falhado com um erro de token expirado.');
      } catch (error) {
        // Verificamos se o erro é da instância e tipo corretos.
        expect(error).to.be.an.instanceOf(jwt.TokenExpiredError);
        expect(error.message).to.equal('jwt expired');
      }
    });
  });
});
