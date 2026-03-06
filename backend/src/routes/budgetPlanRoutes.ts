/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Router } from 'express';
import { getBudgetPlans, createBudgetPlan, deleteBudgetPlan } from '../controllers/budgetPlanController';

const router = Router();

router.get('/', getBudgetPlans);
router.post('/', createBudgetPlan); // acts as upsert
router.delete('/:id', deleteBudgetPlan);

export default router;
