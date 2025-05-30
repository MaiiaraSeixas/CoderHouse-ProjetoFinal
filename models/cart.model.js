// Importa a biblioteca Mongoose para modelagem de dados
import mongoose from 'mongoose';

// Define o schema do carrinho de compras
const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,  // Referência ao modelo Product
        ref: 'Product',                        // Permite população dos dados do produto
        required: true                         // Produto é obrigatório no item
      },
      quantity: {
        type: Number,
        min: 1,                                // Quantidade mínima permitida
        default: 1                             // Valor padrão ao adicionar item
      }
    }
  ]
});

// Cria o modelo Cart baseado no schema
const CartModel = mongoose.model('Cart', cartSchema);

// Exporta o modelo para uso na aplicação
export default CartModel;