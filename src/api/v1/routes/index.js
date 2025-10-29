// src/api/v1/routes/index.js
import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

/**
 * Rotas da API v1
 * Base: /v1
 */ // Rotas de usuários
router.use('/users', userRoutes);

// Rota de health check específica da v1
router.get('/health', (req, res) => {
  res.json({
    version: 'v1',
    status: 'OK',
    message: 'API v1 do Gerador de Provas',
  });
});

export default router;
