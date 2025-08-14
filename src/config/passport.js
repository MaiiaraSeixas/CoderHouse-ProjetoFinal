import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

// Serviços e utilitários necessários
import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import { cookieExtractor } from '../utils/cookieExtractor.js';
import config from './config.js';

/**
 * Configura todas as estratégias de autenticação do Passport
 */
export function initializePassport() {
  // =====================================================================
  // ESTRATÉGIA DE REGISTRO LOCAL (email/senha)
  // =====================================================================
  passport.use('register', new LocalStrategy(
    {
      usernameField: 'email',       // Campo usado como identificador
      passReqToCallback: true       // Permite acesso ao objeto req completo
    },
    async (req, email, password, done) => {
      try {
        // Tenta registrar o usuário com dados da requisição
        const user = await authService.register({ ...req.body, password });

        // Registro bem-sucedido: passa usuário para próximo middleware
        return done(null, user);
      } catch (err) {
        // Falha no registro: passa mensagem de erro
        return done(null, false, { message: err.message });
      }
    }
  ));

  // =====================================================================
  // ESTRATÉGIA DE LOGIN LOCAL (email/senha)
  // =====================================================================
  passport.use('login', new LocalStrategy(
    { usernameField: 'email' },     // Identificador é o email
    async (email, password, done) => {
      try {
        // Valida credenciais com serviço de autenticação
        const user = await authService.login(email, password);

        // Login válido: passa objeto do usuário
        return done(null, user);
      } catch (err) {
        // Credenciais inválidas: retorna erro
        return done(null, false, { message: err.message });
      }
    }
  ));

  // =====================================================================
  // ESTRATÉGIA DE AUTENTICAÇÃO COM GITHUB (OAuth)
  // =====================================================================
  passport.use('github', new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,         // Credenciais da app GitHub
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: config.GITHUB_CALLBACK_URL    // URL de retorno
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tenta obter email do perfil GitHub ou cria um placeholder
        const email = profile._json.email || `${profile.username}@github.com`;

        // Verifica se usuário já existe
        let user = await userService.getUserByEmail(email);

        // Cria novo usuário se não existir
        if (!user) {
          user = await userService.createUser({
            first_name: profile.displayName || profile.username,
            last_name: '',
            email: email,
            password: '',               // Sem senha (autenticação social)
            githubId: profile.id,       // Salva ID do GitHub
            role: 'user'                // Papel padrão
          });
        }

        // Autenticação bem-sucedida
        return done(null, user);
      } catch (err) {
        // Tratamento de erros no fluxo OAuth
        return done(err);
      }
    }
  ));

  // =====================================================================
  // ESTRATÉGIA JWT (PARA ROTAS PROTEGIDAS)
  // =====================================================================
  passport.use('jwt', new JWTStrategy(
    {
      // Extrai token JWT de cookies
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.SECRET_KEY     // Chave para verificar assinatura
    },
    async (jwtPayload, done) => {
      try {
        // Payload já contém dados do usuário decodificados
        return done(null, jwtPayload.user);
      } catch (err) {
        // Token inválido ou expirado
        return done(err);
      }
    }
  ));

  // =====================================================================
  // SERIALIZAÇÃO/DESSERIALIZAÇÃO (PARA SESSÕES)
  // =====================================================================

  // Salva apenas ID do usuário na sessão
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Recupera usuário completo do banco usando ID da sessão
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}