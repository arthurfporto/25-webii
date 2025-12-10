// src/api/v2/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import validate from '../../../middlewares/validate.js';
import authMiddleware from '../../../middlewares/auth.js';
import authorize, { isAdmin, isOwnerOrAdmin } from '../../../middlewares/authorize.js';
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from '../schemas/userSchema.js';
import upload from '../../../config/multer.js';

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
 */

// ============================================
// ROTAS PÚBLICAS (não requerem autenticação)
// ============================================

/**
 * @swagger
 * /v2/users:
 *   get:
 *     summary: Lista todos os usuários (público)
 *     description: Retorna lista de usuários. Rota pública para consulta.
 *     tags:
 *       - Usuários v2
 *     security: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/', userController.getAll);

/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     summary: Busca um usuário por ID (público)
 *     description: Retorna dados de um usuário específico.
 *     tags:
 *       - Usuários v2
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', validate(idParamSchema, 'params'), userController.getById);

// ============================================
// ROTAS PROTEGIDAS (requerem autenticação + autorização)
// ============================================

/**
 * @swagger
 * /v2/users:
 *   post:
 *     summary: Cria um novo usuário (apenas ADMIN)
 *     description: |
 *       Cadastra novo usuário no sistema.
 *       **Requer autenticação e papel ADMIN**.
 *     tags:
 *       - Usuários v2
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserV2'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (não é ADMIN)
 *       409:
 *         description: Email já cadastrado
 */
router.post(
  '/',
  authMiddleware,         // 🔒 Primeiro: verifica autenticação
  isAdmin,                // 🔒 Segundo: verifica se é ADMIN
  upload.single('foto'),
  validate(createUserSchema, 'body'),
  userController.create,
);

/**
 * @swagger
 * /v2/users/{id}:
 *   put:
 *     summary: Atualiza um usuário (próprio ou ADMIN)
 *     description: |
 *       Atualiza dados do usuário.
 *       - Usuários comuns podem atualizar **apenas seu próprio** perfil
 *       - ADMIN pode atualizar **qualquer** usuário
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
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  '/:id',
  authMiddleware,           // 🔒 Verifica autenticação
  validate(idParamSchema, 'params'),
  isOwnerOrAdmin('id'),     // 🔒 Verifica se é dono do recurso ou ADMIN
  upload.single('foto'),
  validate(updateUserSchema, 'body'),
  userController.update,
);

/**
 * @swagger
 * /v2/users/{id}:
 *   delete:
 *     summary: Remove um usuário (apenas ADMIN)
 *     description: |
 *       Deleta permanentemente um usuário.
 *       **Requer autenticação e papel ADMIN**.
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
 *       403:
 *         description: Sem permissão (não é ADMIN)
 *       404:
 *         description: Usuário não encontrado
 */
router.delete(
  '/:id',
  authMiddleware,          // 🔒 Verifica autenticação
  isAdmin,                 // 🔒 Verifica se é ADMIN
  validate(idParamSchema, 'params'),
  userController.remove,
);

export default router;