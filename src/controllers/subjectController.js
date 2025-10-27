// src/controllers/subjectController.js
import * as subjectService from '../services/subjectService.js';

/**
 * Subject Controller
 * Responsável por gerenciar requisições HTTP relacionadas às disciplinas
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

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplina = await subjectService.getSubjectById(id);

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

export const create = async (req, res) => {
  try {
    const novaDisciplina = await subjectService.createSubject(req.body);
    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      data: novaDisciplina,
    });
  } catch (error) {
    if (
      error.message.includes('obrigatórios') ||
      error.message.includes('já cadastrado') ||
      error.message.includes('não encontrado') ||
      error.message.includes('Professor não encontrado')
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
    if (
      error.message.includes('já está em uso') ||
      error.message.includes('não encontrado') ||
      error.message.includes('Professor não encontrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('não encontrada')) {
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
