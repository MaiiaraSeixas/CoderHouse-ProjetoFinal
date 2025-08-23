// src/routes/auth.routes.js
import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt.js';
import CartModel from '../models/cart.model.js';
import UserDTO from '../dtos/UserDTO.js';
import userDAO from '../daos/mongo/user.dao.js';

const router = Router();

// Helper para configurar cookie JWT
function setAuthCookie(res, token) {
  res.cookie('jwtCookieToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Handler genérico para autenticação de login
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Próximo middleware
 * @param {Boolean} isApi - Indica se é requisição de API (JSON) ou formulário (HTML)
 */
function handleLogin(req, res, next, isApi = false) {
  passport.authenticate('login', { session: false }, async (err, user, info) => {
    // Tratamento de erros gerais
    if (err) {
      console.error('[LOGIN ERROR]', err);
      return isApi
        ? res.status(500).json({ status: 'error', error: 'Erro interno no servidor' })
        : res.redirect('/login?error=1');
    }

    // Verifica se o usuário foi autenticado
    if (!user) {
      const msg = info?.message || 'Credenciais inválidas';
      console.warn('[LOGIN FAIL]', msg);
      return isApi
        ? res.status(401).json({ status: 'error', error: msg })
        : res.redirect('/login?error=1');
    }

    try {
      // Cria payload do token com informações essenciais
      const tokenPayload = {
        user: {
          _id: user._id,
          first_name: user.first_name,
          email: user.email,
          role: user.role,
          cartId: user.cartId?.toString(),
        }
      };

      // Gera token JWT
      const token = generateToken(tokenPayload);
      setAuthCookie(res, token);

      // Comportamento para autenticação via formulário
      if (!isApi) {
        // Armazena dados do usuário na sessão para views
        req.session.user = {
          _id: user._id,
          first_name: user.first_name,
          email: user.email,
          role: user.role,
        };

        // Busca ou cria carrinho associado ao usuário
        const cart = await CartModel.findOne({ user: user._id }) ||
          await CartModel.create({ user: user._id, products: [] });

        req.session.cartId = cart._id;
        return res.redirect('/products');
      }

      // Resposta para API
      return res.sendSuccess('Login bem-sucedido');
    } catch (tokenErr) {
      console.error('[TOKEN ERROR]', tokenErr);
      return isApi
        ? res.status(500).json({ status: 'error', error: 'Erro ao gerar token' })
        : res.redirect('/login?error=2');
    }
  })(req, res, next);
}

// =============== ROTAS DE REGISTRO ===============

// Registro via API (JSON)
router.post(
  '/register',
  (req, res, next) => {
    passport.authenticate('register', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // A mensagem de erro vem do 'done' na estratégia do passport
        return res.status(400).json({ status: 'error', error: info.message });
      }
      res.sendCreated({
        message: 'Usuário registrado com sucesso',
        user: new UserDTO(user)
      });
    })(req, res, next);
  }
);

// Registro via Formulário HTML
router.post(
  '/register/form',
  passport.authenticate('register', {
    failureRedirect: '/register?error=1',
    session: false,
  }),
  (req, res) => res.redirect('/login')
);

// =============== ROTAS DE LOGIN ===============

// Login via API (JSON)
router.post('/login', (req, res, next) => {
  handleLogin(req, res, next, true);
});

// Login via Formulário HTML
router.post('/login/form', (req, res, next) => {
  handleLogin(req, res, next, false);
});

// =============== ROTA DE USUÁRIO ATUAL ===============

router.get(
  '/current',
  (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Não autorizado. Faça o login para continuar.' });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    try {
      const safeUser = new UserDTO(req.user);
      res.sendSuccess({ message: 'Usuário autenticado', user: safeUser });
    } catch (e) {
      console.error('[CURRENT USER ERROR]', e);
      res.status(500).json({ status: 'error', error: 'Erro ao recuperar dados do usuário' });
    }
  }
);

// =============== ROTA DE LOGOUT ===============

router.get('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Atualiza a última conexão do usuário
    if (req.user) {
      await userDAO.updateUser(req.user._id, { last_connection: new Date() });
    }
    // Remove cookie de autenticação
    res.clearCookie('jwtCookieToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    // Destrói a sessão para limpar os dados do usuário
    req.session.destroy(err => {
      if (err) {
        console.error('Falha ao destruir a sessão:', err);
        // Mesmo com erro na destruição da sessão, o logout deve continuar
      }

      // Responde ao cliente
      if (req.accepts('html')) {
        res.redirect('/login');
      } else {
        res.sendSuccess('Logout realizado com sucesso');
      }
    }); // <-- Fecha o callback de req.session.destroy
  } catch (e) {
    console.error('[LOGOUT ERROR]', e);
    // Evita enviar resposta duas vezes
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', error: 'Erro durante logout' });
    }
  }
});

// =============== AUTENTICAÇÃO COM GITHUB ===============

// Inicia fluxo de autenticação
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// Callback do GitHub
router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    try {
      // Cria payload para token
      const tokenPayload = {
        user: {
          _id: req.user._id,
          first_name: req.user.first_name,
          email: req.user.email,
          role: req.user.role,
          cartId: req.user.cartId?.toString(),
        }
      };

      // Gera token e configura cookie
      const token = generateToken(tokenPayload);
      setAuthCookie(res, token);

      // Redireciona após autenticação bem-sucedida
      res.redirect('/products');
    } catch (error) {
      console.error('[GITHUB AUTH ERROR]', error);
      res.redirect('/login?error=3');
    }
  }
);

export default router;
