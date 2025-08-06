// Arquivo: src/api/routes/logs.routes.js

const { Router } = require('express');
const db = require('../../config/database');
const router = Router();

router.get('/logs', async (req, res) => {
  try {
    // Pega os parâmetros da query da URL, com valores padrão.
    const { nivel, busca, limit = 100 } = req.query;

    // Constrói a query SQL dinamicamente
    let baseQuery = `
    SELECT 
        ls.*, 
        u.nome AS nome_autor 
    FROM logs_sistema ls 
    LEFT JOIN usuarios u ON ls.usuario_id = u.id`;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (nivel) {
      conditions.push(`nivel = $${paramIndex}`);
      values.push(nivel);
      paramIndex++;
    }

    if (busca) {
      // Usamos ILIKE para busca case-insensitive e '%' como wildcard
      conditions.push(`mensagem ILIKE $${paramIndex}`);
      values.push(`%${busca}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
    values.push(limit);

    // Executa a query construída
    const { rows } = await db.query(baseQuery, values);
    res.status(200).json(rows);

  } catch (error) {
    console.error("Erro ao buscar logs com filtros:", error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

module.exports = router;