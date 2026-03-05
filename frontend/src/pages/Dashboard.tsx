import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '../types';
import { TodoItem } from '../components/TodoItem';
import { TodoForm } from '../components/TodoForm';
import { todoService } from '../api/todos';
import { TodoHeader } from '../components/TodoHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export const Dashboard = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const fetchTodos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const isCompletedParam = filterType === 'all' ? null : filterType === 'completed';
            const data = await todoService.getAll(searchTerm, isCompletedParam);
            setTodos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to synchronize with core.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterType]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleCreateTodo = async (todoData: Partial<Todo>) => {
        setError(null);
        try {
            await todoService.create(todoData);
            fetchTodos();
            setIsFormOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed.');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setError(null);
        try {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            await todoService.update(id, { ...todo, isCompleted: !currentStatus });
            fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Status update failed.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete data node?')) return;
        setError(null);
        try {
            await todoService.delete(id);
            fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Data purge failed.');
        }
    };

    const handleUpdateTodo = async (todo: Todo) => {
        setError(null);
        try {
            await todoService.update(todo.id, todo);
            fetchTodos();
            setEditingTodo(null);
            setIsFormOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed.');
        }
    };

    return (
        <div className="space-y-6">
            <TodoHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
                onNewTodo={() => { setEditingTodo(null); setIsFormOpen(true); }}
            />

            {error ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faExclamationCircle} /> {error}
                </div>
            ) : isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xray-cyan"></div>
                </div>
            ) : (
                <div className="space-y-6 pt-10">

                    {/* Inline New Todo Creation */}
                    {isFormOpen && !editingTodo && (
                        <div className="mb-8">
                            <TodoForm
                                isInline={true}
                                onSubmit={handleCreateTodo}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    )}

                    {todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            onEdit={handleUpdateTodo}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
