// Arquivo: src/app.js (VERSÃO FINAL E LIMPA)

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// --- 1. Bloco de Importação das Rotas (Sem Duplicatas) ---
const registroRoutes = require('./api/routes/registros.routes.js');
const financeiroRoutes = require('./api/routes/financeiro.routes.js');
const authRoutes = require('./api/routes/auth.routes.js');
const logsRoutes = require('./api/routes/logs.routes.js');
const mensalistaRoutes = require('./api/routes/mensalista.routes.js');
const operacionalRoutes = require('./api/routes/operacional.routes.js');


// --- Inicialização do App ---
const app = express();


// --- Middlewares Globais ---
app.use(cors());
app.use(express.json());


// --- 2. Bloco de Definição das Rotas ---
app.get('/', (req, res) => {
  res.status(200).send('<h1>API do Sistema de Estacionamento está ativa!</h1>');
});

// Usando todas as rotas com o prefixo /api
app.use('/api', registroRoutes);
app.use('/api', financeiroRoutes);
app.use('/api', authRoutes);
app.use('/api', logsRoutes);
app.use('/api', mensalistaRoutes);
app.use('/api', operacionalRoutes);


// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor Express iniciado e escutando na porta ${PORT}.`);
});