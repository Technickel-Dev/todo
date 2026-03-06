import { apiClient } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const { data } = await apiClient('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (data.accessToken) {
            localStorage.setItem('auth', JSON.stringify(data));
        }

        return data;
    },

    async refresh(): Promise<AuthResponse> {
        const authData = localStorage.getItem('auth');
        const refreshToken = authData ? JSON.parse(authData).refreshToken : null;

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const { data } = await apiClient('/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        if (data.accessToken) {
            localStorage.setItem('auth', JSON.stringify(data));
        }

        return data;
    },

    async register(credentials: RegisterRequest): Promise<void> {
        await apiClient('/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    logout(): void {
        localStorage.removeItem('auth');
        window.location.href = '/login';
    },

    getAuth(): AuthResponse | null {
        const auth = localStorage.getItem('auth');
        return auth ? JSON.parse(auth) : null;
    },

    isAuthenticated(): boolean {
        return !!this.getAuth()?.accessToken;
    }
};
