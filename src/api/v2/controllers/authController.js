import authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../schemas/authValidator.js';
import { AppError } from '../../../errors/AppError.js';

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

class AuthController {
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
  async register(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = registerSchema.parse(req.body);

      // Registrar usuário
      const result = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result,
      });
    } catch (error) {
      // Erro de validação do Zod
      if (error.name === 'ZodError') {
        return next(
          new AppError(
            'Dados de entrada inválidos',
            400,
            'VALIDATION_ERROR',
            error.errors
          )
        );
      }
      next(error);
    }
  }

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
  async login(req, res, next) {
    try {
      // Validar dados de entrada
      const { email, senha } = loginSchema.parse(req.body);

      // Realizar login
      const result = await authService.login(email, senha);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(
          new AppError(
            'Dados de entrada inválidos',
            400,
            'VALIDATION_ERROR',
            error.errors
          )
        );
      }
      next(error);
    }
  }

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
  async me(req, res, next) {
    try {
      // O middleware de autenticação já populou req.user
      const user = await authService.findById(req.user.sub);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();