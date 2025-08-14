// src/tests/users.router.test.js

import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import UserModel from '../models/user.model.js';
import path from 'path';
import fs from 'fs';
import { createHash } from '../utils/cryptography.js';
import { generateToken } from '../utils/jwt.js';

// Cria cliente para requisições HTTP
const requester = supertest(app);

// Suite de testes para rotas de usuários
describe('Testes de Integração da API de Usuários', function () {
  // Aumenta timeout para operações assíncronas
  this.timeout(15000);

  let testUser;      // Usuário de teste comum
  let adminUser;     // Usuário administrador
  let authToken;     // Token de autenticação do usuário comum
  let adminToken;    // Token de autenticação do administrador

  // Configuração inicial antes de todos os testes
  before(async () => {
    // Limpa coleção de usuários
    await UserModel.deleteMany({});

    // Cria usuário de teste comum
    testUser = await UserModel.create({
      first_name: 'Test',
      last_name: 'User',
      email: `testuser.premium-${Date.now()}@example.com`,
      password: createHash('password123'),
      role: 'user'
    });

    // Cria usuário administrador
    adminUser = await UserModel.create({
      first_name: 'Admin',
      last_name: 'User',
      email: `admin.premium-${Date.now()}@example.com`,
      password: createHash('adminpassword'),
      role: 'admin'
    });

    // Gera tokens JWT para autenticação
    authToken = generateToken({
      user: {
        _id: testUser._id.toString(),
        email: testUser.email,
        role: testUser.role
      }
    });

    adminToken = generateToken({
      user: {
        _id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role
      }
    });

    // Cria diretório para documentos de teste se não existir
    const testFilesDir = path.resolve('./uploads/documents');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  // Testes para upload de documentos
  describe('Upload de Documentos do Usuário', () => {
    it('POST /api/users/:uid/documents deve fazer upload de documento com sucesso', async () => {
      // Cria arquivo de teste temporário
      const filePath = path.resolve('./uploads/documents/test-doc.pdf');
      fs.writeFileSync(filePath, 'Este é um documento de teste.');

      // Faz requisição de upload
      const res = await requester
        .post(`/api/users/${testUser._id}/documents`)
        .set('Cookie', `jwtCookieToken=${authToken}`)
        .attach('document', filePath, 'test-doc.pdf');

      // Verificações de sucesso
      expect(res.status).to.equal(200);
      expect(res.body.payload.message).to.equal('Documentos enviados com sucesso!');

      // Verifica se documento foi salvo no usuário
      const user = await UserModel.findById(testUser._id).lean();
      expect(user.documents).to.be.an('array').with.lengthOf(1);
      expect(user.documents[0].name).to.equal('test-doc.pdf');

      // Remove arquivo temporário
      fs.unlinkSync(filePath);
    });
  });

  // Testes para gerenciamento de conta premium
  describe('Gerenciamento de Conta Premium', () => {
    // Reset do usuário antes de cada teste
    beforeEach(async () => {
      await UserModel.findByIdAndUpdate(testUser._id, {
        $set: {
          role: 'user',
          documents: []
        }
      });
    });

    it('PUT /api/users/premium/:uid deve FALHAR ao tentar upgrade sem documentos obrigatórios', async () => {
      // Tenta atualizar para premium sem documentos
      const res = await requester
        .put(`/api/users/premium/${testUser._id}`)
        .set('Cookie', `jwtCookieToken=${adminToken}`);

      // Verifica falha esperada
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Documentos obrigatórios faltando');
    });

    it('PUT /api/users/premium/:uid deve TER SUCESSO após upload de todos documentos obrigatórios', async () => {
      // Lista de documentos obrigatórios para upgrade
      const docNames = [
        'Identificacion.pdf',
        'Comprobante de domicilio.pdf',
        'Comprobante de estado de cuenta.pdf'
      ];

      // Faz upload de cada documento necessário
      for (const docName of docNames) {
        const docPath = path.resolve('./uploads/documents/', docName);
        fs.writeFileSync(docPath, 'conteúdo dummy');
        await requester
          .post(`/api/users/${testUser._id}/documents`)
          .set('Cookie', `jwtCookieToken=${authToken}`)
          .attach('document', docPath, docName);
        fs.unlinkSync(docPath);
      }

      // Solicita upgrade para premium
      const res = await requester
        .put(`/api/users/premium/${testUser._id}`)
        .set('Cookie', `jwtCookieToken=${adminToken}`);

      // Verificações de sucesso
      expect(res.status).to.equal(200);
      expect(res.body.payload.user.role).to.equal('premium');
    });
  });

  // Testes relacionados ao login de usuário
  describe('Login do Usuário', () => {
    it('POST /api/sessions/login deve atualizar last_connection do usuário', async () => {
      // Obtém timestamp da última conexão antes do login
      const userBeforeLogin = await UserModel.findById(testUser._id).lean();
      const initialConnection = userBeforeLogin.last_connection;

      // Executa login
      const loginRes = await requester.post('/api/sessions/login').send({
        email: testUser.email,
        password: 'password123'
      });

      expect(loginRes.status).to.equal(200);

      // Verifica atualização do campo last_connection
      const userAfterLogin = await UserModel.findById(testUser._id).lean();
      expect(userAfterLogin.last_connection).to.be.a('date');

      // Compara timestamps se existir conexão anterior
      if (initialConnection) {
        expect(userAfterLogin.last_connection.getTime()).to.be.greaterThan(initialConnection.getTime());
      }
    });
  });
});