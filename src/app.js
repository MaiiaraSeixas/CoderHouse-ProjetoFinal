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
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Rotas
app.use('/api/products', productMongoRoutes);
app.use('/api/products/fs', productsRouter); // opcional: FileSystem em rota separada
app.use('/api/carts', cartMongoRoutes);

app.get('/', async (req, res) => {
  const products = await ProductModel.find();
  res.render('home', { products });
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

