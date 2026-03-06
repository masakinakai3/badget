/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
export interface Project {
    id: number;
    name: string;
    term_start: string;
    term_end: string;
    total_budget: number;
    categoryIds?: number[];
}

export interface Category {
    id: number;
    name: string;
}

export interface BudgetPlan {
    id: number;
    project_id: number;
    category_id: number;
    year_month: string;
    planned_amount: number;
}

export interface Expense {
    id: number;
    project_id: number;
    category_id: number;
    year_month: string;
    date: string;
    actual_amount: number;
    note?: string;
    is_completed: number;
}
