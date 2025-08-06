// Arquivo: src/controllers/financeiro.controller.js
const db = require('../config/database');

const getRelatorioDiario = async (req, res) => {
  try {
    const query = `
      SELECT
  COUNT(*) AS total_veiculos,
  SUM(valor_total) AS faturamento_total,
  AVG(CASE WHEN valor_total > 0 THEN valor_total ELSE NULL END) AS ticket_medio --  ignora carros com valor_total 0 para cálculo do ticket_medio
FROM registros_estacionamento
WHERE
  status = 'Finalizado'
  AND horario_saida >= CURRENT_DATE
  AND horario_saida < CURRENT_DATE + INTERVAL '1 day'
  AND (valor_total > 0 OR (horario_saida - horario_entrada) > INTERVAL '5 minutes') -- Garante que só contabilize os que pagaram (valor_total > 0) ou que ficaram mais tempo ( > 5 minutos )
  `;
    const { rows } = await db.query(query);
    res.status(200).json(rows[0] || { total_veiculos: '0', faturamento_total: '0', ticket_medio: '0' });

  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const getRelatorioGeral = async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_veiculos,
        SUM(valor_total) AS faturamento_total,
        AVG(CASE WHEN valor_total > 0 THEN valor_total ELSE NULL END) AS ticket_medio
      FROM registros_estacionamento
      WHERE
        status = 'Finalizado'
        AND valor_total > 0;
    `;
    const { rows } = await db.query(query);
    // Retorna o resultado ou um objeto zerado se não houver dados
    res.status(200).json(rows[0] || { total_veiculos: '0', faturamento_total: '0', ticket_medio: '0' });

  } catch (error) {
    console.error('Erro ao gerar relatório geral:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  getRelatorioDiario,
  getRelatorioGeral
};