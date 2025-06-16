// src/utils/errors/errorDictionary.js

// Bloco 1: Definição do Objeto de Erros
// Este objeto `EErrors` funciona como uma enumeração (enum). Cada chave representa
// um tipo de erro lógico na nossa aplicação, e o valor é um código numérico único.
// Usar este objeto em vez de strings de texto para identificar erros previne
// erros de digitação e centraliza todos os tipos de erro em um único local.
const EErrors = {
    // Causa: A rota solicitada pelo cliente não existe no servidor.
    ROUTING_ERROR: 1,

    // Causa: Um ou mais campos enviados na requisição têm tipos de dados incorretos (ex: esperar um número e receber um texto).
    INVALID_TYPES_ERROR: 2,

    // Causa: Erro geral relacionado a uma falha na operação do banco de dados.
    DATABASE_ERROR: 3,

    // Causa: O ID de um produto fornecido em um parâmetro de URL não foi encontrado no banco de dados.
    PRODUCT_NOT_FOUND: 4,

    // Causa: O ID de um carrinho fornecido em um parâmetro de URL não foi encontrado no banco de dados.
    CART_NOT_FOUND: 5,

    // Causa: Tentativa de adicionar um produto ao carrinho ou finalizar uma compra sem estoque suficiente.
    INSUFFICIENT_STOCK: 6,

    // Causa: Dados obrigatórios estão faltando ao tentar criar um novo produto.
    PRODUCT_CREATION_ERROR: 7,

    // Causa: O usuário (identificado pelo token JWT) não tem a permissão (role) necessária para acessar o recurso.
    AUTHORIZATION_ERROR: 8,
};

// Bloco 2: Exportação
// Exportamos o objeto para que ele possa ser usado em outras partes do sistema,
// como no nosso gerador de erros e no middleware de tratamento de erros.
export default EErrors;
