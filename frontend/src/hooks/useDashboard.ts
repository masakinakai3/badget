/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState, useEffect } from 'react';
import api from '../api';

interface DashboardProjectMetric {
    id: number;
    name: string;
    term_start: string;
    term_end: string;
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
    consumptionRate: number;
}

interface DashboardMetrics {
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
    consumptionRate: number;
    projectCount: number;
    projectMetrics: DashboardProjectMetric[];
}

export const useDashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalBudget: 0,
        totalExpenses: 0,
        remainingBudget: 0,
        consumptionRate: 0,
        projectCount: 0,
        projectMetrics: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // In a real production app, this should be a dedicated backend endpoint.
            // For this local app, we'll fetch all projects and their expenses and calculate it here.
            const [projectsRes, expensesRes] = await Promise.all([
                api.get('/projects'),
                api.get('/expenses')
            ]);

            const projects = projectsRes.data;
            const expenses = expensesRes.data;

            let totalBudget = 0;
            let totalExpenses = 0;
            const projectMetrics: DashboardProjectMetric[] = [];

            for (const p of projects) {
                const projExpenses = expenses.filter((e: any) => e.project_id === p.id && e.is_completed === 1);
                const pTotalExp = projExpenses.reduce((sum: number, e: any) => sum + e.actual_amount, 0);
                const pTotalBud = p.total_budget;
                const pRemaining = pTotalBud - pTotalExp;
                const pRate = pTotalBud > 0 ? (pTotalExp / pTotalBud) * 100 : 0;

                projectMetrics.push({
                    id: p.id,
                    name: p.name,
                    term_start: p.term_start,
                    term_end: p.term_end,
                    totalBudget: pTotalBud,
                    totalExpenses: pTotalExp,
                    remainingBudget: pRemaining,
                    consumptionRate: pRate
                });

                totalBudget += pTotalBud;
                totalExpenses += pTotalExp;
            }

            const remainingBudget = totalBudget - totalExpenses;
            const consumptionRate = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

            setMetrics({
                totalBudget,
                totalExpenses,
                remainingBudget,
                consumptionRate,
                projectCount: projects.length,
                projectMetrics
            });
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    return { metrics, loading, error, refetch: fetchMetrics };
};
