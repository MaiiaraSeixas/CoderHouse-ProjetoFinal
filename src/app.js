// Arquivo 3: src/app.js (ATUALIZE ESTE ARQUIVO)

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Server } from 'socket.io';
import http from 'http';
import exphbs from 'express-handlebars';
import logger from './utils/logger.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';


// Middlewares e Configs
import config from './config/config.js';
import { initializePassport } from './config/passport.js';
import responseMiddleware from './middlewares/responseMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Rotas
import authRoutes from './routes/auth.routes.js';
import productsRouter from './routes/products.js';
import productMongoRoutes from './routes/products.mongo.js';
import cartRoutes from './routes/carts.routes.js';
import productsViewRouter from './routes/products.view.js';
import mailRoutes from './routes/mail.routes.js';
import smsRoutes from './routes/sms.routes.js';
import usersRoutes from './routes/users.routes.js';
import mockingRoutes from './routes/mocking.routes.js';

// Serviços e Modelos
import { cartService } from './services/cart.service.js';
import ProductModel from './models/product.model.js';
import MessageModel from './models/message.model.js';

// Diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Inicialização
const app = express();
const PORT = config.port;
const server = http.createServer(app);
const io = new Server(server);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// Handlebars
const hbs = exphbs.create({
  layoutsDir: path.resolve(__dirname, './views/layouts'),
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    multiply: (a, b) => a * b,
    calculateTotal: (products) =>
      products.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2),
    gt: (a, b) => a > b
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));
app.use(responseMiddleware);

// --- MIDDLEWARE PARA INJETAR O LOGGER ---
// Adiciona o logger a todas as requisições para fácil acesso
app.use((req, res, next) => {
  req.logger = logger;
  // Log de alto valor: registra cada requisição HTTP recebida
  req.logger.http(`${req.method} em ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// --- Configuração do Swagger ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentação da API de E-commerce',
            description: 'API para gerir produtos e carrinhos de um e-commerce, desenvolvida para o projeto final do curso de Backend da CoderHouse.'
        },
        // ATUALIZAÇÃO: Define o esquema de segurança JWT
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Insira o token JWT obtido no login'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
};
const specs = swaggerJsdoc(swaggerOptions);

// Sessão e Passport
app.use(session({
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// --- REGISTRO DAS ROTAS ---
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
app.use('/api/sessions', authRoutes);
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter);
app.use('/api/carts', cartRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/users', usersRoutes);
app.use('/mockingproducts', mockingRoutes);

// --- ROTA DE TESTE DO LOGGER ---
app.get('/loggerTest', (req, res) => {
  req.logger.fatal('Este é um log fatal de teste!');
  req.logger.error('Este é um log de erro de teste!');
  req.logger.warning('Este é um log de aviso de teste!');
  req.logger.info('Este é um log de informação de teste!');
  req.logger.http('Este é um log http de teste!');
  req.logger.debug('Este é um log de debug de teste! (Só deve aparecer em desenvolvimento)');

  res.send('Logs de teste enviados! Verifique o console e, em produção, o arquivo errors.log.');
});

// Rotas de Visualização
app.use(
  '/products',
  passport.authenticate('jwt', { session: false }),
  productsViewRouter
);

// Página inicial e outras views
app.get('/', async (req, res) => {
  const products = await ProductModel.find().lean();
  res.render('pages/home', { products });
});

app.get('/cart', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const cartId = req.user.cartId;
    if (!cartId) {
      return res.render('pages/cartDetails', { products: [], empty: true });
    }
    const cart = await cartService.getCartById(cartId);
    if (!cart) {
      console.warn(`Carrinho com ID ${cartId} não foi encontrado.`);
      return res.render('pages/cartDetails', { products: [], empty: true });
    }
    const isEmpty = !cart.products || cart.products.length === 0;
    res.render('pages/cartDetails', { products: cart.products, empty: isEmpty });
  } catch (error) {
    console.error("Erro ao carregar a página do carrinho:", error);
    res.status(500).send("Erro ao carregar o carrinho.");
  }
});

app.get('/chat', (req, res) => res.render('pages/chat'));
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));

// WebSocket
io.on('connection', socket => {
  // Usamos o logger global aqui, pois sockets não passam por middlewares Express
  logger.info('🔌 Usuário conectado via WebSocket');
  socket.on('chatMessage', async data => {
    await MessageModel.create(data);
    io.emit('chatMessage', data);
  });
});

// MIDDLEWARE DE ERROS (Deve ser o último)
app.use(errorHandler);

// Start
server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🔗 Ambiente atual: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📚 Documentação da API disponível em: http://localhost:${PORT}/api-docs`);
});


