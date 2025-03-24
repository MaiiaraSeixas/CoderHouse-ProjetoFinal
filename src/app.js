const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

// Importa os gerenciadores de produtos e carrinhos
// Usando .js explicitamente
const ProductManager = require('../models/ProductManager.js'); 
const CartManager = require('../models/CartManager.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares para JSON, formulários e arquivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Instancia os gerenciadores
const productManager = new ProductManager();
const cartManager = new CartManager();


// Rotas para as Views (Interface via Handlebars)


// Rota principal: exibe a lista de produtos (renderização inicial)
app.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    res.status(500).send('Erro ao carregar produtos.');
  }
});

// Rota para view em tempo real: utiliza Socket.io para atualização automática
app.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).send('Erro ao carregar produtos.');
  }
});

// Rotas da API para Produtos
const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const limitedProducts = req.query.limit
      ? products.slice(0, Number(req.query.limit))
      : products;
    res.json(limitedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productsRouter.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(Number(req.params.pid));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Ao adicionar um novo produto, emite o evento Socket.io
productsRouter.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    const products = await productManager.getProducts();
    io.emit('updateProducts', products); // Emit dentro do POST
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.put('/:pid', async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(Number(req.params.pid), req.body);
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  try {
    await productManager.deleteProduct(Number(req.params.pid));
    const products = await productManager.getProducts();
    io.emit('updateProducts', products);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


// Rotas da API para Carrinhos

const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(Number(req.params.cid));
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });
    res.json(cart.products);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const updatedCart = await cartManager.addProductToCart(Number(req.params.cid), Number(req.params.pid));
    res.json(updatedCart);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Registra as rotas da API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


// Configuração do Socket.io

io.on('connection', async (socket) => {
  console.log('Cliente conectado via Socket.io');
  // Ao conectar, envia a lista atualizada de produtos
  const products = await productManager.getProducts();
  socket.emit('updateProducts', products);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// Inicialização do Servidor

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
