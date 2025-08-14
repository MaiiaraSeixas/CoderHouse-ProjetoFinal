// src/tests/user.dao.test.js

import { expect } from 'chai';
import sinon from 'sinon'; // Biblioteca para criar mocks e stubs
import UserModel from '../models/user.model.js'; // O modelo que vamos "simular"
import UserDAO from '../daos/mongo/user.dao.js'; // A unidade que queremos testar

describe('Teste de Unidade para UserDAO', () => {
  // O hook 'beforeEach' é executado antes de cada teste ('it') neste bloco.
  // Usamo-lo para "resetar" os nossos mocks e garantir que um teste não interfira no outro.
  beforeEach(() => {
    // 'sinon.restore()' limpa todos os stubs, mocks e espiões criados pelo Sinon.
    sinon.restore();
  });

  // --- Teste para o método findById ---
  it('Deve retornar um utilizador pelo seu ID', async () => {
    // 1. DADOS DE MOCK: Criamos um utilizador falso que esperamos que seja retornado.
    const userMock = {
      _id: '60d5ecb3b3a3a40015f3b3a5',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'user'
    };

    // 2. CRIAÇÃO DO STUB:
    // 'sinon.stub' substitui um método de um objeto por uma função falsa (stub).
    // Aqui, estamos a substituir o método 'findById' do 'UserModel'.
    // O '.returns()' define o que a nossa função falsa deve retornar.
    // O '.lean()' é encadeado porque o nosso DAO o utiliza.
    const findByIdStub = sinon.stub(UserModel, 'findById').returns({
      lean: sinon.stub().resolves(userMock) // .resolves para simular uma Promise que resolve
    });

    // 3. EXECUÇÃO: Chamamos o método do DAO que queremos testar.
    const userDao = new UserDAO();
    const result = await userDao.findById(userMock._id);

    // 4. ASSERÇÕES (VERIFICAÇÕES):
    // Verificamos se o resultado é o que esperávamos.
    expect(result).to.deep.equal(userMock);
    // Verificamos se o método 'findById' do UserModel foi chamado exatamente uma vez.
    expect(findByIdStub.calledOnce).to.be.true;
    // Verificamos se foi chamado com o argumento correto.
    expect(findByIdStub.calledWith(userMock._id)).to.be.true;
  });

  // --- Teste para o método findByEmail ---
  it('Deve retornar um utilizador pelo seu email', async () => {
    const userMock = {
      _id: '60d5ecb3b3a3a40015f3b3a5',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
      role: 'user'
    };

    // Criamos um stub para o método 'findOne' do UserModel
    const findOneStub = sinon.stub(UserModel, 'findOne').returns({
      lean: sinon.stub().resolves(userMock)
    });

    const userDao = new UserDAO();
    const result = await userDao.findByEmail(userMock.email);

    expect(result).to.deep.equal(userMock);
    expect(findOneStub.calledOnceWith({ email: userMock.email })).to.be.true;
  });

  // --- Teste para o método create ---
  it('Deve criar um novo utilizador', async () => {
    const newUserDa_ta = {
      first_name: 'New',
      last_name: 'User',
      email: 'new.user@example.com',
      password: 'hashedpassword'
    };
    const createdUserMock = { ...newUserDa_ta, _id: 'some-new-id' };

    // Para o 'create', o método do Mongoose é estático, então o stub é direto no UserModel.
    // Também simulamos o método '.save()' que é chamado no DAO.
    sinon.stub(UserModel.prototype, 'save').resolves(createdUserMock);

    const userDao = new UserDAO();
    // O resultado do 'create' no DAO é o resultado do 'save', então não precisamos de o verificar.
    // Apenas chamamos o método.
    const result = await userDao.create(newUserDa_ta);

    // Verificamos se o resultado retornado é o esperado.
    expect(result).to.deep.equal(createdUserMock);
  });
});
