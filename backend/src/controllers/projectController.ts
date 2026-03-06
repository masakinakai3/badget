/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Request, Response } from 'express';
import db from '../config/database';

export const getProjects = (req: Request, res: Response): void => {
    db.all(`
        SELECT p.*, GROUP_CONCAT(pc.category_id) as categoryIds
        FROM projects p
        LEFT JOIN project_categories pc ON p.id = pc.project_id
        GROUP BY p.id
    `, [], (err, rows: any[]) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const formattedRows = rows.map(r => ({
            ...r,
            categoryIds: r.categoryIds ? r.categoryIds.split(',').map(Number) : []
        }));
        res.json(formattedRows);
    });
};

export const getProjectById = (req: Request, res: Response): void => {
    const { id } = req.params;
    db.get(`
        SELECT p.*, GROUP_CONCAT(pc.category_id) as categoryIds
        FROM projects p
        LEFT JOIN project_categories pc ON p.id = pc.project_id
        WHERE p.id = ?
        GROUP BY p.id
    `, [id], (err, row: any) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const formattedRow = {
            ...row,
            categoryIds: row.categoryIds ? row.categoryIds.split(',').map(Number) : []
        };
        res.json(formattedRow);
    });
};

export const createProject = (req: Request, res: Response): void => {
    const { name, term_start, term_end, total_budget, categoryIds } = req.body;
    if (!name || !term_start || !term_end || total_budget == null) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(
            'INSERT INTO projects (name, term_start, term_end, total_budget) VALUES (?, ?, ?, ?)',
            [name, term_start, term_end, total_budget],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }
                const newProjectId = this.lastID;

                if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                    const stmt = db.prepare('INSERT INTO project_categories (project_id, category_id) VALUES (?, ?)');
                    categoryIds.forEach(catId => {
                        stmt.run(newProjectId, catId);
                    });
                    stmt.finalize();
                }

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        res.status(500).json({ error: commitErr.message });
                        return;
                    }
                    res.status(201).json({ id: newProjectId, name, term_start, term_end, total_budget, categoryIds: categoryIds || [] });
                });
            }
        );
    });
};

export const deleteProject = (req: Request, res: Response): void => {
    const { id } = req.params;
    db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
};

export const updateProject = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { name, term_start, term_end, total_budget, categoryIds } = req.body;

    if (!name || !term_start || !term_end || total_budget == null) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'UPDATE projects SET name = ?, term_start = ?, term_end = ?, total_budget = ? WHERE id = ?',
            [name, term_start, term_end, total_budget, id],
            function (err) {
                if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    res.status(404).json({ error: 'Project not found' });
                    return;
                }

                // Update categories only if array is provided
                if (Array.isArray(categoryIds)) {
                    db.run('DELETE FROM project_categories WHERE project_id = ?', [id], (delErr) => {
                        if (delErr) {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: delErr.message });
                            return;
                        }

                        if (categoryIds.length > 0) {
                            const stmt = db.prepare('INSERT INTO project_categories (project_id, category_id) VALUES (?, ?)');
                            categoryIds.forEach(catId => {
                                stmt.run(id, catId);
                            });
                            stmt.finalize();
                        }

                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                res.status(500).json({ error: commitErr.message });
                                return;
                            }
                            res.json({ message: 'Updated successfully', changes: this.changes });
                        });
                    });
                } else {
                    db.run('COMMIT', (commitErr) => {
                        if (commitErr) {
                            res.status(500).json({ error: commitErr.message });
                            return;
                        }
                        res.json({ message: 'Updated successfully', changes: this.changes });
                    });
                }
            }
        );
    });
};
