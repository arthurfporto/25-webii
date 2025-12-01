// src/api/v1/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import validate from '../../../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from '../schemas/userSchema.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserV1:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *           example: 1
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome completo do usuário
 *           example: "Prof. João Silva"
 *         email:
 *           type: string
 *           format: email
 *           description: Email único do usuário
 *           example: "joao.silva@escola.com"
 *         senha:
 *           type: string
 *           minLength: 6
 *           format: password
 *           description: Senha do usuário (mínimo 6 caracteres)
 *           example: "senha123"
 *         papel:
 *           type: string
 *           enum: [PROFESSOR, ADMIN]
 *           default: PROFESSOR
 *           description: Papel do usuário no sistema
 *           example: "PROFESSOR"
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto de perfil
 *           example: "https://example.com/foto.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *
 *     UserResponseV1:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Prof. João Silva"
 *         email:
 *           type: string
 *           example: "joao.silva@escola.com"
 *         papel:
 *           type: string
 *           example: "PROFESSOR"
 *         foto:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/foto.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "VALIDATION_ERROR"
 *             message:
 *               type: string
 *               example: "Dados de entrada inválidos"
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   message:
 *                     type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         path:
 *           type: string
 */

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Lista todos os usuários
 *     description: Retorna uma lista de todos os usuários cadastrados no sistema (v1)
 *     tags:
 *       - Usuários v1
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserResponseV1'
 *                 total:
 *                   type: integer
 *                   example: 10
 */
router.get('/', userController.getAll);

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     description: Retorna os dados de um usuário específico baseado no ID fornecido
 *     tags:
 *       - Usuários v1
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérico do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponseV1'
 *       400:
 *         description: ID inválido fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate(idParamSchema, 'params'), userController.getById);
/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Cadastra um novo usuário no sistema com os dados fornecidos
 *     tags:
 *       - Usuários v1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Nome completo do usuário
 *                 example: "Prof. Maria Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único do usuário
 *                 example: "maria.santos@escola.com"
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário (mínimo 6 caracteres)
 *                 example: "senha123"
 *               papel:
 *                 type: string
 *                 enum: [PROFESSOR, ADMIN]
 *                 default: PROFESSOR
 *                 description: Papel do usuário no sistema
 *                 example: "PROFESSOR"
 *               foto:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL da foto de perfil (opcional)
 *                 example: "https://example.com/foto.jpg"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponseV1'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já cadastrado no sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(createUserSchema, 'body'), userController.create);
/**
 * @swagger
 * /v1/users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     description: Atualiza os dados de um usuário específico. Todos os campos são opcionais.
 *     tags:
 *       - Usuários v1
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérico do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Prof. João Silva Atualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.novo@escola.com"
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 example: "novasenha123"
 *               papel:
 *                 type: string
 *                 enum: [PROFESSOR, ADMIN]
 *                 example: "ADMIN"
 *               foto:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://example.com/nova-foto.jpg"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponseV1'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update,
);
/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     summary: Remove um usuário do sistema
 *     description: Deleta permanentemente um usuário baseado no ID fornecido
 *     tags:
 *       - Usuários v1
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérico do usuário a ser removido
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuário removido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: "Prof. João Silva"
 *                     email:
 *                       type: string
 *                       example: "joao.silva@escola.com"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', validate(idParamSchema, 'params'), userController.remove);

export default router;
