import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Todo } from '../types';
import { todoService } from '../api/todos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faClock, faExclamationCircle, faAlignLeft } from '@fortawesome/free-solid-svg-icons';

export const TodoDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [todo, setTodo] = useState<Todo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoading, setShowLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent loading flicker on fast networks
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (isLoading) {
            timer = setTimeout(() => setShowLoading(true), 250);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    const fetchTodoDetails = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                throw new Error("Invalid Todo ID provided.");
            }
            const data = await todoService.getById(parsedId);
            setTodo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to retrieve todo details.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTodoDetails();
    }, [fetchTodoDetails]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-24 h-48 transition-opacity duration-300" style={{ opacity: showLoading ? 1 : 0 }}>
                {showLoading && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xray-cyan"></div>}
            </div>
        );
    }

    if (error || !todo) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-xray-text-muted hover:text-white transition-colors cursor-pointer"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back to Dashboard</span>
                </button>
                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 flex items-center gap-3 xray-film">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-xl" />
                    <div>
                        <h3 className="font-semibold text-white">Error Loading Details</h3>
                        <p className="text-sm">{error || 'Todo not found.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(todo.createdAt).toLocaleString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6 slide-in-from-bottom-4 animate-in duration-500">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-xray-text-muted hover:text-xray-cyan transition-colors group cursor-pointer"
            >
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="transition-transform group-hover:-translate-x-1"
                />
                <span>Back to Dashboard</span>
            </Link>

            <div className="xray-film p-8 flex flex-col gap-6 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-xray-cyan/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {/* Header Section */}
                <div className="flex justify-between items-start gap-4 border-b border-white/5 mx-0 px-0 pb-6 relative z-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                        {todo.title}
                    </h1>
                    <div className="shrink-0 flex items-center gap-2 mt-1">
                        {todo.isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-xray-green/10 text-xray-green border border-xray-green/20">
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Completed
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                                Todo
                            </span>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-xray-text-muted uppercase tracking-widest flex items-center gap-2">
                            <FontAwesomeIcon icon={faAlignLeft} className="text-xray-cyan/70" />
                            Description
                        </h3>
                        {todo.description ? (
                            <div className="bg-white/5 rounded-lg p-5 border border-white/5">
                                <p className="text-white whitespace-pre-wrap leading-relaxed">
                                    {todo.description}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xray-text-muted italic bg-white/5 rounded-lg p-5 border border-white/5">
                                No description provided.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white/5 rounded-lg p-5 border border-white/5">
                            <h3 className="text-xs font-medium text-xray-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faClock} className="text-xray-cyan/70" />
                                Created At
                            </h3>
                            <p className="text-white text-sm">
                                {formattedDate}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
