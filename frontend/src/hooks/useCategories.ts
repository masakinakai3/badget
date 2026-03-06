/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState, useEffect } from 'react';
import api from '../api';
import type { Category } from '../types';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/categories`);
            setCategories(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const createCategory = async (name: string) => {
        setLoading(true);
        try {
            const response = await api.post('/categories', { name });
            setCategories((prev) => [...prev, response.data]);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to create category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id: number) => {
        setLoading(true);
        try {
            await api.delete(`/categories/${id}`);
            setCategories((prev) => prev.filter(c => c.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete category');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, error, fetchCategories, createCategory, deleteCategory };
};
