// tests/protected-routes.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/server.js";
import prisma from "../src/config/database.js";

/**
 * Testes de Rotas Protegidas
 * Verifica que o middleware de autenticação está funcionando corretamente
 */

describe("Rotas Protegidas - Autenticação JWT", () => {
  let validToken;
  let testUserId;

  // Criar usuário e obter token antes dos testes
  beforeAll(async () => {
    // Limpar usuários de teste anteriores
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "protected-test",
        },
      },
    });

    // Registrar usuário para obter token
    const registerResponse = await request(app).post("/v2/auth/register").send({
      nome: "Usuário Teste Protegido",
      email: "protected-test@escola.com",
      senha: "Senha123",
      papel: "PROFESSOR",
    });

    validToken = registerResponse.body.data.token;
    testUserId = registerResponse.body.data.user.id;

    console.log("Token obtido para testes:", validToken ? "✅" : "❌");
  });

  // Limpar após os testes
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "protected-test",
        },
      },
    });
    await prisma.$disconnect();
  });

  // ==========================================
  // TESTES DE ROTAS PÚBLICAS
  // ==========================================

  describe("Rotas Públicas (não requerem autenticação)", () => {
    it("GET /v2/users deve funcionar sem token", async () => {
      const response = await request(app).get("/v2/users").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("GET /v2/users/:id deve funcionar sem token", async () => {
      const response = await request(app)
        .get(`/v2/users/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUserId);
    });

    it("POST /v2/auth/login deve funcionar sem token", async () => {
      const response = await request(app)
        .post("/v2/auth/login")
        .send({
          email: "protected-test@escola.com",
          senha: "Senha123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  // ==========================================
  // TESTES DE ROTAS PROTEGIDAS - SEM TOKEN
  // ==========================================

  describe("Rotas Protegidas - Sem Token", () => {
    it("POST /v2/users deve retornar 401 sem token", async () => {
      const response = await request(app)
        .post("/v2/users")
        .send({
          primeiro_nome: "Teste",
          sobrenome: "Sem Token",
          email: "semtoken@escola.com",
          senha: "senha123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(response.body.error.message).toContain("Token");
    });

    it("PUT /v2/users/:id deve retornar 401 sem token", async () => {
      const response = await request(app)
        .put(`/v2/users/${testUserId}`)
        .send({
          primeiro_nome: "Atualizado",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("DELETE /v2/users/:id deve retornar 401 sem token", async () => {
      const response = await request(app)
        .delete(`/v2/users/${testUserId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /v2/auth/me deve retornar 401 sem token", async () => {
      const response = await request(app).get("/v2/auth/me").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  // ==========================================
  // TESTES DE ROTAS PROTEGIDAS - TOKEN INVÁLIDO
  // ==========================================

  describe("Rotas Protegidas - Token Inválido", () => {
    it("deve retornar 401 com token malformado", async () => {
      const response = await request(app)
        .post("/v2/users")
        .set("Authorization", "Bearer token-invalido-123")
        .send({
          primeiro_nome: "Teste",
          sobrenome: "Token Invalido",
          email: "tokeninvalido@escola.com",
          senha: "senha123",
        })
        .expect(401);

      expect(response.body.error.message).toContain("inválido");
    });

    it("deve retornar 401 com formato incorreto (sem Bearer)", async () => {
      const response = await request(app)
        .post("/v2/users")
        .set("Authorization", validToken) // Sem "Bearer"
        .send({
          primeiro_nome: "Teste",
          sobrenome: "Sem Bearer",
          email: "sembearer@escola.com",
          senha: "senha123",
        })
        .expect(401);

      expect(response.body.error.message).toContain("Bearer");
    });

    it("deve retornar 401 com token expirado", async () => {
      // Token com exp no passado (gerado manualmente para teste)
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdGVAZXNjb2xhLmNvbSIsInJvbGUiOiJQUk9GRVNTT1IiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid";

      const response = await request(app)
        .post("/v2/users")
        .set("Authorization", `Bearer ${expiredToken}`)
        .send({
          primeiro_nome: "Teste",
          sobrenome: "Token Expirado",
          email: "expirado@escola.com",
          senha: "senha123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TESTES DE ROTAS PROTEGIDAS - TOKEN VÁLIDO
  // ==========================================

  describe("Rotas Protegidas - Token Válido", () => {
    it("POST /v2/users deve funcionar com token válido", async () => {
      const response = await request(app)
        .post("/v2/users")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          primeiro_nome: "Novo",
          sobrenome: "Usuario",
          email: `protected-test-new-${Date.now()}@escola.com`,
          senha: "senha123",
          tipo_usuario: "professor",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.primeiro_nome).toBe("Novo");
    });

    it("PUT /v2/users/:id deve funcionar com token válido", async () => {
      const response = await request(app)
        .put(`/v2/users/${testUserId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          primeiro_nome: "Atualizado",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("GET /v2/auth/me deve retornar dados do usuário autenticado", async () => {
      const response = await request(app)
        .get("/v2/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe("protected-test@escola.com");
      // Não deve retornar a senha
      expect(response.body.data.user.senha).toBeUndefined();
    });
  });

  // ==========================================
  // TESTES DE EDGE CASES
  // ==========================================

  describe("Edge Cases de Autenticação", () => {
    it("deve aceitar Bearer case-insensitive", async () => {
      // Alguns clientes enviam "bearer" em lowercase
      const response = await request(app)
        .get("/v2/auth/me")
        .set("Authorization", `bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("deve rejeitar header Authorization vazio", async () => {
      const response = await request(app)
        .get("/v2/auth/me")
        .set("Authorization", "")
        .expect(401);

      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it('deve rejeitar header com apenas "Bearer"', async () => {
      const response = await request(app)
        .get("/v2/auth/me")
        .set("Authorization", "Bearer")
        .expect(401);

      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("deve rejeitar header com espaços extras", async () => {
      const response = await request(app)
        .get("/v2/auth/me")
        .set("Authorization", `Bearer  ${validToken}`) // Dois espaços
        .expect(401);

      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});