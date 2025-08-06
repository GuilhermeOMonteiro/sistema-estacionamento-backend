// Arquivo: src/api/routes/operacional.routes.js (NO BACKEND)
const { Router } = require('express');
const router = Router();
const operacionalController = require('../../controllers/operacional.controller.js');
const verificarToken = require('../../middleware/auth.middleware');

// AS DUAS ÚNICAS ROTAS OPERACIONAIS QUE DEVEM EXISTIR
router.get('/operacional/metricas', verificarToken, operacionalController.getMetricasOperacionais);
router.get('/operacional/dados-graficos', verificarToken, operacionalController.getDadosParaGraficos);

module.exports = router;