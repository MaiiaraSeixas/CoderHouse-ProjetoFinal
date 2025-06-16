// src/middlewares/errorHandler.js

// Bloco 1: Importação do Dicionário de Erros
// Importamos nosso dicionário `EErrors` para ter acesso aos códigos de erro padronizados.
import EErrors from "../utils/errors/errorDictionary.js";

// Bloco 2: Middleware de Tratamento de Erros
// Este middleware é o ponto final para qualquer erro lançado na aplicação que não
// foi capturado por um bloco `try...catch` local. Ele recebe o objeto de erro
// e formata uma resposta HTTP apropriada.
export const errorHandler = (error, req, res, next) => {
    // 2.1: Log do erro no console do servidor para depuração.
    // É importante registrar a "causa" do erro, que contém os detalhes técnicos.
    console.error(`[CUSTOM ERROR] Causa: ${error.cause || 'Não definida'}`);
    
    // 2.2: Estrutura Switch para tratar cada tipo de erro
    // O `switch` verifica o código do erro (`error.code`) e define a resposta HTTP correta.
    switch (error.code) {
        // Caso seja um erro de rota não encontrada.
        case EErrors.ROUTING_ERROR:
            res.status(404).send({ status: 'error', error: error.name, message: error.message });
            break;

        // Casos para dados inválidos ou de criação. Retorna "Bad Request".
        case EErrors.INVALID_TYPES_ERROR:
        case EErrors.PRODUCT_CREATION_ERROR:
            res.status(400).send({ status: 'error', error: error.name, message: error.message, cause: error.cause });
            break;

        // Casos para recursos não encontrados.
        case EErrors.PRODUCT_NOT_FOUND:
        case EErrors.CART_NOT_FOUND:
            res.status(404).send({ status: 'error', error: error.name, message: error.message });
            break;

        // Caso para falha de autorização (permissão). Retorna "Forbidden".
        case EErrors.AUTHORIZATION_ERROR:
            res.status(403).send({ status: 'error', error: error.name, message: error.message });
            break;
            
        // 2.3: Caso Padrão (Default)
        // Se o erro não corresponder a nenhum dos nossos códigos personalizados,
        // ele é tratado como um erro interno do servidor (status 500).
        default:
            res.status(500).send({ status: 'error', error: "Unhandled error", message: error.message });
            break;
    }
}



// // middlewares/errorHandler.js

// /**
//  * Middleware global para captura e tratamento de erros
//  */
// export function errorHandler(err, req, res, next) {
//   console.error('[ERROR]', err);

//   const isProd = process.env.NODE_ENV === 'production';
//   const status = err.status || 500;
//   const message = err.message || 'Erro interno do servidor';

//   res.status(status).json({
//     status: 'error',
//     message: isProd ? 'Erro inesperado. Contate o suporte.' : message
//   });
// }
