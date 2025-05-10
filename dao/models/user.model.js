// Importa a biblioteca Mongoose para modelagem de dados
import mongoose from 'mongoose';

// Define o schema (estrutura) do usuário com validações e configurações
const userSchema = new mongoose.Schema({
  first_name: {
    type: String // Nome do usuário
  },
  last_name: {
    type: String // Sobrenome (não obrigatório)
  },
  email: {
    type: String,
    unique: true,   // Garante unicidade
    sparse: true    // Permite múltiplos documentos sem o campo email
  },
  password: {
    type: String    // Senha (deve ser hasheada antes de armazenar)
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Valores permitidos
    default: 'user'          // Valor padrão se não especificado
  },
  githubId: {
    type: String    // ID único do GitHub para autenticação social
  },
  avatar: {
    type: String    // URL da imagem do avatar/perfil
  }
});

// Cria o modelo User baseado no schema
const UserModel = mongoose.model('User', userSchema);

// Exporta o modelo para uso em outras partes da aplicação
export default UserModel;