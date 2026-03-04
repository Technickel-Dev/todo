

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
    return (
        <svg viewBox="10 10 80 80" className={`text-xray-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] ${className}`}>
            <path d="M 50 15 C 30 15, 20 30, 20 50 C 20 65, 30 70, 35 75 Q 35 85 40 85 L 60 85 Q 65 85 65 75 C 70 70, 80 65, 80 50 C 80 30, 70 15, 50 15 Z" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="35" cy="45" r="8" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 55 45 L 62 52 L 72 38" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <line x1="45" y1="75" x2="45" y2="85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="75" x2="55" y2="85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
};
