import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import { cookieExtractor } from '../utils/cookieExtractor.js';
import config from './config.js';

export function initializePassport() {
  const authService = new AuthService();
  const userService = new UserService();

  // Estratégia de Registro Local (email/senha)
  passport.use('register', new LocalStrategy(
    {
      usernameField: 'email',   // Campo usado como identificador
      passReqToCallback: true   // Permite acesso ao objeto 'req'
    },
    async (req, email, password, done) => {
      try {
        // Cria novo usuário usando dados do corpo da requisição
        const user = await authService.register({ ...req.body, password });
        return done(null, user);  // Sucesso: retorna usuário criado
      } catch (err) {
        // Falha: retorna mensagem de erro
        return done(null, false, { message: err.message });
      }
    }
  ));

  // Estratégia de Login Local
  passport.use('login', new LocalStrategy(
    { usernameField: 'email' },  // Usa email como identificador
    async (email, password, done) => {
      try {
        // Autentica usuário com email e senha
        const user = await authService.login(email, password);
        return done(null, user);  // Sucesso
      } catch (err) {
        // Falha na autenticação
        return done(null, false, { message: err.message });
      }
    }
  ));

  // Estratégia de Autenticação com GitHub (OAuth)
  passport.use('github', new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID,          // ID do app GitHub
      clientSecret: config.GITHUB_CLIENT_SECRET,  // Chave secreta
      callbackURL: config.GITHUB_CALLBACK_URL     // URL de retorno
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Obtém email do perfil ou gera um padrão
        const email = profile._json.email || `${profile.username}@github.com`;

        // Verifica se usuário já existe
        let user = await userService.getUserByEmail(email);

        if (!user) {
          // Cria novo usuário para contas GitHub
          user = await userService.createUser({
            first_name: profile.displayName || profile.username,
            last_name: '',  // GitHub não fornece sobrenome
            email: email,
            password: '',    // Sem senha (autenticação social)
            githubId: profile.id,  // ID único do GitHub
            role: 'user'    // Papel padrão
          });
        }
        return done(null, user);  // Retorna usuário existente/novo
      } catch (err) {
        return done(err);  // Erro no processo
      }
    }
  ));

  // Estratégia JWT para autenticação stateless
  passport.use('jwt', new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),  // Extrai JWT dos cookies
      secretOrKey: config.SECRET_KEY  // Chave para verificar assinatura
    },
    async (jwtPayload, done) => {
      try {
        // Payload JWT já contém dados do usuário (sem necessidade de DB)
        return done(null, jwtPayload);  // Autenticação válida
      } catch (err) {
        return done(err);  // Token inválido/expirado
      }
    }
  ));

  // Serialização: armazena apenas ID do usuário na sessão
  passport.serializeUser((user, done) => {
    done(null, user._id);  // Salva ID na sessão
  });

  // Desserialização: busca usuário completo pelo ID da sessão
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserById(id);
      done(null, user);  // Adiciona usuário ao req.user
    } catch (err) {
      done(err);  // Erro na busca
    }
  });
}