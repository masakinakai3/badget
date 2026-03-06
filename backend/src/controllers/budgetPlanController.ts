/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Request, Response } from 'express';
import db from '../config/database';

export const getBudgetPlans = (req: Request, res: Response): void => {
    const { projectId } = req.query;
    const sql = projectId
        ? 'SELECT * FROM budget_plans WHERE project_id = ?'
        : 'SELECT * FROM budget_plans';
    const params = projectId ? [projectId] : [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

export const createBudgetPlan = (req: Request, res: Response): void => {
    const { project_id, category_id, year_month, planned_amount } = req.body;
    if (!project_id || !category_id || !year_month || planned_amount == null) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // upsert configuration: if exists for the same project, category and year_month, update it.
    db.get(
        'SELECT id FROM budget_plans WHERE project_id = ? AND category_id = ? AND year_month = ?',
        [project_id, category_id, year_month],
        (err, row: any) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                // Update existing
                db.run(
                    'UPDATE budget_plans SET planned_amount = ? WHERE id = ?',
                    [planned_amount, row.id],
                    function (updateErr) {
                        if (updateErr) {
                            res.status(500).json({ error: updateErr.message });
                            return;
                        }
                        res.json({ id: row.id, project_id, category_id, year_month, planned_amount });
                    }
                );
            } else {
                // Create new
                db.run(
                    'INSERT INTO budget_plans (project_id, category_id, year_month, planned_amount) VALUES (?, ?, ?, ?)',
                    [project_id, category_id, year_month, planned_amount],
                    function (insertErr) {
                        if (insertErr) {
                            res.status(500).json({ error: insertErr.message });
                            return;
                        }
                        res.status(201).json({ id: this.lastID, project_id, category_id, year_month, planned_amount });
                    }
                );
            }
        }
    );
};

export const deleteBudgetPlan = (req: Request, res: Response): void => {
    const { id } = req.params;
    db.run('DELETE FROM budget_plans WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
};
