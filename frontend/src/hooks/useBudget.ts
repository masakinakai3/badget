/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState, useEffect } from 'react';
import api from '../api';
import type { BudgetPlan, Expense } from '../types';

export const useBudget = (projectId: number | undefined) => {
    const [plans, setPlans] = useState<BudgetPlan[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [plansRes, expensesRes] = await Promise.all([
                api.get(`/budget_plans?projectId=${projectId}`),
                api.get(`/expenses?projectId=${projectId}`)
            ]);
            setPlans(plansRes.data);
            setExpenses(expensesRes.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch budget data');
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async (categoryId: number, yearMonth: string, amount: number) => {
        if (!projectId) return;
        try {
            await api.post('/budget_plans', {
                project_id: projectId,
                category_id: categoryId,
                year_month: yearMonth,
                planned_amount: amount
            });
            // Refresh data
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save plan');
            throw err;
        }
    };

    const saveExpense = async (categoryId: number, yearMonth: string, date: string, amount: number, note: string, is_completed: boolean = false) => {
        if (!projectId) return;
        try {
            await api.post('/expenses', {
                project_id: projectId,
                category_id: categoryId,
                year_month: yearMonth,
                date: date,
                actual_amount: amount,
                note,
                is_completed
            });
            // Refresh data
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense');
            throw err;
        }
    };

    const deleteExpense = async (id: number) => {
        try {
            await api.delete(`/expenses/${id}`);
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete expense');
            throw err;
        }
    };

    const updateExpense = async (id: number, categoryId: number, yearMonth: string, date: string, amount: number, note: string, is_completed: boolean = false) => {
        try {
            await api.put(`/expenses/${id}`, {
                category_id: categoryId,
                year_month: yearMonth,
                date: date,
                actual_amount: amount,
                note,
                is_completed
            });
            // Refresh data
            await fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to update expense');
            throw err;
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    return { plans, expenses, loading, error, savePlan, saveExpense, deleteExpense, updateExpense, refetch: fetchData };
};
