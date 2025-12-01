import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo (alternativa a primeiro_nome + sobrenome)
 *           example: "João Silva"
 *         primeiro_nome:
 *           type: string
 *           description: Primeiro nome do usuário
 *           example: "João"
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do usuário
 *           example: "Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@escola.com"
 *         senha:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "Senha123"
 *         papel:
 *           type: string
 *           enum: [PROFESSOR, ADMIN]
 *           default: PROFESSOR
 *         telefone:
 *           type: string
 *           example: "(11) 98765-4321"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "joao@escola.com"
 *         senha:
 *           type: string
 *           format: password
 *           example: "Senha123"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 papel:
 *                   type: string
 *             token:
 *               type: string
 *               description: JWT token para autenticação
 */

/**
   * @swagger
   * /v2/auth/register:
   *   post:
   *     summary: Registra um novo usuário
   *     description: Cria uma nova conta de usuário e retorna um token JWT
   *     tags:
   *       - Autenticação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Email já está em uso
   */
router.post('/register', authController.register.bind(authController));


/**
 * @swagger
 * /v2/auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     description: Autentica o usuário e retorna um token JWT
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * /v2/auth/me:
 *   get:
 *     summary: Retorna dados do usuário autenticado
 *     description: Retorna os dados do usuário com base no token JWT
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token inválido ou não fornecido
 */
// GET /v2/auth/me - Dados do usuário autenticado (será protegida na próxima aula)
// router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;