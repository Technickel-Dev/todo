import { apiClient } from './client';
import type { Todo } from '../types';

export const todoService = {
    getAll: async (search?: string, isCompleted?: boolean | null): Promise<Todo[]> => {
        let url = '/todos';
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (isCompleted !== undefined && isCompleted !== null) {
            params.append('isCompleted', isCompleted.toString());
        }

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const { data } = await apiClient(url);
        return data as Todo[];
    },

    getById: async (id: number): Promise<Todo> => {
        const { data } = await apiClient(`/todos/${id}`);
        return data as Todo;
    },

    create: async (todoData: Partial<Todo>): Promise<Todo> => {
        const { data } = await apiClient('/todos', {
            method: 'POST',
            body: JSON.stringify(todoData)
        });
        return data as Todo;
    },

    update: async (id: number, todoData: Partial<Todo>): Promise<void> => {
        await apiClient(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(todoData)
        });
    },

    delete: async (id: number): Promise<void> => {
        await apiClient(`/todos/${id}`, {
            method: 'DELETE'
        });
    }
};
