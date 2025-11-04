// src/api/v2/services/userService.js
import prisma from '../../../config/database.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../errors/AppError.js';

/**
 * User Service v2
 * MUDANÇAS DA V2:
 * - Usa primeiro_nome e sobrenome separados
 * - Usa tipo_usuario (lowercase) ao invés de papel
 * - Adiciona campo telefone
 * - Mantém compatibilidade com banco (popula campos v1 também)
 */

/**
 * Busca todos os usuários (formato v2)
 * @returns {Promise<Array>} Lista de usuários no formato v2
 */
export const getAllUsers = async () => {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      primeiro_nome: true,
      sobrenome: true,
      email: true,
      tipo_usuario: true,
      telefone: true,
      foto: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return usuarios;
};

/**
 * Busca um usuário por ID (formato v2)
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Usuário no formato v2
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 */
export const getUserById = async userId => {
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  const usuario = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      primeiro_nome: true,
      sobrenome: true,
      email: true,
      tipo_usuario: true,
      telefone: true,
      foto: true,
      createdAt: true,
    },
  });

  if (!usuario) {
    throw new NotFoundError(`Usuário com ID ${userId} não encontrado`, 'User');
  }

  return usuario;
};

/**
 * Verifica se um email já está cadastrado
 * @param {string} email - Email a ser verificado
 * @returns {Promise<boolean>} True se email existe
 */
const emailExists = async email => {
  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  return !!usuario;
};

/**
 * Cria um novo usuário (formato v2)
 * @param {Object} userData - Dados do novo usuário
 * @returns {Promise<Object>} Usuário criado no formato v2
 * @throws {ConflictError} Se email já existir
 */
export const createUser = async userData => {
  // Verificar se email já existe
  const emailJaExiste = await emailExists(userData.email);
  if (emailJaExiste) {
    throw new ConflictError('Email já cadastrado no sistema', 'email');
  }

  // Preparar dados para criação
  // IMPORTANTE: Populamos tanto campos v1 quanto v2 para compatibilidade
  const dadosUsuario = {
    // Campos v2 (novos)
    primeiro_nome: userData.primeiro_nome,
    sobrenome: userData.sobrenome,
    tipo_usuario: userData.tipo_usuario || 'professor',
    telefone: userData.telefone || null,

    // Campos v1 (mantidos para compatibilidade)
    nome: `${userData.primeiro_nome} ${userData.sobrenome}`.trim(),
    papel: userData.tipo_usuario === 'admin' ? 'ADMIN' : 'PROFESSOR',

    // Campos comuns
    email: userData.email,
    senha: userData.senha, // TODO: Hash da senha
    foto: userData.foto || null,
  };

  // Criar usuário no banco
  const novoUsuario = await prisma.user.create({
    data: dadosUsuario,
    select: {
      id: true,
      primeiro_nome: true,
      sobrenome: true,
      email: true,
      tipo_usuario: true,
      telefone: true,
      foto: true,
      createdAt: true,
    },
  });

  return novoUsuario;
};

/**
 * Atualiza um usuário existente (formato v2)
 * @param {number} userId - ID do usuário
 * @param {Object} userData - Dados para atualizar
 * @returns {Promise<Object>} Usuário atualizado no formato v2
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 * @throws {ConflictError} Se email já estiver em uso
 */
export const updateUser = async (userId, userData) => {
  // Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  // Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!usuarioExistente) {
    throw new NotFoundError(`Usuário com ID ${userId} não encontrado`, 'User');
  }

  // Se email está sendo alterado, verificar unicidade
  if (userData.email && userData.email !== usuarioExistente.email) {
    const emailJaExiste = await emailExists(userData.email);
    if (emailJaExiste) {
      throw new ConflictError(
        'Email já está em uso por outro usuário',
        'email',
      );
    }
  }

  // Preparar dados para atualização
  const dadosAtualizacao = {};

  // Campos v2
  if (userData.primeiro_nome) {
    dadosAtualizacao.primeiro_nome = userData.primeiro_nome;
  }
  if (userData.sobrenome) {
    dadosAtualizacao.sobrenome = userData.sobrenome;
  }
  if (userData.tipo_usuario) {
    dadosAtualizacao.tipo_usuario = userData.tipo_usuario;
  }
  if (userData.telefone !== undefined) {
    dadosAtualizacao.telefone = userData.telefone;
  }

  // Atualizar campos v1 para manter compatibilidade
  if (userData.primeiro_nome || userData.sobrenome) {
    const primeiroNome =
      userData.primeiro_nome || usuarioExistente.primeiro_nome;
    const sobrenome = userData.sobrenome || usuarioExistente.sobrenome;
    dadosAtualizacao.nome = `${primeiroNome} ${sobrenome}`.trim();
  }
  if (userData.tipo_usuario) {
    dadosAtualizacao.papel =
      userData.tipo_usuario === 'admin' ? 'ADMIN' : 'PROFESSOR';
  }

  // Campos comuns
  if (userData.email) dadosAtualizacao.email = userData.email;
  if (userData.senha) dadosAtualizacao.senha = userData.senha; // TODO: Hash
  if (userData.foto !== undefined) dadosAtualizacao.foto = userData.foto;

  // Atualizar no banco
  const usuarioAtualizado = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: dadosAtualizacao,
    select: {
      id: true,
      primeiro_nome: true,
      sobrenome: true,
      email: true,
      tipo_usuario: true,
      telefone: true,
      foto: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return usuarioAtualizado;
};

/**
 * Remove um usuário do sistema
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Dados do usuário removido (formato v2)
 * @throws {ValidationError} Se ID for inválido
 * @throws {NotFoundError} Se usuário não existir
 */
export const deleteUser = async userId => {
  // Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new ValidationError('ID inválido. Deve ser um número positivo');
  }

  // Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      primeiro_nome: true,
      sobrenome: true,
      email: true,
    },
  });

  if (!usuarioExistente) {
    throw new NotFoundError(`Usuário com ID ${userId} não encontrado`, 'User');
  }

  // Remover do banco
  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });

  return usuarioExistente;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
