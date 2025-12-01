import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para registro e login de usuários
 */

// POST /v2/auth/register - Registrar novo usuário
router.post('/register', authController.register.bind(authController));

// POST /v2/auth/login - Login de usuário
router.post('/login', authController.login.bind(authController));

// GET /v2/auth/me - Dados do usuário autenticado (será protegida na próxima aula)
// router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;