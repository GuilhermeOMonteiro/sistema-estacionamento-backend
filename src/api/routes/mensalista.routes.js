// Arquivo: src/api/routes/mensalista.routes.js
const { Router } = require('express');
const router = Router();
const mensalistaController = require('../../controllers/mensalista.controller.js');
const verificarToken = require('../../middleware/auth.middleware');

// Todas as rotas de mensalistas são protegidas e só podem ser acessadas por usuários logados
router.get('/mensalistas', verificarToken, mensalistaController.listarMensalistas);
router.post('/mensalistas', verificarToken, mensalistaController.adicionarMensalista);
router.put('/mensalistas/:id', verificarToken, mensalistaController.atualizarMensalista);

module.exports = router;