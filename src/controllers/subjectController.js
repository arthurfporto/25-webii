// src/controllers/subjectController.js
import * as subjectService from '../services/subjectService.js';

/**
 * Subject Controller
 * Responsável por gerenciar requisições HTTP relacionadas às disciplinas
 * Delega a lógica de negócio para o SubjectService
 */

/**
 * GET /subjects
 * Lista todas as disciplinas
 */
export const getAll = async (req, res) => {
  try {
    const disciplinas = await subjectService.getAllSubjects();

    res.status(200).json({
      success: true,
      data: disciplinas,
      total: disciplinas.length,
    });
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar disciplinas',
      error: error.message,
    });
  }
};

/**
 * GET /subjects/:id
 * Busca uma disciplina específica por ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplina = await subjectService.getSubjectById(id);

    // Disciplina não encontrada
    if (!disciplina) {
      return res.status(404).json({
        success: false,
        message: `Disciplina com ID ${id} não encontrada`,
      });
    }

    res.status(200).json({
      success: true,
      data: disciplina,
    });
  } catch (error) {
    // Se erro é de validação, retorna 400
    if (error.message.includes('inválido')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar disciplina',
      error: error.message,
    });
  }
};

/**
 * POST /subjects
 * Cria uma nova disciplina
 */
export const create = async (req, res) => {
  try {
    const novaDisciplina = await subjectService.createSubject(req.body);

    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      data: novaDisciplina,
    });
  } catch (error) {
    // Erros de validação retornam 400
    if (
      error.message.includes('obrigatório') ||
      error.message.includes('obrigatórios') ||
      error.message.includes('não encontrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar disciplina',
      error: error.message,
    });
  }
};

/**
 * PUT /subjects/:id
 * Atualiza uma disciplina existente
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplinaAtualizada = await subjectService.updateSubject(
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Disciplina atualizada com sucesso',
      data: disciplinaAtualizada,
    });
  } catch (error) {
    // Erros de validação
    if (
      error.message.includes('inválido') ||
      error.message.includes('não encontrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes('Disciplina com ID') &&
      error.message.includes('não encontrada')
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar disciplina',
      error: error.message,
    });
  }
};

/**
 * DELETE /subjects/:id
 * Remove uma disciplina do sistema
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplinaRemovida = await subjectService.deleteSubject(id);

    res.status(200).json({
      success: true,
      message: 'Disciplina removida com sucesso',
      data: disciplinaRemovida,
    });
  } catch (error) {
    // Disciplina não encontrada
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao remover disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover disciplina',
      error: error.message,
    });
  }
};
