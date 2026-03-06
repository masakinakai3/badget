/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { Request, Response } from 'express';
import db from '../config/database';

export const getCategories = (req: Request, res: Response): void => {
    // Return all categories globally
    const sql = 'SELECT * FROM categories ORDER BY id ASC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

export const createCategory = (req: Request, res: Response): void => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Missing required field: name' });
        return;
    }
    db.run(
        'INSERT INTO categories (name) VALUES (?)',
        [name],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(409).json({ error: 'Category with this name already exists' });
                } else {
                    res.status(500).json({ error: err.message });
                }
                return;
            }
            res.status(201).json({ id: this.lastID, name });
        }
    );
};

export const deleteCategory = (req: Request, res: Response): void => {
    const { id } = req.params;
    db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
};
