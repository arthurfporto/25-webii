// tests/users-v2.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

/**
 * Testes de Integração - User API v2
 * Testa os novos endpoints e formatos da v2
 */

describe('User API v2 - Novos Campos e Formatos', () => {
  describe('POST /v2/users - Criação com Novos Campos', () => {
    it('deve criar usuário com primeiro_nome e sobrenome separados', async () => {
      const novoUsuario = {
        primeiro_nome: 'Carlos',
        sobrenome: 'Oliveira',
        email: `carlos.v2.${Date.now()}@teste.com`,
        senha: 'senha123',
        tipo_usuario: 'professor',
      };

      const response = await request(app).post('/v2/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('primeiro_nome', 'Carlos');
      expect(response.body.data).toHaveProperty('sobrenome', 'Oliveira');
      expect(response.body.data).toHaveProperty('tipo_usuario', 'professor');
      expect(response.body).toHaveProperty('version', 'v2');
    });

    it('deve criar usuário com telefone', async () => {
      const novoUsuario = {
        primeiro_nome: 'Ana',
        sobrenome: 'Costa',
        email: `ana.v2.${Date.now()}@teste.com`,
        senha: 'senha123',
        telefone: '11987654321',
      };

      const response = await request(app).post('/v2/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('telefone', '11987654321');
    });

    it('deve aceitar tipo_usuario em lowercase', async () => {
      const admin = {
        primeiro_nome: 'Admin',
        sobrenome: 'User',
        email: `admin.v2.${Date.now()}@teste.com`,
        senha: 'senha123',
        tipo_usuario: 'admin',
      };

      const response = await request(app).post('/v2/users').send(admin);

      expect(response.status).toBe(201);
      expect(response.body.data.tipo_usuario).toBe('admin');
    });
  });

  describe('POST /v2/users - Validações v2', () => {
    it('deve retornar 400 se primeiro_nome estiver ausente', async () => {
      const usuarioInvalido = {
        sobrenome: 'Silva',
        email: `teste${Date.now()}@teste.com`,
        senha: 'senha123',
      };

      const response = await request(app)
        .post('/v2/users')
        .send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      const erro = response.body.error.details.find(
        d => d.field === 'primeiro_nome',
      );
      expect(erro).toBeDefined();
    });

    it('deve retornar 400 se sobrenome estiver ausente', async () => {
      const usuarioInvalido = {
        primeiro_nome: 'João',
        email: `teste${Date.now()}@teste.com`,
        senha: 'senha123',
      };

      const response = await request(app)
        .post('/v2/users')
        .send(usuarioInvalido);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'sobrenome',
      );
      expect(erro).toBeDefined();
    });

    it('deve retornar 400 para telefone com formato inválido', async () => {
      const usuarioInvalido = {
        primeiro_nome: 'Teste',
        sobrenome: 'Telefone',
        email: `teste${Date.now()}@teste.com`,
        senha: 'senha123',
        telefone: '123', // Muito curto
      };

      const response = await request(app)
        .post('/v2/users')
        .send(usuarioInvalido);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'telefone',
      );
      expect(erro.message).toContain('10 ou 11 dígitos');
    });

    it('deve retornar 400 para tipo_usuario inválido', async () => {
      const usuarioInvalido = {
        primeiro_nome: 'Teste',
        sobrenome: 'Tipo',
        email: `teste${Date.now()}@teste.com`,
        senha: 'senha123',
        tipo_usuario: 'PROFESSOR', // Uppercase não é aceito na v2
      };

      const response = await request(app)
        .post('/v2/users')
        .send(usuarioInvalido);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'tipo_usuario',
      );
      expect(erro).toBeDefined();
    });
  });

  describe('GET /v2/users - Listagem com Novos Campos', () => {
    it('deve retornar usuários no formato v2', async () => {
      // Criar um usuário v2 primeiro
      await request(app)
        .post('/v2/users')
        .send({
          primeiro_nome: 'Teste',
          sobrenome: 'Listagem',
          email: `listagem.v2.${Date.now()}@teste.com`,
          senha: 'senha123',
        });

      const response = await request(app).get('/v2/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version', 'v2');
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const usuario = response.body.data[0];
        expect(usuario).toHaveProperty('primeiro_nome');
        expect(usuario).toHaveProperty('sobrenome');
        expect(usuario).toHaveProperty('tipo_usuario');
        expect(usuario).not.toHaveProperty('nome'); // v1 field
        expect(usuario).not.toHaveProperty('papel'); // v1 field
      }
    });
  });

  describe('Compatibilidade entre v1 e v2', () => {
    it('deve criar usuário na v2 e aparecer na v1 com campos convertidos', async () => {
      // Criar na v2
      const usuarioV2 = {
        primeiro_nome: 'Pedro',
        sobrenome: 'Almeida',
        email: `pedro.compat.${Date.now()}@teste.com`,
        senha: 'senha123',
        tipo_usuario: 'admin',
      };

      const createResponse = await request(app)
        .post('/v2/users')
        .send(usuarioV2);
      const userId = createResponse.body.data.id;

      // Buscar na v1
      const v1Response = await request(app).get(`/v1/users/${userId}`);

      expect(v1Response.status).toBe(200);
      expect(v1Response.body.data).toHaveProperty('nome', 'Pedro Almeida');
      expect(v1Response.body.data).toHaveProperty('papel', 'ADMIN');
    });

    it('deve criar usuário na v1 e aparecer na v2 (sem novos campos)', async () => {
      // Criar na v1
      const usuarioV1 = {
        nome: 'Lucia Ferreira',
        email: `lucia.compat.${Date.now()}@teste.com`,
        senha: 'senha123',
        papel: 'PROFESSOR',
      };

      const createResponse = await request(app)
        .post('/v1/users')
        .send(usuarioV1);
      const userId = createResponse.body.data.id;

      console.log('Usuário criado na v1 com ID:', userId);

      // Buscar na v2
      const v2Response = await request(app).get(`/v2/users/${userId}`);

      expect(v2Response.status).toBe(200);
      // Como foi criado na v1, não terá os campos separados
      expect(v2Response.body.data.primeiro_nome).toBeNull();
      expect(v2Response.body.data.sobrenome).toBeNull();
    });
  });
});
