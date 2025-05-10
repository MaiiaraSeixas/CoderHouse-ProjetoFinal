// ====== Configuração principal do servidor ======
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Configuração de caminhos para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
config({ path: path.resolve(__dirname, '../.env') });

// Importações de segurança e autenticação
import passport from 'passport';
import '../config/passportConfig.js'; // Estratégias de autenticação

// Importações principais do Express
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import exphbs from 'express-handlebars';

// Modelos de dados
import MessageModel from '../dao/models/message.model.js';
import ProductModel from '../dao/models/product.model.js';

// Rotas da aplicação
import productsRouter from '../routes/api/products.js';
import productMongoRoutes from '../routes/api/products.mongo.js';
import cartMongoRoutes from '../routes/api/carts.mongo.js';

// Configuração de sessão
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Middlewares e rotas de autenticação
import { isAuthenticated } from '../middlewares/auth.js';
import authRoutes from '../routes/auth.routes.js';

// ====== Inicialização do servidor ======
const app = express();
const server = http.createServer(app);
const io = new Server(server); // Configura Socket.IO

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar no MongoDB:', err));

// Configuração do Handlebars com helpers customizados
const hbs = exphbs.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Permite acesso a propriedades de protótipo
    allowProtoMethodsByDefault: true
  },
  helpers: {
    multiply: (a, b) => a * b, // Calcula subtotal
    calculateTotal: (products) => { // Calcula total do carrinho
      let total = 0;
      products.forEach(item => {
        total += item.product.price * item.quantity;
      });
      return total.toFixed(2);
    },
    gt: (a, b) => a > b // Helper para comparação
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Configuração de sessão com armazenamento no MongoDB
app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  secret: 'chaveUltraSecreta123', // Deve ser alterado em produção
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // Sessão de 1 hora
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// ====== Configuração de rotas ======
app.use('/', authRoutes); // Rotas de autenticação
app.use('/api/products', productMongoRoutes); // Produtos com MongoDB
app.use('/api/products/fs', productsRouter); // Produtos com FileSystem (legado)
app.use('/api/carts', cartMongoRoutes); // Carrinhos com MongoDB

// Rota principal com lista de produtos
app.get('/', async (req, res) => {
  const products = await ProductModel.find().lean(); // lean() para objetos simples
  res.render('home', { products });
});

// Rota paginada de produtos com autenticação
app.get('/products', isAuthenticated, async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  // Validação de parâmetros
  const numLimit = parseInt(limit);
  const numPage = parseInt(page);

  if (isNaN(numLimit) || numLimit <= 0 || isNaN(numPage) || numPage <= 0) {
    return res.status(400).send('Parâmetros de limite ou página inválidos.');
  }

  try {
    const result = await ProductModel.paginate({}, {
      page: numPage,
      limit: numLimit,
      lean: true
    });

    // Renderização com dados para paginação
    res.render('products', {
      products: result.docs,
      user: req.session.user, // Dados do usuário logado
      cartId: req.session.cartId, // ID do carrinho na sessão
      totalPages: result.totalPages,
      currentPage: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      limit: numLimit
    });
  } catch (error) {
    console.error('Erro ao buscar produtos para a view:', error);
    res.status(500).send('Erro ao carregar a página de produtos.');
  }
});

// Rota de detalhes do produto
app.get('/products/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await ProductModel.findById(pid).lean();
    if (!product) {
      return res.status(404).send('Produto não encontrado.');
    }
    res.render('productDetails', {
      product,
      cartId: req.session.cartId || null, // Passa cartId para a view
      user: req.session.user
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    res.status(500).send('Erro ao carregar os detalhes do produto.');
  }
});

// Rota do chat
app.get('/chat', (req, res) => {
  res.render('chat');
});

// ====== Configuração do Socket.IO ======
io.on('connection', socket => {
  console.log('Novo usuário conectado ao chat');
  socket.on('chatMessage', async data => {
    await MessageModel.create(data); // Salva mensagem no MongoDB
    io.emit('chatMessage', data); // Broadcast da mensagem
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));