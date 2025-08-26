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
  // Adiciona uma verificação para garantir que ambos os argumentos são strings válidas.
  // Se não forem, bcrypt.compareSync lançaria um erro. Em vez disso, retornamos false.
  if (!password || typeof password !== 'string' || !hashedPassword || typeof hashedPassword !== 'string') {
    return false;
  }
  try {
    return bcrypt.compareSync(password, hashedPassword);
  } catch (error) {
    // Se bcrypt ainda lançar um erro (por exemplo, hash malformado), capturamos e retornamos false.
    return false;
  }
}
