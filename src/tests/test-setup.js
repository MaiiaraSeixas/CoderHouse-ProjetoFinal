// src/tests/test-setup.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Este hook será executado UMA VEZ antes de todos os testes começarem
before(async function () {
    this.timeout(60000); // Aumenta o timeout para o download do MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Este hook será executado ANTES de cada teste
after(async function () {
    this.timeout(10000); // Dá mais tempo para a limpeza
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpa as coleções antes de cada teste para garantir isolamento
afterEach(async function () {
    this.timeout(10000);
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
