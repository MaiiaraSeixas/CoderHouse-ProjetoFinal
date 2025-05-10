// Importa o Mongoose para interação com MongoDB
import mongoose from 'mongoose';

// Função de conexão com o banco de dados
export const connectDB = async () => {
  try {
    // Configuração da conexão
    await mongoose.connect('mongodb+srv://<USUARIO>:<SENHA>@<CLUSTER>.mongodb.net/ecommerce', {
      useNewUrlParser: true,       // Usa novo parser de URL
      useUnifiedTopology: true     // Usa novo engine de descoberta de servidores
    });

    // Confirmação de conexão bem-sucedida
    console.log('MongoDB conectado com sucesso!');

  } catch (error) {
    // Tratamento de erros na conexão
    console.error('Erro na conexão com o MongoDB:', error);
  }
};