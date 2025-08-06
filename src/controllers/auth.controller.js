// Arquivo: src/controllers/auth.controller.js

const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { login, senha } = req.body;

  // Validação básica
  if (!login || !senha) {
    return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
  }

  try {
    // 1. Busca o usuário pelo login
    const userResult = await db.query('SELECT * FROM usuarios WHERE login = $1', [login]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' }); // Erro genérico por segurança
    }

    const usuario = userResult.rows[0];

    // 2. Compara a senha enviada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 3. Se a senha é válida, cria o Token JWT
    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      nivel_acesso: usuario.nivel_acesso
    };
    
    // ATENÇÃO: Troque 'SEGREDO_MUITO_SEGURO' por uma chave real em seu .env!
    const token = jwt.sign(payload, 'SEGREDO_MUITO_SEGURO', { expiresIn: '8h' });

    // 4. Retorna o token para o frontend
    res.status(200).json({ 
        message: 'Login bem-sucedido!',
        token: token,
        usuario: payload // Enviamos os dados do usuário para o frontend usar
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = { login };