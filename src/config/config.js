// src/config/config.js

import dotenv from 'dotenv';

// Carrega as variáveis do ficheiro .env para process.env
dotenv.config();

/**
 * Objeto de configuração que centraliza todas as variáveis de ambiente da aplicação.
 */
export default {
    // CORREÇÃO: Lendo a variável PORT corretamente.
    PORT: process.env.PORT,
    
    // CORREÇÃO: Lendo a variável MONGO_URL corretamente.
    MONGO_URL: process.env.MONGO_URL,
    
    // Essencial para que os testes possam rodar num banco de dados separado.
    MONGO_URL_TEST: process.env.MONGO_URL_TEST,

    // CORREÇÃO: Padronizando o nome da chave secreta.
    SECRET_KEY: process.env.SECRET_KEY,
    
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE: process.env.TWILIO_PHONE,
    
    NODE_ENV: process.env.NODE_ENV || 'development',
};
