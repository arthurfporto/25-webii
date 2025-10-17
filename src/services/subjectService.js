// src/services/subjectService.js
import prisma from '../config/database.js';

/**
 * Busca todas as disciplinas
 */
export const getAllSubjects = async () => {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      nome: true,
      ativa: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return subjects;
};

/**
 * Busca disciplina por ID
 */
export const getSubjectById = async (subjectId) => {
  // Validação de ID
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const subject = await prisma.subject.findUnique({
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

  return subject;
};

/**
 * Cria uma nova disciplina
 */
export const createSubject = async (subjectData) => {
  const { nome, professorId, ativa } = subjectData;

  // Validações básicas
  if (!nome || !professorId) {
    throw new Error('Nome e professorId são obrigatórios');
  }

  // Validar se professor existe
  const professorExiste = await prisma.user.findUnique({
    where: { id: parseInt(professorId) },
  });

  if (!professorExiste) {
    throw new Error('Professor não encontrado');
  }

  // Criar disciplina
  const novaSubject = await prisma.subject.create({
    data: {
      nome,
      professorId: parseInt(professorId),
      ativa: ativa !== undefined ? ativa : true,
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

  return novaSubject;
};

/**
 * Atualiza uma disciplina
 */
export const updateSubject = async (subjectId, subjectData) => {
  // Validar ID
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // Verificar se disciplina existe
  const subjectExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
  });

  if (!subjectExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  // Se está alterando professorId, validar se o novo professor existe
  if (subjectData.professorId) {
    const professorExiste = await prisma.user.findUnique({
      where: { id: parseInt(subjectData.professorId) },
    });

    if (!professorExiste) {
      throw new Error('Professor não encontrado');
    }
  }

  // Preparar dados para atualização
  const dadosAtualizacao = {};
  if (subjectData.nome) dadosAtualizacao.nome = subjectData.nome;
  if (subjectData.professorId) dadosAtualizacao.professorId = parseInt(subjectData.professorId);
  if (subjectData.ativa !== undefined) dadosAtualizacao.ativa = subjectData.ativa;

  // Atualizar
  const subjectAtualizada = await prisma.subject.update({
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

  return subjectAtualizada;
};

/**
 * Remove uma disciplina
 */
export const deleteSubject = async (subjectId) => {
  // Validar ID
  if (!subjectId || isNaN(subjectId) || subjectId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // Verificar se existe
  const subjectExistente = await prisma.subject.findUnique({
    where: { id: parseInt(subjectId) },
    select: {
      id: true,
      nome: true,
    },
  });

  if (!subjectExistente) {
    throw new Error(`Disciplina com ID ${subjectId} não encontrada`);
  }

  // Deletar
  await prisma.subject.delete({
    where: { id: parseInt(subjectId) },
  });

  return subjectExistente;
};

export default {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};