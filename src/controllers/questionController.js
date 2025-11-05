// src/controllers/questionController.js
import * as questionService from '../services/questionService.js';

/**
 * Question Controller
 * Responsável por gerenciar requisições HTTP relacionadas às Questões
 * Delega a lógica de negócio para o QuestionService
 */

/**
 * GET /questions
 * Lista todas as questões
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

/**
 * GET /questions/:id
 * Busca uma questão específica por ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const questao = await questionService.getQuestionById(id);

    // Questão não encontrada
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
    // Se erro é de validação, retorna 400
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

/**
 * POST /questions
 * Cria uma nova questão
 */
export const create = async (req, res) => {
  try {
    const novaQuestao = await questionService.createQuestion(req.body);

    res.status(201).json({
      success: true,
      message: 'Questão criada com sucesso',
      data: novaQuestao,
    });
  } catch (error) {
    // Erros de validação (campos faltando ou FKs não encontradas) retornam 400
    if (
      error.message.includes('obrigatórios') ||
      error.message.includes('não encontrado') // Captura erro de FK (Autor ou Disciplina)
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

/**
 * PUT /questions/:id
 * Atualiza uma questão existente
 */
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
    // Erros de validação (FKs não encontradas)
    if (
      error.message.includes('Autor com ID') ||
      error.message.includes('Disciplina com ID')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Questão não encontrada
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

/**
 * DELETE /questions/:id
 * Remove uma questão do sistema
 */
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
    // Questão não encontrada
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