import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import GitHubStrategy from 'passport-github2';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { createHash, isValidPassword } from '../utils/cryptography.js';
import { cookieExtractor } from '../utils/cookieExtractor.js';
import userService from '../services/user.service.js';
import config from './config.js';

dotenv.config();

const {
  jwtSecret,
  githubClientId,
  githubClientSecret,
  githubCallbackUrl
} = config;

export function initializePassport() {
  // 1) REGISTER
  passport.use('register', new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        if (await userService.getUserByEmail(email)) {
          return done(null, false, { message: 'Usuário já registrado' });
        }
        const hashed = createHash(password);
        const user = await userService.createUser({ ...req.body, password: hashed });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));

  // 2) LOGIN
  passport.use('login', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await userService.getUserByEmail(email);
        if (!user || !isValidPassword(password, user.password)) {
          return done(null, false, { message: 'Credenciais inválidas' });
        }

        // Recupera o usuário completo com cartId
        let fullUser = await userService.getUserById(user._id);

        if (!fullUser.cartId) {
          console.warn('[LOGIN DEBUG] Usuário sem cartId, criando carrinho...');
          const createdCart = await userService.createEmptyCartForUser(fullUser._id);
          fullUser.cartId = createdCart._id;
        }

        done(null, fullUser);
      } catch (err) {
        done(err);
      }
    }
  ));

  // 3) GITHUB
  passport.use('github', new GitHubStrategy(
    {
      clientID: githubClientId,
      clientSecret: githubClientSecret,
      callbackURL: githubCallbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json.email || `${profile.username}@github.com`;
        let user = await userService.getUserByEmail(email);
        if (!user) {
          user = await userService.createUser({
            first_name: profile.displayName || profile.username,
            last_name: '',
            email,
            password: '',
            githubId: profile.id
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));

  // 4) JWT
  passport.use('jwt', new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor
      ]),
      secretOrKey: jwtSecret
    },
    async (jwtPayload, done) => {
      try {
        const userId = jwtPayload._id || jwtPayload.user?._id;
        const user = await userService.getUserById(userId);
        if (!user) {
          return done(null, false, { message: 'Usuário não encontrado' });
        }
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  ));

  // SERIALIZE / DESERIALIZE
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}



















// import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';
// import GitHubStrategy from 'passport-github2';
// import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
// import dotenv from 'dotenv';
// import { createHash, isValidPassword } from '../utils/cryptography.js';
// import { cookieExtractor } from '../utils/cookieExtractor.js';
// import userService from '../services/user.service.js';
// import config from './config.js';

// dotenv.config();

// const {
//   jwtSecret,
//   githubClientId,
//   githubClientSecret,
//   githubCallbackUrl
// } = config;

// export function initializePassport() {
//   // 1) LOCAL REGISTER
//   passport.use('register', new LocalStrategy({
//     usernameField: 'email',
//     passReqToCallback: true
//   },
//     async (req, email, password, done) => {
//       try {
//         if (await userService.getUserByEmail(email)) {
//           return done(null, false, { message: 'Usuário já registrado' });
//         }
//         const hashed = createHash(password);
//         const user = await userService.createUser({ ...req.body, password: hashed });
//         done(null, user);
//       } catch (err) {
//         done(err);
//       }
//     }
//   ));

//   // 2) LOCAL LOGIN
//   passport.use('login', new LocalStrategy(
//     { usernameField: 'email' },
//     async (email, password, done) => {
//       try {
//         const user = await userService.getUserByEmail(email);
//         if (!user || !isValidPassword(password, user.password)) {
//           return done(null, false, { message: 'Credenciais inválidas' });
//         }

//         // ⚠️ Garante que o user retornado tenha o cartId
//         const fullUser = await userService.getUserById(user._id);
//         done(null, fullUser);
//       } catch (err) {
//         done(err);
//       }
//     }
//   ));

//   // 3) GITHUB OAUTH
//   passport.use('github', new GitHubStrategy({
//     clientID: githubClientId,
//     clientSecret: githubClientSecret,
//     callbackURL: githubCallbackUrl
//   },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile._json.email || `${profile.username}@github.com`;
//         let user = await userService.getUserByEmail(email);
//         if (!user) {
//           user = await userService.createUser({
//             first_name: profile.displayName || profile.username,
//             last_name: '',
//             email,
//             password: '',
//             githubId: profile.id
//           });
//         }
//         done(null, user);
//       } catch (err) {
//         done(err);
//       }
//     }
//   ));

//   // 4) JWT STRATEGY — agora com dois extractors
//   passport.use('jwt', new JWTStrategy({
//     jwtFromRequest: ExtractJwt.fromExtractors([
//       ExtractJwt.fromAuthHeaderAsBearerToken(), // <-- permite Authorization: Bearer
//       cookieExtractor                             // <-- permite jwtCookieToken
//     ]),
//     secretOrKey: jwtSecret
//   },
//     async (jwtPayload, done) => {
//       try {
//         // Suporte ao payload com estrutura: { user: { _id, email, role } }
//         const userId = jwtPayload.user?._id || jwtPayload._id;
//         const user = await userService.getUserById(userId);
//         if (!user) {
//           return done(null, false, { message: 'Usuário não encontrado' });
//         }
//         done(null, user);
//       } catch (err) {
//         done(err, false);
//       }
//     }
//   ));

//   // SERIALIZE / DESERIALIZE
//   passport.serializeUser((user, done) => done(null, user._id));

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await userService.getUserById(id);
//       done(null, user);
//     } catch (err) {
//       done(err);
//     }
//   });
// }
