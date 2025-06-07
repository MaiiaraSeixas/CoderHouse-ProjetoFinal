// utils/cookieExtractor.js
export const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies && req.cookies.jwtCookieToken) {
    token = req.cookies.jwtCookieToken; // nome do cookie
  }
  return token;
};

// Essa função extrai o cookie JWT do objeto de requisição, permitindo que seja usado para autenticação ou autorização em outras partes da aplicação.