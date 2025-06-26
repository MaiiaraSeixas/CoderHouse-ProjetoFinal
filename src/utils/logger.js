// src/utils/logger.js

import winston from 'winston';

// 1. Definição do sistema de camadas (níveis de log) customizado
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warning: 'yellow',
    info: 'blue',
    http: 'green',
    debug: 'white',
  },
};

// Adiciona as cores ao Winston para que ele as reconheça
winston.addColors(customLevels.colors);

// Função para criar o logger de desenvolvimento
const createDevLogger = () => {
  return winston.createLogger({
    levels: customLevels.levels,
    // Logger de desenvolvimento: registra a partir de 'debug' e apenas no console.
    transports: [
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
      }),
    ],
  });
};

// Função para criar o logger de produção
const createProdLogger = () => {
  return winston.createLogger({
    levels: customLevels.levels,
    // Logger de produção: registra a partir de 'info'.
    transports: [
      // Log para o console a partir do nível 'info'
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
      }),
      // Log para o arquivo 'errors.log' a partir do nível 'error'
      new winston.transports.File({
        filename: './errors.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json() // Formato JSON é ótimo para logs em arquivo
        ),
      }),
    ],
  });
};

// Escolhe o logger com base no ambiente (NODE_ENV)
// Por padrão, usa o de desenvolvimento se a variável não estiver definida
const logger = process.env.NODE_ENV === 'production' 
  ? createProdLogger() 
  : createDevLogger();

export default logger;