// src/tests/test-setup.js
import mongoose from 'mongoose';
import config from '../config/config.js';

// Este hook será executado UMA VEZ antes de todos os testes começarem
before(async function() {
    this.timeout(20000);
    if (!config.MONGO_URL_TEST) {
        throw new Error("MONGO_URL_TEST não está definida no seu arquivo .env");
    }
    await mongoose.connect(config.MONGO_URL_TEST);
});

// ✅ CORREÇÃO FINAL: Limpa as coleções em vez de apagar o banco de dados
after(async function() {
    this.timeout(10000); // Dá mais tempo para a limpeza
    // Limpa todas as coleções usadas nos testes
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('products').deleteMany({});
    await mongoose.connection.collection('carts').deleteMany({});
    await mongoose.connection.collection('tickets').deleteMany({});
    // Fecha a conexão
    await mongoose.connection.close();
});