// src/routes/subjectRoutes.js
import express from 'express';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

/**
 * Rotas de Disciplinas
 * Base URL: /subjects
 */

// CREATE - Criar nova disciplina
router.post('/', subjectController.create);

// READ - Listar todas as disciplinas
router.get('/', subjectController.getAll);

// READ - Buscar disciplina por ID
router.get('/:id', subjectController.getById);

// UPDATE - Atualizar disciplina
router.put('/:id', subjectController.update);

// DELETE - Remover disciplina
router.delete('/:id', subjectController.remove);

export default router;
