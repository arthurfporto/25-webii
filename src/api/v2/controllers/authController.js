import authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../schemas/authValidator.js';
import { AppError } from '../../../errors/AppError.js';

class AuthController {

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

  async me(req, res, next) {
    try {
      // O middleware de autenticação já populou req.user
      const user = await authService.findById(req.user.id);

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