import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface TodoFilterProps {
    value: 'all' | 'active' | 'completed';
    onChange: (value: 'all' | 'active' | 'completed') => void;
}

export const TodoFilter: React.FC<TodoFilterProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
    ] as const;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="xray-inline-input bg-black/60 rounded-lg py-1 px-3 text-sm focus:outline-none focus:border-xray-cyan w-full sm:w-40 flex justify-between items-center cursor-pointer group"
            >
                <span className="truncate">{selectedOption?.label}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-xray-text-muted group-hover:text-xray-cyan`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 xray-film-static bg-[#020617]/95 border border-xray-panel-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2
                                    ${value === option.value
                                        ? 'bg-xray-cyan/10 text-xray-cyan'
                                        : 'text-xray-text-muted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                                    ${value === option.value
                                        ? 'bg-xray-cyan shadow-[0_0_8px_rgba(207,250,254,0.8)]'
                                        : 'bg-transparent'
                                    }`}
                                />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
