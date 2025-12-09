// src/api/v2/routes/index.js
import express from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

/**
 * Rotas da API v2
 * Base: /v2
 *
 * MUDANÇAS DA V2:
 * - Estrutura de nomes separada (primeiro_nome, sobrenome)
 * - Enums lowercase (professor, admin)
 * - Novos campos (telefone)
 * - Autenticação JWT implementada
 */

/**
 * @swagger
 * /v2:
 *   get:
 *     summary: Informações da API v2
 *     tags:
 *       - Info
 *     responses:
 *       200:
 *         description: Informações da versão 2 da API
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Gerador de Provas - Versão 2",
    version: "2.0.0",
    endpoints: {
      users: "/v2/users",
      auth: "/v2/auth",
    },
    changes: [
      "Campos primeiro_nome e sobrenome separados",
      "Campo tipo_usuario em lowercase",
      "Campo telefone adicionado",
      "Autenticação JWT implementada",
      "Rotas protegidas por autenticação",
    ],
    authentication: {
      login: "POST /v2/auth/login",
      register: "POST /v2/auth/register",
      protected_routes: 'Requer header "Authorization: Bearer <token>"',
    },
  });
});

// Rotas de autenticação (públicas)
router.use("/auth", authRoutes);

// Rotas de usuários (serão parcialmente protegidas)
router.use("/users", userRoutes);

export default router;