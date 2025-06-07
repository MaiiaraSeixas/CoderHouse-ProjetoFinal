// services/auth.service.js
import UserModel from '../../dao/models/JS_user.model.js';
import { createHash, validatePassword } from '../../utils/hash.utils.js';

class AuthService {
  // Registra um novo usuário
  async register(userData) {
    const { email, password } = userData;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new Error('Usuário já registrado');

    const hashedPassword = createHash(password);
    const newUser = await UserModel.create({
      ...userData,
      password: hashedPassword,
      role: 'user' // padrão
    });

    return newUser;
  }

  // Autentica usuário com e-mail e senha
  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Usuário não encontrado');

    const isValid = validatePassword(password, user.password);
    if (!isValid) throw new Error('Senha incorreta');

    return user;
  }

  // Retorna usuário por ID (para JWT ou sessão)
  async getUserById(uid) {
    return await UserModel.findById(uid).select('-password').lean();
  }

  // Retorna usuário por e-mail
  async getUserByEmail(email) {
    return await UserModel.findOne({ email });
  }
}

export default new AuthService();
