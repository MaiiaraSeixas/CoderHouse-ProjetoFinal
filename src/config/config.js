// config/config.js

import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
  cookieName: 'jwtCookieToken',
  
  // ADICIONE ESTE OBJETO PARA AS CONFIGURAÇÕES DE E-MAIL
  mailing: {
    service: process.env.MAIL_SERVICE || 'gmail',
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASS
  }
};