import bcrypt from 'bcrypt';
import prisma from '../../../config/database.js';
import { generateToken } from '../../../config/jwt.js';
import { AppError } from '../../../errors/AppError.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Serviço de Autenticação
 * Gerencia registro, login e operações relacionadas à autenticação
 */
class AuthService {
  /**
   * Registra um novo usuário
   *
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.nome - Nome completo (v1)
   * @param {string} userData.primeiro_nome - Primeiro nome (v2)
   * @param {string} userData.sobrenome - Sobrenome (v2)
   * @param {string} userData.email - Email único
   * @param {string} userData.senha - Senha em texto puro
   * @param {string} userData.papel - Papel do usuário (PROFESSOR, ADMIN)
   * @returns {Object} Usuário criado (sem senha) e token
   */
  async register(userData) {
    // 1. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError('Email já está em uso', 409, 'EMAIL_IN_USE');
    }

    // 2. Gerar hash da senha
    const hashedPassword = await bcrypt.hash(userData.senha, SALT_ROUNDS);

    // 3. Criar usuário no banco
    const user = await prisma.user.create({
      data: {
        nome:
          userData.nome ||
          `${userData.primeiro_nome} ${userData.sobrenome}`,
        primeiro_nome: userData.primeiro_nome,
        sobrenome: userData.sobrenome,
        email: userData.email,
        senha: hashedPassword,
        papel: userData.papel || 'PROFESSOR',
        tipo_usuario: (userData.papel || 'PROFESSOR').toLowerCase(),
        telefone: userData.telefone,
        foto: userData.foto,
      },
    });

    // 4. Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      papel: user.papel,
    });

    // 5. Retornar usuário sem a senha
    const { senha: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Realiza login do usuário
   *
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha em texto puro
   * @returns {Object} Usuário (sem senha) e token
   */
  async login(email, senha) {
    // 1. Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Mensagem genérica para não revelar se email existe
      throw new AppError(
        'Credenciais inválidas',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // 2. Verificar senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      throw new AppError(
        'Credenciais inválidas',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // 3. Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      papel: user.papel,
    });

    // 4. Retornar usuário sem a senha
    const { senha: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Busca usuário por ID (para uso interno)
   *
   * @param {number} id - ID do usuário
   * @returns {Object} Usuário sem senha
   */
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(
        'Usuário não encontrado',
        404,
        'USER_NOT_FOUND'
      );
    }

    const { senha: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();