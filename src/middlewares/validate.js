// src/middlewares/validate.js
import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware factory para validação com Zod
 * Cria um middleware que valida dados contra um schema Zod
 *
 * @param {Object} schema - Schema Zod para validação
 * @param {string} source - De onde vem os dados ('body', 'params', 'query')
 * @returns {Function} Middleware Express
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Dados a validar (body, query, params)
      const dataToValidate = req[source];

      // safeParse retorna { success, data } OU { success, error }
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        // Cria lista detalhada de erros
        const details = result.error.errors?.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })) || [];

        // Lança SEMPRE um ValidationError customizado
        throw new ValidationError('Dados de entrada inválidos', details);
      }

      // Se passou, substitui os dados por versão validada
      req[source] = result.data;
      next();
    } catch (error) {
      // Se o erro for do Zod (casos raros fora do safeParse)
      if (error.name === 'ZodError' && Array.isArray(error.errors)) {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new ValidationError('Dados de entrada inválidos', details));
      }

      // Se for outro erro qualquer, repassa pro handler
      next(error);
    }
  };
};

export default validate;
