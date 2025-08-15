import UserModel from '../../models/user.model.js';

export class UserDAO {
  // Busca um usuário pelo ID, retornando objeto JavaScript simples
  async findById(id) {
    return await UserModel.findById(id).lean();
  }

  // Busca um usuário pelo email (campo único)
  async findByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

    // NOVO MÉTODO: Busca usuário para autenticação, SEM usar .lean()
  // Isso é crucial para que a senha possa ser comparada pelo bcrypt.
  async findByEmailForAuth(email) {
    return await UserModel.findOne({ email });
  }

  // Cria um novo usuário no sistema
  async create(userData) {
    const newUser = new UserModel(userData);
    return await newUser.save();
  }

  // Atualiza os dados de um usuário existente
  async update(id, userData) {
    return await UserModel.findByIdAndUpdate(
      id,
      userData,
      { new: true }  // Retorna a versão atualizada do usuário
    ).lean();
  }

  // Remove permanentemente um usuário do sistema
  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }

  // Lista todos os usuários cadastrados (cuidado com performance em grandes volumes)
  async findAll() {
    return await UserModel.find({}).lean();
  }
}

const userDAO = new UserDAO(); // Exporta uma instância do UserDAO
// Isso permite que outros módulos importem diretamente a instância já configurada.
export default new UserDAO();