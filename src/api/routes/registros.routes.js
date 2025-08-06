// Arquivo: src/api/routes/registros.routes.js

const { Router } = require('express');
const router = Router();
const registroController = require('../../controllers/registro.controller');
const verificarToken = require('../../middleware/auth.middleware');

// ===== APLIQUE O MIDDLEWARE AQUI =====
router.post('/entrada', verificarToken, registroController.handleEntrada);
router.post('/saida/:placa/pagar', verificarToken, registroController.registrarPagamento);
router.post('/saida/:placa/finalizar-manual', verificarToken, registroController.finalizarManualmente);

// Rotas de consulta podem permanecer públicas, pois não modificam dados nem geram logs de autor.
router.get('/patio', registroController.listarVeiculosNoPatio);
router.get('/saida/:placa', registroController.consultarValor);
router.get('/saida/:placa/validar', registroController.validarSaida);

module.exports = router;