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

// Middleware
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
