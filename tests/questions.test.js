// tests/questions.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

/**
 * Testes de Integração - Question API
 * Testa os endpoints de questões com banco de dados real
 */

describe('Question API - Endpoints', () => {
  describe('GET /questions', () => {
    it('deve retornar lista de questões com status 200', async () => {
      const response = await request(app).get('/questions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar questões com estrutura correta', async () => {
      const response = await request(app).get('/questions');

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        const primeiraQuestion = response.body.data[0];
        expect(primeiraQuestion).toHaveProperty('id');
        expect(primeiraQuestion).toHaveProperty('enunciado');
        expect(primeiraQuestion).toHaveProperty('dificuldade');
        expect(primeiraQuestion).toHaveProperty('disciplinaId');
        expect(primeiraQuestion).toHaveProperty('autorId');
        expect(primeiraQuestion).toHaveProperty('ativa');
        expect(primeiraQuestion).toHaveProperty('createdAt');
      }
    });
  });

  describe('GET /questions/:id', () => {
    it('deve retornar questão específica com status 200', async () => {
      // Cria professor
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Question Test',
          email: `prof.question${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      // Cria disciplina
      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Question Test',
        professorId: professor.body.data.id,
      });

      // Cria questão
      const novaQuestion = await request(app).post('/questions').send({
        enunciado: 'O que é REST?',
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      });

      const questionId = novaQuestion.body.data.id;

      // Busca por ID
      const response = await request(app).get(`/questions/${questionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', questionId);
    });

    it('deve retornar 404 para questão inexistente', async () => {
      const response = await request(app).get('/questions/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 para ID inválido', async () => {
      const response = await request(app).get('/questions/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('inválido');
    });
  });

  describe('POST /questions', () => {
    it('deve criar nova questão com dados válidos', async () => {
      // Cria professor e disciplina
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Create Question',
          email: `prof.createq${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Create Question',
        professorId: professor.body.data.id,
      });

      const novaQuestion = {
        enunciado: 'Explique o que é uma API RESTful',
        dificuldade: 2,
        respostaCorreta: 'Uma API que segue os princípios REST...',
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
        ativa: true,
      };

      const response = await request(app).post('/questions').send(novaQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.enunciado).toBe(novaQuestion.enunciado);
      expect(response.body.data.dificuldade).toBe(novaQuestion.dificuldade);
    });

    it('deve criar questão sem resposta_correta (campo opcional)', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const novaQuestion = {
        enunciado: 'Questão sem resposta',
        dificuldade: 1,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      };

      const response = await request(app).post('/questions').send(novaQuestion);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.respostaCorreta).toBeNull();
    });

    it('deve retornar 400 ao criar questão sem enunciado', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const questionInvalida = {
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      };

      const response = await request(app)
        .post('/questions')
        .send(questionInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('obrigatório');
    });

    it('deve retornar 400 ao criar questão sem dificuldade', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const questionInvalida = {
        enunciado: 'Questão sem dificuldade',
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      };

      const response = await request(app)
        .post('/questions')
        .send(questionInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('obrigatório');
    });

    it('deve retornar 400 ao criar questão com disciplinaId inexistente', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const questionInvalida = {
        enunciado: 'Questão teste',
        dificuldade: 2,
        disciplinaId: 99999,
        autorId: professor.body.data.id,
      };

      const response = await request(app)
        .post('/questions')
        .send(questionInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 ao criar questão com autorId inexistente', async () => {
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const questionInvalida = {
        enunciado: 'Questão teste',
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: 99999,
      };

      const response = await request(app)
        .post('/questions')
        .send(questionInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('PUT /questions/:id', () => {
    it('deve atualizar questão existente', async () => {
      // Cria professor e disciplina
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Update Question',
          email: `prof.updateq${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Update Question',
        professorId: professor.body.data.id,
      });

      // Cria questão
      const novaQuestion = await request(app).post('/questions').send({
        enunciado: 'Questão Original',
        dificuldade: 1,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      });

      const questionId = novaQuestion.body.data.id;

      // Atualiza a questão
      const response = await request(app).put(`/questions/${questionId}`).send({
        enunciado: 'Questão Atualizada',
        dificuldade: 3,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.enunciado).toBe('Questão Atualizada');
      expect(response.body.data.dificuldade).toBe(3);
      expect(response.body.data.id).toBe(questionId);
    });

    it('deve retornar 404 ao atualizar questão inexistente', async () => {
      const response = await request(app).put('/questions/99999').send({
        enunciado: 'Teste',
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 ao atualizar com disciplinaId inexistente', async () => {
      // Cria estrutura básica
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const novaQuestion = await request(app).post('/questions').send({
        enunciado: 'Questão Teste',
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      });

      // Tenta atualizar com disciplina inexistente
      const response = await request(app)
        .put(`/questions/${novaQuestion.body.data.id}`)
        .send({
          disciplinaId: 99999,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });

    it('deve retornar 400 ao atualizar com autorId inexistente', async () => {
      // Cria estrutura básica
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Test',
          email: `prof.test${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Test',
        professorId: professor.body.data.id,
      });

      const novaQuestion = await request(app).post('/questions').send({
        enunciado: 'Questão Teste',
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      });

      // Tenta atualizar com autor inexistente
      const response = await request(app)
        .put(`/questions/${novaQuestion.body.data.id}`)
        .send({
          autorId: 99999,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('DELETE /questions/:id', () => {
    it('deve deletar questão existente', async () => {
      // Cria estrutura completa
      const professor = await request(app)
        .post('/users')
        .send({
          nome: 'Prof. Delete Question',
          email: `prof.deleteq${Date.now()}@escola.com`,
          senha: 'senha123',
        });

      const disciplina = await request(app).post('/subjects').send({
        nome: 'Disciplina Delete Question',
        professorId: professor.body.data.id,
      });

      const novaQuestion = await request(app).post('/questions').send({
        enunciado: 'Questão Para Deletar',
        dificuldade: 2,
        disciplinaId: disciplina.body.data.id,
        autorId: professor.body.data.id,
      });

      const questionId = novaQuestion.body.data.id;

      // Deleta a questão
      const response = await request(app).delete(`/questions/${questionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('removida com sucesso');

      // Verifica que não existe mais
      const busca = await request(app).get(`/questions/${questionId}`);
      expect(busca.status).toBe(404);
    });

    it('deve retornar 404 ao deletar questão inexistente', async () => {
      const response = await request(app).delete('/questions/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrada');
    });
  });
});
