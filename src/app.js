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
app.use('/api/sessions', authRoutes);
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter);
app.use('/api/carts', cartRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/users', usersRoutes);
app.use('/mockingproducts', mockingRoutes);

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
  console.log('🔌 Usuário conectado');
  socket.on('chatMessage', async data => {
    await MessageModel.create(data);
    io.emit('chatMessage', data);
  });
});

// MIDDLEWARE DE ERROS (Deve ser o último)
app.use(errorHandler);

// Start
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
