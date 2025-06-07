// config/config.js

import dotenv from 'dotenv';
dotenv.config();

/**
 * Centraliza todas as variáveis de ambiente com fallback seguro
 */
export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
  cookieName: 'jwtCookieToken',
};
// Nota: Certifique-se de que as variáveis de ambiente estejam definidas no arquivo .env
// e que o dotenv esteja configurado corretamente no início do seu app.js.