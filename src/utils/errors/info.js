// src/utils/errors/info.js

// Bloco 1: Função de Informação de Erro para Criação de Produto
// Esta função tem uma única responsabilidade: gerar uma string clara e detalhada
// sobre por que a criação de um produto falhou, baseando-se nos dados recebidos.
// Isso ajuda na depuração, pois informa exatamente qual campo está errado.
// @param {object} product - O objeto de produto que foi enviado na requisição.
// @returns {string} Uma mensagem de erro formatada para ser usada no campo `cause` do nosso CustomError.
export const generateProductErrorInfo = (product) => {
    return `Um ou mais campos obrigatórios estão faltando ou são inválidos.
    Lista de propriedades necessárias:
    * title: precisa ser uma String, recebido: ${product.title}
    * description: precisa ser uma String, recebido: ${product.description}
    * code: precisa ser uma String, recebido: ${product.code}
    * price: precisa ser um Number, recebido: ${product.price}
    * stock: precisa ser um Number, recebido: ${product.stock}
    * category: precisa ser uma String, recebido: ${product.category}
    `;
};

// Futuramente, você pode adicionar outras funções aqui para outros tipos de erro.
// Ex: export const generateCartErrorInfo = (cart) => { ... };
