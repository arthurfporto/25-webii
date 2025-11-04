import express from 'express';
import prisma from './config/database.js';
import v1Routes from './api/v1/routes/index.js';
import v2Routes from './api/v2/routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rota de health check geral
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
    availableVersions: ['v1', 'v2'],
    versions: {
      v1: {
        status: 'active',
        endpoint: '/v1',
        deprecated: false,
      },
      v2: {
        status: 'active',
        endpoint: '/v2',
        deprecated: false,
        changes: [
          'primeiro_nome e sobrenome separados',
          'tipo_usuario (lowercase)',
          'Campo telefone adicionado',
        ],
      },
    },
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

// Rotas da API v2
app.use('/v2', v2Routes);

// Middleware de 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
      hint: 'Versões disponíveis da API: /v1, /v2',
      availableVersions: [
        { version: 'v1', endpoint: '/v1' },
        { version: 'v2', endpoint: '/v2' },
      ],
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// Middleware de erro (deve ser o último!)
app.use(errorHandler);

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 API v1: http://localhost:${PORT}/v1`);
  console.log(`📦 API v2 (NEW!): http://localhost:${PORT}/v2`);
  console.log(`👥 Usuários v1: http://localhost:${PORT}/v1/users`);
  console.log(`👥 Usuários v2: http://localhost:${PORT}/v2/users`);
});

export default app;
