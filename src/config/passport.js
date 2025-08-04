import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import { createHash, isValidPassword } from '../utils/cryptography.js';
import { cookieExtractor } from '../utils/cookieExtractor.js';
import userService from '../services/user.service.js';
import config from './config.js';
import { generateToken } from '../utils/jwt.js';

export function initializePassport() {

  // Estratégia de Registro Local (já corrigida pelo novo createUser)
  passport.use('register', new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        if (await userService.getUserByEmail(email)) {
          return done(null, false, { message: 'Usuário já registrado' });
        }
        const hashed = createHash(password);
        const user = await userService.createUser({ ...req.body, password: hashed });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // --- ESTRATÉGIA DE LOGIN LOCAL CORRIGIDA ---
  passport.use('login', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        let user = await userService.getUserByEmail(email);
        if (!user || !isValidPassword(password, user.password)) {
          return done(null, false, { message: 'Credenciais inválidas' });
        }
        // Garante que o usuário tenha um carrinho. Se não tiver, cria um.
        if (!user.cartId) {
          console.log(`Usuário ${user.email} sem carrinho. Criando um novo...`);
          const newCartId = await userService.ensureCartForUser(user._id);
          user.cartId = newCartId;
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // --- ESTRATÉGIA GITHUB CORRIGIDA ---
  passport.use('github', new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: config.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json.email || `${profile.username}@github.com`;
        let user = await userService.getUserByEmail(email);

        if (!user) {
          // O novo createUser já associa um carrinho automaticamente.
          user = await userService.createUser({
            first_name: profile.displayName || profile.username,
            last_name: '',
            email: email,
            password: '',
            githubId: profile.id,
            role: 'user'
          });
        } else if (!user.cartId) {
          // Se o usuário já existia mas não tinha carrinho, cria um.
          console.log(`Usuário do GitHub ${user.email} sem carrinho. Criando um novo...`);
          const newCartId = await userService.ensureCartForUser(user._id);
          user.cartId = newCartId;
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Estratégia JWT
  passport.use('jwt', new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.SECRET_KEY
    },
    async (jwtPayload, done) => {
      try {
        const user = jwtPayload.user;
        if (!user) {
          return done(null, false, { message: 'Usuário não encontrado no token' });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  ));

  // Serialização / Deserialização
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}


