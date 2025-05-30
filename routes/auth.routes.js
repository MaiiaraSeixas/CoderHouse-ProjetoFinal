// routes/auth.routes.js

import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt.js';
import CartModel from '../models/cart.model.js'; // Import do modelo de carrinho

const router = Router();

// Helper para configurar cookie JWT
function setAuthCookie(res, token) {
  res.cookie('jwtCookieToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 1000, // 1h
  });
}

// Wrapper genérico de login (HTML ou API)
function handleLogin(req, res, next, isApi = false) {
  passport.authenticate('login', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('[LOGIN ERROR]', err);
      if (isApi) return res.status(500).json({ status: 'error', error: 'Erro interno no servidor' });
      return res.redirect('/login?error=1');
    }

    if (!user) {
      const msg = info?.message || 'Credenciais inválidas';
      console.warn('[LOGIN FAIL]', msg);
      if (isApi) return res.status(401).json({ status: 'error', error: msg });
      return res.redirect('/login?error=1');
    }

    try {
      console.log('[DEBUG] Usuário recuperado para gerar token:', user);

      const tokenPayload = {
      
          _id: user._id,
          email: user.email,
          role: user.role,
          cartId: user.cartId?.toString()
        
      };

      const token = generateToken(tokenPayload);

      if (!token) {
        console.error('[DEBUG] Falha ao gerar token. Payload:', tokenPayload);
        if (isApi) return res.status(500).json({ status: 'error', error: 'Erro ao gerar token' });
        return res.redirect('/login?error=2');
      }

      setAuthCookie(res, token);

      if (!isApi) {
        req.session.user = {
          _id: user._id,
          first_name: user.first_name,
          email: user.email,
          role: user.role,
        };

        const cart = await CartModel.findOne({ user: user._id })
          || await CartModel.create({ user: user._id, products: [] });

        req.session.cartId = cart._id;

        return res.redirect('/products');
      }

      return res.sendSuccess('Login bem-sucedido');
    } catch (tokenErr) {
      console.error('[TOKEN ERROR]', tokenErr);
      if (isApi) return res.status(500).json({ status: 'error', error: 'Erro ao gerar token' });
      return res.redirect('/login?error=2');
    }
  })(req, res, next);
}

// ----------------------
// Registro via Formulário
// ----------------------
router.post(
  '/register/form',
  passport.authenticate('register', {
    failureRedirect: '/register?error=1',
    session: false
  }),
  (req, res) => res.redirect('/login')
);

// ----------------------
// Login via Formulário
// ----------------------
router.post('/login/form', (req, res, next) => {
  handleLogin(req, res, next, false);
});

// ----------------------
// Registro via API (Postman/SPA)
// ----------------------
router.post(
  '/register',
  passport.authenticate('register', { session: false }),
  (req, res) => {
    try {
      res.sendSuccess('Usuário registrado com sucesso', {
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email
        }
      });
    } catch (e) {
      console.error('[REGISTER API ERROR]', e);
      res.status(500).json({ status: 'error', error: 'Erro interno no servidor' });
    }
  }
);

// ----------------------
// Login via API (Postman/SPA)
// ----------------------
router.post('/login', (req, res, next) => {
  handleLogin(req, res, next, true);
});

// ----------------------
// Rota /current
// ----------------------
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      const { _id, first_name, last_name, email, role } = req.user;
      res.sendSuccess('Usuário autenticado', {
        user: { _id, first_name, last_name, email, role }
      });
    } catch (e) {
      console.error('[CURRENT USER ERROR]', e);
      res.status(500).json({ status: 'error', error: 'Erro ao recuperar dados do usuário' });
    }
  }
);

