// src/api/v2/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import validate from '../../../middlewares/validate.js';
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
 *         senha:
 *           type: string
 *           minLength: 6
 *           format: password
 *           description: Senha do usuário (mínimo 6 caracteres)
 *           example: "senha123"
 *         tipo_usuario:
 *           type: string
 *           enum: [professor, admin]
 *           default: professor
 *           description: Tipo de usuário no sistema (lowercase na v2)
 *           example: "professor"
 *         telefone:
 *           type: string
 *           pattern: '^\d{10,11}$'
 *           nullable: true
 *           description: Telefone com 10 ou 11 dígitos
 *           example: "11987654321"
 *         foto:
 *           type: string
 *           format: uri
 *           nullable: true
 *           description: URL da foto de perfil (armazenada no Uploadcare)
 *           example: "https://ucarecdn.com/uuid/"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *
 *     UserResponseV2:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         primeiro_nome:
 *           type: string
 *           example: "João"
 *         sobrenome:
 *           type: string
 *           example: "Silva"
 *         email:
 *           type: string
 *           example: "joao.silva@escola.com"
 *         tipo_usuario:
 *           type: string
 *           example: "professor"
 *         telefone:
 *           type: string
 *           nullable: true
 *           example: "11987654321"
 *         foto:
 *           type: string
 *           nullable: true
 *           example: "https://ucarecdn.com/uuid/"
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /v2/users:
 *   get:
 *     summary: Lista todos os usuários (v2)
 *     description: Retorna lista de usuários no formato v2 (primeiro_nome e sobrenome separados)
 *     tags:
 *       - Usuários v2
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
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
 *                     $ref: '#/components/schemas/UserResponseV2'
 *                 total:
 *                   type: integer
 *                   example: 10
 *                 version:
 *                   type: string
 *                   example: "v2"
 */
router.get('/', userController.getAll);
/**
 * @swagger
 * /v2/users/{id}:
 *   get:
 *     summary: Busca um usuário por ID (v2)
 *     description: Retorna os dados de um usuário no formato v2
 *     tags:
 *       - Usuários v2
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
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponseV2'
 *                 version:
 *                   type: string
 *                   example: "v2"
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
 * /v2/users:
 *   post:
 *     summary: Cria um novo usuário com upload de foto (v2)
 *     description: |
 *       Cadastra usuário com suporte a upload de foto de perfil.
 *
 *       **IMPORTANTE:** Usa `multipart/form-data` para permitir upload de arquivos.
 *
 *       **Novidades da v2:**
 *       - Primeiro nome e sobrenome separados
 *       - tipo_usuario em lowercase (professor, admin)
 *       - Campo telefone
 *       - Upload direto de foto (integrado com Uploadcare)
 *     tags:
 *       - Usuários v2
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
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Primeiro nome do usuário
 *                 example: "Maria"
 *               sobrenome:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Sobrenome do usuário
 *                 example: "Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único do usuário
 *                 example: "maria.santos@escola.com"
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário
 *                 example: "senha123"
 *               tipo_usuario:
 *                 type: string
 *                 enum: [professor, admin]
 *                 default: professor
 *                 description: Tipo de usuário (lowercase)
 *                 example: "professor"
 *               telefone:
 *                 type: string
 *                 pattern: '^\d{10,11}$'
 *                 description: Telefone (opcional)
 *                 example: "11987654321"
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPG, PNG, GIF, WebP - máx 5MB)
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
 *                   $ref: '#/components/schemas/UserResponseV2'
 *                 version:
 *                   type: string
 *                   example: "v2"
 *       400:
 *         description: Dados inválidos ou arquivo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  upload.single('foto'),
  validate(createUserSchema, 'body'),
  userController.create,
);
/**
 * @swagger
 * /v2/users/{id}:
 *   put:
 *     summary: Atualiza um usuário com upload de foto (v2)
 *     description: Atualiza dados do usuário. Todos os campos opcionais. Usa multipart/form-data.
 *     tags:
 *       - Usuários v2
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               primeiro_nome:
 *                 type: string
 *                 example: "João"
 *               sobrenome:
 *                 type: string
 *                 example: "Silva"
 *               email:
 *                 type: string
 *                 example: "joao@escola.com"
 *               senha:
 *                 type: string
 *                 example: "novasenha123"
 *               tipo_usuario:
 *                 type: string
 *                 enum: [professor, admin]
 *                 example: "admin"
 *               telefone:
 *                 type: string
 *                 example: "11999887766"
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Nova foto (opcional)
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponseV2'
 *                 version:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  upload.single('foto'),
  validate(updateUserSchema, 'body'),
  userController.update,
);
/**
 * @swagger
 * /v2/users/{id}:
 *   delete:
 *     summary: Remove um usuário (v2)
 *     description: Deleta permanentemente um usuário
 *     tags:
 *       - Usuários v2
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 version:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', validate(idParamSchema, 'params'), userController.remove);

export default router;
