import React, { useState } from 'react';
import type { Task } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { TodoForm } from './TodoForm';

interface TodoItemProps {
    task: Task;
    onToggleStatus: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ task, onToggleStatus, onDelete, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(task.id);
        setIsDeleting(false);
    };

    const handleToggle = async () => {
        setIsToggling(true);
        await onToggleStatus(task.id, task.isCompleted);
        setIsToggling(false);
    };

    const handleEditSubmit = async (taskData: Partial<Task>) => {
        await onEdit({ ...task, ...taskData });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <TodoForm
                task={task}
                isInline={true}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className={`xray-film p-5 pt-8 flex items-center gap-4 ${task.isCompleted ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}>
            {/* The physical clip holding the film */}
            <div className="xray-film-clip"></div>

            <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-all z-10 relative cursor-pointer disabled:cursor-not-allowed
          ${task.isCompleted
                        ? 'bg-xray-green border-xray-green text-xray-bg drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'border-xray-text-muted hover:border-xray-cyan bg-black/50 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}
            >
                {isToggling ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : (
                    task.isCompleted && <FontAwesomeIcon icon={faCheck} className="text-xs" />
                )}
            </button>

            <div className="flex-1 min-w-0 z-10 relative">
                <h3 className={`text-lg font-medium truncate xray-film-text ${task.isCompleted ? 'line-through text-xray-text-muted' : 'text-white'}`}>
                    {task.title}
                </h3>
                {task.description && (
                    <p className="text-xs text-xray-text-muted mt-1 truncate">
                        {task.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10 relative">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-xray-text-muted hover:text-xray-cyan transition-colors xray-film-icon cursor-pointer"
                    title="Edit Task"
                >
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-xray-text-muted hover:text-red-400 transition-colors xray-film-icon cursor-pointer disabled:cursor-not-allowed"
                    title="Delete Task"
                >
                    {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                        <FontAwesomeIcon icon={faTrash} />
                    )}
                </button>
            </div>

        </div>
    );
};
