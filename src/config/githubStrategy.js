// Importações básicas do Passport e da estratégia GitHub
import passport from 'passport';
import GitHubStrategy from 'passport-github2';

// Model de usuário
import UserModel from '../dao/models/user.model.js';

// JWT para gerar token de autenticação
import jwt from 'jsonwebtoken';

// Configurações de ambiente centralizadas (clientID, secret, etc)
import config from './config.js';

/**
 * Configura a estratégia GitHub para o Passport
 * - Verifica se o usuário existe
 * - Se não, cria um novo usuário com base nos dados do GitHub
 * - Gera um JWT com os dados no formato esperado pelo passport.js
 */
passport.use('github',
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: config.githubCallbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({ email: profile._json.email });

        if (!user) {
          user = await UserModel.create({
            first_name: profile._json.name || profile.username,
            last_name: '',
            email: profile._json.email,
            password: '',
            age: 0,
            role: 'user'
          });
        }

        // ✅ Corrigido: estrutura correta para o JWT funcionar com o passport.js
        const token = jwt.sign(
          {
            user: {
              _id: user._id,
              role: user.role,
              email: user.email
            }
          },
          config.jwtSecret,
          { expiresIn: '1h' }
        );

        return done(null, { user, token });

      } catch (error) {
        return done(error);
      }
    }
  )
);
