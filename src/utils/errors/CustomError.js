// src/utils/errors/CustomError.js

// Bloco 1: Definição da Classe
// `CustomError` não é um erro em si, mas uma fábrica de erros.
// Ela contém um método estático, o que significa que não precisamos instanciar
// a classe (`new CustomError()`) para usá-lo. Podemos chamar `CustomError.createError()` diretamente.
export default class CustomError {
    
    // Bloco 2: Método Estático `createError`
    // Este método é o coração da nossa fábrica de erros. Ele recebe um objeto
    // com todas as informações necessárias para construir um erro detalhado.
    // @param {string} name - Um nome descritivo para o tipo de erro (ex: 'Product Creation Error').
    // @param {string} cause - Uma explicação técnica e detalhada do que causou o erro. Ideal para logs.
    // @param {string} message - Uma mensagem amigável que pode ser mostrada ao usuário final.
    // @param {number} code - O código numérico do nosso dicionário `EErrors`.
    static createError({ name = "Error", cause, message, code = 1 }) {
        // 2.1: Cria uma instância de erro padrão do JavaScript.
        const error = new Error(message);

        // 2.2: Anexa as propriedades personalizadas ao objeto de erro.
        // Isso enriquece o erro padrão com nosso contexto de negócio.
        error.name = name;
        error.cause = cause;
        error.code = code;

        // 2.3: Lança o erro.
        // O `throw` interrompe a execução do bloco `try` atual e passa o controle
        // para o primeiro bloco `catch` ou para o middleware de erro, se não for capturado antes.
        throw error;
    }
}
