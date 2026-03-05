import React, { useState } from 'react';
import type { Todo } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { TodoForm } from './TodoForm';

interface TodoItemProps {
    todo: Todo;
    onToggleStatus: (id: number, currentStatus: boolean) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onEdit: (todo: Todo) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleStatus, onDelete, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(todo.id);
        setIsDeleting(false);
    };

    const handleToggle = async () => {
        setIsToggling(true);
        await onToggleStatus(todo.id, todo.isCompleted);
        setIsToggling(false);
    };

    const handleEditSubmit = async (todoData: Partial<Todo>) => {
        await onEdit({ ...todo, ...todoData });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <TodoForm
                todo={todo}
                isInline={true}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className={`xray-film p-5 pt-8 flex items-center gap-4 ${todo.isCompleted ? 'opacity-70 grayscale hover:grayscale-0' : ''}`}>
            <div className="xray-film-clip"></div>
            <div className="xray-film-inner"></div>

            <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-all z-10 relative cursor-pointer disabled:cursor-not-allowed
          ${todo.isCompleted
                        ? 'bg-xray-green border-xray-green text-xray-bg drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'border-xray-text-muted hover:border-xray-cyan bg-black/50 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}
            >
                {isToggling ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                ) : (
                    todo.isCompleted && <FontAwesomeIcon icon={faCheck} className="text-xs" />
                )}
            </button>

            <div className="flex-1 min-w-0 z-10 relative">
                <h3 className={`text-lg font-medium truncate xray-film-text ${todo.isCompleted ? 'line-through text-xray-text-muted' : 'text-white'}`}>
                    {todo.title}
                </h3>
                {todo.description && (
                    <p className="text-xs text-xray-text-muted mt-1 truncate">
                        {todo.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10 relative">
                <Link
                    to={`/todos/${todo.id}`}
                    className="p-2 text-xray-text-muted hover:text-white transition-colors xray-film-icon cursor-pointer"
                    title="View Details"
                >
                    <FontAwesomeIcon icon={faEye} />
                </Link>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-xray-text-muted hover:text-xray-cyan transition-colors xray-film-icon cursor-pointer"
                    title="Edit Todo"
                >
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-xray-text-muted hover:text-red-400 transition-colors xray-film-icon cursor-pointer disabled:cursor-not-allowed"
                    title="Delete Todo"
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
