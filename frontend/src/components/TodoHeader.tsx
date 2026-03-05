import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TodoFilter } from './TodoFilter';

interface TodoHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: 'all' | 'active' | 'completed';
    onFilterChange: (value: 'all' | 'active' | 'completed') => void;
    onNewTodo: () => void;
}

export const TodoHeader: React.FC<TodoHeaderProps> = ({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterChange,
    onNewTodo
}) => {
    return (
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
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Action Controls */}
            <div className="flex w-full sm:w-auto items-center gap-3 z-10">
                <TodoFilter
                    value={filterType}
                    onChange={onFilterChange}
                />

                <button
                    onClick={onNewTodo}
                    className="xray-btn-primary shrink-0 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className="hidden sm:inline">New Todo</span>
                </button>
            </div>
        </div>
    );
};
