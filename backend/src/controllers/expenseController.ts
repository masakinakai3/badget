/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Request, Response } from 'express';
import db from '../config/database';

export const getExpenses = (req: Request, res: Response): void => {
    const { projectId } = req.query;
    const sql = projectId
        ? 'SELECT * FROM expenses WHERE project_id = ?'
        : 'SELECT * FROM expenses';
    const params = projectId ? [projectId] : [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

export const createExpense = (req: Request, res: Response): void => {
    const { project_id, category_id, year_month, date, actual_amount, note, is_completed } = req.body;
    if (!project_id || !category_id || !year_month || !date || actual_amount == null) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const isCompletedVal = is_completed ? 1 : 0;

    db.run(
        'INSERT INTO expenses (project_id, category_id, year_month, date, actual_amount, note, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project_id, category_id, year_month, date, actual_amount, note || '', isCompletedVal],
        function (insertErr) {
            if (insertErr) {
                res.status(500).json({ error: insertErr.message });
                return;
            }
            res.status(201).json({ id: this.lastID, project_id, category_id, year_month, date, actual_amount, note, is_completed: isCompletedVal });
        }
    );
};

export const deleteExpense = (req: Request, res: Response): void => {
    const { id } = req.params;
    db.run('DELETE FROM expenses WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
};

export const updateExpense = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { category_id, year_month, date, actual_amount, note, is_completed } = req.body;

    if (!category_id || !year_month || !date || actual_amount == null) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const isCompletedVal = is_completed ? 1 : 0;

    db.run(
        'UPDATE expenses SET category_id = ?, year_month = ?, date = ?, actual_amount = ?, note = ?, is_completed = ? WHERE id = ?',
        [category_id, year_month, date, actual_amount, note || '', isCompletedVal, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Expense not found' });
                return;
            }
            res.json({ message: 'Updated successfully', changes: this.changes });
        }
    );
};
