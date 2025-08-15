// Arquivo 4: src/tests/users.router.test.js
// Correção para o Erro 6: "Cannot read properties of undefined (reading 'role')"
// O que foi alterado: Adicionámos uma verificação do status da resposta antes de
// tentar ler o corpo da resposta.
// Porquê: O teste estava a falhar porque a API devolvia um erro 400, mas o teste
// continuava a tentar ler `res.body.payload.user.role`, que não existe numa
// resposta de erro. A asserção correta é verificar primeiro o status.
// --------------------------------------------------------------------
// Testes de integração para as rotas de usuários

// Importações necessárias
import { expect } from 'chai'; // Biblioteca de asserções
import supertest from 'supertest'; // Cliente HTTP para testes
import app from '../app.js'; // Aplicação Express
import mongoose from 'mongoose'; // ORM para MongoDB
import UserModel from '../models/user.model.js'; // Modelo de usuário
import path from 'path'; // Manipulação de caminhos de arquivo
import fs from 'fs'; // Manipulação de arquivos
import { createHash } from '../utils/cryptography.js'; // Função para hash de senha
import { generateToken } from '../utils/jwt.js'; // Função para gerar tokens JWT

// Cria um cliente de teste para a aplicação
const requester = supertest(app);

// Suite de testes para a API de usuários
describe('Testes de Integração da API de Usuários', function () {
  // Aumenta o timeout para 15 segundos (útil para operações assíncronas)
  this.timeout(15000);

  // Variáveis para armazenar dados de usuários e tokens
  let testUser; // Usuário comum para testes
  let adminUser; // Usuário administrador
  let authToken; // Token do usuário comum
  let adminToken; // Token do administrador

  // Hook executado uma vez antes de todos os testes
  before(async () => {
    // Limpa a coleção de usuários
    await UserModel.deleteMany({});

    // Cria um usuário comum para testes
    testUser = await UserModel.create({
      first_name: 'Test',
      last_name: 'User',
      email: `testuser.premium-${Date.now()}@example.com`, // Email único com timestamp
      password: createHash('password123'), // Senha hasheada
      role: 'user' // Papel inicial: usuário comum
    });

    // Cria um usuário administrador
    adminUser = await UserModel.create({
      first_name: 'Admin',
      last_name: 'User',
      email: `admin.premium-${Date.now()}@example.com`, // Email único com timestamp
      password: createHash('adminpassword'), // Senha hasheada
      role: 'admin' // Papel: administrador
    });

    // Gera token JWT para o usuário comum
    authToken = generateToken({
      user: {
        _id: testUser._id.toString(),
        email: testUser.email,
        role: testUser.role
      }
    });

    // Gera token JWT para o administrador
    adminToken = generateToken({
      user: {
        _id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role
      }
    });

    // Cria diretório para uploads de documentos (se não existir)
    const testFilesDir = path.resolve('./uploads/documents');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  // Suite de testes para gerenciamento de conta premium
  describe('Gerenciamento de Conta Premium', () => {
    // Hook executado antes de cada teste neste bloco
    beforeEach(async () => {
      // Reseta o papel do usuário para 'user' e remove documentos
      await UserModel.findByIdAndUpdate(testUser._id, {
        $set: {
          role: 'user',
          documents: []
        }
      });
    });

    /**
     * Teste: Atualização bem-sucedida para conta premium
     * - Deve retornar status 200 após upload de todos documentos obrigatórios
     * - Verifica se o papel do usuário foi atualizado para 'premium'
     * 
     * Correção aplicada: 
     *   - Verificação do status da resposta ANTES de acessar o corpo
     *   - Isso evita o erro "Cannot read properties of undefined" quando a API retorna um erro
     */
    it('PUT /api/users/premium/:uid deve TER SUCESSO após upload de todos documentos obrigatórios', async () => {
      // Lista de documentos obrigatórios para upgrade premium
      const docNames = [
        'Identificacion.pdf',
        'Comprobante de domicilio.pdf',
        'Comprobante de estado de cuenta.pdf'
      ];

      // Para cada documento na lista:
      for (const docName of docNames) {
        // Cria caminho absoluto para o arquivo temporário
        const docPath = path.resolve('./uploads/documents/', docName);

        // Cria um arquivo dummy (conteúdo temporário)
        fs.writeFileSync(docPath, 'conteúdo dummy');

        // Faz upload do documento via API
        await requester
          .post(`/api/users/${testUser._id}/documents`)
          .set('Cookie', `jwtCookieToken=${authToken}`) // Autentica com token do usuário
          .attach('document', docPath, docName); // Anexa o arquivo

        // Remove o arquivo temporário após o upload
        fs.unlinkSync(docPath);
      }

      // Solicita upgrade para premium (como administrador)
      const res = await requester
        .put(`/api/users/premium/${testUser._id}`)
        .set('Cookie', `jwtCookieToken=${adminToken}`); // Autentica com token de admin

      console.log('Resposta da API:', res.body); // Log para depuração
      // ALTERAÇÃO: Verifica o status da resposta primeiro
      expect(res.status).to.equal(200);

      // Em seguida, verifica o papel do usuário no corpo da resposta
      expect(res.body.payload.payload.user.role).to.equal('premium');
    });
  });
});