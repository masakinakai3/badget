/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState, useEffect } from 'react';
import api from '../api';
import type { Project } from '../types';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (data: Omit<Project, 'id' | 'categoryIds'> & { categoryIds: number[] }) => {
        setLoading(true);
        try {
            const response = await api.post('/projects', data);
            setProjects((prev) => [...prev, response.data]);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to create project');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return { projects, loading, error, fetchProjects, createProject };
};
