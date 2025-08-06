// Arquivo: src/controllers/mensalista.controller.js
const db = require('../config/database');

// GET /api/mensalistas - Listar todos
const listarMensalistas = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM clientes_mensalistas ORDER BY nome_completo');
    res.status(200).json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// POST /api/mensalistas - Adicionar novo
const adicionarMensalista = async (req, res) => {
  try {
    const { nome_completo, cpf, placa_principal, telefone, email, dia_vencimento, valor_mensalidade } = req.body;
    const query = `
      INSERT INTO clientes_mensalistas (nome_completo, cpf, placa_principal, telefone, email, dia_vencimento, valor_mensalidade)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const { rows } = await db.query(query, [nome_completo, cpf, placa_principal.toUpperCase(), telefone, email, dia_vencimento, valor_mensalidade]);
    res.status(201).json({ message: "Mensalista adicionado com sucesso!", mensalista: rows[0] });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// PUT /api/mensalistas/:id - Atualizar
const atualizarMensalista = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_completo, cpf, placa_principal, telefone, email, dia_vencimento, valor_mensalidade, status_pagamento, ativo } = req.body;
        const query = `
          UPDATE clientes_mensalistas
          SET nome_completo = $1, cpf = $2, placa_principal = $3, telefone = $4, email = $5, dia_vencimento = $6, valor_mensalidade = $7, status_pagamento = $8, ativo = $9
          WHERE id = $10 RETURNING *
        `;
        const { rows } = await db.query(query, [nome_completo, cpf, placa_principal.toUpperCase(), telefone, email, dia_vencimento, valor_mensalidade, status_pagamento, ativo, id]);
        res.status(200).json({ message: "Mensalista atualizado com sucesso!", mensalista: rows[0] });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { listarMensalistas, adicionarMensalista, atualizarMensalista };