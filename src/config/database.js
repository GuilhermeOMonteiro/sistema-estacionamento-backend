// Arquivo: src/config/database.js

// Importa a biblioteca dotenv para carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa a classe Pool do pacote pg
const { Pool } = require('pg');

// Cria uma nova instância do Pool com as configurações de conexão
// que foram carregadas do arquivo .env
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Apenas um log para confirmar que o pool foi configurado (opcional, bom para debug)
console.log('Pool de conexões com o PostgreSQL configurado.');

// Exportamos um objeto com um método 'query'.
// Desta forma, qualquer parte da nossa aplicação que precisar
// interagir com o banco de dados pode simplesmente importar este módulo
// e chamar a função 'query', passando o comando SQL e os parâmetros.
module.exports = {
  query: (text, params) => pool.query(text, params),
};