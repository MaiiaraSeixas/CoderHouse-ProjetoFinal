import userDAO from '../daos/mongo/user.dao.js';
import UserDTO from '../dtos/UserDTO.js';

export default class UserRepository {
  async getById(id) {
    const user = await userDAO.getById(id);
    return user ? new UserDTO(user) : null;
  }

  async getByEmail(email) {
    return await userDAO.getByEmail(email);
  }

  async create(data) {
    return await userDAO.create(data);
  }
}
