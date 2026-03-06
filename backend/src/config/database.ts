/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// DBファイルのパス（プロジェクトルートの data ディレクトリ下に作成）
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.resolve(dataDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON'); // 外部キー制約を有効化
  }
});

export const initDB = () => {
  db.serialize(() => {
    // 1. Project Table
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        term_start TEXT NOT NULL,
        term_end TEXT NOT NULL,
        total_budget INTEGER NOT NULL
      )
    `);

    // 2. Category Table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // 2.5 Project Categories Table
    db.run(`
      CREATE TABLE IF NOT EXISTS project_categories (
        project_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, category_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // 3. BudgetPlan Table
    db.run(`
      CREATE TABLE IF NOT EXISTS budget_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        year_month TEXT NOT NULL,
        planned_amount INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // 4. Expense Table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        year_month TEXT NOT NULL,
        date TEXT NOT NULL,
        actual_amount INTEGER NOT NULL,
        note TEXT,
        is_completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Add is_completed column to expenses table if it isn't already there
    db.run(`ALTER TABLE expenses ADD COLUMN is_completed BOOLEAN DEFAULT 0`, (err) => {
      // Ignore "duplicate column name" errors
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Failed to add is_completed column:", err);
      }
    });

    console.log('Database schema initialized.');
  });
};

export default db;
