// src/routes/subjectRoutes.js
import express from 'express';
import * as subjectController from '../controllers/subjectController.js';

const router = express.Router();

// CREATE
router.post('/', subjectController.create);

// READ
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

// UPDATE
router.put('/:id', subjectController.update);

// DELETE
router.delete('/:id', subjectController.remove);

export default router;