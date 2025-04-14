import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://<USUARIO>:<SENHA>@<CLUSTER>.mongodb.net/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('Erro na conexão com o MongoDB:', error);
  }
};
