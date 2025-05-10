// Importa o modelo Message
// Esta linha importa a definição do modelo de dados para as mensagens.
// Provavelmente, este modelo foi definido em outro arquivo (message.model.js)
// e é usado para interagir com a coleção de mensagens no banco de dados.
import MessageModel from '../models/message.model.js';

// Define a classe MessageManagerMongo
// Esta linha declara uma classe chamada MessageManagerMongo.
// O termo "Manager" sugere que esta classe é responsável por gerenciar
// operações relacionadas a mensagens. O sufixo "Mongo" indica que esta
// classe é especificamente projetada para interagir com o banco de dados MongoDB.
export class MessageManagerMongo {

  // Define um método assíncrono para buscar todas as mensagens
  // A palavra-chave 'async' indica que esta função pode realizar operações
  // assíncronas (como consultas ao banco de dados) e retorna uma Promise.
  async getAllMessages() {
    // Utiliza o modelo MessageModel para buscar todos os documentos
    // (mensagens) na coleção correspondente no MongoDB.
    // O método 'find()' do Mongoose (ou outra biblioteca ODM) retorna uma Promise
    // que será resolvida com um array contendo todas as mensagens encontradas.
    return await MessageModel.find();
  }

  // Define um método assíncrono para criar uma nova mensagem
  // Assim como 'getAllMessages', 'async' indica que esta função é assíncrona.
  // Este método recebe um argumento chamado 'data', que provavelmente é um
  // objeto JavaScript contendo as informações da nova mensagem a ser criada.
  async createMessage(data) {
    // Utiliza o modelo MessageModel para criar um novo documento (mensagem)
    // no banco de dados MongoDB com os dados fornecidos no objeto 'data'.
    // O método 'create()' do Mongoose retorna uma Promise que será resolvida
    // com o documento da mensagem recém-criada.
    return await MessageModel.create(data);
  }
}