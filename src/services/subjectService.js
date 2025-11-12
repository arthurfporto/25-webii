// src/services/subjectService.js
import prisma from '../config/database.js';

/**
 * Subject Service
 * Responsável pela lógica de negócio relacionada às disciplinas
 * Contém as regras de validação, transformação de dados e acesso ao banco
 */

/**
 * Busca todas as disciplinas do sistema
 * @returns {Promise<Array>} Lista de disciplinas
 */
export const getAllSubjects = async () => {
  const disciplinas = await prisma.subject.findMany({
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  });

  return disciplinas;
};

/**
 * Busca uma disciplina por ID
 * @param {number} subjectId - ID da disciplina
 * @returns {Promise<Object|null>} Disciplina encontrada ou null
 */
export const getSubjectById = async subjectId => {
  // Validação: ID deve ser um número positivo
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const disciplina = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return disciplina;
};

/**
 * Valida os dados de uma disciplina
 * @param {Object} subjectData - Dados da disciplina
 * @throws {Error} Se validação falhar
 */
const validateSubjectData = subjectData => {
  const { nome, professorId } = subjectData;

  if (!nome) {
    throw new Error('Nome é obrigatório');
  }

  if (!professorId || isNaN(professorId) || professorId <= 0) {
    throw new Error('Professor ID é obrigatório e deve ser um número positivo');
  }
};

/**
 * Cria uma nova disciplina
 * @param {Object} subjectData - Dados da nova disciplina
 * @returns {Promise<Object>} Disciplina criada
 * @throws {Error} Se validação falhar
 */
export const createSubject = async subjectData => {
  // 1. Validar dados de entrada
  validateSubjectData(subjectData);

  // 2. Verificar se o professor existe
  const professorExiste = await prisma.user.findUnique({
    where: { id: parseInt(subjectData.professorId) },
  });

  if (!professorExiste) {
    throw new Error('Professor não encontrado');
  }

  // 3. Criar disciplina no banco
  try {
    const novaDisciplina = await prisma.subject.create({
      data: {
        nome: subjectData.nome,
        professorId: parseInt(subjectData.professorId),
        ativa: subjectData.ativa !== undefined ? subjectData.ativa : true, // Default: true
      },
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return novaDisciplina;
  } catch (error) {
    // Erro de foreign key constraint (professorId inexistente)
    if (error.code === 'P2003') {
      throw new Error('Professor não encontrado');
    }
    throw error;
  }
};

/**
 * Atualiza uma disciplina existente
 * @param {number} subjectId - ID da disciplina
 * @param {Object} subjectData - Dados para atualizar
 * @returns {Promise<Object>} Disciplina atualizada
 * @throws {Error} Se validação falhar ou disciplina não existir
 */
export const updateSubject = async (subjectId, subjectData) => {
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }
  const disciplinaExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
  });

  if (!disciplinaExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  // Verificar se o novo professor existe (se estiver sendo atualizado)
  if (subjectData.professorId) {
    const professorExiste = await prisma.user.findUnique({
      where: { id: parseInt(subjectData.professorId) },
    });

    if (!professorExiste) {
      throw new Error('Professor não encontrado');
    }
  }

  const dadosAtualizacao = {};

  if (subjectData.nome) dadosAtualizacao.nome = subjectData.nome;
  if (subjectData.ativa !== undefined)
    dadosAtualizacao.ativa = subjectData.ativa;
  if (subjectData.professorId)
    dadosAtualizacao.professorId = parseInt(subjectData.professorId);

  try {
    const disciplinaAtualizada = await prisma.subject.update({
      where: { id: parseInt(subjectId) },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return disciplinaAtualizada;
  } catch (error) {
    // Erro de foreign key constraint (professorId inexistente)
    if (error.code === 'P2003') {
      throw new Error('Professor não encontrado');
    }
    throw error;
  }
};

/**
 * Remove uma disciplina do sistema
 * @param {number} subjectId - ID da disciplina
 * @returns {Promise<Object>} Dados da disciplina removida
 * @throws {Error} Se disciplina não existir
 */
export const deleteSubject = async subjectId => {
  // 1. Validar ID
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // 2. Verificar se disciplina existe
  const disciplinaExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
    },
  });

  if (!disciplinaExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  // 3. Remover do banco
  await prisma.subject.delete({
    where: { id: parseInt(subjectId) },
  });

  // 4. Retornar dados da disciplina removida (para confirmação)
  return disciplinaExistente;
};

// Exportações nomeadas para facilitar testes e imports
export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  deleteSubject,
  updateSubject,
};
