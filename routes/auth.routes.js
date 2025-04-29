// /routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../dao/models/user.model.js';

const router = express.Router();

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  const userExists = await UserModel.findOne({ email });
  if (userExists) return res.status(400).send('E-mail já cadastrado.');

  const role = (email === 'adminCoder@coder.com' && password === 'adminCod3r123') ? 'admin' : 'user';

  const hashed = await bcrypt.hash(password, 10);
  await UserModel.create({ first_name, last_name, email, password: hashed, role });

  res.redirect('/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).send('Usuário não encontrado.');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send('Senha inválida.');

  req.session.user = {
    name: user.first_name,
    email: user.email,
    role: user.role
  };

  res.redirect('/products');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

export default router;
