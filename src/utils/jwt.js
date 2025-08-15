// utils/jwt.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';



/**
 * Gera um token JWT para o usuário, incluindo cartId
 * @returns {string} Token JWT assinado
 */
export const generateToken = (payload) => {
  return jwt.sign(
    payload, // ✅ estrutura esperada pelo JWTStrategy
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
  return jwt.verify(token, config.SECRET_KEY);
};

export default { generateToken, verifyToken };