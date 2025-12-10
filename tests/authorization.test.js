// tests/authorization.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/config/database.js';

/**
 * Testes de Autorização (RBAC)
 * Verifica que diferentes roles têm diferentes permissões
 */

describe('Autorização RBAC', () => {
  let adminToken;
  let professorToken;
  let adminUserId;
  let professorUserId;

  beforeAll(async () => {
    // Limpar usuários de teste anteriores
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'rbac-test',
        },
      },
    });

    // Criar usuário ADMIN
    const adminResponse = await request(app)
      .post('/v2/auth/register')
      .send({
        nome: 'Admin RBAC Test',
        email: 'rbac-test-admin@escola.com',
        senha: 'Senha123',
        papel: 'ADMIN',
      });

    adminToken = adminResponse.body.data.token;
    adminUserId = adminResponse.body.data.user.id;

    // Criar usuário PROFESSOR
    const professorResponse = await request(app)
      .post('/v2/auth/register')
      .send({
        nome: 'Professor RBAC Test',
        email: 'rbac-test-professor@escola.com',
        senha: 'Senha123',
        papel: 'PROFESSOR',
      });

    professorToken = professorResponse.body.data.token;
    professorUserId = professorResponse.body.data.user.id;

    console.log('Usuários de teste criados:', {
      admin: { id: adminUserId, token: adminToken ? '✅' : '❌' },
      professor: { id: professorUserId, token: professorToken ? '✅' : '❌' },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'rbac-test',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('ADMIN - Permissões Totais', () => {
    it('ADMIN pode criar novo usuário', async () => {
      const response = await request(app)
        .post('/v2/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          primeiro_nome: 'Criado',
          sobrenome: 'PeloAdmin',
          email: `rbac-test-admin-created-${Date.now()}@escola.com`,
          senha: 'senha123',
          tipo_usuario: 'professor',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('ADMIN pode atualizar qualquer usuário', async () => {
      const response = await request(app)
        .put(`/v2/users/${professorUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          primeiro_nome: 'Atualizado',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PROFESSOR - Permissões Limitadas', () => {
    it('PROFESSOR NÃO pode criar novo usuário', async () => {
      const response = await request(app)
        .post('/v2/users')
        .set('Authorization', `Bearer ${professorToken}`)
        .send({
          primeiro_nome: 'Tentativa',
          sobrenome: 'Professor',
          email: `rbac-test-prof-create-${Date.now()}@escola.com`,
          senha: 'senha123',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('PROFESSOR pode atualizar SEU PRÓPRIO perfil', async () => {
      const response = await request(app)
        .put(`/v2/users/${professorUserId}`)
        .set('Authorization', `Bearer ${professorToken}`)
        .send({
          telefone: '11999999999',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('PROFESSOR NÃO pode atualizar perfil de OUTRO usuário', async () => {
      const response = await request(app)
        .put(`/v2/users/${adminUserId}`)
        .set('Authorization', `Bearer ${professorToken}`)
        .send({
          primeiro_nome: 'Hackeado',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});