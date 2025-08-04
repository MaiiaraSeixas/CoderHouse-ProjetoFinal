// utils/jwt.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// 🔐 Chave secreta usada para assinar/verificar os tokens JWT
const SECRET = process.env.JWT_SECRET || 'secretao';

/**
 * Gera um token JWT para o usuário, incluindo cartId
 * @param {Object} user - Dados do usuário que serão armazenados no token
 * @returns {string} Token JWT assinado
 */
export const generateToken = (user) => {
  return jwt.sign(
    { user }, // ✅ estrutura esperada pelo JWTStrategy
    config.SECRET_KEY,
    { expiresIn: '1h' }
  );
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token a ser verificado
 * @returns {Object} Payload decodificado se válido, ou erro se inválido
 */
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

export default { generateToken, verifyToken };


