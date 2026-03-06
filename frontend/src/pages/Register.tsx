import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Credentials do not match.');
            return;
        }

        setLoading(true);

        try {
            await authService.register({ email, password });
            // After registration, let's just go to login.
            navigate('/login', { state: { message: 'Registration successful. Please login.' } });
        } catch (err: any) {
            setError(err.message || 'Registration failed. System error.');
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
                        <FontAwesomeIcon icon={faUserPlus} className="xray-film-icon text-xray-cyan text-xl" />
                        <h1 className="text-2xl font-light tracking-[0.2em] uppercase xray-film-text">Register</h1>
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

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-xray-text-muted mb-2 ml-1">Confirm Password</label>
                            <input
                                type="password"
                                className="xray-input w-full"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-xray-text-muted font-light">
                            Already have an account?{' '}
                            <Link to="/login" className="text-xray-cyan hover:underline decoration-xray-cyan/30 underline-offset-4">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
