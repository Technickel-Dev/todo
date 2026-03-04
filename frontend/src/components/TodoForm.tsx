import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

interface TodoFormProps {
    task?: Task | null;
    isInline?: boolean;
    onSubmit: (taskData: Partial<Task>) => Promise<void>;
    onCancel: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ task, isInline = false, onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        await onSubmit({
            title: title.trim(),
            description: description.trim()
        });
        setIsSubmitting(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`xray-film p-5 pt-8 flex items-center gap-4 ${isInline ? 'w-full' : 'w-full max-w-md mx-auto mt-4'}`}
        >
            <div className="xray-film-clip"></div>

            {/* Placeholder for the checkbox to keep layout identical to TodoItem */}
            <div className="w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-all z-10 relative border-xray-text-muted/30 bg-black/30" />

            <div className="flex-1 min-w-0 z-10 relative flex flex-col">
                <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="xray-inline-input text-lg font-medium xray-film-text"
                    placeholder="Task name"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="xray-inline-textarea text-xs"
                    placeholder="Description (optional)"
                    rows={1}
                />
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10 relative">
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="p-2 text-xray-cyan hover:text-white transition-colors xray-film-icon"
                    title={task ? 'Save Changes' : 'Create Task'}
                >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                        <FontAwesomeIcon icon={faSave} />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="p-2 text-xray-text-muted hover:text-red-400 transition-colors xray-film-icon"
                    title="Cancel"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </form>
    );
};
