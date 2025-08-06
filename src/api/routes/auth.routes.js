// Arquivo: src/api/routes/auth.routes.js
const { Router } = require('express');
const router = Router();
const authController = require('../../controllers/auth.controller');

router.post('/auth/login', authController.login);

module.exports = router;