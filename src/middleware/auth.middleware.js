// Arquivo: src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.sendStatus(401); // Não autorizado (sem token)
  }

  // ATENÇÃO: Use a mesma chave secreta que você usou no login!
  jwt.verify(token, 'SEGREDO_MUITO_SEGURO', (err, usuarioDecodificado) => {
    if (err) {
      return res.sendStatus(403); // Proibido (token inválido)
    }
    
    // Se o token for válido, anexamos os dados do usuário à requisição
    req.usuario = usuarioDecodificado;
    
    // Passa para a próxima etapa (o controller da rota)
    next();
  });
};

module.exports = verificarToken;