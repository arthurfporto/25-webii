// src/middlewares/auth.js
import { verifyToken } from "../config/jwt.js";
import { UnauthorizedError } from "../errors/AppError.js";

/**
 * Middleware de Autenticação JWT
 *
 * Este middleware intercepta requisições e verifica se o usuário
 * está autenticado através de um token JWT válido.
 *
 * Fluxo:
 * 1. Extrai o token do header Authorization
 * 2. Verifica se o token é válido e não expirou
 * 3. Decodifica o payload e anexa ao objeto request
 * 4. Passa para o próximo middleware/controller
 *
 * Se qualquer verificação falhar, retorna 401 Unauthorized
 */

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obter o header Authorization
    const authHeader = req.headers.authorization;

    // Verificar se o header existe
    if (!authHeader) {
      throw new UnauthorizedError("Token de autenticação não fornecido");
    }

    // 2. Verificar formato "Bearer <token>"
    // O padrão Bearer Token é definido no RFC 6750
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      throw new UnauthorizedError(
        "Formato de token inválido. Use: Bearer <token>"
      );
    }

    const [scheme, token] = parts;

    // Verificar se começa com "Bearer" (case insensitive)
    if (!/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedError(
        'Formato de token inválido. O token deve começar com "Bearer"'
      );
    }

    // 3. Verificar e decodificar o token
    try {
      const decoded = verifyToken(token);

      // 4. Anexar dados do usuário ao request
      // Isso permite que controllers acessem o usuário autenticado via req.user
      req.user = {
        id: decoded.sub, // ID do usuário (do claim 'sub')
        email: decoded.email, // Email do usuário
        role: decoded.role, // Papel/role do usuário
      };

      // Log para debugging (remover em produção)
      console.log("✅ Usuário autenticado:", {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });

      // 5. Passar para o próximo middleware/controller
      return next();
    } catch (jwtError) {
      // Tratar erros específicos do JWT
      if (jwtError.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Token expirado. Por favor, faça login novamente"
        );
      }

      if (jwtError.name === "JsonWebTokenError") {
        throw new UnauthorizedError(
          "Token inválido. Por favor, faça login novamente"
        );
      }

      if (jwtError.name === "NotBeforeError") {
        throw new UnauthorizedError("Token ainda não é válido");
      }

      // Erro desconhecido
      throw new UnauthorizedError("Falha na autenticação do token");
    }
  } catch (error) {
    // Passar erro para o middleware de tratamento de erros
    next(error);
  }
};

/**
 * Middleware opcional de autenticação
 *
 * Similar ao authMiddleware, mas não falha se o token não for fornecido.
 * Útil para rotas que funcionam para usuários autenticados e não autenticados,
 * mas com comportamento diferente.
 *
 * Exemplo: GET /posts pode retornar posts públicos para todos,
 * mas posts privados apenas para o autor autenticado.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Se não há header, continua sem autenticar
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
      req.user = null;
      return next();
    }

    const [, token] = parts;

    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      // Token inválido, mas continua sem autenticar
      req.user = null;
    }

    return next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;