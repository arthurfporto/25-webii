// src/services/questionService.js
import prisma from '../config/database.js';

/**
 * Question Service
 * Responsável pela lógica de negócio relacionada às questões
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
      createdAt: 'desc',
    },
  });
  return questoes;
};

export const getQuestionById = async questionId => {
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

const enunciadoExists = async enunciado => {
  const questao = await prisma.question.findFirst({
    where: { enunciado },
  });
  return !!questao;
};

const disciplinaExists = async disciplinaId => {
  const disciplina = await prisma.subject.findUnique({
    where: { id: disciplinaId },
  });
  return !!disciplina;
};

const autorExists = async autorId => {
  const autor = await prisma.user.findUnique({
    where: { id: autorId },
  });
  return !!autor;
};

const validateQuestionData = questionData => {
  const { enunciado, dificuldade, disciplinaId, autorId } = questionData;

  if (!enunciado || !dificuldade || !disciplinaId || !autorId) {
    throw new Error(
      'Enunciado, dificuldade, id da disciplina e id do autor são obrigatórios',
    );
  }

  // ✅ Validação adicional para dificuldade
  if (dificuldade < 1 || dificuldade > 5) {
    throw new Error('Dificuldade deve ser entre 1 e 5');
  }
};

export const createQuestion = async questionData => {
  validateQuestionData(questionData);

  const enunciadoJaExiste = await enunciadoExists(questionData.enunciado);
  if (enunciadoJaExiste) {
    throw new Error('Enunciado já cadastrado no sistema');
  }

  const disciplinaExiste = await disciplinaExists(questionData.disciplinaId);
  if (!disciplinaExiste) {
    throw new Error('Disciplina não encontrada');
  }

  // Verificar se autor existe
  const autorExiste = await autorExists(questionData.autorId);
  if (!autorExiste) {
    throw new Error('Autor não encontrado');
  }

  const novaQuestao = await prisma.question.create({
    data: {
      enunciado: questionData.enunciado,
      dificuldade: questionData.dificuldade,
      respostaCorreta: questionData.respostaCorreta,
      disciplinaId: questionData.disciplinaId,
      autorId: questionData.autorId,
      ativa: questionData.ativa ?? true, // default true
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
};

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

  // ✅ VALIDAÇÃO NOVA: Verificar se disciplina existe (se foi fornecida)
  if (questionData.disciplinaId) {
    const disciplinaExiste = await disciplinaExists(questionData.disciplinaId);
    if (!disciplinaExiste) {
      throw new Error('Disciplina não encontrada');
    }
  }

  // ✅ VALIDAÇÃO NOVA: Verificar se autor existe (se foi fornecido)
  if (questionData.autorId) {
    const autorExiste = await autorExists(questionData.autorId);
    if (!autorExiste) {
      throw new Error('Autor não encontrado');
    }
  }

  if (
    questionData.enunciado &&
    questionData.enunciado !== questaoExistente.enunciado
  ) {
    const enunciadoJaExiste = await enunciadoExists(questionData.enunciado);
    if (enunciadoJaExiste) {
      throw new Error('Enunciado já está em uso por outra questão');
    }
  }

  // ✅ Validação de dificuldade na atualização também
  if (
    questionData.dificuldade &&
    (questionData.dificuldade < 1 || questionData.dificuldade > 5)
  ) {
    throw new Error('Dificuldade deve ser entre 1 e 5');
  }

  const dadosAtualizacao = {};
  if (questionData.enunciado)
    dadosAtualizacao.enunciado = questionData.enunciado;
  if (questionData.dificuldade)
    dadosAtualizacao.dificuldade = questionData.dificuldade;
  if (questionData.respostaCorreta)
    dadosAtualizacao.respostaCorreta = questionData.respostaCorreta;
  if (questionData.disciplinaId)
    dadosAtualizacao.disciplinaId = questionData.disciplinaId;
  if (questionData.autorId) dadosAtualizacao.autorId = questionData.autorId;
  if (questionData.ativa !== undefined)
    dadosAtualizacao.ativa = questionData.ativa;

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
};

export const deleteQuestion = async questionId => {
  if (!questionId || isNaN(questionId) || questionId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const questaoExistente = await prisma.question.findUnique({
    where: { id: parseInt(questionId) },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      disciplinaId: true,
      autorId: true,
    },
  });

  if (!questaoExistente) {
    throw new Error(`Questão com ID ${questionId} não encontrada`);
  }

  await prisma.question.delete({
    where: { id: parseInt(questionId) },
  });

  return questaoExistente;
};

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
  updateQuestion,
};
