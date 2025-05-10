// Importa a biblioteca Mongoose para interação com MongoDB
import mongoose from 'mongoose';

// Define o schema para mensagens do chat
const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,       // Nome do usuário é obrigatório
    trim: true            // Remove espaços em branco extras
  },
  message: {
    type: String,
    required: true,       // Conteúdo da mensagem é obrigatório
    maxlength: 300        // Limite máximo de caracteres
  },
  timestamp: {
    type: Date,
    default: Date.now     // Data/hora automática da mensagem
  }
});

// Cria o modelo Message baseado no schema
const MessageModel = mongoose.model('Message', messageSchema);

// Exporta o modelo para uso no sistema de chat
export default MessageModel;