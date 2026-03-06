/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import express from 'express';
import cors from 'cors';
import { initDB } from './config/database';

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';

// Standalone mode detection
const isPkg = (process as any).pkg !== undefined;

// Crash Logging for Standalone EXE
if (isPkg) {
    const logPath = path.join(path.dirname(process.execPath), 'crash.log');
    const logError = (err: any) => {
        const errorMsg = err.stack || err;
        const message = `[${new Date().toISOString()}] ${errorMsg}\n`;
        try {
            fs.appendFileSync(logPath, message);
        } catch (e) {
            console.error('Failed to write to crash.log:', e);
        }
        console.error('\n--- CRASH REPORT ---');
        console.error(errorMsg);
        console.error('--------------------\n');
        console.error('The application crashed. Please check the error above.');
        console.error('Press Ctrl+C to exit.');

        // Keep the console window open
        setInterval(() => { }, 1000);
    };
    process.on('uncaughtException', logError);
    process.on('unhandledRejection', logError);
}
app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Basic Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running.' });
});

// Import Routes
import projectRoutes from './routes/projectRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetPlanRoutes from './routes/budgetPlanRoutes';
import expenseRoutes from './routes/expenseRoutes';

app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budget_plans', budgetPlanRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve Static Frontend (for production/exe)
const frontendDist = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendDist));

// Root route for SPA fallback
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server is running on ${url}`);

    // Auto-open browser in production (pkg is always production)
    if (isPkg || process.env.NODE_ENV === 'production') {
        const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${command} ${url}`);
    }
});
