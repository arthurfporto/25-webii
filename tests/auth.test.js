import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/config/database.js';

describe('Auth Routes', () => {
  // Limpar banco antes dos testes
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-auth',
        },
      },
    });
  });

  // Limpar após os testes
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-auth',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /v2/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const newUser = {
        nome: 'Usuário Teste Auth',
        email: 'test-auth-register@escola.com',
        senha: 'Senha123',
        papel: 'PROFESSOR',
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(newUser.email);
      // Senha não deve ser retornada
      expect(response.body.data.user.senha).toBeUndefined();
    });

    it('deve rejeitar registro com email duplicado', async () => {
      const existingUser = {
        nome: 'Usuário Duplicado',
        email: 'test-auth-duplicate@escola.com',
        senha: 'Senha123',
      };

      // Primeiro registro
      await request(app)
        .post('/v2/auth/register')
        .send(existingUser)
        .expect(201);

      // Tentativa de registro com mesmo email
      const response = await request(app)
        .post('/v2/auth/register')
        .send(existingUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_IN_USE');
    });

    it('deve rejeitar registro com senha fraca', async () => {
      const weakPasswordUser = {
        nome: 'Usuário Senha Fraca',
        email: 'test-auth-weak@escola.com',
        senha: '123', // Senha muito curta e sem complexidade
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('deve rejeitar registro com email inválido', async () => {
      const invalidEmailUser = {
        nome: 'Usuário Email Inválido',
        email: 'email-invalido',
        senha: 'Senha123',
      };

      const response = await request(app)
        .post('/v2/auth/register')
        .send(invalidEmailUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /v2/auth/login', () => {
    // Criar usuário para testes de login
    beforeEach(async () => {
      // Limpar e criar usuário de teste
      await prisma.user.deleteMany({
        where: { email: 'test-auth-login@escola.com' },
      });

      await request(app).post('/v2/auth/register').send({
        nome: 'Usuário Login Teste',
        email: 'test-auth-login@escola.com',
        senha: 'Senha123',
      });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: 'test-auth-login@escola.com',
          senha: 'Senha123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(
        'test-auth-login@escola.com'
      );
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: 'test-auth-login@escola.com',
          senha: 'SenhaErrada123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('deve rejeitar login com email inexistente', async () => {
      const response = await request(app)
        .post('/v2/auth/login')
        .send({
          email: 'naoexiste@escola.com',
          senha: 'Senha123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('JWT Token', () => {
    it('deve retornar um token JWT válido no formato correto', async () => {
      const response = await request(app)
        .post('/v2/auth/register')
        .send({
          nome: 'Usuário Token Teste',
          email: 'test-auth-token@escola.com',
          senha: 'Senha123',
        })
        .expect(201);

      const { token } = response.body.data;

      // Token deve ter formato JWT (3 partes separadas por ponto)
      expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

      // Decodificar payload (parte do meio)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.sub).toBeDefined();
      expect(payload.email).toBe('test-auth-token@escola.com');
      expect(payload.role).toBe('PROFESSOR');
      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();
    });
  });
});