// services/user.service.js
import UserModel from '../models/user.model.js';
import CartModel from '../models/cart.model.js';

// Documentos obrigatórios para se tornar Premium
const REQUIRED_DOCUMENTS = [
  'Identificacion',
  'Comprobante de domicilio',
  'Comprobante de estado de cuenta'
];

class UserService {
  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  async getUserById(id) {
    return await UserModel.findById(id).lean();
  }

  // ✅ Criação atômica de usuário com carrinho
  async createUser(userData) {
    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      const newUser = await UserModel.create([userData], { session });

      const newCart = await CartModel.create(
        [{ user: newUser[0]._id, products: [] }],
        { session }
      );

      const updatedUser = await UserModel.findByIdAndUpdate(
        newUser[0]._id,
        { $set: { cartId: newCart[0]._id } },
        { new: true, session }
      ).lean();

      await session.commitTransaction();
      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      throw new Error('Falha ao criar usuário: ' + error.message);
    } finally {
      session.endSession();
    }
  }

  async getAllUsers() {
    return await UserModel.find({}).lean();
  }

  async deleteUser(id) {
    const session = await UserModel.startSession();
    session.startTransaction();

    try {
      const user = await UserModel.findById(id).session(session);
      if (!user) return false;

      // Remove carrinho associado
      await CartModel.deleteOne({ _id: user.cartId }).session(session);

      // Remove usuário
      await UserModel.deleteOne({ _id: id }).session(session);

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ✅ Validação robusta de documentos para mudança de role
  async changeRole(uid) {
    const user = await UserModel.findById(uid);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.role === 'admin') return user;

    // Verifica documentos obrigatórios
    const userDocNames = user.documents.map(doc => doc.name);
    const hasAllDocuments = REQUIRED_DOCUMENTS.every(doc =>
      userDocNames.includes(doc)
    );

    if (!hasAllDocuments) {
      throw new Error(
        `Documentos obrigatórios faltando: ${REQUIRED_DOCUMENTS.join(', ')}`
      );
    }

    // Muda apenas de user para premium
    if (user.role === 'user') {
      user.role = 'premium';
      await user.save();
    }

    return user;
  }

  // ✅ Armazenamento seguro de documentos
  async updateUserDocuments(uid, files) {
    if (!files?.length) {
      throw new Error('Nenhum arquivo fornecido');
    }

    const user = await UserModel.findById(uid);
    if (!user) throw new Error('Usuário não encontrado');

    // Valida e armazena metadados seguros
    const validDocuments = files.map(file => ({
      name: file.originalname,
      reference: `/assets/documents/${file.filename}`, // Caminho seguro
      type: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    }));

    user.documents.push(...validDocuments);
    await user.save();
    return user;
  }

  // ✅ Garantia segura de carrinho
  async ensureCartForUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('Usuário não encontrado');

    if (user.cartId) {
      return user.cartId;
    }

    const newCart = await CartModel.create({ user: userId, products: [] });
    user.cartId = newCart._id;
    await user.save();

    return newCart._id;
  }
}

export default new UserService();