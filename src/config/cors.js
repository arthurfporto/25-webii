// src/config/cors.js
import cors from 'cors';

/**
 * Configuração de CORS (Cross-Origin Resource Sharing)
 *
 * CORS é um mecanismo que permite que recursos de uma API sejam
 * acessados por páginas de domínios diferentes.
 *
 * Documentação: https://github.com/expressjs/cors
 */

// Lista de origens permitidas
// Em produção, adicione apenas os domínios do seu frontend
const allowedOrigins = [
  'http://localhost:3000',       // Desenvolvimento local
  'http://localhost:5173',       // Vite dev server (comum em React)
  'http://localhost:8080',       // Outro servidor de dev comum
  'http://127.0.0.1:3000',       // Alternativa localhost
  'http://127.0.0.1:5173',
];

// Adicionar origens de produção se definidas nas variáveis de ambiente
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

if (process.env.ADMIN_URL) {
  allowedOrigins.push(process.env.ADMIN_URL);
}

/**
 * Função de validação de origem
 * Permite requisições de origens na lista ou requisições sem origem
 * (como requisições de ferramentas como Postman/Bruno)
 */
const originValidator = (origin, callback) => {
  // Permitir requisições sem origem (Postman, Bruno, curl, etc.)
  if (!origin) {
    return callback(null, true);
  }

  // Verificar se origem está na lista de permitidas
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Em desenvolvimento, permitir qualquer localhost
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    console.log('⚠️  CORS: Permitindo origem de desenvolvimento:', origin);
    return callback(null, true);
  }

  // Origem não permitida
  console.log('❌ CORS: Origem bloqueada:', origin);
  return callback(new Error(`Origem ${origin} não permitida pelo CORS`), false);
};

/**
 * Configuração do middleware CORS
 */
const corsConfig = cors({
  // Função de validação de origem
  origin: originValidator,

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Headers que o cliente pode enviar
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Headers que o cliente pode acessar na resposta
  exposedHeaders: [
    'X-Total-Count',      // Para paginação
    'X-Page',             // Página atual
    'X-Per-Page',         // Itens por página
    'X-Total-Pages',      // Total de páginas
  ],

  // Permite envio de cookies/credenciais
  credentials: true,

  // Tempo de cache do preflight (em segundos)
  // 24 horas = 86400 segundos
  maxAge: 86400,

  // Responder automaticamente a requisições OPTIONS
  preflightContinue: false,

  // Status de sucesso para preflight (204 é padrão, mas alguns navegadores preferem 200)
  optionsSuccessStatus: 204,
});

/**
 * Configuração alternativa para desenvolvimento (permite tudo)
 * ⚠️  NUNCA usar em produção!
 */
export const corsDevConfig = cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
});

export { allowedOrigins };
export default corsConfig;