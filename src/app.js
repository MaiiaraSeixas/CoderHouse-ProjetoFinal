// app.js
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
import { initializePassport } from '../config/passport.js';
import responseMiddleware from '../middlewares/responseMiddleware.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { errorHandler } from '../middlewares/errorHandler.js';

// Rotas
import authRoutes from '../routes/auth.routes.js';
import productsRouter from '../routes/products.js';
import productMongoRoutes from '../routes/products.mongo.js';
import cartMongoRoutes from '../routes/carts.mongo.js';
import cartRoutes from '../routes/carts.routes.js';
import productsViewRouter from '../routes/products.view.js';

// Modelos
import ProductModel from '../models/product.model.js';
import MessageModel from '../models/message.model.js';

// Diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Inicialização
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// Handlebars
const hbs = exphbs.create({
  layoutsDir: path.resolve(__dirname, '../views/layouts'),
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    multiply: (a, b) => a * b,
    calculateTotal: (products) =>
      products.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2),
    gt: (a, b) => a > b
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, '../views'));

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

// Rotas da API
app.use('/api/sessions', authRoutes);
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter);
// app.use('/api/carts', cartMongoRoutes);
app.use('/api/carts', cartRoutes);

// Rotas de Visualização
app.use(
  '/products',
  passport.authenticate('jwt', { session: false }),
  productsViewRouter
);

// Página inicial
app.get('/', async (req, res) => {
  const products = await ProductModel.find().lean();
  res.render('pages/home', { products });
});



// ✅ Página de produtos (corrigida)
// app.get('/products', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   try {
//   console.log('[DEBUG] req.user:', req.user);
//   console.log('[DEBUG] req.session:', req.session);


//   const products = await ProductModel.find().lean();
//   const user = req.user || null;
//   const cartId = user?.cartId?.toString() || null;

//   console.log('🛒 Produtos carregados:', products.length); // Verifica a quantidade de produtos
//   console.log('📦 cartId enviado para a view:', cartId); // Verifica o ID do carrinho
//   console.log('[DEBUG] user que será enviado para a view:', user);
  


//   res.render('pages/products', {
//     user,
//     cartId,
//     products,
//     currentPage: 1,
//     totalPages: 1,
//     hasPrevPage: false,
//     hasNextPage: false,
//     prevPage: null,
//     nextPage: null,
//     limit: products.length
//   });
//   } catch (err) {
//     console.error('❌ Erro ao carregar os produtos:', err);
//     res.status(500).json({ error: 'Erro ao carregar os produtos' });
//   }
// });

// Outras páginas
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

// Middleware de erros
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
