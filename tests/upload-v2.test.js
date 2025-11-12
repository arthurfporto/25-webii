// tests/upload-v2.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Testes de Upload de Arquivos - API v2
 * Testa upload com novos campos da v2 (primeiro_nome, sobrenome, tipo_usuario)
 */

describe('Upload de Arquivos - API v2', () => {
  let testImagePath;

  beforeAll(() => {
    testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

    if (!fs.existsSync(testImagePath)) {
      throw new Error(
        'Imagem de teste não encontrada. Execute: node tests/fixtures/createTestImage.js',
      );
    }
  });

  describe('POST /v2/users - Upload de Foto', () => {
    it('deve criar usuário v2 com foto', async () => {
      const response = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'Carlos')
        .field('sobrenome', 'Silva')
        .field('email', `carlos.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .field('tipo_usuario', 'professor')
        .field('telefone', '11987654321')
        .attach('foto', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.version).toBe('v2');
      expect(response.body.data).toHaveProperty('primeiro_nome', 'Carlos');
      expect(response.body.data).toHaveProperty('sobrenome', 'Silva');
      expect(response.body.data).toHaveProperty('foto');
      expect(response.body.data.foto).toMatch(/^https:\/\/ucarecdn\.com\//);
    }, 15000);

    it('deve criar usuário v2 SEM foto', async () => {
      const response = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'Ana')
        .field('sobrenome', 'Costa')
        .field('email', `ana.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .field('tipo_usuario', 'admin');

      expect(response.status).toBe(201);
      expect(response.body.data.foto).toBeNull();
    });

    it('deve criar admin v2 com foto', async () => {
      const response = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'Admin')
        .field('sobrenome', 'User')
        .field('email', `admin.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .field('tipo_usuario', 'admin')
        .attach('foto', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.data.tipo_usuario).toBe('admin');
      expect(response.body.data.foto).toMatch(/^https:\/\/ucarecdn\.com\//);
    }, 15000);
  });

  describe('Compatibilidade v2 ↔ v1', () => {
    it('deve criar usuário v2 com foto e aparecer corretamente na v1', async () => {
      // Criar na v2
      const createResponse = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'Pedro')
        .field('sobrenome', 'Santos')
        .field('email', `pedro.compat.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .field('tipo_usuario', 'professor')
        .attach('foto', testImagePath);

      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.data.id;
      const fotoUrl = createResponse.body.data.foto;

      // Buscar na v1
      const v1Response = await request(app).get(`/v1/users/${userId}`);

      expect(v1Response.status).toBe(200);
      expect(v1Response.body.data.nome).toBe('Pedro Santos');
      expect(v1Response.body.data.papel).toBe('PROFESSOR');
      expect(v1Response.body.data.foto).toBe(fotoUrl); // Mesma URL!
    }, 15000);

    // it('deve criar usuário v1 com foto e aparecer na v2', async () => {
    //   // Criar na v1
    //   const createResponse = await request(app)
    //     .post('/v1/users')
    //     .field('nome', 'Maria Silva')
    //     .field('email', `maria.compat.${Date.now()}@teste.com`)
    //     .field('senha', 'senha123')
    //     .field('papel', 'ADMIN')
    //     .attach('foto', testImagePath);

    //   expect(createResponse.status).toBe(201);
    //   const userId = createResponse.body.data.id;
    //   const fotoUrl = createResponse.body.data.foto;

    //   // Buscar na v2
    //   const v2Response = await request(app).get(`/v2/users/${userId}`);

    //   expect(v2Response.status).toBe(200);
    //   expect(v2Response.body.data.foto).toBe(fotoUrl); // Mesma URL!
    //   // Nota: primeiro_nome e sobrenome serão null pois foi criado na v1
    // }, 15000);
  });

  describe('Validações v2 com Upload', () => {
    it('deve validar primeiro_nome mesmo com upload', async () => {
      const response = await request(app)
        .post('/v2/users')
        // primeiro_nome ausente
        .field('sobrenome', 'Silva')
        .field('email', `teste.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .attach('foto', testImagePath);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'primeiro_nome',
      );
      expect(erro).toBeDefined();
    });

    it('deve validar sobrenome mesmo com upload', async () => {
      const response = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'João')
        // sobrenome ausente
        .field('email', `teste.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .attach('foto', testImagePath);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'sobrenome',
      );
      expect(erro).toBeDefined();
    });

    it('deve validar formato de telefone com upload', async () => {
      const response = await request(app)
        .post('/v2/users')
        .field('primeiro_nome', 'Teste')
        .field('sobrenome', 'Telefone')
        .field('email', `teste.v2.${Date.now()}@teste.com`)
        .field('senha', 'senha123')
        .field('telefone', '123') // Inválido
        .attach('foto', testImagePath);

      expect(response.status).toBe(400);
      const erro = response.body.error.details.find(
        d => d.field === 'telefone',
      );
      expect(erro).toBeDefined();
    });
  });
});
