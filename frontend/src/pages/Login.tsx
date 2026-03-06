import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login({ email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="xray-film-static p-8 w-full max-auto max-w-md">
                <div className="xray-film-inner"></div>
                <div className="xray-film-clip"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <FontAwesomeIcon icon={faRightToBracket} className="xray-film-icon text-xray-cyan text-xl" />
                        <h1 className="text-2xl font-light tracking-[0.2em] uppercase xray-film-text">Login</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-xray-text-muted mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                className="xray-input w-full"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-xray-text-muted mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                className="xray-input w-full"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs font-light tracking-wide bg-red-950/20 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="xray-btn-primary w-full py-3 mt-4"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-xray-text-muted font-light">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-xray-cyan hover:underline decoration-xray-cyan/30 underline-offset-4">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
