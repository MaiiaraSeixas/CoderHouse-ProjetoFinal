import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import exphbs from 'express-handlebars';

import MessageModel from '../dao/models/message.model.js';
import ProductModel from '../dao/models/product.model.js';

import productsRouter from '../routes/api/products.js'; // FileSystem
import productMongoRoutes from '../routes/api/products.mongo.js';
import cartMongoRoutes from '../routes/api/carts.mongo.js';

import session from 'express-session';
import MongoStore from 'connect-mongo';

import { isAuthenticated } from '../middlewares/auth.js';

import authRoutes from '../routes/auth.routes.js'; // Rotas de autenticação

// Configuração inicial
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); // se quiser usar CSS ou imagens

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://MaiiaraSeixas:%40Coder25@cluster0.noqqyct.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0') // substitua pela URI real
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar no MongoDB:', err));



// Handlebars (view engine)
const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        multiply: (a, b) => a * b,
        calculateTotal: (products) => {
            let total = 0;
            products.forEach(item => {
                total += item.product.price * item.quantity;
            });
            return total.toFixed(2);
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://MaiiaraSeixas:%40Coder25@cluster0.noqqyct.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0'

    }),
    secret: 'chaveUltraSecreta123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1h
}));

// 🔥 Usa as rotas de autenticação
app.use('/', authRoutes);

// Rotas API
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter); // opcional: FileSystem em rota separada
app.use('/api/carts', cartMongoRoutes);

// Rotas de Visualização
app.get('/', async (req, res) => {
    const products = await ProductModel.find().lean(); // Use .lean() para obter objetos JavaScript simples
    res.render('home', { products });
});

app.get('/products', isAuthenticated, async (req, res) => {
    const { limit = 10, page = 1 } = req.query;
    const numLimit = parseInt(limit);
    const numPage = parseInt(page);

    if (isNaN(numLimit) || numLimit <= 0 || isNaN(numPage) || numPage <= 0) {
        return res.status(400).send('Parâmetros de limite ou página inválidos.');
    }

    try {
        const result = await ProductModel.paginate({}, { page: numPage, limit: numLimit, lean: true });
        res.render('products', {
            products: result.docs,
            user: req.session.user,
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

app.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await ProductModel.findById(pid).lean();
        if (!product) {
            return res.status(404).send('Produto não encontrado.');
        }
        res.render('productDetails', { product });
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        res.status(500).send('Erro ao carregar os detalhes do produto.');
    }
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

// WebSocket (Chat)
io.on('connection', socket => {
    console.log('Novo usuário conectado ao chat');
    socket.on('chatMessage', async data => {
        await MessageModel.create(data);
        io.emit('chatMessage', data);
    });
});

//  Início do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));