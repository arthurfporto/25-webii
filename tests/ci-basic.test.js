// tests/ci-basic.test.js
/**
 * Teste Básico para Pipeline CI/CD
 * 
 * Este teste verifica funcionalidades essenciais da API
 * de forma rápida e isolada, ideal para execução em CI.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('CI/CD - Testes Básicos de Sanidade', () => {

  /**
   * Teste 1: Health Check
   * Verifica se a API está respondendo
   */
  describe('GET /health', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toMatch(/OK|DEGRADED/);
      expect(response.body).toHaveProperty('availableVersions');
      expect(response.body.availableVersions).toContain('v2');
    });
  });

  /**
   * Teste 2: Listagem de Usuários (v2)
   * Verifica se o endpoint principal está funcionando
   */
  describe('GET /v2/users', () => {
    it('deve retornar lista de usuários com status 200', async () => {
      const response = await request(app)
        .get('/v2/users')
        .expect(200);

      // Verifica estrutura da resposta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('version', 'v2');

      // Verifica que data é um array
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verifica que total é um número
      expect(typeof response.body.total).toBe('number');
    });

    it('deve retornar usuários no formato v2 (com campos corretos)', async () => {
      const response = await request(app)
        .get('/v2/users')
        .expect(200);

      // Se houver usuários, verifica o formato
      if (response.body.data.length > 0) {
        const usuario = response.body.data[0];

        // Campos esperados na v2
        expect(usuario).toHaveProperty('id');
        expect(usuario).toHaveProperty('email');
        expect(usuario).toHaveProperty('primeiro_nome');
        expect(usuario).toHaveProperty('sobrenome');
        expect(usuario).toHaveProperty('tipo_usuario');

        // Campos que NÃO devem aparecer (v1 ou sensíveis)
        expect(usuario).not.toHaveProperty('senha');
        expect(usuario).not.toHaveProperty('password');
      }
    });
  });

  /**
   * Teste 3: Rota inexistente
   * Verifica se o tratamento de 404 está funcionando
   */
  describe('GET /rota-inexistente', () => {
    it('deve retornar 404 com estrutura de erro correta', async () => {
      const response = await request(app)
        .get('/rota-que-nao-existe')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  /**
   * Teste 4: Documentação Swagger
   * Verifica se a documentação está acessível
   */
  describe('GET /api-docs', () => {
    it('deve retornar a página de documentação', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);

      // Swagger UI retorna HTML
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  /**
   * Teste 5: Endpoint de informações da v2
   * Verifica se o endpoint de info da v2 está respondendo
   */
  describe('GET /v2', () => {
    it('deve retornar informações da API v2', async () => {
      const response = await request(app)
        .get('/v2')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('version', '2.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('auth');
    });
  });
});