import MessageModel from '../models/message.model.js';

export class MessageManagerMongo {
  async getAllMessages() {
    return await MessageModel.find();
  }

  async createMessage(data) {
    return await MessageModel.create(data);
  }
}
