// src/middlewares/authorize.js
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

/**
 * Middleware de Autorização baseado em Roles (RBAC)
 *
 * Este middleware verifica se o usuário autenticado possui um dos
 * papéis (roles) necessários para acessar o recurso.
 *
 * IMPORTANTE: Este middleware DEVE ser usado APÓS o authMiddleware,
 * pois depende de req.user estar populado.
 *
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware Express
 *
 * @example
 * // Apenas ADMIN pode acessar
 * router.delete('/users/:id', authMiddleware, authorize(['ADMIN']), controller);
 *
 * @example
 * // ADMIN ou PROFESSOR podem acessar
 * router.get('/questions', authMiddleware, authorize(['ADMIN', 'PROFESSOR']), controller);
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // 1. Verificar se o usuário está autenticado
      // (authMiddleware deve ter sido executado antes)
      if (!req.user) {
        throw new UnauthorizedError(
          'Usuário não autenticado. Faça login para continuar.'
        );
      }

      // 2. Se não há roles requeridas, permitir acesso
      // (útil para rotas que só requerem autenticação)
      if (allowedRoles.length === 0) {
        return next();
      }

      // 3. Obter o papel do usuário
      const userRole = req.user.role;

      if (!userRole) {
        throw new ForbiddenError(
          'Papel do usuário não definido. Entre em contato com o administrador.'
        );
      }

      // 4. Normalizar para comparação (case-insensitive)
      const normalizedUserRole = userRole.toUpperCase();
      const normalizedAllowedRoles = allowedRoles.map(role =>
        role.toUpperCase()
      );

      // 5. Verificar se o papel do usuário está na lista de permitidos
      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        console.log('❌ Acesso negado:', {
          userId: req.user.id,
          userRole: normalizedUserRole,
          requiredRoles: normalizedAllowedRoles,
          path: req.path,
          method: req.method,
        });

        throw new ForbiddenError(
          `Acesso negado. Esta ação requer um dos seguintes papéis: ${allowedRoles.join(', ')}`
        );
      }

      // 6. Usuário autorizado - prosseguir
      console.log('✅ Acesso autorizado:', {
        userId: req.user.id,
        userRole: normalizedUserRole,
        path: req.path,
      });

      next();

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware que verifica se o usuário é ADMIN
 * Atalho para authorize(['ADMIN'])
 */
export const isAdmin = authorize(['ADMIN']);

/**
 * Middleware que verifica se o usuário é PROFESSOR ou ADMIN
 * Atalho para authorize(['PROFESSOR', 'ADMIN'])
 */
export const isProfessorOrAdmin = authorize(['PROFESSOR', 'ADMIN']);

/**
 * Middleware que verifica se o usuário está acessando seu próprio recurso
 * ou se é ADMIN (que pode acessar qualquer recurso)
 *
 * @param {string} paramName - Nome do parâmetro de rota que contém o ID do recurso
 * @returns {Function} Middleware Express
 *
 * @example
 * // Usuário pode editar apenas seu próprio perfil, ADMIN pode editar qualquer um
 * router.put('/users/:id', authMiddleware, isOwnerOrAdmin('id'), controller);
 */
export const isOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const resourceId = parseInt(req.params[paramName]);
      const userId = req.user.id;
      const userRole = req.user.role?.toUpperCase();

      // ADMIN pode acessar qualquer recurso
      if (userRole === 'ADMIN') {
        console.log('✅ Acesso ADMIN permitido');
        return next();
      }

      // Usuário comum só pode acessar seu próprio recurso
      if (resourceId === userId) {
        console.log('✅ Acesso ao próprio recurso permitido');
        return next();
      }

      // Tentando acessar recurso de outro usuário
      console.log('❌ Tentativa de acesso a recurso de outro usuário:', {
        userId,
        resourceId,
        userRole,
      });

      throw new ForbiddenError(
        'Você não tem permissão para acessar este recurso'
      );

    } catch (error) {
      next(error);
    }
  };
};

export default authorize;