// routes/auth.routes.js (ATUALIZADO COM ROTA DO CARRINHO)
import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import UserModel from '../dao/models/user.model.js';
import CartModel from '../dao/models/cart.model.js';

const router = express.Router();

// ========== ROTAS DE VIEWS ==========
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

// ========== REGISTRO ==========
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const userExists = await UserModel.findOne({ email });
  if (userExists) return res.status(400).send('E-mail já cadastrado.');

  const role = (email === 'adminCoder@coder.com' && password === 'adminCod3r123') ? 'admin' : 'user';
  const hashedPassword = await bcrypt.hash(password, 10);
  await UserModel.create({ first_name, last_name, email, password: hashedPassword, role });

  res.redirect('/login');
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).send('Usuário não encontrado.');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).send('Senha inválida.');

  // Cria carrinho vinculado ao e-mail, se não existir
  let cart = await CartModel.findOne({ userEmail: email });
  if (!cart) {
    cart = await CartModel.create({ userEmail: email, products: [] });
  }

  req.session.user = {
    name: user.first_name,
    email: user.email,
    role: user.role
  };
  req.session.cartId = cart._id;

  res.redirect('/products');
});

// ========== LOGOUT ==========
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ========== LOGIN VIA GITHUB ==========
router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    // Cria carrinho se não existir para esse usuário GitHub
    let cart = await CartModel.findOne({ userEmail: req.user.email });
    if (!cart) {
      cart = await CartModel.create({ userEmail: req.user.email, products: [] });
    }

    req.session.user = {
      name: req.user.first_name,
      email: req.user.email,
      role: req.user.role || 'user'
    };
    req.session.cartId = cart._id;

    res.redirect('/products');
  }
);

// ========== ROTA DE VISUALIZAÇÃO DO CARRINHO ==========
router.get('/cart', async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.render('cartDetails', { products: [], empty: true });

  const cart = await CartModel.findById(cartId).populate('products.product').lean();
  if (!cart || cart.products.length === 0) {
    return res.render('cartDetails', { products: [], empty: true });
  }

  res.render('cartDetails', {
    products: cart.products,
    cartId: cart._id,
    empty: false
  });
});

export default router;
