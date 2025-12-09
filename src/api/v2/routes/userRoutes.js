// src/api/v2/routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import validate from "../../../middlewares/validate.js";
import authMiddleware from "../../../middlewares/auth.js";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from "../schemas/userSchema.js";
import upload from "../../../config/multer.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT obtido no login
 *
 *   schemas:
 *     UserV2:
 *       type: object
 *       required:
 *         - primeiro_nome
 *         - sobrenome
 *         - email
 *         - senha
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *           example: 1
 *         primeiro_nome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Primeiro nome do usuário
 *           example: "João"
 *         sobrenome:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Sobrenome do usuário
 *           example: "Silva"
 *         email:
 *           type: string
 *           format: email
 *           description: Email único do usuário
 *           example: "joao.silva@escola.com"
 *         tipo_usuario:
 *           type: string
 *           enum: [professor, admin]
 *           default: professor
 *           description: Tipo de usuário no sistema
 *           example: "professor"
 *         telefone:
 *           type: string
 *           nullable: true
 *           description: Telefone com 10 ou 11 dígitos
 *           example: "11987654321"
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto de perfil
 *           example: "https://ucarecdn.com/uuid/"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 */

// ============================================
// ROTAS PÚBLICAS (não requerem autenticação)
// ============================================

/**
 * @swagger
 * /v2/users:
 *   get:
 *     summary: Lista todos os usuários (público)
 *     description: |
 *       Retorna lista de usuários no formato v2.
 *       **Esta rota é pública** para facilitar testes.
 *     tags:
 *       - Usuários v2
 *     security: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get("/", userController.getAll);

/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     summary: Busca um usuário por ID (público)
 *     description: Retorna os dados de um usuário no formato v2
 *     tags:
 *       - Usuários v2
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérico do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", validate(idParamSchema, "params"), userController.getById);

// ============================================
// ROTAS PROTEGIDAS (requerem autenticação)
// ============================================

/**
 * @swagger
 * /v2/users:
 *   post:
 *     summary: Cria um novo usuário (protegido)
 *     description: |
 *       Cadastra usuário com suporte a upload de foto.
 *       **Requer autenticação** - apenas administradores ou usuários autenticados podem criar novos usuários.
 *     tags:
 *       - Usuários v2
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - primeiro_nome
 *               - sobrenome
 *               - email
 *               - senha
 *             properties:
 *               primeiro_nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *               telefone:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       401:
 *         description: Não autenticado
 *       409:
 *         description: Email já cadastrado
 */
router.post(
  "/",
  authMiddleware, // 🔒 Protegido
  upload.single("foto"),
  validate(createUserSchema, "body"),
  userController.create
);

/**
 * @swagger
 * /v2/users/{id}:
 *   put:
 *     summary: Atualiza um usuário (protegido)
 *     description: |
 *       Atualiza dados do usuário.
 *       **Requer autenticação**.
 *     tags:
 *       - Usuários v2
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               primeiro_nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *               telefone:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  "/:id",
  authMiddleware, // 🔒 Protegido
  validate(idParamSchema, "params"),
  upload.single("foto"),
  validate(updateUserSchema, "body"),
  userController.update
);

/**
 * @swagger
 * /v2/users/{id}:
 *   delete:
 *     summary: Remove um usuário (protegido)
 *     description: |
 *       Deleta permanentemente um usuário.
 *       **Requer autenticação**.
 *     tags:
 *       - Usuários v2
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário removido
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete(
  "/:id",
  authMiddleware, // 🔒 Protegido
  validate(idParamSchema, "params"),
  userController.remove
);

export default router;