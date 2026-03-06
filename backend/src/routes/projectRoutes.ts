/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Router } from 'express';
import { getProjects, getProjectById, createProject, deleteProject, updateProject } from '../controllers/projectController';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
