// src/controllers/subjectController.js
import * as subjectService from '../services/subjectService.js';

/**
 * GET /subjects
 */
export const getAll = async (req, res) => {
  try {
    const subjects = await subjectService.getAllSubjects();

    res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
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
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Disciplina com ID ${id} não encontrada`,
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
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
 */
export const create = async (req, res) => {
  try {
    const novaSubject = await subjectService.createSubject(req.body);

    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      data: novaSubject,
    });
  } catch (error) {
    if (
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
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectAtualizada = await subjectService.updateSubject(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Disciplina atualizada com sucesso',
      data: subjectAtualizada,
    });
  } catch (error) {
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('inválido')) {
      return res.status(400).json({
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
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectRemovida = await subjectService.deleteSubject(id);

    res.status(200).json({
      success: true,
      message: 'Disciplina removida com sucesso',
      data: subjectRemovida,
    });
  } catch (error) {
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