// config/passportConfig.js
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração manual do dotenv para garantir acesso às variáveis
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../.env') });


// Importações principais
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import UserModel from '../dao/models/user.model.js';

// Recupera credenciais do GitHub do .env
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// ====== Configuração de Serialização ======
passport.serializeUser((user, done) => {
  done(null, user._id); // Armazena apenas o ID na sessão
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id); // Recupera usuário completo do banco
  done(null, user);
});

// ====== Estratégia GitHub ======
passport.use(new GitHubStrategy({
    // Configurações OAuth
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback" // URL de desenvolvimento
  },
  // Callback de autenticação
  async (accessToken, refreshToken, profile, done) => {
    try {
    
      // Busca usuário existente
      let user = await UserModel.findOne({ githubId: profile.id });

      // Cria novo usuário se não existir
      if (!user) {
        user = await UserModel.create({
          githubId: profile.id, // ID único do GitHub
          first_name: profile.displayName || profile.username,
          last_name: '', // Campo não disponível no GitHub
          email: profile.emails?.[0]?.value || '', // Email primário
          password: '', // Não necessário para autenticação social
          avatar: profile.photos?.[0]?.value || '', // Avatar do perfil
          role: 'user' // Role padrão
        });
      }

      return done(null, user); // Finaliza com sucesso
    } catch (err) {
      console.error('Erro no callback GitHub:', err);
      return done(err); // Propagação de erros
    }
  }
));