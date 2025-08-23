// src/app.js

import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import exphbs from 'express-handlebars';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

// Middlewares, Configs e Utilitários
import config from './config/config.js';
import { initializePassport } from './config/passport.js';
import responseMiddleware from './middlewares/responseMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

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
import cartService  from './services/cart.service.js';
import ProductModel from './models/product.model.js';

// Diretórios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. INICIALIZAÇÃO DA APLICAÇÃO EXPRESS
const app = express();

// 2. CONFIGURAÇÃO DOS MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));
app.use(responseMiddleware);

app.use((req, res, next) => {
  req.logger = logger;
  req.logger.http(`${req.method} em ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// 3. CONFIGURAÇÃO DO TEMPLATE ENGINE (HANDLEBARS)
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
    gt: (a, b) => a > b,
    eq: (a, b) => a === b
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

// 4. CONFIGURAÇÃO DA SESSÃO E PASSPORT
app.use(session({
  store: MongoStore.create({ mongoUrl: config.MONGO_URL }),
  secret: config.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
}));
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// 5. CONFIGURAÇÃO DO SWAGGER
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentação da API de E-commerce',
            description: 'API para gerir produtos e carrinhos.'
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// 6. REGISTO DAS ROTAS
app.use('/api/sessions', authRoutes);
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter);
app.use('/api/carts', cartRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/users', usersRoutes);
app.use('/mockingproducts', mockingRoutes);
app.use('/products', passport.authenticate('jwt', { session: false }), productsViewRouter);

// Rotas de Views adicionais
app.get('/', async (req, res) => {
  const products = await ProductModel.find().lean();
  res.render('pages/home', { products });
});
app.get('/cart', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
    const cartId = req.user.cartId;
    if (!cartId) {
      return res.render('pages/cartDetails', { products: [], empty: true, cartId: null });
    }
    const cart = await cartService.getCartById(cartId);
    if (!cart) {
      console.warn(`Carrinho com ID ${cartId} não foi encontrado.`);
      return res.render('pages/cartDetails', { products: [], empty: true, cartId: cartId });
    }
    const isEmpty = !cart.products || cart.products.length === 0;
    res.render('pages/cartDetails', { products: cart.products, empty: isEmpty, cartId: cartId });
  } catch (error) {
    console.error("Erro ao carregar a página do carrinho:", error);
    res.status(500).send("Erro ao carregar o carrinho.");
  }
});
app.get('/chat', (req, res) => res.render('pages/chat'));
app.get('/login', (req, res) => res.render('pages/login'));
app.get('/register', (req, res) => res.render('pages/register'));

// 7. MIDDLEWARE DE ERROS (DEVE SER O ÚLTIMO)
app.use(errorHandler);

// 8. EXPORTA A APLICAÇÃO CONFIGURADA
export default app;
