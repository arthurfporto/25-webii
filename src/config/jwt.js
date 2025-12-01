import jwt from 'jsonwebtoken';

/**
 * Configuração e utilitários para JSON Web Tokens
 */

// Carregar configurações do ambiente
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Validação de configuração
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente!');
}

if (JWT_SECRET.length < 32) {
  console.warn(
    'AVISO: JWT_SECRET deve ter no mínimo 32 caracteres para segurança adequada'
  );
}

/**
 * Gera um token JWT para o usuário
 *
 * @param {Object} payload - Dados do usuário para incluir no token
 * @param {number} payload.id - ID do usuário
 * @param {string} payload.email - Email do usuário
 * @param {string} payload.papel - Papel/role do usuário
 * @returns {string} Token JWT assinado
 */
export function generateToken(payload) {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.papel || payload.tipo_usuario,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'api-gerador-provas',
      audience: 'api-gerador-provas-client',
    }
  );
}

/**
 * Verifica e decodifica um token JWT
 *
 * @param {string} token - Token JWT para verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Se o token for inválido ou expirado
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'api-gerador-provas',
    audience: 'api-gerador-provas-client',
  });
}

/**
 * Decodifica um token sem verificar a assinatura
 * Útil para debugging, NÃO usar para autenticação!
 *
 * @param {string} token - Token JWT para decodificar
 * @returns {Object} Payload decodificado
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  verifyToken,
  decodeToken,
};