// Importa o Mongoose e o plugin de paginação
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Define o schema para produtos com campos essenciais
const productSchema = new mongoose.Schema({
  title: {
    type: String,       // Nome do produto
    required: true      // (Sugestão: Adicionar validação obrigatória)
  },
  description: String,  // Descrição detalhada
  code: {
    type: String,       // Código único do produto
    unique: true        // (Sugestão: Garantir unicidade)
  },
  price: {
    type: Number,       // Preço numérico
    min: 0              // Valor mínimo permitido
  },
  stock: {
    type: Number,       // Quantidade em estoque
    default: 0          // Valor padrão se não informado
  },
  category: String,     // Categoria de classificação
  thumbnails: [String], // Array de URLs de imagens
  status: {
    type: Boolean,      // Disponibilidade do produto
    default: true       // Ativo por padrão
  }
});

// Aplica o plugin de paginação ao schema
productSchema.plugin(mongoosePaginate);

// Cria o modelo Product com capacidades de paginação
const ProductModel = mongoose.model('Product', productSchema);

// Exporta o modelo para uso na aplicação
export default ProductModel;