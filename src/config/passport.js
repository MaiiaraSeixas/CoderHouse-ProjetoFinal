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
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: config.githubCallbackUrl
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
      secretOrKey: config.jwtSecret
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





// import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';
// import { Strategy as GitHubStrategy } from 'passport-github2';
// import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

// // Corrigido para caminhos relativos corretos
// import { createHash, isValidPassword } from '../utils/cryptography.js';
// import { cookieExtractor } from '../utils/cookieExtractor.js';
// import userService from '../services/user.service.js';
// import config from './config.js';

// export function initializePassport() {

//   // Estratégia de Registro Local
//   passport.use('register', new LocalStrategy(
//     { usernameField: 'email', passReqToCallback: true },
//     async (req, email, password, done) => {
//       try {
//         if (await userService.getUserByEmail(email)) {
//           return done(null, false, { message: 'Usuário já registrado' });
//         }
//         const hashed = createHash(password);
//         const user = await userService.createUser({ ...req.body, password: hashed });
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   ));

//   // Estratégia de Login Local
//   passport.use('login', new LocalStrategy(
//     { usernameField: 'email' },
//     async (email, password, done) => {
//       try {
//         const user = await userService.getUserByEmail(email);
//         if (!user || !isValidPassword(password, user.password)) {
//           return done(null, false, { message: 'Credenciais inválidas' });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   ));

//   // --- ESTRATÉGIA GITHUB CORRIGIDA ---
//   // A responsabilidade dela é apenas encontrar ou criar o usuário.
//   passport.use('github', new GitHubStrategy(
//     {
//       clientID: config.githubClientId,
//       clientSecret: config.githubClientSecret,
//       callbackURL: config.githubCallbackUrl
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile._json.email || `${profile.username}@github.com`;
//         let user = await userService.getUserByEmail(email);

//         if (!user) {
//           console.log("Usuário não encontrado. Criando novo usuário do GitHub...");
//           user = await userService.createUser({
//             first_name: profile.displayName || profile.username,
//             last_name: '',
//             email: email,
//             password: '', // A senha não é necessária para autenticação OAuth
//             githubId: profile.id,
//             role: 'user'
//           });
//         }
//         // A estratégia passa o objeto 'user' para a próxima etapa (a rota de callback).
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   ));

//   // Estratégia JWT
//   passport.use('jwt', new JWTStrategy(
//     {
//       jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
//       secretOrKey: config.jwtSecret
//     },
//     async (jwtPayload, done) => {
//       try {
//         // Acessa o usuário dentro do payload do token
//         const user = jwtPayload.user;
//         if (!user) {
//           return done(null, false, { message: 'Usuário não encontrado no token' });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, false);
//       }
//     }
//   ));

//   // Serialização (usado para sessões tradicionais, pode ser mantido por compatibilidade)
//   passport.serializeUser((user, done) => {
//     done(null, user._id);
//   });

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await userService.getUserById(id);
//       done(null, user);
//     } catch (err) {
//       done(err);
//     }
//   });
// }








//import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';
// import { Strategy as GitHubStrategy } from 'passport-github2';
// import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
// import dotenv from 'dotenv';

// // CAMINHOS CORRIGIDOS: A partir da raiz 'config', entra em 'src'
// import { createHash, isValidPassword } from '../utils/cryptography.js';
// import { cookieExtractor } from '../utils/cookieExtractor.js';
// import userService from '../services/user.service.js';
// // CAMINHO CORRIGIDO: O arquivo de config está na mesma pasta
// import config from './config.js';
// import { generateToken } from '../utils/jwt.js'; // <-- ADICIONE ESTA LINHA


// dotenv.config();

// const {
//   jwtSecret,
//   githubClientId,
//   githubClientSecret,
//   githubCallbackUrl
// } = config;

// export function initializePassport() {
//   // 1) REGISTER
//   passport.use('register', new LocalStrategy(
//     {
//       usernameField: 'email',
//       passReqToCallback: true
//     },
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

//   // 2) LOGIN
//   passport.use('login', new LocalStrategy(
//     { usernameField: 'email' },
//     async (email, password, done) => {
//       try {
//         const user = await userService.getUserByEmail(email);
//         if (!user || !isValidPassword(password, user.password)) {
//           return done(null, false, { message: 'Credenciais inválidas' });
//         }

//         // Recupera o usuário completo com cartId
//         let fullUser = await userService.getUserById(user._id);

//         if (!fullUser.cartId) {
//           console.warn('[LOGIN DEBUG] Usuário sem cartId, criando carrinho...');
//           const createdCart = await userService.createEmptyCartForUser(fullUser._id);
//           fullUser.cartId = createdCart._id;
//         }

//         done(null, fullUser);
//       } catch (err) {
//         done(err);
//       }
//     }
//   ));

// console.log('[DEBUG GITHUB] Callback URL sendo usada:', githubCallbackUrl);



// // 3) GITHUB (Versão Corrigida com Geração de Token)
// passport.use('github', new GitHubStrategy(
//   {
//     clientID: githubClientId,
//     clientSecret: githubClientSecret,
//     callbackURL: githubCallbackUrl
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Procura pelo e-mail do perfil do GitHub
//       const email = profile._json.email || `${profile.username}@github.com`;
//       let user = await userService.getUserByEmail(email);

//       // Se o usuário não existir, cria um novo
//       if (!user) {
//         user = await userService.createUser({
//           first_name: profile.displayName || profile.username,
//           last_name: '',
//           email,
//           password: '', // Senha fica vazia
//           githubId: profile.id
//         });
//       }

//       // ---- CORREÇÃO PRINCIPAL: GERAR O TOKEN JWT ----
//       const token = generateToken({ user }); // Gera o token para o usuário

//       // Passa o usuário e o token para a próxima etapa
//       return done(null, { user, token });

//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

//   // 4) JWT
//   passport.use('jwt', new JWTStrategy(
//     {
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         ExtractJwt.fromAuthHeaderAsBearerToken(),
//         cookieExtractor
//       ]),
//       secretOrKey: jwtSecret
//     },
//     async (jwtPayload, done) => {
//       try {
//         const userId = jwtPayload._id || jwtPayload.user?._id;
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


