import jwt from "jsonwebtoken";

/**
 * Configuração e utilitários para JSON Web Tokens
 *
 * O JWT é uma forma de transmitir informações de forma segura entre partes
 * como um objeto JSON. A informação pode ser verificada e confiável porque
 * é digitalmente assinada.
 */

// Carregar configurações do ambiente
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Validação de configuração no startup
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido nas variáveis de ambiente!");
}

if (JWT_SECRET.length < 32) {
  console.warn(
    "⚠️  AVISO: JWT_SECRET deve ter no mínimo 32 caracteres para segurança adequada"
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
      sub: payload.id, // Subject - ID único do usuário
      email: payload.email, // Email para identificação
      role: payload.papel || payload.tipo_usuario, // Papel para autorização
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN, // Quando expira
      issuer: "api-gerador-provas", // Quem emitiu
      audience: "api-gerador-provas-client", // Para quem foi emitido
    }
  );
}

/**
 * Verifica e decodifica um token JWT
 *
 * @param {string} token - Token JWT para verificar
 * @returns {Object} Payload decodificado
 * @throws {JsonWebTokenError} Se o token for inválido
 * @throws {TokenExpiredError} Se o token estiver expirado
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "api-gerador-provas",
    audience: "api-gerador-provas-client",
  });
}

/**
 * Decodifica um token sem verificar a assinatura
 * ⚠️  APENAS para debugging, NUNCA usar para autenticação!
 *
 * @param {string} token - Token JWT para decodificar
 * @returns {Object} Payload decodificado (sem verificação)
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  verifyToken,
  decodeToken,
};