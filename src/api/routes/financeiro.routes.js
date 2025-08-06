// Arquivo: src/api/routes/financeiro.routes.js
const { Router } = require('express');
const router = Router();
const financeiroController = require('../../controllers/financeiro.controller.js');

// Rota para o dashboard financeiro
router.get('/financeiro/relatorio-diario', financeiroController.getRelatorioDiario);

router.get('/financeiro/relatorio-geral', financeiroController.getRelatorioGeral);

module.exports = router;