// src/controllers/questionController.js
import * as questionService from '../services/questionService.js';

/**
 * Question Controller
 * Responsável por gerenciar requisições HTTP relacionadas às questões
 */

export const getAll = async (req, res) => {
  try {
    const questoes = await questionService.getAllQuestions();
    res.status(200).json({
      success: true,
      data: questoes,
      total: questoes.length,
    });
  } catch (error) {
    console.error('Erro ao listar questões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar questões',
      error: error.message,
    });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const questao = await questionService.getQuestionById(id);

    if (!questao) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${id} não encontrada`,
      });
    }

    res.status(200).json({
      success: true,
      data: questao,
    });
  } catch (error) {
    if (error.message.includes('inválido')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao buscar questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar questão',
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const novaQuestao = await questionService.createQuestion(req.body);
    res.status(201).json({
      success: true,
      message: 'Questão criada com sucesso',
      data: novaQuestao,
    });
  } catch (error) {
    if (
      error.message.includes('obrigatórios') ||
      error.message.includes('já cadastrado') ||
      error.message.includes('Dificuldade deve ser') ||
      error.message.includes('não encontrada') ||
      error.message.includes('não encontrado') ||
      error.message.includes('Disciplina não encontrada') ||
      error.message.includes('Autor não encontrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao criar questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar questão',
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const questaoAtualizada = await questionService.updateQuestion(
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Questão atualizada com sucesso',
      data: questaoAtualizada,
    });
  } catch (error) {
    if (
      error.message.includes('já está em uso') ||
      error.message.includes('Dificuldade deve ser') ||
      error.message.includes('Disciplina não encontrada') ||
      error.message.includes('Autor não encontrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ✅ TRATAMENTO PARA ERRO DE FOREIGN KEY DO PRISMA
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Disciplina ou autor não encontrado',
      });
    }

    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao atualizar questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar questão',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const questaoRemovida = await questionService.deleteQuestion(id);

    res.status(200).json({
      success: true,
      message: 'Questão removida com sucesso',
      data: questaoRemovida,
    });
  } catch (error) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao remover questão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover questão',
      error: error.message,
    });
  }
};
