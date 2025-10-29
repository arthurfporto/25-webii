// src/server.js
import express from 'express';
import prisma from './config/database.js';
import v1Routes from './api/v1/routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rota de health check
app.get('/health', async (req, res) => {
  let databaseStatus = 'OK';
  let databaseMessage = 'Conexão com banco de dados funcionando';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = 'ERROR';
    databaseMessage = 'Falha na conexão com banco de dados';
    console.error('Erro na verificação do banco:', error);
  }

  const httpStatus = databaseStatus === 'OK' ? 200 : 503;

  res.status(httpStatus).json({
    status: databaseStatus === 'OK' ? 'OK' : 'DEGRADED',
    message: 'API do Gerador de Provas',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    availableVersions: ['v1'],
    services: {
      api: 'OK',
      database: {
        status: databaseStatus,
        message: databaseMessage,
      },
    },
  });
});

// Rotas da API v1
app.use('/v1', v1Routes);

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    },
    hint: 'Versões disponíveis: /v1', // <- Novo
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// IMPORTANTE: Middleware de erro deve ser o ÚLTIMO!
app.use(errorHandler);

// Inicializar servidor
app.listen(PORT, () => {
  // <-- Novo
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 API v1: http://localhost:${PORT}/v1`);
  console.log(`👥 Usuários v1: http://localhost:${PORT}/v1/users`);
});

export default app;
