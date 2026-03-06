/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Router } from 'express';
import { getExpenses, createExpense, deleteExpense, updateExpense } from '../controllers/expenseController';

const router = Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
