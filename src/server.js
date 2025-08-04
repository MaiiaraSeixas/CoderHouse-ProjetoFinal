// src/server.js

import app from './app.js';
import config from './config/config.js';
import { connectDb } from './config/db.js';
import http from 'http';
import { Server } from 'socket.io';
import logger from './utils/logger.js';
import MessageModel from './models/message.model.js';

/**
 * Ponto de entrada principal da aplicação.
 * Responsável por conectar à base de dados e iniciar o servidor Express com WebSockets.
 */
const startServer = async () => {
    try {
        // Conecta à base de dados primeiro.
        await connectDb();

        const server = http.createServer(app);
        const io = new Server(server);

        // Lógica do WebSocket
        io.on('connection', socket => {
            logger.info('🔌 Usuário conectado via WebSocket');
            socket.on('chatMessage', async data => {
                await MessageModel.create(data);
                io.emit('chatMessage', data);
            });
        });

        // Se a conexão for bem-sucedida, inicia o servidor.
        server.listen(config.PORT, () => {
            logger.info(`🚀 Servidor a correr na porta ${config.PORT}`);
            logger.info(`🔗 Ambiente atual: ${config.NODE_ENV}`);
            logger.info(`📚 Documentação da API disponível em: http://localhost:${config.PORT}/api-docs`);
        });

        server.on('error', error => logger.error('❌ Erro no servidor:', error));

    } catch (error) {
        logger.fatal('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
};

startServer();