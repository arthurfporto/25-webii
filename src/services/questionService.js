// src/services/questionService.js
import prisma from '../config/database.js';

/**
 * Question Service
 * Responsável pela lógica de negócio relacionada às questões
 * Contém as regras de validação, transformação de dados e acesso ao banco
 */

/**
 * Busca todas as questões do sistema
 * @returns {Promise<Array>} Lista de questões
 */
export const getAllQuestions = async () => {
  const questoes = await prisma.question.findMany({
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  });

  return questoes;
};

/**
 * Busca uma questão por ID
 * @param {number} questionId - ID da questão
 * @returns {Promise<Object|null>} Questão encontrada ou null
 */
export const getQuestionById = async questionId => {
  // Validação: ID deve ser um número positivo
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const questao = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,
      autorId: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return questao;
};

/**
 * Valida os dados de uma questão
 * @param {Object} questionData - Dados da questão
 * @throws {Error} Se validação falhar
 */
const validateQuestionData = questionData => {
  const { enunciado, dificuldade, disciplinaId, autorId } = questionData;

  if (!enunciado) {
    throw new Error('Enunciado é obrigatório');
  }

  if (!dificuldade || isNaN(dificuldade) || dificuldade <= 0) {
    throw new Error('Dificuldade é obrigatório e deve ser um número positivo');
  }

  if (!disciplinaId || isNaN(disciplinaId) || disciplinaId <= 0) {
    throw new Error(
      'Disciplina ID é obrigatório e deve ser um número positivo',
    );
  }

  if (!autorId || isNaN(autorId) || autorId <= 0) {
    throw new Error('Autor ID é obrigatório e deve ser um número positivo');
  }
};

/**
 * Cria uma nova questão
 * @param {Object} questionData - Dados da nova questão
 * @returns {Promise<Object>} Questão criada
 * @throws {Error} Se validação falhar
 */
export const createQuestion = async questionData => {
  // 1. Validar dados de entrada
  validateQuestionData(questionData);

  // 2. Criar questão no banco
  try {
    const novaQuestao = await prisma.question.create({
      data: {
        enunciado: questionData.enunciado,
        dificuldade: parseInt(questionData.dificuldade),
        respostaCorreta: questionData.respostaCorreta || null,
        disciplinaId: parseInt(questionData.disciplinaId),
        autorId: parseInt(questionData.autorId),
        ativa: questionData.ativa !== undefined ? questionData.ativa : true, // Default: true
      },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        disciplinaId: true,
        autorId: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return novaQuestao;
  } catch (error) {
    // Erro de foreign key constraint (disciplinaId ou autorId inexistente)
    if (error.code === 'P2003') {
      if (error.meta?.constraint === 'questions_disciplina_id_fkey') {
        throw new Error('Disciplina não encontrada');
      }
      if (error.meta?.constraint === 'questions_autor_id_fkey') {
        throw new Error('Autor não encontrado');
      }
    }
    throw error;
  }
};

/**
 * Atualiza uma questão existente
 * @param {number} questionId - ID da questão
 * @param {Object} questionData - Dados para atualizar
 * @returns {Promise<Object>} Questão atualizada
 * @throws {Error} Se validação falhar ou questão não existir
 */
export const updateQuestion = async (questionId, questionData) => {
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }
  const questaoExistente = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
  });

  if (!questaoExistente) {
    throw new Error(`Questão com ID ${questionId} não encontrada`);
  }

  const dadosAtualizacao = {};

  if (questionData.enunciado)
    dadosAtualizacao.enunciado = questionData.enunciado;
  if (questionData.dificuldade)
    dadosAtualizacao.dificuldade = parseInt(questionData.dificuldade);
  if (questionData.respostaCorreta !== undefined)
    dadosAtualizacao.respostaCorreta = questionData.respostaCorreta;
  if (questionData.disciplinaId)
    dadosAtualizacao.disciplinaId = parseInt(questionData.disciplinaId);
  if (questionData.autorId)
    dadosAtualizacao.autorId = parseInt(questionData.autorId);
  if (questionData.ativa !== undefined)
    dadosAtualizacao.ativa = questionData.ativa;

  try {
    const questaoAtualizada = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: dadosAtualizacao,
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        disciplinaId: true,
        autorId: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return questaoAtualizada;
  } catch (error) {
    // Erro de foreign key constraint (disciplinaId ou autorId inexistente)
    if (error.code === 'P2003') {
      if (error.meta?.constraint === 'questions_disciplina_id_fkey') {
        throw new Error('Disciplina não encontrada');
      }
      if (error.meta?.constraint === 'questions_autor_id_fkey') {
        throw new Error('Autor não encontrado');
      }
    }
    throw error;
  }
};

/**
 * Remove uma questão do sistema
 * @param {number} questionId - ID da questão
 * @returns {Promise<Object>} Dados da questão removida
 * @throws {Error} Se questão não existir
 */
export const deleteQuestion = async questionId => {
  // 1. Validar ID
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // 2. Verificar se questão existe
  const questaoExistente = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      disciplinaId: true,
      autorId: true,
    },
  });

  if (!questaoExistente) {
    throw new Error(`Questão com ID ${questionId} não encontrada`);
  }

  // 3. Remover do banco
  await prisma.question.delete({
    where: { id: parseInt(questionId) },
  });

  // 4. Retornar dados da questão removida (para confirmação)
  return questaoExistente;
};

// Exportações nomeadas para facilitar testes e imports
export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
  updateQuestion,
};
