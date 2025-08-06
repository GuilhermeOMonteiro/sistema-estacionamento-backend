// Arquivo: src/services/logger.service.js
const db = require('../config/database');

const registrarLog = (nivel, origem, mensagem, usuarioId = null) => {
  // Usamos console.log para também vermos o log no terminal do servidor.
  console.log(`[${nivel}] ${origem}: ${mensagem}`);
  
  const query = 'INSERT INTO logs_sistema(nivel, origem, mensagem, usuario_id) VALUES($1, $2, $3, $4)';
  
  // Executamos a query de log em "segundo plano" (fire and forget).
  // Não precisamos esperar (await) por ela, para não atrasar a resposta ao usuário.
  db.query(query, [nivel, origem, mensagem, usuarioId]).catch(err => {
    // Se o próprio log falhar, apenas mostramos no console.
    console.error("ERRO CRÍTICO: Falha ao registrar log no banco de dados.", err);
  });
};

module.exports = registrarLog;