// tests/subjects.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

/**
 * Testes de Integração - Subject API
 * Testa os endpoints de disciplinas com banco de dados real
 */

describe('Subject API - Endpoints', () => {
  describe('GET /subjects', () => {
    it('deve retornar lista de disciplinas com status 200', async () => {
      const response = await request(app).get('/subjects');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar disciplinas com estrutura correta', async () => {
      const response = await request(app).get('/subjects');

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        const primeiraSubject = response.body.data[0];
        expect(primeiraSubject).toHaveProperty('id');
        expect(primeiraSubject).toHaveProperty('nome');
        expect(primeiraSubject).toHaveProperty('ativa');
        expect(primeiraSubject).toHaveProperty('professorId');
        expect(primeiraSubject).toHaveProperty('createdAt');
      }
    });
  });

  describe('GET /subjects/:id', () => {
    it('deve retornar disciplina específica com status 200', async () => {
      // Primeiro, cria um professor
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Teste Subject',
          email: `prof.subject${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      // Depois cria uma disciplina
      const novaSubject = await request(app).post('/subjects').send({
        nome: 'Disciplina Teste',
        professorId: professor.body.data.id,
      });

      const subjectId = novaSubject.body.data.id;

      // Busca por ID
      const response = await request(app).get(`/subjects/${subjectId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', subjectId);
    });

    it('deve retornar 404 para disciplina inexistente', async () => {
      const response = await request(app).get('/subjects/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 para ID inválido', async () => {
      const response = await request(app).get('/subjects/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('inválido');
    });
  });

  describe('POST /subjects', () => {
    it('deve criar nova disciplina com dados válidos', async () => {
      // Cria um professor primeiro
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Create Test',
          email: `prof.create${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const novaSubject = {
        nome: 'Programação Web II',
        professorId: professor.body.data.id,
        ativa: true,
      };

      const response = await request(app).post('/subjects').send(novaSubject);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(novaSubject.nome);
      expect(response.body.data.professorId).toBe(novaSubject.professorId);
    });

    it('deve retornar 400 ao criar disciplina sem nome', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const subjectInvalida = {
        professorId: professor.body.data.id,
      };

      const response = await request(app)
        .post('/subjects')
        .send(subjectInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('obrigatório');
    });

    it('deve retornar 400 ao criar disciplina sem professorId', async () => {
      const subjectInvalida = {
        nome: 'Disciplina Sem Professor',
      };

      const response = await request(app)
        .post('/subjects')
        .send(subjectInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('obrigatório');
    });

    it('deve retornar 400 ao criar disciplina com professorId inexistente', async () => {
      const subjectInvalida = {
        nome: 'Disciplina Teste',
        professorId: 99999,
      };

      const response = await request(app)
        .post('/subjects')
        .send(subjectInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('PUT /subjects/:id', () => {
    it('deve atualizar disciplina existente', async () => {
      // Cria professor e disciplina
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Update Test',
          email: `prof.update${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const novaSubject = await request(app).post('/subjects').send({
        nome: 'Disciplina Original',
        professorId: professor.body.data.id,
      });

      const subjectId = novaSubject.body.data.id;

      // Atualiza a disciplina
      const response = await request(app).put(`/subjects/${subjectId}`).send({
        nome: 'Disciplina Atualizada',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.nome).toBe('Disciplina Atualizada');
      expect(response.body.data.id).toBe(subjectId);
    });

    it('deve retornar 404 ao atualizar disciplina inexistente', async () => {
      const response = await request(app).put('/subjects/99999').send({
        nome: 'Teste',
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 ao atualizar com professorId inexistente', async () => {
      // Cria disciplina
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const novaSubject = await request(app).post('/subjects').send({
        nome: 'Disciplina Teste',
        professorId: professor.body.data.id,
      });

      // Tenta atualizar com professor inexistente
      const response = await request(app)
        .put(`/subjects/${novaSubject.body.data.id}`)
        .send({
          professorId: 99999,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('DELETE /subjects/:id', () => {
    it('deve deletar disciplina existente', async () => {
      // Cria professor e disciplina
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Delete Test',
          email: `prof.delete${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const novaSubject = await request(app).post('/subjects').send({
        nome: 'Disciplina Para Deletar',
        professorId: professor.body.data.id,
      });

      const subjectId = novaSubject.body.data.id;

      // Deleta a disciplina
      const response = await request(app).delete(`/subjects/${subjectId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('removida com sucesso');

      // Verifica que não existe mais
      const busca = await request(app).get(`/subjects/${subjectId}`);
      expect(busca.status).toBe(404);
    });

    it('deve retornar 404 ao deletar disciplina inexistente', async () => {
      const response = await request(app).delete('/subjects/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });
  });
});
