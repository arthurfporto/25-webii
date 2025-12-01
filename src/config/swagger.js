// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuração do Swagger/OpenAPI
 * Define as informações gerais da API e onde buscar as anotações
 */

// Definição base da API
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API do Gerador de Provas Automáticas',
    version: '1.0.0',
    description: `
      API RESTful para gerenciamento de provas, questões e usuários.
      
      ## Funcionalidades
      - Gerenciamento completo de usuários (CRUD)
      - Upload de fotos de perfil
      - Versionamento de API (v1 e v2)
      - Validação robusta de dados
      - Tratamento centralizado de erros
      
      ## Versões Disponíveis
      - **v1:** Versão estável com campos consolidados
      - **v2:** Versão atual com novos campos e upload de arquivos
    `,
    contact: {
      name: 'Suporte API',
      email: 'contato@arthurporto.com.br',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento',
    },
    {
      url: 'https://api.geradorprovas.com',
      description: 'Servidor de Produção (exemplo)',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Endpoints de verificação de saúde da API',
    },
    {
      name: 'Usuários v1',
      description: 'Gerenciamento de usuários (API v1)',
    },
    {
      name: 'Usuários v2',
      description: 'Gerenciamento de usuários com upload de fotos (API v2)',
    },
  ],
};

// Opções do swagger-jsdoc
const options = {
  swaggerDefinition,
  // Onde procurar por anotações @swagger
  apis: [
    './src/server.js', // Rota de health check geral
    './src/api/v1/routes/*.js', // Rotas da v1
    './src/api/v2/routes/*.js', // Rotas da v2
    './src/errors/AppError.js', // Schemas de erro
  ],
};

// Gera a especificação OpenAPI
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
