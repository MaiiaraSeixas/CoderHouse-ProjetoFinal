// Importa o Schema e model do Mongoose para definição e criação de modelos MongoDB
import { Schema, model } from 'mongoose';

// Importa a função randomUUID do módulo crypto para gerar identificadores únicos
import { randomUUID } from 'crypto';

// Define o esquema (estrutura) do modelo Ticket
const ticketSchema = new Schema({
  // Campo _id personalizado como string, com valor padrão gerado por UUID
  _id: { type: String, default: () => randomUUID() },

  // Código único do ticket, obrigatório, gerado automaticamente se não fornecido
  code: {
    type: String,
    unique: true,      // Garante que o código não se repita no banco de dados
    required: true,    // Campo obrigatório
    default: () => randomUUID() // Gera um UUID como valor padrão
  },

  // Data e hora da compra do ticket, com valor padrão sendo o momento atual
  purchase_datetime: {
    type: Date,
    default: Date.now, // Define o momento atual como padrão
    required: true
  },

  // Quantidade total da compra, obrigatória
  amount: {
    type: Number,
    required: true
  },

  // Identificação do comprador, obrigatória
  purchaser: {
    type: String,
    required: true
  }
});

// Cria o modelo Ticket com base no esquema definido, associando-o à coleção 'tickets'
export const TicketModel = model('tickets', ticketSchema);