// ----------------------
// Logout
// ----------------------
router.get('/logout', (req, res) => {
  try {
    // Limpa cookie JWT com flags de segurança
    res.clearCookie('jwtCookieToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    // Resposta dinâmica para HTML vs API
    if (req.accepts('html')) {
      req.logout(() => res.redirect('/login'));
    } else {
      res.sendSuccess('Logout realizado com sucesso');
    }
  } catch (e) {
    console.error('[LOGOUT ERROR]', e);
    res.status(500).json({ status: 'error', error: 'Erro durante logout' });
  }
});

export default router;







































// // routes/auth.routes.js

// import { Router } from 'express';
// import passport from 'passport';
// import { generateToken } from '../utils/jwt.js';
// import CartModel from '../models/cart.model.js'; // Import do modelo de carrinho

// const router = Router();

// // Helper para configurar cookie JWT
// function setAuthCookie(res, token) {
//   res.cookie('jwtCookieToken', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'Strict',
//     maxAge: 60 * 60 * 1000, // 1h
//   });
// }

// // Wrapper genérico de login (HTML ou API)
// function handleLogin(req, res, next, isApi = false) {
//   passport.authenticate('login', { session: false }, async (err, user, info) => {
//     if (err) {
//       console.error('[LOGIN ERROR]', err);
//       if (isApi) return res.status(500).json({ status: 'error', error: 'Erro interno no servidor' });
//       return res.redirect('/login?error=1');
//     }

//     if (!user) {
//       const msg = info?.message || 'Credenciais inválidas';
//       console.warn('[LOGIN FAIL]', msg);
//       if (isApi) return res.status(401).json({ status: 'error', error: msg });
//       return res.redirect('/login?error=1');
//     }

//     try {
//       // Gera o token corretamente
//       const token = generateToken({
//   user: {
//     _id: user._id,
//     email: user.email,
//     role: user.role,
//     cartId: user.cartId
//   }
// });
//       // ✅ Corrigido: token com estrutura correta para o passport.js
//       if (!token) {
//         if (isApi) return res.status(500).json({ status: 'error', error: 'Erro ao gerar token' });
//         return res.redirect('/login?error=2');
//       }

//       // Define o cookie JWT com flags de segurança
//       setAuthCookie(res, token);

//       // Mantém sessão para HTML
//       if (!isApi) {
//         // Sessão do usuário
//         req.session.user = {
//           _id: user._id,
//           first_name: user.first_name,
//           email: user.email,
//           role: user.role,
//         };

//         // Cria ou obtém carrinho e salva na sessão
//         const cart = await CartModel.findOne({ user: user._id })
//           || await CartModel.create({ user: user._id, products: [] });
//         req.session.cartId = cart._id;

//         return res.redirect('/products');
//       }

//       return res.sendSuccess('Login bem-sucedido');
//     } catch (tokenErr) {
//       console.error('[TOKEN ERROR]', tokenErr);
//       if (isApi) return res.status(500).json({ status: 'error', error: 'Erro ao gerar token' });
//       return res.redirect('/login?error=2');
//     }
//   })(req, res, next);
// }

// // ----------------------
// // Registro via Formulário
// // ----------------------
// router.post(
//   '/register/form',
//   passport.authenticate('register', {
//     failureRedirect: '/register?error=1',
//     session: false
//   }),
//   (req, res) => res.redirect('/login')
// );

// // ----------------------
// // Login via Formulário
// // ----------------------
// router.post('/login/form', (req, res, next) => {
//   handleLogin(req, res, next, false);
// });

// // ----------------------
// // Registro via API (Postman/SPA)
// // ----------------------
// router.post(
//   '/register',
//   passport.authenticate('register', { session: false }),
//   (req, res) => {
//     try {
//       res.sendSuccess('Usuário registrado com sucesso', {
//         user: {
//           id: req.user._id,
//           first_name: req.user.first_name,
//           last_name: req.user.last_name,
//           email: req.user.email
//         }
//       });
//     } catch (e) {
//       console.error('[REGISTER API ERROR]', e);
//       res.status(500).json({ status: 'error', error: 'Erro interno no servidor' });
//     }
//   }
// );

// // ----------------------
// // Login via API (Postman/SPA)
// // ----------------------
// router.post('/login', (req, res, next) => {
//   handleLogin(req, res, next, true);
// });

// // ----------------------
// // Rota /current
// // ----------------------
// router.get(
//   '/current',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     try {
//       const { _id, first_name, last_name, email, role } = req.user;
//       res.sendSuccess('Usuário autenticado', {
//         user: { _id, first_name, last_name, email, role }
//       });
//     } catch (e) {
//       console.error('[CURRENT USER ERROR]', e);
//       res.status(500).json({ status: 'error', error: 'Erro ao recuperar dados do usuário' });
//     }
//   }
// );

// // ----------------------
// // Logout
// // ----------------------
// router.get('/logout', (req, res) => {
//   try {
//     // Limpa cookie JWT com flags de segurança
//     res.clearCookie('jwtCookieToken', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'Strict'
//     });

//     // Resposta dinâmica para HTML vs API
//     if (req.accepts('html')) {
//       req.logout(() => res.redirect('/login'));
//     } else {
//       res.sendSuccess('Logout realizado com sucesso');
//     }
//   } catch (e) {
//     console.error('[LOGOUT ERROR]', e);
//     res.status(500).json({ status: 'error', error: 'Erro durante logout' });
//   }
// });

// export default router;