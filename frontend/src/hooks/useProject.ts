/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState, useEffect } from 'react';
import api from '../api';
import type { Project } from '../types';

export const useProject = (id: string | undefined) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch project');
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (data: { name: string, term_start: string, term_end: string, total_budget: number, categoryIds: number[] }) => {
        if (!id) return;
        setLoading(true);
        try {
            await api.put(`/projects/${id}`, data);
            await fetchProject();
        } catch (err: any) {
            setError(err.message || 'Failed to update project');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    return { project, loading, error, fetchProject, updateProject };
};
