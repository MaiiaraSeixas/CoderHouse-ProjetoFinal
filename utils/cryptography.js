// utils/cryptography.js

import bcrypt from 'bcrypt';

/**
 * Cria um hash seguro da senha usando bcrypt
 * @param {string} password - senha em texto puro
 * @returns {string} senha criptografada
 */
export function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

/**
 * Compara senha em texto com senha criptografada
 * @param {string} password - senha recebida do usuário
 * @param {string} hashedPassword - hash salvo no banco
 * @returns {boolean} true se a senha for válida
 */
export function isValidPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}
