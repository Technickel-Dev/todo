import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { TodoItem } from '../components/TodoItem';
import { TodoForm } from '../components/TodoForm';
import { TodoFilter } from '../components/TodoFilter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export const Dashboard = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState<string | null>(null);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Replace API fetching with raw simulated state
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setTasks([
                { id: 1, title: 'SYS_INIT_SEQUENCE', description: 'Bootstrapping quantum core containment field. Diagnostics running.', isCompleted: true, createdAt: new Date().toISOString() },
                { id: 2, title: 'CALIBRATE_OPTICS_ARRAY', description: 'Spectrum analysis required for sub-routine alpha.', isCompleted: false, createdAt: new Date().toISOString() },
                { id: 3, title: 'PURGE_MEMORY_BANKS', description: '', isCompleted: false, createdAt: new Date().toISOString() },
            ]);
            setIsLoading(false);
        }, 1200);
    }, []);

    const handleCreateTask = async (taskData: Partial<Task>) => {
        const newTask: Task = {
            id: Date.now(),
            title: taskData.title || '',
            description: taskData.description || '',
            isCompleted: false,
            createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
        setIsFormOpen(false);
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete data node?')) return;
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleUpdateTask = async (task: Task) => {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };

    // Client-side status filtering with fake search
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = searchTerm ? (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))) : true;
        if (!matchesSearch) return false;

        if (filterType === 'active') return !task.isCompleted;
        if (filterType === 'completed') return task.isCompleted;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="xray-film-static p-5 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-30">
                <div className="xray-film-clip"></div>

                {/* Search Bar - Backend Fuzzy Search capability */}
                <div className="relative w-full sm:w-96 z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="text-xray-text-muted" />
                    </div>
                    <input
                        type="text"
                        className="xray-inline-input w-full pl-10"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Action Controls */}
                <div className="flex w-full sm:w-auto items-center gap-3 z-10">
                    <TodoFilter
                        value={filterType}
                        onChange={setFilterType}
                    />

                    <button
                        onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                        className="xray-btn-primary shrink-0 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

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

                    {/* Inline New Task Creation */}
                    {isFormOpen && !editingTask && (
                        <div className="mb-8">
                            <TodoForm
                                isInline={true}
                                onSubmit={handleCreateTask}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    )}

                    {filteredTasks.map(task => (
                        <TodoItem
                            key={task.id}
                            task={task}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            onEdit={handleUpdateTask}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
