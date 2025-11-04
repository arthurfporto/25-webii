// src/api/v2/routes/index.js
import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

/**
 * Rotas da API v2
 * Base: /v2
 *
 * MUDANÇAS DA V2:
 * - Estrutura de nomes separada (primeiro_nome, sobrenome)
 * - Enums lowercase (professor, admin)
 * - Novos campos (telefone)
 */

// Rotas de usuários
router.use('/users', userRoutes);

// Rota de health check específica da v2
router.get('/health', (req, res) => {
  res.json({
    version: 'v2',
    status: 'OK',
    message: 'API v2 do Gerador de Provas',
    changes: [
      'Primeiro_nome e sobrenome separados',
      'Tipo_usuario ao invés de papel',
      'Valores lowercase (professor, admin)',
      'Campo telefone adicionado',
    ],
  });
});

export default router;
